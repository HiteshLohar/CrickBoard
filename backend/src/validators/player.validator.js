import Joi from "joi";

export const createPlayerSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required(),

  shortName: Joi.string()
    .trim()
    .max(30)
    .optional(),

  role: Joi.string()
    .valid(
      "BATTER",
      "BOWLER",
      "ALL_ROUNDER",
      "WICKET_KEEPER"
    )
    .default("BATTER"),
});

export const updatePlayerSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100),

  shortName: Joi.string()
    .trim()
    .max(30)
    .allow(""),

  role: Joi.string()
    .valid(
      "BATTER",
      "BOWLER",
      "ALL_ROUNDER",
      "WICKET_KEEPER"
    ),
}).min(1);