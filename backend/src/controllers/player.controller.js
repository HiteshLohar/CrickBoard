import {
  createPlayer,
  getPlayers,
  getPlayerById,
  updatePlayer,
  deletePlayer,
} from "../services/player.service.js";

export const create = async (req, res, next) => {
    try {
        const player = await createPlayer({
            ...req.body,
            userId: req.user.userId,
        });

        res.status(201).json({
            success: true,
            message: "Player created successfully",
            data: player,
        });
    } catch (error) {
        next(error);
    }
};

export const getAll = async (req, res, next) => {
    try {
        const players = await getPlayers(req.user.userId);

        res.status(200).json({
            success: true,
            message: "Players fetched successfully",
            data: players,
        });
    } catch (error) {
        next(error);
    }
};

export const getOne = async (req, res, next) => {
    try {
        const player = await getPlayerById(
            req.params.id,
            req.user.userId
        );

        res.status(200).json({
            success: true,
            message: "Player fetched successfully",
            data: player,
        });
    } catch (error) {
        next(error);
    }
};

export const update = async (req, res, next) => {
    try {
        const player = await updatePlayer(
            req.params.id,
            req.user.userId,
            req.body
        );

        res.status(200).json({
            success: true,
            message: "Player updated successfully",
            data: player,
        });
    } catch (error) {
        next(error);
    }
};

export const remove = async (req, res, next) => {
  try {
    await deletePlayer(
      req.params.id,
      req.user.userId
    );

    res.status(200).json({
      success: true,
      message: "Player deleted successfully",
    });
  } catch (error) {
    next(error);
  }
};