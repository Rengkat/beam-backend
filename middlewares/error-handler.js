const { StatusCodes } = require("http-status-codes");

const errorHandlerMiddleware = (err, req, res, next) => {
  // Default error structure
  const customError = {
    statusCode: err.statusCode || StatusCodes.INTERNAL_SERVER_ERROR,
    message: err.message || "Something went wrong, try again later",
    success: false,
  };

  // Handle PostgreSQL errors
  if (err.code) {
    switch (err.code) {
      // Unique violation
      case "23505":
        customError.message = `Duplicate value entered for ${err.constraint} field, please choose another value.`;
        customError.statusCode = StatusCodes.BAD_REQUEST;
        break;

      // Foreign key violation
      case "23503":
        customError.message = `Referenced record not found: ${err.detail}`;
        customError.statusCode = StatusCodes.BAD_REQUEST;
        break;

      // Not null violation
      case "23502":
        customError.message = `Missing required field: ${err.column}`;
        customError.statusCode = StatusCodes.BAD_REQUEST;
        break;

      // Check violation
      case "23514":
        customError.message = `Data validation failed: ${err.constraint}`;
        customError.statusCode = StatusCodes.BAD_REQUEST;
        break;

      // Default for other PostgreSQL errors
      default:
        customError.message = `Database error: ${err.message}`;
        customError.statusCode = StatusCodes.INTERNAL_SERVER_ERROR;
    }
  }

  // Validation errors (from Joi, express-validator, etc.)
  if (err.name === "ValidationError" || Array.isArray(err.errors)) {
    customError.message = Object.values(err.errors)
      .map((item) => item.message || item)
      .join(", ");
    customError.statusCode = StatusCodes.BAD_REQUEST;
  }

  // JWT errors
  if (err.name === "JsonWebTokenError") {
    customError.message = "Invalid token, please log in again";
    customError.statusCode = StatusCodes.UNAUTHORIZED;
  }

  if (err.name === "TokenExpiredError") {
    customError.message = "Token expired, please log in again";
    customError.statusCode = StatusCodes.UNAUTHORIZED;
  }

  // Custom error types
  if (err.name === "CustomError") {
    // Handle your custom error types here
  }

  // Log the error for debugging
  console.error(err);

  return res.status(customError.statusCode).json({
    success: customError.success,
    message: customError.message,
    // Only include stack trace in development
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
};

module.exports = errorHandlerMiddleware;
