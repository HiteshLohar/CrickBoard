import mongoose from "mongoose";
import Match from "../models/Match.js";
import Innings from "../models/Innings.js";
import MatchPlayer from "../models/MatchPlayer.js";
import BallEvent from "../models/BallEvent.js";

/*
 * =========================================================
 * Constants
 * =========================================================
 */

const MAX_TRANSACTION_RETRIES = 5;

const WICKET_KINDS_REQUIRING_FIELDER = new Set([
    "CAUGHT",
    "RUN_OUT",
    "STUMPED",
]);

/*
 * =========================================================
 * Helpers
 * =========================================================
 */

const createError = (message, statusCode = 400) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

const getId = (value) => {
    if (!value) return null;
    return value.toString();
};

const isSameId = (a, b) => {
    return getId(a) === getId(b);
};

const calculateOverNumber = (legalBalls) => {
    return Math.floor(legalBalls / 6) + 1;
};

const calculateBallNumber = (legalBalls) => {
    return (legalBalls % 6) + 1;
};

/*
 * Normal batter-run strike rotation.
 *
 * 1 batter run  -> rotate
 * 2 batter runs -> no rotate
 * 1 wide        -> no rotate
 * 1 no-ball     -> no rotate
 */
const shouldRotateStrike = (batterRuns) => {
    return batterRuns % 2 === 1;
};

const isTransactionRetryable = (error) => {
    if (!error) return false;

    if (
        Array.isArray(error.errorLabels) &&
        (
            error.errorLabels.includes(
                "TransientTransactionError"
            ) ||
            error.errorLabels.includes(
                "UnknownTransactionCommitResult"
            )
        )
    ) {
        return true;
    }

    return (
        error.code === 112 ||
        error.codeName === "WriteConflict"
    );
};

const sleep = (ms) =>
    new Promise((resolve) => setTimeout(resolve, ms));

/*
 * =========================================================
 * Validate wicket
 * =========================================================
 */

const validateWicket = ({
    wicket,
    striker,
    nonStriker,
    playingPlayers,
    battingTeamId,
}) => {
    /*
     * No wicket
     */
    if (!wicket?.isWicket) {
        if (wicket?.kind !== "NONE") {
            throw createError(
                "Wicket kind must be NONE when there is no wicket."
            );
        }

        if (
            wicket?.playerOut ||
            wicket?.fielder
        ) {
            throw createError(
                "Wicket player information cannot be provided when there is no wicket."
            );
        }

        return;
    }

    /*
     * Wicket must have dismissed player
     */
    if (!wicket.playerOut) {
        throw createError(
            "Dismissed player is required for a wicket."
        );
    }

    /*
     * Wicket must have valid kind
     */
    if (
        !wicket.kind ||
        wicket.kind === "NONE"
    ) {
        throw createError(
            "Wicket kind is required."
        );
    }

    /*
     * Dismissed player must be striker
     * or non-striker.
     */
    const isStrikerOut =
        isSameId(
            wicket.playerOut,
            striker
        );

    const isNonStrikerOut =
        isSameId(
            wicket.playerOut,
            nonStriker
        );

    if (
        !isStrikerOut &&
        !isNonStrikerOut
    ) {
        throw createError(
            "Dismissed player must be the current striker or non-striker."
        );
    }

    /*
     * Dismissed player must be in Playing XI.
     */
    const dismissedPlayer =
        playingPlayers.find((item) =>
            isSameId(
                item.player,
                wicket.playerOut
            )
        );

    if (!dismissedPlayer) {
        throw createError(
            "Dismissed player is not part of the Playing XI."
        );
    }

    /*
     * Dismissed player must belong
     * to batting team.
     */
    if (
        !isSameId(
            dismissedPlayer.team,
            battingTeamId
        )
    ) {
        throw createError(
            "Dismissed player must belong to the batting team."
        );
    }

    /*
     * Validate fielder requirement.
     */
    if (
        WICKET_KINDS_REQUIRING_FIELDER.has(
            wicket.kind
        )
    ) {
        if (!wicket.fielder) {
            throw createError(
                `${wicket.kind} wicket requires a fielder.`
            );
        }
    } else if (wicket.fielder) {
        throw createError(
            `Fielder should not be provided for ${wicket.kind} wicket.`
        );
    }
};

/*
 * =========================================================
 * Validate fielder
 * =========================================================
 */

const validateFielder = ({
    wicket,
    playingPlayers,
    bowlingTeamId,
}) => {
    if (
        !wicket?.isWicket ||
        !wicket.fielder
    ) {
        return;
    }

    const fielder =
        playingPlayers.find((item) =>
            isSameId(
                item.player,
                wicket.fielder
            )
        );

    if (!fielder) {
        throw createError(
            "Fielder is not part of the Playing XI."
        );
    }

    if (
        !isSameId(
            fielder.team,
            bowlingTeamId
        )
    ) {
        throw createError(
            "Fielder must belong to the bowling team."
        );
    }
};

/*
 * =========================================================
 * Get current Playing XI
 * =========================================================
 */

const getPlayingPlayers = async (
    matchId,
    session
) => {
    return MatchPlayer.find({
        match: matchId,
        isPlaying: true,
    })
        .select(
            "player team isPlaying"
        )
        .session(session)
        .lean();
};

/*
 * =========================================================
 * Find player record
 * =========================================================
 */

const findPlayingPlayer = (
    playingPlayers,
    playerId
) => {
    return playingPlayers.find((item) =>
        isSameId(
            item.player,
            playerId
        )
    );
};

/*
 * =========================================================
 * Validate current players
 * =========================================================
 */

const validateCurrentPlayers = ({
    innings,
    payload,
    playingPlayers,
    battingTeamId,
    bowlingTeamId,
}) => {
    /*
     * All three players must exist
     * before a ball can be recorded.
     */
    if (
        !innings.striker ||
        !innings.nonStriker ||
        !innings.currentBowler
    ) {
        throw createError(
            "Striker, non-striker and bowler must be selected before recording a ball."
        );
    }

    /*
     * IMPORTANT:
     *
     * Once an over is completed, the next
     * ball must NOT be recorded until a new
     * bowler is selected.
     *
     * This check must happen before checking
     * the provided bowler.
     */
    if (innings.requiresNewBowler) {
        throw createError(
            "Over completed. Please select a new bowler before starting the next over.",
            409
        );
    }

    /*
     * Validate striker.
     */
    if (
        !isSameId(
            innings.striker,
            payload.striker
        )
    ) {
        throw createError(
            "Provided striker does not match the current striker."
        );
    }

    /*
     * Validate non-striker.
     */
    if (
        !isSameId(
            innings.nonStriker,
            payload.nonStriker
        )
    ) {
        throw createError(
            "Provided non-striker does not match the current non-striker."
        );
    }

    /*
     * Validate current bowler.
     */
    if (
        !isSameId(
            innings.currentBowler,
            payload.bowler
        )
    ) {
        throw createError(
            "Provided bowler does not match the current bowler."
        );
    }

    /*
     * Find Playing XI records.
     */
    const strikerRecord =
        findPlayingPlayer(
            playingPlayers,
            payload.striker
        );

    const nonStrikerRecord =
        findPlayingPlayer(
            playingPlayers,
            payload.nonStriker
        );

    const bowlerRecord =
        findPlayingPlayer(
            playingPlayers,
            payload.bowler
        );

    /*
     * Validate striker existence.
     */
    if (!strikerRecord) {
        throw createError(
            "Striker is not part of the Playing XI."
        );
    }

    /*
     * Validate non-striker existence.
     */
    if (!nonStrikerRecord) {
        throw createError(
            "Non-striker is not part of the Playing XI."
        );
    }

    /*
     * Validate bowler existence.
     */
    if (!bowlerRecord) {
        throw createError(
            "Bowler is not part of the Playing XI."
        );
    }

    /*
     * Striker must belong to batting team.
     */
    if (
        !isSameId(
            strikerRecord.team,
            battingTeamId
        )
    ) {
        throw createError(
            "Striker must belong to the batting team."
        );
    }

    /*
     * Non-striker must belong to batting team.
     */
    if (
        !isSameId(
            nonStrikerRecord.team,
            battingTeamId
        )
    ) {
        throw createError(
            "Non-striker must belong to the batting team."
        );
    }

    /*
     * Bowler must belong to bowling team.
     */
    if (
        !isSameId(
            bowlerRecord.team,
            bowlingTeamId
        )
    ) {
        throw createError(
            "Bowler must belong to the bowling team."
        );
    }

    return {
        strikerRecord,
        nonStrikerRecord,
        bowlerRecord,
    };
};

/*
 * =========================================================
 * Validate scoring values
 * =========================================================
 */

const validateScoring = (payload) => {
    const batterRuns =
        payload.runs.batter;

    const extraRuns =
        payload.runs.extras;

    const totalRuns =
        payload.runs.total;

    const extrasType =
        payload.extras.type;

    /*
     * extras object and runs.extras
     * must contain the same value.
     */
    if (
        payload.extras.runs !== extraRuns
    ) {
        throw createError(
            "Extras runs do not match the total extras runs."
        );
    }

    /*
     * NONE cannot contain extras.
     */
    if (
        extrasType === "NONE" &&
        extraRuns !== 0
    ) {
        throw createError(
            "Extras runs must be 0 when extras type is NONE."
        );
    }

    /*
     * Every non-NONE extra must
     * contain at least one run.
     */
    if (
        extrasType !== "NONE" &&
        extraRuns < 1
    ) {
        throw createError(
            "Extras must contain at least 1 run."
        );
    }

    /*
     * Total must equal:
     *
     * batter runs + extras
     */
    if (
        totalRuns !==
        batterRuns + extraRuns
    ) {
        throw createError(
            "Total runs must equal batter runs plus extras."
        );
    }

    return {
        batterRuns,
        extraRuns,
        totalRuns,
        extrasType,
    };
};

/*
 * =========================================================
 * Calculate delivery legality
 * =========================================================
 */

const calculateLegalDelivery = (
    extrasType
) => {
    return ![
        "WIDE",
        "NO_BALL",
    ].includes(extrasType);
};

/*
 * =========================================================
 * Check innings completion
 * =========================================================
 */

const isInningsComplete = ({
    innings,
    match,
}) => {
    const maxLegalBalls =
        match.totalOvers * 6;

    const maxWickets =
        match.playersPerTeam - 1;

    return (
        innings.totalWickets >= maxWickets ||
        innings.legalBalls >= maxLegalBalls
    );
};

/*
 * =========================================================
 * Apply innings completion
 * =========================================================
 */

const completeInnings = (
    innings
) => {
    innings.status =
        "COMPLETED";

    innings.completedAt =
        new Date();

    innings.striker =
        null;

    innings.nonStriker =
        null;

    innings.currentBowler =
        null;

    /*
     * No new bowler is required once
     * the innings itself has completed.
     */
    innings.requiresNewBowler =
        false;
};

/*
 * =========================================================
 * Populate scoring response
 * =========================================================
 */

const populateBall = async (
    ballId
) => {
    return BallEvent.findById(
        ballId
    )
        .populate(
            "striker",
            "name shortName role"
        )
        .populate(
            "nonStriker",
            "name shortName role"
        )
        .populate(
            "bowler",
            "name shortName role"
        )
        .populate(
            "wicket.playerOut",
            "name shortName role"
        )
        .populate(
            "wicket.fielder",
            "name shortName role"
        );
};

const populateInnings = async (
    inningsId
) => {
    return Innings.findById(
        inningsId
    )
        .populate(
            "battingTeam",
            "name shortName logo"
        )
        .populate(
            "bowlingTeam",
            "name shortName logo"
        )
        .populate(
            "striker",
            "name shortName role"
        )
        .populate(
            "nonStriker",
            "name shortName role"
        )
        .populate(
            "currentBowler",
            "name shortName role"
        )
        .populate(
            "dismissedPlayers",
            "name shortName role"
        );
};

/*
 * =========================================================
 * Process one scoring transaction
 * =========================================================
 */

const processBallTransaction = async (
    matchId,
    userId,
    payload,
    session
) => {
    /*
     * -------------------------------------------------------
     * 1. Find match owned by current user
     * -------------------------------------------------------
     */

    const match =
        await Match.findOne({
            _id: matchId,
            createdBy: userId,
        }).session(session);

    if (!match) {
        throw createError(
            "Match not found",
            404
        );
    }

    /*
     * -------------------------------------------------------
     * 2. Match must be LIVE
     * -------------------------------------------------------
     */

    if (
        match.status !== "LIVE"
    ) {
        throw createError(
            "Ball can only be recorded for a LIVE match."
        );
    }

    /*
     * -------------------------------------------------------
     * 3. Find current LIVE innings
     * -------------------------------------------------------
     */

    const innings =
        await Innings.findOne({
            match: match._id,
            inningsNumber:
                match.currentInnings,
            status: "LIVE",
        }).session(session);

    if (!innings) {
        throw createError(
            "Live innings not found",
            404
        );
    }

    /*
     * -------------------------------------------------------
     * 4. Playing XI
     * -------------------------------------------------------
     */

    const playingPlayers =
        await getPlayingPlayers(
            match._id,
            session
        );

    /*
     * -------------------------------------------------------
     * 5. Team IDs
     * -------------------------------------------------------
     */

    const battingTeamId =
        getId(
            innings.battingTeam
        );

    const bowlingTeamId =
        getId(
            innings.bowlingTeam
        );

    /*
     * -------------------------------------------------------
     * 6. Validate current players
     * -------------------------------------------------------
     */

    validateCurrentPlayers({
        innings,
        payload,
        playingPlayers,
        battingTeamId,
        bowlingTeamId,
    });

    /*
     * -------------------------------------------------------
     * 7. Server-derived delivery position
     * -------------------------------------------------------
     *
     * Client cannot decide the real over/ball.
     * Server derives it from legalBalls.
     */

    const overNumber =
        calculateOverNumber(
            innings.legalBalls
        );

    const ballNumber =
        calculateBallNumber(
            innings.legalBalls
        );

    /*
     * -------------------------------------------------------
     * 8. Scoring values
     * -------------------------------------------------------
     */

    const {
        batterRuns,
        extraRuns,
        totalRuns,
        extrasType,
    } = validateScoring(
        payload
    );

    /*
     * -------------------------------------------------------
     * 9. Server-derived legal delivery
     * -------------------------------------------------------
     */

    const isLegalDelivery =
        calculateLegalDelivery(
            extrasType
        );

    /*
     * Client must agree with server.
     */
    if (
        payload.isLegalDelivery !==
        isLegalDelivery
    ) {
        throw createError(
            "Invalid legal delivery value."
        );
    }

    /*
     * -------------------------------------------------------
     * 10. Validate wicket
     * -------------------------------------------------------
     */

    validateWicket({
        wicket: payload.wicket,
        striker: payload.striker,
        nonStriker: payload.nonStriker,
        playingPlayers,
        battingTeamId,
    });

    /*
     * -------------------------------------------------------
     * 11. Validate fielder
     * -------------------------------------------------------
     */

    validateFielder({
        wicket: payload.wicket,
        playingPlayers,
        bowlingTeamId,
    });

    /*
     * -------------------------------------------------------
     * 12. Prevent duplicate dismissal
     * -------------------------------------------------------
     */

    if (
        payload.wicket.isWicket
    ) {
        const alreadyDismissed =
            innings.dismissedPlayers.some(
                (player) =>
                    isSameId(
                        player,
                        payload.wicket.playerOut
                    )
            );

        if (alreadyDismissed) {
            throw createError(
                "Player has already been dismissed."
            );
        }
    }

    /*
     * -------------------------------------------------------
     * 13. Delivery number
     * -------------------------------------------------------
     */

    const updatedInnings =
        await Innings.findOneAndUpdate(
            {
                _id: innings._id,
                status: "LIVE",
            },
            {
                $inc: {
                    deliverySequence: 1,
                },
            },
            {
                new: true,
                session,
            }
        );

    if (!updatedInnings) {
        throw createError(
            "Unable to reserve delivery sequence.",
            409
        );
    }

    const deliveryNumber =
        updatedInnings.deliverySequence;

    /*
     * -------------------------------------------------------
     * 14. Calculate next innings state
     * -------------------------------------------------------
     */

    const nextTotalRuns =
        innings.totalRuns +
        totalRuns;

    const nextTotalExtras =
        innings.totalExtras +
        extraRuns;

    const nextTotalWickets =
        innings.totalWickets +
        (
            payload.wicket.isWicket
                ? 1
                : 0
        );

    const nextLegalBalls =
        innings.legalBalls +
        (
            isLegalDelivery
                ? 1
                : 0
        );

    /*
     * -------------------------------------------------------
     * 15. Create BallEvent
     * -------------------------------------------------------
     */

    const [ballEvent] =
        await BallEvent.create(
            [
                {
                    match:
                        match._id,

                    innings:
                        innings._id,

                    overNumber,

                    ballNumber,

                    deliveryNumber,

                    striker:
                        payload.striker,

                    nonStriker:
                        payload.nonStriker,

                    bowler:
                        payload.bowler,

                    runs: {
                        batter:
                            batterRuns,

                        extras:
                            extraRuns,

                        total:
                            totalRuns,
                    },

                    extras: {
                        type:
                            extrasType,

                        runs:
                            extraRuns,
                    },

                    wicket: {
                        isWicket:
                            payload.wicket.isWicket,

                        playerOut:
                            payload.wicket.playerOut,

                        kind:
                            payload.wicket.kind,

                        fielder:
                            payload.wicket.fielder,
                    },

                    isLegalDelivery,

                    commentary:
                        payload.commentary,
                },
            ],
            {
                session,
            }
        );

    /*
     * -------------------------------------------------------
     * 16. Update innings score
     * -------------------------------------------------------
     */

    innings.totalRuns =
        nextTotalRuns;

    innings.totalExtras =
        nextTotalExtras;

    innings.totalWickets =
        nextTotalWickets;

    innings.legalBalls =
        nextLegalBalls;

    /*
     * -------------------------------------------------------
     * 17. Calculate next strike
     * -------------------------------------------------------
     */

    let nextStriker =
        innings.striker;

    let nextNonStriker =
        innings.nonStriker;

    /*
     * Normal batter-run strike rotation.
     */
    if (
        !payload.wicket.isWicket &&
        shouldRotateStrike(
            batterRuns
        )
    ) {
        [
            nextStriker,
            nextNonStriker,
        ] = [
                nextNonStriker,
                nextStriker,
            ];
    }

    /*
     * -------------------------------------------------------
     * 18. Check over completion
     * -------------------------------------------------------
     */

    const overCompleted =
        isLegalDelivery &&
        nextLegalBalls % 6 === 0;

    /*
     * -------------------------------------------------------
     * 19. End-of-over handling
     * -------------------------------------------------------
     *
     * If the over is complete:
     *
     * 1. Rotate strike.
     * 2. Require a new bowler.
     *
     * The new bowler will be selected through
     * Change Bowler API.
     */

    if (
        overCompleted &&
        !payload.wicket.isWicket
    ) {
        [
            nextStriker,
            nextNonStriker,
        ] = [
                nextNonStriker,
                nextStriker,
            ];
    }

    /*
     * -------------------------------------------------------
     * 20. Handle wicket
     * -------------------------------------------------------
     */

    if (
        payload.wicket.isWicket
    ) {
        const dismissedPlayer =
            payload.wicket.playerOut;

        innings.dismissedPlayers.push(
            dismissedPlayer
        );

        /*
         * Remove dismissed player from
         * the correct crease position.
         */
        if (
            isSameId(
                innings.striker,
                dismissedPlayer
            )
        ) {
            innings.striker =
                null;
        }

        if (
            isSameId(
                innings.nonStriker,
                dismissedPlayer
            )
        ) {
            innings.nonStriker =
                null;
        }
    } else {
        /*
         * Normal delivery:
         * persist calculated striker positions.
         */
        innings.striker =
            nextStriker;

        innings.nonStriker =
            nextNonStriker;
    }

    /*
     * -------------------------------------------------------
     * 21. Set requiresNewBowler
     * -------------------------------------------------------
     *
     * This is the important fix.
     *
     * Once 6 legal balls are completed,
     * the next over cannot start until the
     * Change Bowler API selects a new bowler.
     */

    if (overCompleted) {
        innings.requiresNewBowler =
            true;
    }

    /*
     * -------------------------------------------------------
     * 22. Check innings completion
     * -------------------------------------------------------
     */

    const maxLegalBalls =
        match.totalOvers * 6;

    const maxWickets =
        match.playersPerTeam - 1;

    /*
     * First innings
     *
     * No target exists yet.
     * Complete only when:
     *
     * - All wickets are lost
     * - Overs are completed
     */
    if (innings.inningsNumber === 1) {
        const firstInningsCompleted =
            innings.totalWickets >= maxWickets ||
            innings.legalBalls >= maxLegalBalls;

        if (firstInningsCompleted) {
            /*
             * Complete first innings.
             */
            completeInnings(
                innings
            );

            /*
             * ---------------------------------------------------
             * Create second innings
             * ---------------------------------------------------
             */

            const nextInningsNumber = 2;

            const existingNextInnings =
                await Innings.findOne({
                    match: match._id,
                    inningsNumber:
                        nextInningsNumber,
                }).session(session);

            if (!existingNextInnings) {
                await Innings.create(
                    [
                        {
                            match:
                                match._id,

                            inningsNumber:
                                nextInningsNumber,

                            battingTeam:
                                innings.bowlingTeam,

                            bowlingTeam:
                                innings.battingTeam,

                            totalRuns:
                                0,

                            totalWickets:
                                0,

                            legalBalls:
                                0,

                            deliverySequence:
                                0,

                            totalExtras:
                                0,

                            status:
                                "LIVE",

                            startedAt:
                                new Date(),

                            requiresNewBowler:
                                false,

                            dismissedPlayers:
                                [],
                        },
                    ],
                    {
                        session,
                    }
                );
            }

            /*
             * Move match to second innings.
             */
            match.currentInnings = 2;
        }
    }

    /*
     * -------------------------------------------------------
     * Second innings completion
     * -------------------------------------------------------
     */

    if (innings.inningsNumber === 2) {
        /*
         * Get first innings score.
         */
        const firstInnings =
            await Innings.findOne({
                match: match._id,
                inningsNumber: 1,
            }).session(session);

        if (!firstInnings) {
            const error = new Error(
                "First innings not found."
            );

            error.statusCode = 500;

            throw error;
        }

        /*
         * Target = first innings score + 1
         */
        const target =
            firstInnings.totalRuns + 1;

        /*
         * ---------------------------------------------------
         * 1. Target achieved
         * ---------------------------------------------------
         */

        if (
            innings.totalRuns >= target
        ) {
            /*
             * Chasing team wins.
             */
            completeInnings(
                innings
            );

            match.status =
                "COMPLETED";

            match.completedAt =
                new Date();

            match.winner =
                innings.battingTeam;

            if (
                innings.battingTeam.toString() ===
                match.teamA.toString()
            ) {
                match.result =
                    "TEAM_A_WON";
            } else {
                match.result =
                    "TEAM_B_WON";
            }
        }

        /*
         * ---------------------------------------------------
         * 2. All wickets lost
         * ---------------------------------------------------
         */

        else if (
            innings.totalWickets >= maxWickets
        ) {
            /*
             * Chasing team is all out
             * before reaching target.
             *
             * First innings team wins.
             */
            completeInnings(
                innings
            );

            match.status =
                "COMPLETED";

            match.completedAt =
                new Date();

            match.winner =
                firstInnings.battingTeam;

            if (
                firstInnings.battingTeam.toString() ===
                match.teamA.toString()
            ) {
                match.result =
                    "TEAM_A_WON";
            } else {
                match.result =
                    "TEAM_B_WON";
            }
        }

        /*
         * ---------------------------------------------------
         * 3. Overs completed
         * ---------------------------------------------------
         */

        else if (
            innings.legalBalls >= maxLegalBalls
        ) {
            /*
             * Chasing team did not reach target.
             */
            completeInnings(
                innings
            );

            match.status =
                "COMPLETED";

            match.completedAt =
                new Date();

            /*
             * Compare both innings.
             */
            if (
                innings.totalRuns >
                firstInnings.totalRuns
            ) {
                /*
                 * Chasing team wins.
                 */
                match.winner =
                    innings.battingTeam;

                if (
                    innings.battingTeam.toString() ===
                    match.teamA.toString()
                ) {
                    match.result =
                        "TEAM_A_WON";
                } else {
                    match.result =
                        "TEAM_B_WON";
                }
            }

            else if (
                innings.totalRuns ===
                firstInnings.totalRuns
            ) {
                /*
                 * Match tied.
                 */
                match.winner =
                    undefined;

                match.result =
                    "TIE";
            }

            else {
                /*
                 * First innings team wins.
                 */
                match.winner =
                    firstInnings.battingTeam;

                if (
                    firstInnings.battingTeam.toString() ===
                    match.teamA.toString()
                ) {
                    match.result =
                        "TEAM_A_WON";
                } else {
                    match.result =
                        "TEAM_B_WON";
                }
            }
        }
    }

    /*
     * -------------------------------------------------------
     * 23. Save innings + match
     * -------------------------------------------------------
     */

    await innings.save({
        session,
    });

    await match.save({
        session,
    });

    /*
     * -------------------------------------------------------
     * 24. Return transaction result
     * -------------------------------------------------------
     */

    return {
        ballEventId:
            ballEvent._id,

        inningsId:
            innings._id,

        overCompleted,
    };
};

/*
 * =========================================================
 * Record a ball event
 * =========================================================
 */

export const recordBallEvent = async (
    matchId,
    userId,
    payload
) => {
    /*
     * Validate match ID.
     */
    if (
        !mongoose.isValidObjectId(
            matchId
        )
    ) {
        throw createError(
            "Invalid match ID."
        );
    }

    /*
     * Validate user ID.
     */
    if (
        !mongoose.isValidObjectId(
            userId
        )
    ) {
        throw createError(
            "Invalid user ID."
        );
    }

    let lastError;

    /*
     * Retry transient transaction conflicts.
     */
    for (
        let attempt = 1;
        attempt <=
        MAX_TRANSACTION_RETRIES;
        attempt += 1
    ) {
        const session =
            await mongoose.startSession();

        try {
            let result;

            /*
             * MongoDB transaction.
             */
            await session.withTransaction(
                async () => {
                    result =
                        await processBallTransaction(
                            matchId,
                            userId,
                            payload,
                            session
                        );
                },
                {
                    readConcern: {
                        level: "snapshot",
                    },

                    writeConcern: {
                        w: "majority",
                    },

                    readPreference:
                        "primary",
                }
            );

            /*
             * Transaction successfully committed.
             */

            const populatedBall =
                await populateBall(
                    result.ballEventId
                );

            const populatedInnings =
                await populateInnings(
                    result.inningsId
                );

            return {
                ball:
                    populatedBall,

                innings:
                    populatedInnings,

                overCompleted:
                    result.overCompleted,
            };
        } catch (error) {
            lastError =
                error;

            /*
             * Retry only MongoDB transaction
             * conflicts.
             */
            if (
                !isTransactionRetryable(
                    error
                ) ||
                attempt ===
                MAX_TRANSACTION_RETRIES
            ) {
                throw error;
            }

            /*
             * Small backoff.
             */
            await sleep(
                25 * attempt
            );
        } finally {
            await session.endSession();
        }
    }

    throw lastError;
};

/*
 * =========================================================
 * Get ball events for a match
 * =========================================================
 *
 * Cursor-based pagination.
 *
 * Query:
 *   ?limit=20
 *   ?cursor=<BallEvent._id>
 *
 * Results are returned newest -> oldest.
 *
 * The cursor is based on _id, which gives us
 * stable pagination without expensive skip().
 */

export const getBallEvents = async (
    matchId,
    userId,
    {
        limit = 20,
        cursor = null,
    } = {}
) => {
    /*
     * -------------------------------------------------------
     * 1. Validate match ID
     * -------------------------------------------------------
     */

    if (
        !mongoose.isValidObjectId(
            matchId
        )
    ) {
        throw createError(
            "Invalid match ID.",
            400
        );
    }

    /*
     * -------------------------------------------------------
     * 2. Validate user ID
     * -------------------------------------------------------
     */

    if (
        !mongoose.isValidObjectId(
            userId
        )
    ) {
        throw createError(
            "Invalid user ID.",
            400
        );
    }

    /*
     * -------------------------------------------------------
     * 3. Validate cursor
     * -------------------------------------------------------
     */

    if (
        cursor &&
        !mongoose.isValidObjectId(cursor)
    ) {
        throw createError(
            "Invalid pagination cursor.",
            400
        );
    }

    /*
     * -------------------------------------------------------
     * 4. Normalize limit
     * -------------------------------------------------------
     *
     * Never allow the client to request
     * an unlimited number of documents.
     */

    const parsedLimit =
        Number(limit);

    if (
        !Number.isInteger(parsedLimit) ||
        parsedLimit < 1 ||
        parsedLimit > 100
    ) {
        throw createError(
            "Limit must be an integer between 1 and 100.",
            400
        );
    }

    /*
     * -------------------------------------------------------
     * 5. Verify match ownership
     * -------------------------------------------------------
     */

    const match =
        await Match.findOne({
            _id: matchId,
            createdBy: userId,
        })
            .select("_id")
            .lean();

    if (!match) {
        throw createError(
            "Match not found",
            404
        );
    }

    /*
     * -------------------------------------------------------
     * 6. Build query
     * -------------------------------------------------------
     */

    const query = {
        match: match._id,
    };

    /*
     * Cursor means:
     *
     * "Give me records older than this
     * BallEvent."
     *
     * Since we sort _id descending,
     * older records have a smaller _id.
     */

    if (cursor) {
        query._id = {
            $lt: cursor,
        };
    }

    /*
     * -------------------------------------------------------
     * 7. Fetch one extra document
     * -------------------------------------------------------
     *
     * Example:
     *
     * limit = 20
     *
     * Fetch 21.
     *
     * If 21 exists, we know another page exists.
     */

    const balls =
        await BallEvent.find(query)
            .sort({
                _id: -1,
            })
            .limit(
                parsedLimit + 1
            )
            .populate(
                "striker",
                "name shortName role"
            )
            .populate(
                "nonStriker",
                "name shortName role"
            )
            .populate(
                "bowler",
                "name shortName role"
            )
            .populate(
                "wicket.playerOut",
                "name shortName role"
            )
            .populate(
                "wicket.fielder",
                "name shortName role"
            )
            .lean();

    /*
     * -------------------------------------------------------
     * 8. Determine next page
     * -------------------------------------------------------
     */

    const hasNextPage =
        balls.length >
        parsedLimit;

    /*
     * Remove the extra document.
     */

    if (hasNextPage) {
        balls.pop();
    }

    /*
     * -------------------------------------------------------
     * 9. Generate next cursor
     * -------------------------------------------------------
     */

    const nextCursor =
        hasNextPage &&
            balls.length > 0
            ? balls[
                balls.length - 1
            ]._id.toString()
            : null;

    /*
     * -------------------------------------------------------
     * 10. Return paginated result
     * -------------------------------------------------------
     */

    return {
        items: balls,

        pagination: {
            limit: parsedLimit,

            hasNextPage,

            nextCursor,
        },
    };
};


/*
 * =========================================================
 * Undo last ball event
 * =========================================================
 */

const processUndoTransaction = async (
    matchId,
    userId,
    session
) => {
    /*
     * -------------------------------------------------------
     * 1. Find match owned by current user
     * -------------------------------------------------------
     */

    const match =
        await Match.findOne({
            _id: matchId,
            createdBy: userId,
        }).session(session);

    if (!match) {
        throw createError(
            "Match not found",
            404
        );
    }

    /*
     * -------------------------------------------------------
     * 2. Find the latest ball
     * -------------------------------------------------------
     *
     * We intentionally find the latest BallEvent globally
     * for this match.
     *
     * This also handles the special case where innings 1
     * has just completed and innings 2 has been automatically
     * created but no ball has been recorded yet.
     */

    const lastBall =
        await BallEvent.findOne({
            match: match._id,
        })
            .sort({
                deliveryNumber: -1,
                _id: -1,
            })
            .session(session);

    if (!lastBall) {
        throw createError(
            "No ball event available to undo.",
            404
        );
    }

    /*
     * -------------------------------------------------------
     * 3. Find innings belonging to the last ball
     * -------------------------------------------------------
     */

    const innings =
        await Innings.findById(
            lastBall.innings
        ).session(session);

    if (!innings) {
        throw createError(
            "Innings for the last ball was not found.",
            404
        );
    }

    /*
     * -------------------------------------------------------
     * 4. Safety check
     * -------------------------------------------------------
     *
     * The last BallEvent must actually belong to the
     * latest scoring sequence.
     */

    if (
        innings.deliverySequence !==
        lastBall.deliveryNumber
    ) {
        throw createError(
            "Unable to safely undo the last ball because the delivery sequence is inconsistent.",
            409
        );
    }

    /*
     * -------------------------------------------------------
     * 5. Capture previous state from the BallEvent
     * -------------------------------------------------------
     *
     * BallEvent stores striker, non-striker and bowler
     * as they were when the ball was recorded.
     */

    const previousStriker =
        lastBall.striker;

    const previousNonStriker =
        lastBall.nonStriker;

    const previousBowler =
        lastBall.bowler;

    const wasLegalDelivery =
        lastBall.isLegalDelivery;

    const totalRuns =
        lastBall.runs?.total || 0;

    const extraRuns =
        lastBall.runs?.extras || 0;

    const wasWicket =
        lastBall.wicket?.isWicket === true;

    const dismissedPlayer =
        wasWicket
            ? lastBall.wicket?.playerOut
            : null;

    /*
     * -------------------------------------------------------
     * 6. Determine whether this ball completed an over
     * -------------------------------------------------------
     *
     * The ball number stored by the server is the position
     * of this delivery among legal balls.
     *
     * A legal ball whose legal ball count was divisible by 6
     * completed the over.
     */

    const overCompleted =
        wasLegalDelivery &&
        innings.legalBalls % 6 === 0;

    /*
     * -------------------------------------------------------
     * 7. Restore innings score
     * -------------------------------------------------------
     */

    innings.totalRuns =
        Math.max(
            0,
            innings.totalRuns -
                totalRuns
        );

    innings.totalExtras =
        Math.max(
            0,
            innings.totalExtras -
                extraRuns
        );

    if (wasWicket) {
        innings.totalWickets =
            Math.max(
                0,
                innings.totalWickets - 1
            );
    }

    if (wasLegalDelivery) {
        innings.legalBalls =
            Math.max(
                0,
                innings.legalBalls - 1
            );
    }

    innings.deliverySequence =
        Math.max(
            0,
            innings.deliverySequence - 1
        );

    /*
     * -------------------------------------------------------
     * 8. Restore dismissed player
     * -------------------------------------------------------
     */

    if (
        wasWicket &&
        dismissedPlayer
    ) {
        innings.dismissedPlayers =
            innings.dismissedPlayers.filter(
                (player) =>
                    !isSameId(
                        player,
                        dismissedPlayer
                    )
            );
    }

    /*
     * -------------------------------------------------------
     * 9. Restore crease
     * -------------------------------------------------------
     *
     * The BallEvent contains the striker/non-striker that
     * existed BEFORE this ball.
     *
     * Therefore these are the safest values to restore.
     */

    innings.striker =
        previousStriker;

    innings.nonStriker =
        previousNonStriker;

    innings.currentBowler =
        previousBowler;

    /*
     * -------------------------------------------------------
     * 10. Restore over state
     * -------------------------------------------------------
     *
     * If the undone ball was the 6th legal delivery,
     * the previous state did NOT require a new bowler.
     */

    if (overCompleted) {
        innings.requiresNewBowler =
            false;
    } else {
        /*
         * For all other balls we restore the state that
         * existed before the ball.
         *
         * A normal previous ball cannot leave
         * requiresNewBowler=true because another ball could
         * not legally have been recorded in that state.
         */
        innings.requiresNewBowler =
            false;
    }

    /*
     * -------------------------------------------------------
     * 11. Restore innings status
     * -------------------------------------------------------
     */

    innings.status =
        "LIVE";

    innings.completedAt =
        null;

    /*
     * -------------------------------------------------------
     * 12. Special case:
     *     Undo first-innings completion
     * -------------------------------------------------------
     *
     * When innings 1 completed, processBallTransaction()
     * automatically created innings 2 and changed:
     *
     * match.currentInnings = 2
     *
     * If the last ball belongs to innings 1, that means
     * innings 2 has not received any ball yet.
     *
     * Remove innings 2 and restore innings 1.
     */

    if (
        innings.inningsNumber === 1 &&
        match.currentInnings === 2
    ) {
        const secondInnings =
            await Innings.findOne({
                match: match._id,
                inningsNumber: 2,
            }).session(session);

        if (secondInnings) {
            const secondInningsBall =
                await BallEvent.exists({
                    match: match._id,
                    innings: secondInnings._id,
                }).session(session);

            if (!secondInningsBall) {
                await Innings.deleteOne(
                    {
                        _id: secondInnings._id,
                    },
                    {
                        session,
                    }
                );

                match.currentInnings =
                    1;
            }
        }
    }

    /*
     * -------------------------------------------------------
     * 13. Restore match state
     * -------------------------------------------------------
     *
     * If the undone ball was the final ball of innings 2,
     * the original scoring transaction may have changed:
     *
     * LIVE -> COMPLETED
     *
     * and assigned result/winner/completedAt.
     */

    if (
        match.status === "COMPLETED"
    ) {
        match.status =
            "LIVE";

        match.result =
            undefined;

        match.winner =
            undefined;

        match.completedAt =
            null;
    }

    /*
     * -------------------------------------------------------
     * 14. Delete last BallEvent
     * -------------------------------------------------------
     */

    await BallEvent.deleteOne(
        {
            _id: lastBall._id,
        },
        {
            session,
        }
    );

    /*
     * -------------------------------------------------------
     * 15. Save restored innings
     * -------------------------------------------------------
     */

    await innings.save({
        session,
    });

    /*
     * -------------------------------------------------------
     * 16. Save restored match
     * -------------------------------------------------------
     */

    await match.save({
        session,
    });

    /*
     * -------------------------------------------------------
     * 17. Return undo result
     * -------------------------------------------------------
     */

    return {
        undoneBallId:
            lastBall._id,

        inningsId:
            innings._id,

        inningsNumber:
            innings.inningsNumber,

        overNumber:
            lastBall.overNumber,

        ballNumber:
            lastBall.ballNumber,

        restored: {
            totalRuns:
                innings.totalRuns,

            totalWickets:
                innings.totalWickets,

            totalExtras:
                innings.totalExtras,

            legalBalls:
                innings.legalBalls,

            deliverySequence:
                innings.deliverySequence,

            striker:
                innings.striker,

            nonStriker:
                innings.nonStriker,

            currentBowler:
                innings.currentBowler,

            requiresNewBowler:
                innings.requiresNewBowler,

            inningsStatus:
                innings.status,

            matchStatus:
                match.status,

            currentInnings:
                match.currentInnings,

            result:
                match.result || null,

            winner:
                match.winner || null,
        },
    };
};

/*
 * =========================================================
 * Undo last ball event
 * =========================================================
 */

export const undoLastBallEvent = async (
    matchId,
    userId
) => {
    /*
     * -------------------------------------------------------
     * Validate match ID
     * -------------------------------------------------------
     */

    if (
        !mongoose.isValidObjectId(
            matchId
        )
    ) {
        throw createError(
            "Invalid match ID.",
            400
        );
    }

    /*
     * -------------------------------------------------------
     * Validate user ID
     * -------------------------------------------------------
     */

    if (
        !mongoose.isValidObjectId(
            userId
        )
    ) {
        throw createError(
            "Invalid user ID.",
            400
        );
    }

    let lastError;

    /*
     * -------------------------------------------------------
     * Retry transaction conflicts
     * -------------------------------------------------------
     */

    for (
        let attempt = 1;
        attempt <=
        MAX_TRANSACTION_RETRIES;
        attempt += 1
    ) {
        const session =
            await mongoose.startSession();

        try {
            let result;

            await session.withTransaction(
                async () => {
                    result =
                        await processUndoTransaction(
                            matchId,
                            userId,
                            session
                        );
                },
                {
                    readConcern: {
                        level: "snapshot",
                    },

                    writeConcern: {
                        w: "majority",
                    },

                    readPreference:
                        "primary",
                }
            );

            const populatedInnings =
                await populateInnings(
                    result.inningsId
                );

            return {
                undoneBallId:
                    result.undoneBallId,

                innings:
                    populatedInnings,

                restored:
                    result.restored,
            };
        } catch (error) {
            lastError =
                error;

            if (
                !isTransactionRetryable(
                    error
                ) ||
                attempt ===
                MAX_TRANSACTION_RETRIES
            ) {
                throw error;
            }

            await sleep(
                25 * attempt
            );
        } finally {
            await session.endSession();
        }
    }

    throw lastError;
};