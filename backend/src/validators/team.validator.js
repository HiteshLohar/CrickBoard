import Joi from "joi";

export const createTeamSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100)
    .required(),

  shortName: Joi.string()
    .trim()
    .min(1)
    .max(10)
    .required(),

  logo: Joi.string()
    .trim()
    .uri()
    .allow("")
    .optional(),

  players: Joi.array()
    .items(
      Joi.string()
        .hex()
        .length(24)
        .required()
    )
    .min(5)
    .max(14)
    .required(),
});

export const updateTeamSchema = Joi.object({
  name: Joi.string()
    .trim()
    .min(2)
    .max(100),

  shortName: Joi.string()
    .trim()
    .min(1)
    .max(10),

  logo: Joi.string()
    .trim()
    .uri()
    .allow(""),
}).min(1);

export const addPlayerSchema = Joi.object({
  playerId: Joi.string()
    .hex()
    .length(24)
    .required(),
});