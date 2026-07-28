import mongoose from "mongoose";
import jwt from "jsonwebtoken";
import ApiError from "../utils/ApiError.js";
import { ENV } from "../config/env.js";

// Turns driver/library errors into ApiError so clients get a meaningful status code
// instead of a blanket 500.
const normalize = (error) => {
  if (error instanceof ApiError) return error;

  if (error instanceof mongoose.Error.ValidationError) {
    const errors = Object.values(error.errors).map((e) => ({
      field: e.path,
      message: e.message,
    }));
    return new ApiError(400, "Validation failed", errors);
  }

  if (error instanceof mongoose.Error.CastError) {
    return new ApiError(400, `Invalid value for '${error.path}'`);
  }

  if (error.code === 11000) {
    const field = Object.keys(error.keyPattern || {})[0] || "field";
    return new ApiError(409, `A record with this ${field} already exists`);
  }

  if (error instanceof jwt.TokenExpiredError) {
    return new ApiError(401, "Token expired");
  }

  if (error instanceof jwt.JsonWebTokenError) {
    return new ApiError(401, "Invalid authentication token");
  }

  if (error.type === "entity.parse.failed") {
    return new ApiError(400, "Malformed JSON body");
  }

  if (error.name === "MulterError") {
    return new ApiError(400, error.message);
  }

  return new ApiError(
    Number.isInteger(error.statusCode) ? error.statusCode : 500,
    error.message || "Internal Server Error",
    error.errors || []
  );
};

export const errorHandler = (err, req, res, next) => {
  const error = normalize(err);

  if (error.statusCode >= 500) {
    console.error(`[error] ${req.method} ${req.originalUrl}`, err);
  }

  res.status(error.statusCode).json({
    success: false,
    message: error.message,
    errors: error.errors,
    ...(ENV.NODE_ENV === "development" ? { stack: err.stack } : {}),
  });
};

export const notFound = (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.originalUrl}`));
};
