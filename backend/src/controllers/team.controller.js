import {
    createTeam,
    getTeams,
    getTeamById,
    updateTeam,
    deleteTeam,
    addPlayerToTeam,
    removePlayerFromTeam,
} from "../services/team.service.js";

export const create = async (req, res, next) => {
    try {
        const team = await createTeam({
            ...req.body,
            userId: req.user.userId,
        });

        res.status(201).json({
            success: true,
            message: "Team created successfully",
            data: team,
        });
    } catch (error) {
        next(error);
    }
};


export const getAll = async (req, res, next) => {
    try {
        const teams = await getTeams(req.user.userId);

        res.status(200).json({
            success: true,
            message: "Teams fetched successfully",
            data: teams,
        });
    } catch (error) {
        next(error);
    }
};

export const getOne = async (req, res, next) => {
    try {
        const team = await getTeamById(
            req.params.id,
            req.user.userId
        );

        res.status(200).json({
            success: true,
            message: "Team fetched successfully",
            data: team,
        });
    } catch (error) {
        next(error);
    }
};


export const update = async (req, res, next) => {
    try {
        const team = await updateTeam(
            req.params.id,
            req.user.userId,
            req.body
        );

        res.status(200).json({
            success: true,
            message: "Team updated successfully",
            data: team,
        });
    } catch (error) {
        next(error);
    }
};

export const remove = async (req, res, next) => {
    try {
        await deleteTeam(
            req.params.id,
            req.user.userId
        );

        res.status(200).json({
            success: true,
            message: "Team deleted successfully",
        });
    } catch (error) {
        next(error);
    }
};

export const addPlayer = async (req, res, next) => {
  try {
    const team = await addPlayerToTeam(
      req.params.id,
      req.body.playerId,
      req.user.userId
    );

    res.status(200).json({
      success: true,
      message: "Player added to team successfully",
      data: team,
    });
  } catch (error) {
    next(error);
  }
};


export const removePlayer = async (req, res, next) => {
  try {
    const team = await removePlayerFromTeam(
      req.params.id,
      req.params.playerId,
      req.user.userId
    );

    res.status(200).json({
      success: true,
      message: "Player removed from team successfully",
      data: team,
    });
  } catch (error) {
    next(error);
  }
};