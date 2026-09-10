import mongoose from "mongoose";

const ballEventSchema = new mongoose.Schema(
  {
    match: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Match",
      required: true,
      index: true,
    },

    innings: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Innings",
      required: true,
      index: true,
    },

    overNumber: {
      type: Number,
      required: true,
      min: 1,
    },

    ballNumber: {
      type: Number,
      required: true,
      min: 1,
    },

    deliveryNumber: {
      type: Number,
      required: true,
      min: 1,
    },

    striker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
      required: true,
    },

    nonStriker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
      required: true,
    },

    bowler: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
      required: true,
    },

    runs: {
      batter: {
        type: Number,
        default: 0,
        min: 0,
        max: 6,
      },

      extras: {
        type: Number,
        default: 0,
        min: 0,
      },

      total: {
        type: Number,
        required: true,
        min: 0,
      },
    },

    extras: {
      type: {
        type: String,
        enum: [
          "NONE",
          "WIDE",
          "NO_BALL",
          "BYE",
          "LEG_BYE",
        ],
        default: "NONE",
      },

      runs: {
        type: Number,
        default: 0,
        min: 0,
      },
    },

    wicket: {
      isWicket: {
        type: Boolean,
        default: false,
      },

      playerOut: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Player",
      },

      kind: {
        type: String,
        enum: [
          "BOWLED",
          "CAUGHT",
          "LBW",
          "RUN_OUT",
          "STUMPED",
          "HIT_WICKET",
          "RETIRED_HURT",
          "NONE",
        ],
        default: "NONE",
      },

      fielder: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Player",
      },
    },

    isLegalDelivery: {
      type: Boolean,
      required: true,
    },

    commentary: {
      type: String,
      trim: true,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
  }
);

ballEventSchema.index(
  {
    innings: 1,
    deliveryNumber: 1,
  },
  {
    unique: true,
  }
);

ballEventSchema.index({
  innings: 1,
  overNumber: 1,
  ballNumber: 1,
});

const BallEvent = mongoose.model(
  "BallEvent",
  ballEventSchema
);

export default BallEvent;