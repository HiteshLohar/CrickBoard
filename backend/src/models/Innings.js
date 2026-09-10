import mongoose from "mongoose";

const inningsSchema = new mongoose.Schema(
  {
    match: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Match",
      required: true,
      index: true,
    },

    inningsNumber: {
      type: Number,
      required: true,
      min: 1,
      max: 4,
    },

    battingTeam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },

    bowlingTeam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },

    striker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
    },

    nonStriker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
    },

    currentBowler: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
    },

    requiresNewBowler: {
      type: Boolean,
      default: false,
    },

    dismissedPlayers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Player",
      },
    ],

    totalRuns: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalWickets: {
      type: Number,
      default: 0,
      min: 0,
    },

    legalBalls: {
      type: Number,
      default: 0,
      min: 0,
    },

    deliverySequence: {
      type: Number,
      default: 0,
      min: 0,
    },

    totalExtras: {
      type: Number,
      default: 0,
      min: 0,
    },

    status: {
      type: String,
      enum: ["NOT_STARTED", "LIVE", "COMPLETED"],
      default: "LIVE",
      index: true,
    },

    startedAt: {
      type: Date,
      default: Date.now,
    },

    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

inningsSchema.index(
  {
    match: 1,
    inningsNumber: 1,
  },
  {
    unique: true,
  }
);

const Innings = mongoose.model("Innings", inningsSchema);

export default Innings;