import mongoose from "mongoose";

const matchPlayerSchema = new mongoose.Schema(
  {
    match: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Match",
      required: true,
      index: true,
    },

    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
      index: true,
    },

    player: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Player",
      required: true,
      index: true,
    },

    isPlaying: {
      type: Boolean,
      default: false,
    },

    isCaptain: {
      type: Boolean,
      default: false,
    },

    isWicketKeeper: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

matchPlayerSchema.index(
  {
    match: 1,
    player: 1,
  },
  {
    unique: true,
  }
);

matchPlayerSchema.index({
  match: 1,
  team: 1,
});

const MatchPlayer = mongoose.model(
  "MatchPlayer",
  matchPlayerSchema
);

export default MatchPlayer;