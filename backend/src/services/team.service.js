import Team from "../models/Team.js";
import Player from "../models/Player.js";

export const createTeam = async ({
    name,
    shortName,
    logo,
    players,
    userId,
}) => {
    // Check duplicate team name for same user
    const existingTeam = await Team.findOne({
        owner: userId,
        name,
        isActive: true,
    });

    if (existingTeam) {
        const error = new Error("Team with this name already exists");
        error.statusCode = 409;
        throw error;
    }

    // Verify player count
    if (players.length < 5 || players.length > 14) {
        const error = new Error(
            "A team must have between 5 and 14 players."
        );
        error.statusCode = 400;
        throw error;
    }

    // Verify all players belong to current user
    const validPlayers = await Player.find({
        _id: { $in: players },
        createdBy: userId,
        isActive: true,
    }).select("_id");

    if (validPlayers.length !== players.length) {
        const error = new Error(
            "One or more players are invalid or do not belong to you."
        );
        error.statusCode = 400;
        throw error;
    }

    const team = await Team.create({
        name,
        shortName,
        logo,
        owner: userId,
        players,
    });

    return team;
};

export const getTeams = async (userId) => {
    const teams = await Team.find({
        owner: userId,
        isActive: true,
    })
        .populate(
            "players",
            "name shortName role"
        )
        .sort({ name: 1 });

    return teams;
};


export const getTeamById = async (teamId, userId) => {
    const team = await Team.findOne({
        _id: teamId,
        owner: userId,
        isActive: true,
    }).populate(
        "players",
        "name shortName role"
    );

    if (!team) {
        const error = new Error("Team not found");
        error.statusCode = 404;
        throw error;
    }

    return team;
};

export const updateTeam = async (
    teamId,
    userId,
    updates
) => {
    const team = await Team.findOne({
        _id: teamId,
        owner: userId,
        isActive: true,
    });

    if (!team) {
        const error = new Error("Team not found");
        error.statusCode = 404;
        throw error;
    }

    if (updates.name) {
        const existingTeam = await Team.findOne({
            owner: userId,
            name: updates.name,
            isActive: true,
            _id: { $ne: teamId },
        });

        if (existingTeam) {
            const error = new Error(
                "Team with this name already exists"
            );
            error.statusCode = 409;
            throw error;
        }
    }

    Object.assign(team, updates);

    await team.save();

    return team;
};


export const deleteTeam = async (teamId, userId) => {
    const team = await Team.findOne({
        _id: teamId,
        owner: userId,
        isActive: true,
    });

    if (!team) {
        const error = new Error("Team not found");
        error.statusCode = 404;
        throw error;
    }

    team.isActive = false;

    await team.save();

    return team;
};

export const addPlayerToTeam = async (
    teamId,
    playerId,
    userId
) => {
    const team = await Team.findOne({
        _id: teamId,
        owner: userId,
        isActive: true,
    });

    if (!team) {
        const error = new Error("Team not found");
        error.statusCode = 404;
        throw error;
    }

    if (team.players.length >= 14) {
        const error = new Error(
            "A team cannot have more than 14 players."
        );
        error.statusCode = 400;
        throw error;
    }

    if (team.players.some(
        (id) => id.toString() === playerId
    )) {
        const error = new Error(
            "Player already exists in this team."
        );
        error.statusCode = 409;
        throw error;
    }

    const player = await Player.findOne({
        _id: playerId,
        createdBy: userId,
        isActive: true,
    });

    if (!player) {
        const error = new Error(
            "Player not found or does not belong to you."
        );
        error.statusCode = 400;
        throw error;
    }

    team.players.push(playerId);

    await team.save();

    return team;
};


export const removePlayerFromTeam = async (
    teamId,
    playerId,
    userId
) => {
    const team = await Team.findOne({
        _id: teamId,
        owner: userId,
        isActive: true,
    });

    if (!team) {
        const error = new Error("Team not found");
        error.statusCode = 404;
        throw error;
    }

    if (team.players.length <= 5) {
        const error = new Error(
            "A team must have at least 5 players."
        );
        error.statusCode = 400;
        throw error;
    }

    const playerIndex = team.players.findIndex(
        (id) => id.toString() === playerId
    );

    if (playerIndex === -1) {
        const error = new Error(
            "Player is not part of this team."
        );
        error.statusCode = 404;
        throw error;
    }

    team.players.splice(playerIndex, 1);

    await team.save();

    return team;
};