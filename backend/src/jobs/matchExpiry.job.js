import Match from "../models/Match.js";

const CHECK_INTERVAL_MS = 60 * 1000;

const expireLiveMatches = async () => {
  const now = new Date();

  const oneDayAgo = new Date(
    now.getTime() - 1 * 24 * 60 * 60 * 1000
  );

  const twoDaysAgo = new Date(
    now.getTime() - 2 * 24 * 60 * 60 * 1000
  );

  const fiveDaysAgo = new Date(
    now.getTime() - 5 * 24 * 60 * 60 * 1000
  );

  const result = await Match.updateMany(
    {
      status: "LIVE",
      startedAt: {
        $exists: true,
      },
      $or: [
        {
          totalOvers: {
            $gte: 1,
            $lte: 20,
          },
          startedAt: {
            $lte: oneDayAgo,
          },
        },
        {
          totalOvers: {
            $gte: 21,
            $lte: 50,
          },
          startedAt: {
            $lte: twoDaysAgo,
          },
        },
        {
          totalOvers: {
            $gte: 51,
          },
          startedAt: {
            $lte: fiveDaysAgo,
          },
        },
      ],
    },
    {
      $set: {
        status: "CANCELLED",
        completedAt: now,
      },
    }
  );

  return result.modifiedCount;
};

export const startMatchExpiryJob = () => {
  expireLiveMatches().catch(() => {});

  setInterval(() => {
    expireLiveMatches().catch(() => {});
  }, CHECK_INTERVAL_MS);
};