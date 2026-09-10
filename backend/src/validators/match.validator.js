import Joi from "joi";

const objectId = Joi.string()
  .hex()
  .length(24);

export const createMatchSchema = Joi.object({
  matchCode: Joi.string()
    .trim()
    .uppercase()
    .min(4)
    .max(20)
    .required(),

  title: Joi.string()
    .trim()
    .max(150)
    .allow("")
    .optional(),

  teamA: objectId.required(),

  teamB: objectId.required(),

  playersPerTeam: Joi.number()
    .integer()
    .min(5)
    .max(14)
    .required(),

  totalOvers: Joi.number()
    .integer()
    .min(1)
    .max(200)
    .required(),

  status: Joi.string()
    .valid("DRAFT", "SCHEDULED")
    .default("DRAFT"),

  toss: Joi.object({
    wonBy: objectId.optional(),

    decision: Joi.string()
      .valid("BAT", "BOWL")
      .optional(),
  }).optional(),
})
  .custom((value, helpers) => {
    if (value.teamA === value.teamB) {
      return helpers.error("any.invalid");
    }

    return value;
  })
  .messages({
    "any.invalid":
      "Team A and Team B must be different.",
  });

export const updateMatchSchema = Joi.object({
  title: Joi.string()
    .trim()
    .max(150)
    .allow(""),

  totalOvers: Joi.number()
    .integer()
    .min(1)
    .max(200),

  status: Joi.string()
    .valid(
      "DRAFT",
      "SCHEDULED",
      "LIVE",
      "COMPLETED",
      "ABANDONED",
      "CANCELLED"
    ),

  toss: Joi.object({
    wonBy: objectId,

    decision: Joi.string()
      .valid("BAT", "BOWL"),
  }),
}).min(1);

export const playingXIValidator = Joi.object({
  teamAPlayers: Joi.array()
    .items(objectId.required())
    .min(5)
    .max(14)
    .unique()
    .required(),

  teamBPlayers: Joi.array()
    .items(objectId.required())
    .min(5)
    .max(14)
    .unique()
    .required(),
});

export const tossSchema = Joi.object({
  wonBy: objectId.required(),

  decision: Joi.string()
    .valid("BAT", "BOWL")
    .required(),
});

export const inningsPlayersSchema = Joi.object({
  striker: objectId.required(),

  nonStriker: objectId.required(),

  bowler: objectId.required(),
})
  .custom((value, helpers) => {
    if (value.striker === value.nonStriker) {
      return helpers.error("any.invalid");
    }

    return value;
  })
  .messages({
    "any.invalid":
      "Striker and non-striker must be different players.",
  });