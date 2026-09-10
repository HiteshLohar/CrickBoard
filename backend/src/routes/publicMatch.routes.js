import express from "express";

import {
  getPublicLiveMatchController,
} from "../controllers/publicMatch.controller.js";

const router = express.Router();

router.get(
  "/matches/:publicId/live",
  getPublicLiveMatchController
);

export default router;