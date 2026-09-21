import crypto from "crypto";

import Match from "../models/Match.js";
import PublicMatch from "../models/PublicMatch.js";
import Team from "../models/Team.js";
import Player from "../models/Player.js";
import MatchPlayer from "../models/MatchPlayer.js";
import Innings from "../models/Innings.js";

import { createError } from "../utils/createError.js";

const getOwnedActiveTeams = async (teamAId, teamBId, userId) => {
  const teams = await Team.find({
    _id: { $in: [teamAId, teamBId] },
    owner: userId,
    isActive: true,
  });

  if (teams.length !== 2) {
    const error = new Error(
      "One or both teams are invalid, inactive, or do not belong to you."
    );
    error.statusCode = 400;
    throw error;
  }

  return teams;
};

/**
 * Create Match
 */
export const createMatch = async ({
  matchCode,
  title,
  teamA,
  teamB,
  playersPerTeam,
  totalOvers,
  status,
  toss,
  userId,
}) => {
  // --------------------------------------------------
  // 1. Validate Team A and Team B are different
  // --------------------------------------------------
  if (teamA === teamB) {
    throw createError(
      "Team A and Team B must be different.",
      400
    );
  }

  // --------------------------------------------------
  // 2. Check duplicate match code
  // --------------------------------------------------
  const existingMatch = await Match.findOne({
    matchCode: matchCode.toUpperCase(),
  });

  if (existingMatch) {
    throw createError(
      "Match code already exists.",
      409
    );
  }

  // --------------------------------------------------
  // 3. Get owned active teams
  // --------------------------------------------------
  const teams = await getOwnedActiveTeams(
    teamA,
    teamB,
    userId
  );

  const teamADocument = teams.find(
    (team) => team._id.toString() === teamA
  );

  const teamBDocument = teams.find(
    (team) => team._id.toString() === teamB
  );

  if (!teamADocument || !teamBDocument) {
    throw createError(
      "One or both teams not found or inactive.",
      404
    );
  }

  // --------------------------------------------------
  // 4. Validate player count of Team A
  // --------------------------------------------------
  const teamAPlayerCount =
    teamADocument.players.length;

  if (
    teamAPlayerCount < 5 ||
    teamAPlayerCount > 14
  ) {
    throw createError(
      "Team A must have between 5 and 14 players.",
      400
    );
  }

  // --------------------------------------------------
  // 5. Validate player count of Team B
  // --------------------------------------------------
  const teamBPlayerCount =
    teamBDocument.players.length;

  if (
    teamBPlayerCount < 5 ||
    teamBPlayerCount > 14
  ) {
    throw createError(
      "Team B must have between 5 and 14 players.",
      400
    );
  }

  // --------------------------------------------------
  // 6. playersPerTeam must match both teams
  // --------------------------------------------------
  if (
    teamAPlayerCount < playersPerTeam ||
    teamBPlayerCount < playersPerTeam
  ) {
    throw createError(
      `Each team must have at least ${playersPerTeam} players. Team A has ${teamAPlayerCount} and Team B has ${teamBPlayerCount}.`,
      400
    );
  }

  // --------------------------------------------------
  // 7. Validate toss winner
  // --------------------------------------------------
  if (toss?.wonBy) {
    const tossWinner = toss.wonBy.toString();

    if (
      tossWinner !== teamA &&
      tossWinner !== teamB
    ) {
      throw createError(
        "Toss winner must be either Team A or Team B.",
        400
      );
    }
  }

  // --------------------------------------------------
  // 8. Create Match
  // --------------------------------------------------
  const match = await Match.create({
    matchCode: matchCode.toUpperCase(),
    title,
    createdBy: userId,
    teamA,
    teamB,
    playersPerTeam,
    totalOvers,
    status: status || "DRAFT",
    toss,
  });

  // --------------------------------------------------
  // 9. Generate Public Match ID
  // --------------------------------------------------
  let publicId;

  while (!publicId) {
    const generatedId =
      crypto.randomBytes(9).toString("base64url");

    const existingPublicMatch =
      await PublicMatch.findOne({
        publicId: generatedId,
      });

    if (!existingPublicMatch) {
      publicId = generatedId;
    }
  }

  // --------------------------------------------------
  // 10. Create Public Match
  // --------------------------------------------------
  await PublicMatch.create({
    publicId,
    match: match._id,
    isActive: true,
  });

  // --------------------------------------------------
  // 11. Return populated Match
  // --------------------------------------------------
  return Match.findById(match._id)
    .populate(
      "teamA",
      "name shortName logo players"
    )
    .populate(
      "teamB",
      "name shortName logo players"
    )
    .populate(
      "toss.wonBy",
      "name shortName"
    );
};

export const getMatches = async (userId) => {
  return Match.find({
    createdBy: userId,
  })
    .populate(
      "teamA",
      "name shortName logo"
    )
    .populate(
      "teamB",
      "name shortName logo"
    )
    .populate(
      "toss.wonBy",
      "name shortName"
    )
    .sort({ createdAt: -1 });
};

export const getMatchById = async (
  matchId,
  userId
) => {
  const match = await Match.findOne({
    _id: matchId,
    createdBy: userId,
  })
    .populate(
      "teamA",
      "name shortName logo players"
    )
    .populate(
      "teamB",
      "name shortName logo players"
    )
    .populate(
      "toss.wonBy",
      "name shortName"
    );

  if (!match) {
    const error = new Error("Match not found");
    error.statusCode = 404;
    throw error;
  }

  return match;
};

export const setPlayingXI = async (
  matchId,
  userId,
  teamAPlayers,
  teamBPlayers
) => {
  // -----------------------------------------
  // 1. Find match owned by current user
  // -----------------------------------------
  const match = await Match.findOne({
    _id: matchId,
    createdBy: userId,
  });

  if (!match) {
    const error = new Error("Match not found");
    error.statusCode = 404;
    throw error;
  }

  // -----------------------------------------
  // 2. Prevent changing XI after match starts
  // -----------------------------------------
  if (["LIVE", "COMPLETED"].includes(match.status)) {
    const error = new Error(
      "Playing XI cannot be changed after the match has started."
    );
    error.statusCode = 400;
    throw error;
  }

  // -----------------------------------------
  // 3. Validate number of players
  // -----------------------------------------
  if (
    teamAPlayers.length !== match.playersPerTeam ||
    teamBPlayers.length !== match.playersPerTeam
  ) {
    const error = new Error(
      `Each team must have exactly ${match.playersPerTeam} playing players.`
    );
    error.statusCode = 400;
    throw error;
  }

  // -----------------------------------------
  // 4. Prevent same player appearing twice
  // -----------------------------------------
  const allPlayers = [
    ...teamAPlayers,
    ...teamBPlayers,
  ];

  const uniquePlayers = new Set(
    allPlayers.map((playerId) => playerId.toString())
  );

  if (uniquePlayers.size !== allPlayers.length) {
    const error = new Error(
      "A player cannot appear more than once in the Playing XI."
    );
    error.statusCode = 400;
    throw error;
  }

  // -----------------------------------------
  // 5. Verify both teams
  // -----------------------------------------
  const teams = await Team.find({
    _id: {
      $in: [match.teamA, match.teamB],
    },
    owner: userId,
    isActive: true,
  });

  if (teams.length !== 2) {
    const error = new Error(
      "One or both teams are invalid or inactive."
    );
    error.statusCode = 400;
    throw error;
  }

  // -----------------------------------------
  // 6. Get team IDs
  // -----------------------------------------
  const teamAId = match.teamA.toString();
  const teamBId = match.teamB.toString();

  // -----------------------------------------
  // 7. Verify Team A players
  // -----------------------------------------
  const validTeamAPlayers = await Player.find({
    _id: { $in: teamAPlayers },
    createdBy: userId,
    isActive: true,
  }).select("_id");

  if (validTeamAPlayers.length !== teamAPlayers.length) {
    const error = new Error(
      "One or more Team A players are invalid or inactive."
    );
    error.statusCode = 400;
    throw error;
  }

  const teamAPlayerIds = new Set(
    teams
      .find(
        (team) => team._id.toString() === teamAId
      )
      .players.map((id) => id.toString())
  );

  const invalidTeamAPlayer = teamAPlayers.some(
    (playerId) =>
      !teamAPlayerIds.has(playerId.toString())
  );

  if (invalidTeamAPlayer) {
    const error = new Error(
      "One or more Team A players do not belong to Team A."
    );
    error.statusCode = 400;
    throw error;
  }

  // -----------------------------------------
  // 8. Verify Team B players
  // -----------------------------------------
  const validTeamBPlayers = await Player.find({
    _id: { $in: teamBPlayers },
    createdBy: userId,
    isActive: true,
  }).select("_id");

  if (validTeamBPlayers.length !== teamBPlayers.length) {
    const error = new Error(
      "One or more Team B players are invalid or inactive."
    );
    error.statusCode = 400;
    throw error;
  }

  const teamBPlayerIds = new Set(
    teams
      .find(
        (team) => team._id.toString() === teamBId
      )
      .players.map((id) => id.toString())
  );

  const invalidTeamBPlayer = teamBPlayers.some(
    (playerId) =>
      !teamBPlayerIds.has(playerId.toString())
  );

  if (invalidTeamBPlayer) {
    const error = new Error(
      "One or more Team B players do not belong to Team B."
    );
    error.statusCode = 400;
    throw error;
  }

  // -----------------------------------------
  // 9. Replace existing Playing XI
  // -----------------------------------------
  await MatchPlayer.deleteMany({
    match: match._id,
  });

  const matchPlayers = [
    ...teamAPlayers.map((playerId) => ({
      match: match._id,
      team: match.teamA,
      player: playerId,
      isPlaying: true,
    })),

    ...teamBPlayers.map((playerId) => ({
      match: match._id,
      team: match.teamB,
      player: playerId,
      isPlaying: true,
    })),
  ];

  await MatchPlayer.insertMany(matchPlayers);

  // -----------------------------------------
  // 10. Return Playing XI
  // -----------------------------------------
  return MatchPlayer.find({
    match: match._id,
    isPlaying: true,
  })
    .populate("player", "name shortName role")
    .populate("team", "name shortName");
};

export const setToss = async (
  matchId,
  userId,
  wonBy,
  decision
) => {
  const match = await Match.findOne({
    _id: matchId,
    createdBy: userId,
  });

  if (!match) {
    const error = new Error("Match not found");
    error.statusCode = 404;
    throw error;
  }

  // Toss can only be set before match starts
  if (
    ["LIVE", "COMPLETED", "ABANDONED", "CANCELLED"].includes(
      match.status
    )
  ) {
    const error = new Error(
      "Toss cannot be changed after the match has started."
    );

    error.statusCode = 400;
    throw error;
  }

  // Toss can only be performed once
  if (match.toss?.wonBy || match.toss?.decision) {
    const error = new Error(
      "Toss has already been completed for this match."
    );

    error.statusCode = 409;
    throw error;
  }

  // Make sure winner is one of the match teams
  const teamAId = match.teamA.toString();
  const teamBId = match.teamB.toString();
  const tossWinnerId = wonBy.toString();

  if (
    tossWinnerId !== teamAId &&
    tossWinnerId !== teamBId
  ) {
    const error = new Error(
      "Toss winner must be Team A or Team B."
    );

    error.statusCode = 400;
    throw error;
  }

  // Make sure both teams are still valid
  const teams = await Team.find({
    _id: {
      $in: [match.teamA, match.teamB],
    },
    owner: userId,
    isActive: true,
  }).select("_id name shortName");

  if (teams.length !== 2) {
    const error = new Error(
      "One or both teams are invalid, inactive, or do not belong to you."
    );

    error.statusCode = 400;
    throw error;
  }

  // Playing XI must be selected before toss
  const playingPlayersCount = await MatchPlayer.countDocuments({
    match: match._id,
    isPlaying: true,
  });

  const expectedPlayers =
    match.playersPerTeam * 2;

  if (playingPlayersCount !== expectedPlayers) {
    const error = new Error(
      "Playing XI must be set for both teams before the toss."
    );

    error.statusCode = 400;
    throw error;
  }

  // Save toss
  match.toss = {
    wonBy,
    decision,
  };

  await match.save();

  return Match.findById(match._id)
    .populate(
      "teamA",
      "name shortName logo"
    )
    .populate(
      "teamB",
      "name shortName logo"
    )
    .populate(
      "toss.wonBy",
      "name shortName"
    );
};

export const startMatch = async (
  matchId,
  userId
) => {
  const match = await Match.findOne({
    _id: matchId,
    createdBy: userId,
  });

  if (!match) {
    const error = new Error("Match not found");
    error.statusCode = 404;
    throw error;
  }

  // Match can only be started from DRAFT or SCHEDULED
  if (!["DRAFT", "SCHEDULED"].includes(match.status)) {
    const error = new Error(
      `Match cannot be started from ${match.status} status.`
    );

    error.statusCode = 400;
    throw error;
  }

  // Toss must be completed
  if (
    !match.toss?.wonBy ||
    !match.toss?.decision
  ) {
    const error = new Error(
      "Toss must be completed before starting the match."
    );

    error.statusCode = 400;
    throw error;
  }

  // Check Playing XI
  const playingPlayersCount =
    await MatchPlayer.countDocuments({
      match: match._id,
      isPlaying: true,
    });

  const expectedPlayers =
    match.playersPerTeam * 2;

  if (playingPlayersCount !== expectedPlayers) {
    const error = new Error(
      "Playing XI must be set for both teams before starting the match."
    );

    error.statusCode = 400;
    throw error;
  }

  // Make sure innings does not already exist
  const existingInnings =
    await Innings.findOne({
      match: match._id,
      inningsNumber: 1,
    });

  if (existingInnings) {
    const error = new Error(
      "Match has already been started."
    );

    error.statusCode = 409;
    throw error;
  }

  const teamAId = match.teamA.toString();
  const teamBId = match.teamB.toString();
  const tossWinnerId =
    match.toss.wonBy.toString();

  let battingTeam;
  let bowlingTeam;

  /*
    Toss logic:

    If toss winner chooses BAT:
      toss winner bats first.

    If toss winner chooses BOWL:
      toss winner bowls first,
      therefore the other team bats first.
  */

  if (match.toss.decision === "BAT") {
    battingTeam = tossWinnerId;

    bowlingTeam =
      tossWinnerId === teamAId
        ? teamBId
        : teamAId;
  } else {
    bowlingTeam =
      tossWinnerId;

    battingTeam =
      tossWinnerId === teamAId
        ? teamBId
        : teamAId;
  }

  // Create first innings
  const innings = await Innings.create({
    match: match._id,
    inningsNumber: 1,
    battingTeam,
    bowlingTeam,
    totalRuns: 0,
    totalWickets: 0,
    legalBalls: 0,
    totalExtras: 0,
    status: "LIVE",
    startedAt: new Date(),
  });

  // Update match
  match.status = "LIVE";
  match.currentInnings = 1;
  match.startedAt = new Date();

  await match.save();

  return {
    match: await Match.findById(match._id)
      .populate(
        "teamA",
        "name shortName logo"
      )
      .populate(
        "teamB",
        "name shortName logo"
      )
      .populate(
        "toss.wonBy",
        "name shortName"
      ),

    innings: await Innings.findById(
      innings._id
    )
      .populate(
        "battingTeam",
        "name shortName logo"
      )
      .populate(
        "bowlingTeam",
        "name shortName logo"
      ),
  };
};

export const setOpeningPlayers = async (
  matchId,
  userId,
  striker,
  nonStriker,
  bowler
) => {
  const match = await Match.findOne({
    _id: matchId,
    createdBy: userId,
  });

  if (!match) {
    const error = new Error("Match not found");
    error.statusCode = 404;
    throw error;
  }

  if (match.status !== "LIVE") {
    const error = new Error(
      "Players can only be selected when the match is LIVE."
    );

    error.statusCode = 400;
    throw error;
  }

  const innings = await Innings.findOne({
    match: match._id,
    inningsNumber: match.currentInnings,
    status: "LIVE",
  });

  if (!innings) {
    const error = new Error("Live innings not found");
    error.statusCode = 404;
    throw error;
  }

  // Striker and non-striker must be different
  if (striker === nonStriker) {
    const error = new Error(
      "Striker and non-striker must be different players."
    );

    error.statusCode = 400;
    throw error;
  }

  // Get all Playing XI players
  const playingPlayers = await MatchPlayer.find({
    match: match._id,
    isPlaying: true,
  }).select("player team");

  const battingTeamId =
    innings.battingTeam.toString();

  const bowlingTeamId =
    innings.bowlingTeam.toString();

  const strikerRecord = playingPlayers.find(
    (item) =>
      item.player.toString() === striker
  );

  const nonStrikerRecord = playingPlayers.find(
    (item) =>
      item.player.toString() === nonStriker
  );

  const bowlerRecord = playingPlayers.find(
    (item) =>
      item.player.toString() === bowler
  );

  // Validate striker
  if (!strikerRecord) {
    const error = new Error(
      "Striker is not part of the Playing XI."
    );

    error.statusCode = 400;
    throw error;
  }

  if (
    strikerRecord.team.toString() !==
    battingTeamId
  ) {
    const error = new Error(
      "Striker must belong to the batting team."
    );

    error.statusCode = 400;
    throw error;
  }

  // Validate non-striker
  if (!nonStrikerRecord) {
    const error = new Error(
      "Non-striker is not part of the Playing XI."
    );

    error.statusCode = 400;
    throw error;
  }

  if (
    nonStrikerRecord.team.toString() !==
    battingTeamId
  ) {
    const error = new Error(
      "Non-striker must belong to the batting team."
    );

    error.statusCode = 400;
    throw error;
  }

  // Validate bowler
  if (!bowlerRecord) {
    const error = new Error(
      "Bowler is not part of the Playing XI."
    );

    error.statusCode = 400;
    throw error;
  }

  if (
    bowlerRecord.team.toString() !==
    bowlingTeamId
  ) {
    const error = new Error(
      "Bowler must belong to the bowling team."
    );

    error.statusCode = 400;
    throw error;
  }

  // Set current players
  innings.striker = striker;
  innings.nonStriker = nonStriker;
  innings.currentBowler = bowler;

  await innings.save();

  return Innings.findById(innings._id)
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
    );
};