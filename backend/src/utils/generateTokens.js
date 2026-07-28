import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js";

export const generateAccessToken = (userId, role) => {
  return jwt.sign({ id: userId, role }, ENV.ACCESS_TOKEN_SECRET, {
    expiresIn: ENV.ACCESS_TOKEN_EXPIRY,
  });
};

export const generateRefreshToken = (userId) => {
  return jwt.sign({ id: userId }, ENV.REFRESH_TOKEN_SECRET, {
    expiresIn: ENV.REFRESH_TOKEN_EXPIRY,
  });
};
