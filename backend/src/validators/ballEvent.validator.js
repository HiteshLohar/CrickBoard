import Joi from "joi";

const objectId = Joi.string()
  .hex()
  .length(24);

const extrasType = Joi.string().valid(
  "NONE",
  "WIDE",
  "NO_BALL",
  "BYE",
  "LEG_BYE"
);

const wicketKind = Joi.string().valid(
  "BOWLED",
  "CAUGHT",
  "LBW",
  "RUN_OUT",
  "STUMPED",
  "HIT_WICKET",
  "RETIRED_HURT",
  "NONE"
);

export const createBallEventSchema = Joi.object({
  overNumber: Joi.number()
    .integer()
    .min(1)
    .max(200)
    .required(),

  ballNumber: Joi.number()
    .integer()
    .min(1)
    .max(20)
    .required(),

  striker: objectId.required(),

  nonStriker: objectId.required(),

  bowler: objectId.required(),

  runs: Joi.object({
    batter: Joi.number()
      .integer()
      .min(0)
      .max(6)
      .required(),

    extras: Joi.number()
      .integer()
      .min(0)
      .max(20)
      .required(),

    total: Joi.number()
      .integer()
      .min(0)
      .max(20)
      .required(),
  })
    .required()
    .custom((runs, helpers) => {
      if (
        runs.total !==
        runs.batter + runs.extras
      ) {
        return helpers.error(
          "runs.totalMismatch"
        );
      }

      return runs;
    })
    .messages({
      "runs.totalMismatch":
        "Total runs must equal batter runs plus extras.",
    }),

  extras: Joi.object({
    type: extrasType.required(),

    runs: Joi.number()
      .integer()
      .min(0)
      .max(20)
      .required(),
  })
    .required(),

  wicket: Joi.object({
    isWicket: Joi.boolean()
      .required(),

    playerOut: objectId.optional(),

    kind: wicketKind.required(),

    fielder: objectId.optional(),
  })
    .required(),

  isLegalDelivery: Joi.boolean()
    .required(),

  commentary: Joi.string()
    .trim()
    .max(500)
    .allow("")
    .optional(),
})
  .custom((value, helpers) => {
    /*
     * Striker and non-striker cannot be
     * the same player.
     */
    if (
      value.striker ===
      value.nonStriker
    ) {
      return helpers.error(
        "players.same"
      );
    }

    /*
     * Basic extras consistency.
     */
    if (
      value.extras.type === "NONE" &&
      value.extras.runs !== 0
    ) {
      return helpers.error(
        "extras.invalidNone"
      );
    }

    /*
     * Any non-NONE extras type must
     * contain at least one extra run.
     */
    if (
      value.extras.type !== "NONE" &&
      value.extras.runs < 1
    ) {
      return helpers.error(
        "extras.missingRuns"
      );
    }

    /*
     * Wicket consistency.
     */
    if (
      value.wicket.isWicket &&
      value.wicket.kind === "NONE"
    ) {
      return helpers.error(
        "wicket.missingKind"
      );
    }

    if (
      !value.wicket.isWicket &&
      value.wicket.kind !== "NONE"
    ) {
      return helpers.error(
        "wicket.invalidKind"
      );
    }

    /*
     * A wicket must identify the
     * dismissed player.
     */
    if (
      value.wicket.isWicket &&
      !value.wicket.playerOut
    ) {
      return helpers.error(
        "wicket.missingPlayer"
      );
    }

    /*
     * A non-wicket must not contain
     * playerOut/fielder.
     */
    if (
      !value.wicket.isWicket &&
      (
        value.wicket.playerOut ||
        value.wicket.fielder
      )
    ) {
      return helpers.error(
        "wicket.unexpectedPlayers"
      );
    }

    /*
     * Wide and no-ball are illegal
     * deliveries.
     *
     * Full cricket scoring logic will
     * be handled by the scoring engine.
     */
    if (
      (
        value.extras.type === "WIDE" ||
        value.extras.type === "NO_BALL"
      ) &&
      value.isLegalDelivery
    ) {
      return helpers.error(
        "delivery.illegalType"
      );
    }

    /*
     * Bye and leg-bye are legal
     * deliveries.
     */
    if (
      (
        value.extras.type === "BYE" ||
        value.extras.type === "LEG_BYE"
      ) &&
      !value.isLegalDelivery
    ) {
      return helpers.error(
        "delivery.legalType"
      );
    }

    return value;
  })
  .messages({
    "players.same":
      "Striker and non-striker must be different players.",

    "extras.invalidNone":
      "Extras runs must be 0 when extras type is NONE.",

    "extras.missingRuns":
      "Extras must contain at least 1 run when an extras type is selected.",

    "wicket.missingKind":
      "Wicket kind is required when isWicket is true.",

    "wicket.invalidKind":
      "Wicket kind must be NONE when isWicket is false.",

    "wicket.missingPlayer":
      "playerOut is required when a wicket occurs.",

    "wicket.unexpectedPlayers":
      "playerOut and fielder cannot be provided when there is no wicket.",

    "delivery.illegalType":
      "Wide and no-ball deliveries must be marked as illegal deliveries.",

    "delivery.legalType":
      "Bye and leg-bye deliveries must be marked as legal deliveries.",
  });