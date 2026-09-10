import mongoose from "mongoose";

const connectDatabase = async () => {
  if (!process.env.MONGO_URI) {
    throw new Error("MONGO_URI is not defined");
  }

  await mongoose.connect(process.env.MONGO_URI);

  console.log("✅ MongoDB connected");
};

export default connectDatabase;