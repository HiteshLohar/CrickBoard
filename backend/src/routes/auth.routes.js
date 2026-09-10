import { Router } from "express";
import validate from "../middleware/validate.js";

import authentication from "../middleware/authentication.js";


import { login, register } from "../controllers/auth.controller.js";
import {
    loginSchema,
    registerSchema,
} from "../validators/auth.validator.js";

const router = Router();

router.post(
    "/register",
    validate(registerSchema),
    register
);

router.post(
    "/login",
    validate(loginSchema),
    login
);

router.get("/me", authentication, (req, res) => {
    res.status(200).json({
        success: true,
        message: "Authentication successful",
        data: {
            userId: req.user.userId,
        },
    });
});

export default router;