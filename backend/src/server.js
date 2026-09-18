import "dotenv/config";

import http from "node:http";

import app from "./app.js";
import connectDatabase from "./config/database.js";
import { startMatchExpiryJob } from "./jobs/matchExpiry.job.js";

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const startServer = async () => {
  try {
    await connectDatabase();

    startMatchExpiryJob();

    server.listen(PORT, () => {
      console.log(`🚀 CrickBoard running on port ${PORT}`);
      console.log(`🌐 http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("❌ Server failed:", error.message);
    process.exit(1);
  }
};

startServer();