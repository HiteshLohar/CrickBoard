import PublicMatch from "../models/PublicMatch.js";
import Match from "../models/Match.js";
import MatchPlayer from "../models/MatchPlayer.js";
import Innings from "../models/Innings.js";
import BallEvent from "../models/BallEvent.js";

import {
    calculateBatting,
    calculateBowling,
    calculateExtras,
    calculateFallOfWickets,
} from "./scorecard.service.js";

import { createError } from "../utils/createError.js";

const formatOvers = (legalBalls = 0) => {
    const overs = Math.floor(legalBalls / 6);
    const balls = legalBalls % 6;

    return `${overs}.${balls}`;
};

const getPublicTeamPlayers = async (
    matchId,
    team
) => {
    const matchPlayers =
        await MatchPlayer.find({
            match: matchId,
            team: team._id,
            isPlaying: true,
        })
            .populate(
                "player",
                "name shortName role"
            )
            .lean();

    const playingPlayerIds = new Set(
        matchPlayers.map(
            (item) =>
                item.player._id.toString()
        )
    );

    const playingXI = matchPlayers.map(
        (item) => ({
            id: item.player._id,
            name: item.player.name,
            shortName:
                item.player.shortName,
            role: item.player.role,
            isCaptain:
                item.isCaptain,
            isWicketKeeper:
                item.isWicketKeeper,
        })
    );

    const notPlaying = team.players
        .filter(
            (player) =>
                !playingPlayerIds.has(
                    player._id.toString()
                )
        )
        .map((player) => ({
            id: player._id,
            name: player.name,
            shortName:
                player.shortName,
            role: player.role,
        }));

    return {
        id: team._id,
        name: team.name,
        shortName: team.shortName,
        logo: team.logo,
        playingXI,
        notPlaying,
    };
};

const getInningsBalls = async (
    matchId,
    inningsId
) => {
    return BallEvent.find({
        match: matchId,
        innings: inningsId,
    })
        .sort({
            deliveryNumber: 1,
        })
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
};

const buildPublicInnings = async (
    matchId,
    innings
) => {
    const balls = await getInningsBalls(
        matchId,
        innings._id
    );

    const batting =
        calculateBatting(balls);

    const bowling =
        calculateBowling(balls);

    const extras =
        calculateExtras(balls);

    const fallOfWickets =
        calculateFallOfWickets(balls);

    return {
        id: innings._id,
        inningsNumber:
            innings.inningsNumber,

        battingTeam: innings.battingTeam,

        bowlingTeam: innings.bowlingTeam,

        score: {
            runs: innings.totalRuns,
            wickets:
                innings.totalWickets,
            overs: formatOvers(
                innings.legalBalls
            ),
        },

        batting,

        bowling,

        extras,

        fallOfWickets,
    };
};

export const getPublicLiveMatch = async (
    publicId
) => {
    if (
        !publicId ||
        typeof publicId !== "string"
    ) {
        throw createError(
            "Invalid public match ID",
            400
        );
    }

    const publicMatch =
        await PublicMatch.findOne({
            publicId: publicId.trim(),
            isActive: true,
        });

    if (!publicMatch) {
        throw createError(
            "Public match not found",
            404
        );
    }

    const match =
        await Match.findById(
            publicMatch.match
        )
            .populate({
                path: "teamA",
                select:
                    "name shortName logo players",
                populate: {
                    path: "players",
                    select:
                        "name shortName role",
                },
            })
            .populate({
                path: "teamB",
                select:
                    "name shortName logo players",
                populate: {
                    path: "players",
                    select:
                        "name shortName role",
                },
            })
            .populate(
                "winner",
                "name shortName logo"
            )
            .lean();

    if (!match) {
        throw createError(
            "Match not found",
            404
        );
    }

    const teamAData =
        await getPublicTeamPlayers(
            match._id,
            match.teamA
        );

    const teamBData =
        await getPublicTeamPlayers(
            match._id,
            match.teamB
        );

    if (
        match.status === "DRAFT" ||
        match.status === "SCHEDULED"
    ) {
        if (
            !match.toss?.wonBy ||
            !match.toss?.decision
        ) {
            throw createError(
                "Toss is pending",
                409,
                {
                    code:
                        "TOSS_REQUIRED",
                    nextAction:
                        "SET_TOSS",
                    matchStatus:
                        match.status,
                }
            );
        }

        throw createError(
            "Match is ready to start",
            409,
            {
                code:
                    "MATCH_START_REQUIRED",
                nextAction:
                    "START_MATCH",
                matchStatus:
                    match.status,

                teams: {
                    teamA: teamAData,
                    teamB: teamBData,
                },
            }
        );
    }

    const innings =
        await Innings.findOne({
            match: match._id,
            inningsNumber:
                match.currentInnings,
        })
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
            .lean();

    if (!innings) {
        throw createError(
            "Current innings not found",
            404
        );
    }

    let target = null;

    if (
        innings.inningsNumber === 2
    ) {
        const firstInnings =
            await Innings.findOne({
                match: match._id,
                inningsNumber: 1,
            }).select("totalRuns");

        if (firstInnings) {
            target =
                firstInnings.totalRuns + 1;
        }
    }

    const recentBalls =
        await BallEvent.find({
            match: match._id,
            innings: innings._id,
        })
            .sort({
                deliveryNumber: -1,
            })
            .limit(12)
            .populate(
                "striker",
                "name shortName"
            )
            .populate(
                "nonStriker",
                "name shortName"
            )
            .populate(
                "bowler",
                "name shortName"
            )
            .populate(
                "wicket.playerOut",
                "name shortName"
            )
            .populate(
                "wicket.fielder",
                "name shortName"
            )
            .lean();

    /*
     * Current innings complete stats.
     */
    const currentBalls =
        await getInningsBalls(
            match._id,
            innings._id
        );

    const batting =
        calculateBatting(
            currentBalls
        );

    const bowling =
        calculateBowling(
            currentBalls
        );

    const extras =
        calculateExtras(
            currentBalls
        );

    const fallOfWickets =
        calculateFallOfWickets(
            currentBalls
        );

    /*
     * Get all innings for the
     * complete public scorecard.
     */
    const allInnings =
        await Innings.find({
            match: match._id,
        })
            .sort({
                inningsNumber: 1,
            })
            .populate(
                "battingTeam",
                "name shortName logo"
            )
            .populate(
                "bowlingTeam",
                "name shortName logo"
            )
            .lean();

    const scorecard = [];

    for (
        const inningsItem of allInnings
    ) {
        scorecard.push(
            await buildPublicInnings(
                match._id,
                inningsItem
            )
        );
    }

    const completedOvers =
        Math.floor(
            innings.legalBalls / 6
        );

    const currentBall =
        innings.legalBalls % 6;

    return {
        match: {
            id: match._id,

            matchCode:
                match.matchCode,

            title: match.title,

            status:
                match.status,

            result:
                match.result || null,

            winner:
                match.winner || null,

            teamA: teamAData,

            teamB: teamBData,

            playersPerTeam:
                match.playersPerTeam,

            totalOvers:
                match.totalOvers,

            currentInnings:
                match.currentInnings,

            startedAt:
                match.startedAt || null,

            completedAt:
                match.completedAt ||
                null,
        },

        innings: {
            id: innings._id,

            inningsNumber:
                innings.inningsNumber,

            battingTeam:
                innings.battingTeam,

            bowlingTeam:
                innings.bowlingTeam,

            totalRuns:
                innings.totalRuns,

            totalWickets:
                innings.totalWickets,

            totalExtras:
                innings.totalExtras,

            legalBalls:
                innings.legalBalls,

            overs: `${completedOvers}.${currentBall}`,

            target,

            striker:
                innings.striker ||
                null,

            nonStriker:
                innings.nonStriker ||
                null,

            currentBowler:
                innings.currentBowler ||
                null,

            requiresNewBowler:
                innings.requiresNewBowler,

            status:
                innings.status,

            batting,

            bowling,

            extras,

            fallOfWickets,
        },

        scorecard,

        recentBalls:
            recentBalls.reverse(),
    };
};