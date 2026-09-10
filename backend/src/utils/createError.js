class ExpressError extends Error {
  constructor(status, message, data = null) {
    super(message);

    this.name = "ExpressError";
    this.status = status;
    this.data = data;
  }
}

export default ExpressError;

export const createError = (
  message,
  status = 500,
  data = null
) => {
  return new ExpressError(status, message, data);
};