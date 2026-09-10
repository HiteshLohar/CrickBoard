const errorHandler = (error, req, res, next) => {
  console.error("❌ Error:", error);

  const statusCode = error.statusCode || 500;

  res.status(statusCode).json({
    success: false,
    message:
      process.env.NODE_ENV === "production"
        ? statusCode === 500
          ? "Internal server error"
          : error.message
        : error.message,

    ...(error.data && {
      data: error.data,
    }),
  });
};

export default errorHandler;