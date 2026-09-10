import mongoose from "mongoose";

const matchSchema = new mongoose.Schema(
  {
    matchCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
      index: true,
    },

    title: {
      type: String,
      trim: true,
      maxlength: 150,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    teamA: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },

    teamB: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },

    playersPerTeam: {
      type: Number,
      required: true,
      min: 5,
      max: 14,
    },

    totalOvers: {
      type: Number,
      required: true,
      min: 1,
      max: 200,
    },

    toss: {
      wonBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Team",
      },

      decision: {
        type: String,
        enum: ["BAT", "BOWL"],
      },
    },

    status: {
      type: String,
      enum: [
        "DRAFT",
        "SCHEDULED",
        "LIVE",
        "COMPLETED",
        "ABANDONED",
        "CANCELLED",
      ],
      default: "DRAFT",
      index: true,
    },

    result: {
      type: String,
      enum: [
        "TEAM_A_WON",
        "TEAM_B_WON",
        "TIE",
        "NO_RESULT",
      ],
    },

    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
    },

    currentInnings: {
      type: Number,
      default: 0,
      min: 0,
    },

    startedAt: {
      type: Date,
    },

    completedAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);



matchSchema.index({
  createdBy: 1,
  status: 1,
});

matchSchema.index({
  teamA: 1,
  status: 1,
});

matchSchema.index({
  teamB: 1,
  status: 1,
});

const Match = mongoose.model("Match", matchSchema);

export default Match;