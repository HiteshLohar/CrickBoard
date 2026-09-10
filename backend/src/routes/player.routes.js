import { Router } from "express";

import authentication from "../middleware/authentication.js";
import validate from "../middleware/validate.js";
import {
    createPlayerSchema,
    updatePlayerSchema,
} from "../validators/player.validator.js";


import {
    create,
    getAll,
    getOne,
    update,
    remove,
} from "../controllers/player.controller.js";

const router = Router();

router.post(
    "/",
    authentication,
    validate(createPlayerSchema),
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
    validate(updatePlayerSchema),
    update
);

router.delete(
    "/:id",
    authentication,
    remove
);

export default router;