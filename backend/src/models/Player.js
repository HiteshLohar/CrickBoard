import mongoose from "mongoose";

const playerSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: 2,
      maxlength: 100,
    },

    shortName: {
      type: String,
      trim: true,
      maxlength: 30,
    },

    role: {
      type: String,
      enum: [
        "BATTER",
        "BOWLER",
        "ALL_ROUNDER",
        "WICKET_KEEPER",
      ],
      default: "BATTER",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  }
);

playerSchema.index({
  createdBy: 1,
  name: 1,
});

const Player = mongoose.model("Player", playerSchema);

export default Player;