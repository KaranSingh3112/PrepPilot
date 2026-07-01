class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    // Capture stack trace properly
    Error.captureStackTrace(this, this.constructor);
  }
}
export default ApiError;