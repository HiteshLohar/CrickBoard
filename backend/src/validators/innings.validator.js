import Joi from "joi";

const objectId = Joi.string()
  .hex()
  .length(24);

export const newBatterSchema = Joi.object({
  playerId: objectId.required(),
});

export const nextBowlerSchema = Joi.object({
  playerId: objectId.required(),
});