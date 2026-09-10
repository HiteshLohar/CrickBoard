import { Router } from "express";

import authentication from "../middleware/authentication.js";
import validate from "../middleware/validate.js";

import {
    createTeamSchema,
    updateTeamSchema,
    addPlayerSchema,
} from "../validators/team.validator.js";

import {
    create,
    getAll,
    getOne,
    update,
    remove,
    addPlayer,
    removePlayer,
} from "../controllers/team.controller.js";

const router = Router();

router.post(
    "/",
    authentication,
    validate(createTeamSchema),
    create
);

router.get(
    "/",
    authentication,
    getAll
);

router.get(
    "/:id",
    authentication,
    getOne
);

router.patch(
    "/:id",
    authentication,
    validate(updateTeamSchema),
    update
);

router.delete(
    "/:id",
    authentication,
    remove
);

router.post(
    "/:id/players",
    authentication,
    validate(addPlayerSchema),
    addPlayer
);

router.delete(
    "/:id/players/:playerId",
    authentication,
    removePlayer
);

export default router;