import {
    getCurrentInnings,
    selectNewBatter,
    selectNextBowler,
} from "../services/innings.service.js";

export const getInnings = async (req, res, next) => {
    try {
        const result = await getCurrentInnings(
            req.params.matchId,
            req.user.userId
        );

        res.status(200).json({
            success: true,
            message: "Current innings fetched successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const selectBatter = async (req, res, next) => {
    try {
        const result = await selectNewBatter(
            req.params.matchId,
            req.user.userId,
            req.body.playerId
        );

        res.status(200).json({
            success: true,
            message: "New batter selected successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const selectBowler = async (req, res, next) => {
    try {
        const result = await selectNextBowler(
            req.params.matchId,
            req.user.userId,
            req.body.playerId
        );

        res.status(200).json({
            success: true,
            message: "Next bowler selected successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};