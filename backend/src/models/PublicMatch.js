import mongoose from "mongoose";

const publicMatchSchema = new mongoose.Schema(
    {
        publicId: {
            type: String,
            required: true,
            unique: true,
            index: true,
            trim: true,
        },

        match: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Match",
            required: true,
            unique: true,
            index: true,
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

const PublicMatch = mongoose.model(
    "PublicMatch",
    publicMatchSchema
);

export default PublicMatch;