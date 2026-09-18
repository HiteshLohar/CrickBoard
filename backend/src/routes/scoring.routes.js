import express from "express";

import authentication from "../middleware/authentication.js";

import validate from "../middleware/validate.js";

import {
    createBallEventSchema,
} from "../validators/ballEvent.validator.js";

import {
    newBatterSchema,
    nextBowlerSchema,
} from "../validators/innings.validator.js";

import {
    recordBall,
    getBalls,
    undoLastBall,
} from "../controllers/scoring.controller.js";

import {
    getInnings,
    selectBatter,
    selectBowler,
} from "../controllers/innings.controller.js";

const router = express.Router();

// Get current innings
router.get(
    "/:matchId/innings",
    authentication,
    getInnings
);

// Get ball events
router.get(
    "/:matchId/balls",
    authentication,
    getBalls
);

// Record ball
router.post(
    "/:matchId/balls",
    authentication,
    validate(createBallEventSchema),
    recordBall
);

// Undo last ball

router.post(
    "/:matchId/balls/undo",
    authentication,
    undoLastBall
);

// Select new batter after wicket
router.patch(
    "/:matchId/innings/batter",
    authentication,
    validate(newBatterSchema),
    selectBatter
);

// Select next bowler
router.patch(
    "/:matchId/innings/bowler",
    authentication,
    validate(nextBowlerSchema),
    selectBowler
);

export default router;