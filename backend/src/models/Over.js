const mongoose = require("mongoose");

const overSchema = new mongoose.Schema(
  {
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

    bowler: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "MatchPlayer",
      required: true,
    },

    runs: {
      type: Number,
      default: 0,
      min: 0,
    },

    wickets: {
      type: Number,
      default: 0,
      min: 0,
    },

    legalBalls: {
      type: Number,
      default: 0,
      min: 0,
    },

    completed: {
      type: Boolean,
      default: false,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

overSchema.index(
  {
    innings: 1,
    overNumber: 1,
  },
  {
    unique: true,
  }
);

module.exports = mongoose.model("Over", overSchema);