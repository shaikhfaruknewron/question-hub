import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import User from "../models/User.model.js";
import { generateAccessToken, generateRefreshToken } from "../utils/generateTokens.js";
import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js";

const isProduction = ENV.NODE_ENV === "production";

// In production the API and the frontend usually live on different domains, which
// requires SameSite=None; that in turn requires Secure.
const cookieOptions = {
  httpOnly: true,
  secure: isProduction,
  sameSite: isProduction ? "none" : "lax",
  path: "/",
};

const ACCESS_COOKIE = { ...cookieOptions, maxAge: 15 * 60 * 1000 };
const REFRESH_COOKIE = { ...cookieOptions, maxAge: 7 * 24 * 60 * 60 * 1000 };

export const register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    throw new ApiError(409, "An account with this email already exists");
  }

  const user = await User.create({ name, email, password, role });

  res
    .status(201)
    .json(new ApiResponse(201, { id: user._id, name: user.name, email: user.email, role: user.role }, "Account created"));
});

export const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password +refreshToken");
  if (!user || !(await user.comparePassword(password))) {
    throw new ApiError(401, "Invalid email or password");
  }

  const accessToken = generateAccessToken(user._id, user.role);
  const refreshToken = generateRefreshToken(user._id);

  user.refreshToken = refreshToken;
  await user.save();

  res
    .status(200)
    .cookie("accessToken", accessToken, ACCESS_COOKIE)
    .cookie("refreshToken", refreshToken, REFRESH_COOKIE)
    .json(
      new ApiResponse(
        200,
        {
          user: { id: user._id, name: user.name, email: user.email, role: user.role },
          accessToken,
          refreshToken,
        },
        "Logged in successfully"
      )
    );
});

export const refreshAccessToken = asyncHandler(async (req, res) => {
  const incomingToken = req.cookies?.refreshToken || req.body.refreshToken;
  if (!incomingToken) {
    throw new ApiError(401, "Refresh token missing");
  }

  const decoded = jwt.verify(incomingToken, ENV.REFRESH_TOKEN_SECRET);
  const user = await User.findById(decoded.id).select("+refreshToken");

  if (!user || user.refreshToken !== incomingToken) {
    throw new ApiError(401, "Invalid or expired refresh token");
  }

  const accessToken = generateAccessToken(user._id, user.role);
  const newRefreshToken = generateRefreshToken(user._id);

  user.refreshToken = newRefreshToken;
  await user.save();

  res
    .status(200)
    .cookie("accessToken", accessToken, ACCESS_COOKIE)
    .cookie("refreshToken", newRefreshToken, REFRESH_COOKIE)
    .json(new ApiResponse(200, { accessToken, refreshToken: newRefreshToken }, "Token refreshed"));
});

export const logout = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(req.user._id, { refreshToken: "" });

  res
    .status(200)
    .clearCookie("accessToken", cookieOptions)
    .clearCookie("refreshToken", cookieOptions)
    .json(new ApiResponse(200, {}, "Logged out successfully"));
});

export const getCurrentUser = asyncHandler(async (req, res) => {
  res.status(200).json(new ApiResponse(200, req.user, "Current user fetched"));
});
