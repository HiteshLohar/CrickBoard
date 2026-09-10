import {
  createMatch,
  getMatches,
  getMatchById,
  setPlayingXI,
  setToss,
  startMatch,
  setOpeningPlayers,
} from "../services/match.service.js";

import { getScorecardData, } from "../services/scorecard.service.js";

export const create = async (req, res, next) => {
  try {
    const match = await createMatch({
      ...req.body,
      userId: req.user.userId,
    });

    res.status(201).json({
      success: true,
      message: "Match created successfully",
      data: match,
    });
  } catch (error) {
    next(error);
  }
};

export const getAll = async (req, res, next) => {
  try {
    const matches = await getMatches(
      req.user.userId
    );

    res.status(200).json({
      success: true,
      message: "Matches fetched successfully",
      data: matches,
    });
  } catch (error) {
    next(error);
  }
};

export const getOne = async (req, res, next) => {
  try {
    const match = await getMatchById(
      req.params.id,
      req.user.userId
    );

    res.status(200).json({
      success: true,
      message: "Match fetched successfully",
      data: match,
    });
  } catch (error) {
    next(error);
  }
};

export const setXI = async (req, res, next) => {
  try {
    const {
      teamAPlayers,
      teamBPlayers,
    } = req.body;

    const playingXI = await setPlayingXI(
      req.params.id,
      req.user.userId,
      teamAPlayers,
      teamBPlayers
    );

    res.status(200).json({
      success: true,
      message: "Playing XI set successfully",
      data: playingXI,
    });
  } catch (error) {
    next(error);
  }
};

export const toss = async (req, res, next) => {
  try {
    const { wonBy, decision } = req.body;

    const match = await setToss(
      req.params.id,
      req.user.userId,
      wonBy,
      decision
    );

    res.status(200).json({
      success: true,
      message: "Toss completed successfully",
      data: match,
    });
  } catch (error) {
    next(error);
  }
};

export const start = async (
  req,
  res,
  next
) => {
  try {
    const result = await startMatch(
      req.params.id,
      req.user.userId
    );

    res.status(200).json({
      success: true,
      message: "Match started successfully",
      data: result,
    });
  } catch (error) {
    next(error);
  }
};

export const setPlayers = async (
  req,
  res,
  next
) => {
  try {
    const {
      striker,
      nonStriker,
      bowler,
    } = req.body;

    const innings = await setOpeningPlayers(
      req.params.id,
      req.user.userId,
      striker,
      nonStriker,
      bowler
    );

    res.status(200).json({
      success: true,
      message:
        "Opening players set successfully",
      data: innings,
    });
  } catch (error) {
    next(error);
  }
};


export const getScorecard = async (
  req,
  res,
  next
) => {
  try {
    const scorecard = await getScorecardData(
      req.params.id,
      req.user.userId
    );

    res.status(200).json({
      success: true,
      message:
        "Match scorecard fetched successfully",
      data: scorecard,
    });
  } catch (error) {
    next(error);
  }
};