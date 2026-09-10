import Player from "../models/Player.js";

export const createPlayer = async ({
    name,
    shortName,
    role,
    userId,
}) => {
    const existingPlayer = await Player.findOne({
        createdBy: userId,
        name,
        isActive: true,
    });

    if (existingPlayer) {
        const error = new Error(
            "Player with this name already exists"
        );

        error.statusCode = 409;
        throw error;
    }

    const player = await Player.create({
        name,
        shortName,
        role,
        createdBy: userId,
    });

    return player;
};

export const getPlayers = async (userId) => {
    const players = await Player.find({
        createdBy: userId,
        isActive: true,
    }).sort({ name: 1 });

    return players;
};

export const getPlayerById = async (playerId, userId) => {
    const player = await Player.findOne({
        _id: playerId,
        createdBy: userId,
        isActive: true,
    });

    if (!player) {
        const error = new Error("Player not found");
        error.statusCode = 404;
        throw error;
    }

    return player;
};

export const updatePlayer = async (
    playerId,
    userId,
    updates
) => {
    const player = await Player.findOne({
        _id: playerId,
        createdBy: userId,
        isActive: true,
    });

    if (!player) {
        const error = new Error("Player not found");
        error.statusCode = 404;
        throw error;
    }

    Object.assign(player, updates);

    await player.save();

    return player;
};

export const deletePlayer = async (playerId, userId) => {
    const player = await Player.findOne({
        _id: playerId,
        createdBy: userId,
        isActive: true,
    });

    if (!player) {
        const error = new Error("Player not found");
        error.statusCode = 404;
        throw error;
    }

    player.isActive = false;

    await player.save();

    return player;
};  