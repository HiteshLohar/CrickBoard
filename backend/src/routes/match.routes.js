import { Router } from "express";

import authentication from "../middleware/authentication.js";
import validate from "../middleware/validate.js";

import {
  createMatchSchema,
  playingXIValidator,
  tossSchema,
  inningsPlayersSchema,
} from "../validators/match.validator.js";

import {
  create,
  getAll,
  getOne,
  getScorecard,
  setXI,
  toss,
  start,
  setPlayers,
} from "../controllers/match.controller.js";

const router = Router();

router.post(
  "/",
  authentication,
  validate(createMatchSchema),
  create
);

router.get(
  "/",
  authentication,
  getAll
);

router.get(
  "/:id/scorecard",
  authentication,
  getScorecard
);

router.get(
  "/:id",
  authentication,
  getOne
);

router.put(
  "/:id/playing-xi",
  authentication,
  validate(playingXIValidator),
  setXI
);

router.patch(
  "/:id/toss",
  authentication,
  validate(tossSchema),
  toss
);

router.post(
  "/:id/start",
  authentication,
  start
);

router.patch(
  "/:id/innings/players",
  authentication,
  validate(inningsPlayersSchema),
  setPlayers
);

export default router;