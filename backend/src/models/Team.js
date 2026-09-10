import mongoose from "mongoose";

const teamSchema = new mongoose.Schema(
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
      required: true,
      trim: true,
      uppercase: true,
      minlength: 1,
      maxlength: 10,
    },

    logo: {
      type: String,
      trim: true,
    },

    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    players: {
      type: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Player",
        },
      ],

      validate: {
        validator: function (players) {
          return players.length >= 5 && players.length <= 14;
        },
        message: "A team must have between 5 and 14 players.",
      },
    },

    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

teamSchema.index({
  owner: 1,
  name: 1,
});

const Team = mongoose.model("Team", teamSchema);

export default Team;