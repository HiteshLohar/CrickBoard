import mongoose from "mongoose";

import Match from "../models/Match.js";
import Innings from "../models/Innings.js";
import BallEvent from "../models/BallEvent.js";

const createError = (message, statusCode = 400) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

const roundToTwo = (value) =>
    Math.round((value + Number.EPSILON) * 100) / 100;

const formatOvers = (legalBalls = 0) => {
    const overs = Math.floor(legalBalls / 6);
    const balls = legalBalls % 6;

    return `${overs}.${balls}`;
};

const getDismissalText = (wicket) => {
    if (!wicket?.isWicket) {
        return "Not Out";
    }

    const dismissalMap = {
        BOWLED: "Bowled",
        CAUGHT: "Caught",
        LBW: "LBW",
        RUN_OUT: "Run Out",
        STUMPED: "Stumped",
        HIT_WICKET: "Hit Wicket",
        RETIRED_HURT: "Retired Hurt",
    };

    return dismissalMap[wicket.kind] || "Out";
};

const isBowlerWicket = (kind) => {
    return new Set([
        "BOWLED",
        "CAUGHT",
        "LBW",
        "STUMPED",
        "HIT_WICKET",
    ]).has(kind);
};

const getBowlerRunsConceded = (ball) => {
    const totalRuns = ball.runs?.total || 0;

    if (
        ball.extras?.type === "BYE" ||
        ball.extras?.type === "LEG_BYE"
    ) {
        return totalRuns - (ball.extras?.runs || 0);
    }

    return totalRuns;
};

const getPlayerData = (player) => {
    if (!player) {
        return null;
    }

    return {
        _id: player._id,
        name: player.name,
        shortName: player.shortName,
    };
};

export const calculateBatting = (balls) => {
    const battingMap = new Map();

    for (const ball of balls) {
        const strikerId = ball.striker?._id?.toString();

        if (!strikerId) {
            continue;
        }

        if (!battingMap.has(strikerId)) {
            battingMap.set(strikerId, {
                player: getPlayerData(ball.striker),
                runs: 0,
                balls: 0,
                fours: 0,
                sixes: 0,
                dismissal: "Not Out",
            });
        }

        const batter = battingMap.get(strikerId);

        const batterRuns = ball.runs?.batter || 0;

        batter.runs += batterRuns;

        if (ball.isLegalDelivery) {
            batter.balls += 1;
        }

        if (batterRuns === 4) {
            batter.fours += 1;
        }

        if (batterRuns === 6) {
            batter.sixes += 1;
        }
    }

    for (const ball of balls) {
        if (!ball.wicket?.isWicket) {
            continue;
        }

        const playerOutId =
            ball.wicket.playerOut?._id?.toString();

        if (!playerOutId) {
            continue;
        }

        const batter = battingMap.get(playerOutId);

        if (batter) {
            batter.dismissal =
                getDismissalText(ball.wicket);
        }
    }

    return Array.from(battingMap.values()).map(
        (batter) => ({
            ...batter,
            strikeRate:
                batter.balls > 0
                    ? roundToTwo(
                          (batter.runs / batter.balls) * 100
                      )
                    : 0,
        })
    );
};

export const calculateBowling = (balls) => {
    const bowlingMap = new Map();

    for (const ball of balls) {
        const bowlerId = ball.bowler?._id?.toString();

        if (!bowlerId) {
            continue;
        }

        if (!bowlingMap.has(bowlerId)) {
            bowlingMap.set(bowlerId, {
                player: getPlayerData(ball.bowler),
                legalBalls: 0,
                runs: 0,
                wickets: 0,
                oversMap: new Map(),
            });
        }

        const bowler = bowlingMap.get(bowlerId);

        const concededRuns =
            getBowlerRunsConceded(ball);

        bowler.runs += concededRuns;

        if (ball.isLegalDelivery) {
            bowler.legalBalls += 1;
        }

        if (
            ball.wicket?.isWicket &&
            isBowlerWicket(ball.wicket.kind)
        ) {
            bowler.wickets += 1;
        }

        const overNumber = ball.overNumber;

        if (!bowler.oversMap.has(overNumber)) {
            bowler.oversMap.set(overNumber, {
                legalBalls: 0,
                runs: 0,
            });
        }

        const over = bowler.oversMap.get(overNumber);

        over.runs += concededRuns;

        if (ball.isLegalDelivery) {
            over.legalBalls += 1;
        }
    }

    return Array.from(bowlingMap.values()).map(
        (bowler) => {
            let maidens = 0;

            for (const over of bowler.oversMap.values()) {
                if (
                    over.legalBalls === 6 &&
                    over.runs === 0
                ) {
                    maidens += 1;
                }
            }

            const oversDecimal =
                bowler.legalBalls / 6;

            return {
                player: bowler.player,
                overs: formatOvers(
                    bowler.legalBalls
                ),
                maidens,
                runs: bowler.runs,
                wickets: bowler.wickets,
                economy:
                    bowler.legalBalls > 0
                        ? roundToTwo(
                              bowler.runs /
                                  oversDecimal
                          )
                        : 0,
            };
        }
    );
};

export const calculateExtras = (balls) => {
    const extras = {
        wides: 0,
        noBalls: 0,
        byes: 0,
        legByes: 0,
        penalty: 0,
        total: 0,
    };

    for (const ball of balls) {
        const type = ball.extras?.type;
        const runs = ball.extras?.runs || 0;

        switch (type) {
            case "WIDE":
                extras.wides += runs;
                break;

            case "NO_BALL":
                extras.noBalls += runs;
                break;

            case "BYE":
                extras.byes += runs;
                break;

            case "LEG_BYE":
                extras.legByes += runs;
                break;

            default:
                break;
        }
    }

    extras.total =
        extras.wides +
        extras.noBalls +
        extras.byes +
        extras.legByes +
        extras.penalty;

    return extras;
};

export const calculateFallOfWickets = (balls) => {
    const fallOfWickets = [];

    let cumulativeScore = 0;
    let wicketNumber = 0;

    for (const ball of balls) {
        cumulativeScore += ball.runs?.total || 0;

        if (!ball.wicket?.isWicket) {
            continue;
        }

        wicketNumber += 1;

        fallOfWickets.push({
            wicketNumber,
            player: getPlayerData(
                ball.wicket.playerOut
            ),
            score: cumulativeScore,
            over: `${ball.overNumber}.${ball.ballNumber}`,
        });
    }

    return fallOfWickets;
};

const calculateResultMargin = (
    match,
    innings
) => {
    if (!match.result) {
        return null;
    }

    if (match.result === "TIE") {
        return "Match tied";
    }

    if (match.result === "NO_RESULT") {
        return "No result";
    }

    if (innings.length < 2) {
        return null;
    }

    const firstInnings = innings.find(
        (item) => item.inningsNumber === 1
    );

    const secondInnings = innings.find(
        (item) => item.inningsNumber === 2
    );

    if (!firstInnings || !secondInnings) {
        return null;
    }

    const winnerId =
        match.winner?._id?.toString();

    if (!winnerId) {
        return null;
    }

    const secondBattingTeamId =
        secondInnings.battingTeam._id.toString();

    if (
        winnerId === secondBattingTeamId
    ) {
        const wicketsRemaining =
            Math.max(
                0,
                match.playersPerTeam -
                    1 -
                    secondInnings.totalWickets
            );

        return `${wicketsRemaining} wickets`;
    }

    const runsMargin =
        firstInnings.totalRuns -
        secondInnings.totalRuns;

    return `${runsMargin} runs`;
};

export const getScorecardData = async (
    matchId,
    userId
) => {
    if (!mongoose.isValidObjectId(matchId)) {
        throw createError(
            "Invalid match ID",
            400
        );
    }

    const match = await Match.findOne({
        _id: matchId,
        createdBy: userId,
    })
        .populate(
            "teamA",
            "name shortName"
        )
        .populate(
            "teamB",
            "name shortName"
        )
        .populate(
            "winner",
            "name shortName"
        )
        .lean();

    if (!match) {
        throw createError(
            "Match not found",
            404
        );
    }

    const inningsList = await Innings.find({
        match: match._id,
    })
        .sort({
            inningsNumber: 1,
        })
        .populate(
            "battingTeam",
            "name shortName"
        )
        .populate(
            "bowlingTeam",
            "name shortName"
        )
        .lean();

    if (!inningsList.length) {
        throw createError(
            "No innings found for this match",
            404
        );
    }

    const resultInnings = [];

    for (const innings of inningsList) {
        const balls = await BallEvent.find({
            match: match._id,
            innings: innings._id,
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

        const batting =
            calculateBatting(balls);

        const bowling =
            calculateBowling(balls);

        const extras =
            calculateExtras(balls);

        const fallOfWickets =
            calculateFallOfWickets(balls);

        resultInnings.push({
            inningsNumber:
                innings.inningsNumber,

            team: {
                _id: innings.battingTeam._id,
                name: innings.battingTeam.name,
                shortName:
                    innings.battingTeam.shortName,
            },

            score: {
                runs: innings.totalRuns,
                wickets: innings.totalWickets,
                overs: formatOvers(
                    innings.legalBalls
                ),
            },

            batting,

            bowling,

            extras,

            fallOfWickets,
        });
    }

    const margin =
        calculateResultMargin(
            match,
            inningsList
        );

    return {
        match: {
            _id: match._id,
            title: match.title,
            status: match.status,
            result: match.result || null,
            winner: match.winner
                ? {
                      _id: match.winner._id,
                      name: match.winner.name,
                      shortName:
                          match.winner.shortName,
                  }
                : null,
        },

        innings: resultInnings,

        result: {
            status: match.result || null,

            winner: match.winner
                ? {
                      _id: match.winner._id,
                      name: match.winner.name,
                      shortName:
                          match.winner.shortName,
                  }
                : null,

            margin,
        },
    };
};