import jwt from "jsonwebtoken";
import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import User from "../models/User.model.js";
import { ENV } from "../config/env.js";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken || req.headers.authorization?.replace("Bearer ", "");

  if (!token) {
    throw new ApiError(401, "Authentication token missing");
  }

  const decoded = jwt.verify(token, ENV.ACCESS_TOKEN_SECRET);
  const user = await User.findById(decoded.id);

  if (!user || !user.isActive) {
    throw new ApiError(401, "Invalid authentication token");
  }

  req.user = user;
  console.log("Logged in user:", req.user.name);
  console.log("Role:", req.user.role);
  next();
});

export const authorizeRoles = (...roles) => (req, res, next) => {
  if (!roles.includes(req.user.role)) {
    throw new ApiError(403, "You do not have permission to perform this action");
  }
  next();
};
