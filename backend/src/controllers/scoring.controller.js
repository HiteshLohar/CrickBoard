import {
    recordBallEvent,
    getBallEvents,
    undoLastBallEvent,
} from "../services/scoring.service.js";

export const recordBall = async (
    req,
    res,
    next
) => {
    try {
        const result =
            await recordBallEvent(
                req.params.matchId,
                req.user.userId,
                req.body
            );

        res.status(201).json({
            success: true,
            message:
                "Ball recorded successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const getBalls = async (
    req,
    res,
    next
) => {
    try {
        const result =
            await getBallEvents(
                req.params.matchId,
                req.user.userId,
                {
                    limit:
                        req.query.limit,
                    cursor:
                        req.query.cursor,
                }
            );

        res.status(200).json({
            success: true,
            message:
                "Ball events fetched successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};

export const undoLastBall = async (
    req,
    res,
    next
) => {
    try {
        const result =
            await undoLastBallEvent(
                req.params.matchId,
                req.user.userId
            );

        res.status(200).json({
            success: true,
            message:
                "Last ball undone successfully",
            data: result,
        });
    } catch (error) {
        next(error);
    }
};