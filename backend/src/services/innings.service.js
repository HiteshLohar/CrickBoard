import mongoose from "mongoose";
import Match from "../models/Match.js";
import Innings from "../models/Innings.js";
import MatchPlayer from "../models/MatchPlayer.js";

const createError = (message, statusCode = 400) => {
    const error = new Error(message);
    error.statusCode = statusCode;
    return error;
};

export const selectNewBatter = async (matchId, userId, playerId) => {
    if (
        !mongoose.Types.ObjectId.isValid(matchId) ||
        !mongoose.Types.ObjectId.isValid(playerId)
    ) {
        throw createError("Invalid match or player ID", 400);
    }

    const match = await Match.findOne({
        _id: matchId,
        createdBy: userId,
    });

    if (!match) {
        throw createError("Match not found", 404);
    }

    if (match.status !== "LIVE") {
        throw createError("Match is not live", 400);
    }

    const innings = await Innings.findOne({
        match: match._id,
        inningsNumber: match.currentInnings,
        status: "LIVE",
    });

    if (!innings) {
        throw createError("Live innings not found", 404);
    }

    // New batter must belong to the batting team's Playing XI.
    const playingPlayer = await MatchPlayer.findOne({
        match: match._id,
        team: innings.battingTeam,
        player: playerId,
    });

    if (!playingPlayer) {
        throw createError(
            "Selected player is not part of the batting team's Playing XI",
            400
        );
    }

    // New batter cannot already be dismissed.
    const alreadyDismissed = innings.dismissedPlayers.some(
        (player) => player.toString() === playerId.toString()
    );

    if (alreadyDismissed) {
        throw createError("Player has already been dismissed", 400);
    }

    // New batter cannot already be on the crease.
    if (
        innings.striker?.toString() === playerId.toString() ||
        innings.nonStriker?.toString() === playerId.toString()
    ) {
        throw createError(
            "Player is already batting",
            400
        );
    }

    // At least one wicket must have occurred.
    if (innings.dismissedPlayers.length === 0) {
        throw createError(
            "No wicket has occurred. A new batter cannot be selected",
            400
        );
    }

    /*
     * The scoring service should temporarily clear the dismissed
     * batter's position when recording the wicket.
     *
     * Therefore:
     * - striker === null  -> replace striker
     * - nonStriker === null -> replace non-striker
     *
     * We intentionally do not guess which batter was dismissed.
     */
    if (!innings.striker && !innings.nonStriker) {
        throw createError(
            "Both batting positions are empty. New batter position cannot be determined",
            400
        );
    }

    if (innings.striker && innings.nonStriker) {
        throw createError(
            "No batting position is currently available for a new batter",
            400
        );
    }

    if (!innings.striker) {
        innings.striker = playerId;
    } else {
        innings.nonStriker = playerId;
    }

    await innings.save();

    const populatedInnings = await Innings.findById(innings._id)
        .populate("battingTeam", "name shortName")
        .populate("bowlingTeam", "name shortName")
        .populate("striker", "name shortName role")
        .populate("nonStriker", "name shortName role")
        .populate("currentBowler", "name shortName role")
        .populate("dismissedPlayers", "name shortName role");

    return populatedInnings;
};

export const getCurrentInnings = async (matchId, userId) => {
    if (!mongoose.Types.ObjectId.isValid(matchId)) {
        throw createError("Invalid match ID", 400);
    }

    const match = await Match.findOne({
        _id: matchId,
        createdBy: userId,
    });

    if (!match) {
        throw createError("Match not found", 404);
    }

    const innings = await Innings.findOne({
        match: match._id,
        inningsNumber: match.currentInnings,
    })
        .populate("battingTeam", "name shortName logo")
        .populate("bowlingTeam", "name shortName logo")
        .populate("striker", "name shortName role")
        .populate("nonStriker", "name shortName role")
        .populate("currentBowler", "name shortName role")
        .populate("dismissedPlayers", "name shortName role");

    if (!innings) {
        throw createError("Innings not found", 404);
    }

    const inningsData = innings.toObject();

    let target = null;

    if (innings.inningsNumber === 2) {
        const firstInnings = await Innings.findOne({
            match: match._id,
            inningsNumber: 1,
        }).select("totalRuns");

        if (firstInnings) {
            target = firstInnings.totalRuns + 1;
        }
    }

    const requiresOpeningPlayers =
        innings.status === "LIVE" &&
        !innings.striker &&
        !innings.nonStriker &&
        !innings.currentBowler;

    return {
        ...inningsData,
        target,
        requiresOpeningPlayers,
    };
};
export const selectNextBowler = async (matchId, userId, playerId) => {
    if (
        !mongoose.Types.ObjectId.isValid(matchId) ||
        !mongoose.Types.ObjectId.isValid(playerId)
    ) {
        throw createError("Invalid match or player ID", 400);
    }

    const match = await Match.findOne({
        _id: matchId,
        createdBy: userId,
    });

    if (!match) {
        throw createError("Match not found", 404);
    }

    if (match.status !== "LIVE") {
        throw createError("Match is not live", 400);
    }

    const innings = await Innings.findOne({
        match: match._id,
        inningsNumber: match.currentInnings,
        status: "LIVE",
    });

    if (!innings) {
        throw createError("Live innings not found", 404);
    }

    // Check whether the current over is actually complete.
    if (innings.legalBalls % 6 !== 0) {
        throw createError(
            "Current over is not completed yet",
            400
        );
    }

    // New bowler must belong to the bowling team's Playing XI.
    const playingPlayer = await MatchPlayer.findOne({
        match: match._id,
        team: innings.bowlingTeam,
        player: playerId,
        isPlaying: true,
    });

    if (!playingPlayer) {
        throw createError(
            "Selected player is not part of the bowling team's Playing XI",
            400
        );
    }

    // Same bowler cannot bowl consecutive overs.
    if (
        innings.currentBowler &&
        innings.currentBowler.toString() === playerId.toString()
    ) {
        throw createError(
            "The same bowler cannot bowl consecutive overs",
            400
        );
    }
    innings.currentBowler = playerId;
    innings.requiresNewBowler = false;

    await innings.save();

    const populatedInnings = await Innings.findById(innings._id)
        .populate("battingTeam", "name shortName")
        .populate("bowlingTeam", "name shortName")
        .populate("striker", "name shortName role")
        .populate("nonStriker", "name shortName role")
        .populate("currentBowler", "name shortName role")
        .populate("dismissedPlayers", "name shortName role");

    return populatedInnings;
};