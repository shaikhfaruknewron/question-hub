import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import User from "../models/User.model.js";
import { ENV } from "../config/env.js";
import {sendAccountDeactivatedEmail} from "../services/email.service.js";
import { sendSetupPasswordEmail } from "../services/email.service.js";
import crypto from "crypto";
import bcrypt from "bcryptjs";


export const getUsers = asyncHandler(async (req, res) => {
  const { role } = req.query;

  // Get page number from query
  const currentPage = Math.max(
    parseInt(req.query.page) || 1,
    1
  );

  // Maximum 10 users per page
  const limit = 10;

  // Calculate how many users to skip
  const skip = (currentPage - 1) * limit;

  const filter = role ? { role } : {};

  const [users, totalUsers] = await Promise.all([
    User.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

    User.countDocuments(filter),
  ]);

  const totalPages = Math.ceil(totalUsers / limit);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        users,
        pagination: {
          currentPage,
          limit,
          totalUsers,
          totalPages,
          hasNextPage: currentPage < totalPages,
          hasPreviousPage: currentPage > 1,
        },
      },
      "Users fetched"
    )
  );
});

export const updateUser = asyncHandler(async (req, res) => {
  const currentUser = req.user;

  const targetUser = await User.findById(req.params.id);

  if (!targetUser) {
    throw new ApiError(404, "User not found");
  }

  // Students cannot edit anyone
  if (currentUser.role === "student") {
    throw new ApiError(403, "Permission denied");
  }

  // Teachers can edit only students
  if (
    currentUser.role === "teacher" &&
    targetUser.role !== "student"
  ) {
    throw new ApiError(
      403,
      "Teachers can only edit students"
    );
  }

  // Admin cannot edit another admin (recommended)
  if (
    currentUser.role === "admin" &&
    targetUser.role === "admin"
  ) {
    throw new ApiError(
      403,
      "Admins cannot edit other admins"
    );
  }

  // Update only allowed fields
  if (req.body.name !== undefined) {
    targetUser.name = req.body.name;
  }

  if (req.body.email !== undefined) {
    targetUser.email = req.body.email;
  }

  if (req.body.isEmailVerified !== undefined) {
    targetUser.isEmailVerified = req.body.isEmailVerified;
  }

  // Do NOT update role or password here

  await targetUser.save();

  res.status(200).json(
    new ApiResponse(
      200,
      targetUser,
      "User updated successfully"
    )
  );
});

export const deactivateUser = asyncHandler(async (req, res) => {
  const currentUser = req.user;
  // Find the user to deactivate
  const targetUser = await User.findById(req.params.id);
  if (!targetUser) {
    throw new ApiError(404, "User not found");
  }
  // Students cannot deactivate anyone
  if (currentUser.role === "student") {
    throw new ApiError(
      403,
      "You do not have permission to deactivate users"
    );
  }

  // Teachers can deactivate only students
  if (
    currentUser.role === "teacher" &&
    targetUser.role !== "student"
  ) {
    throw new ApiError(
      403,
      "Teachers can only deactivate students"
    );
  }

  // Admin cannot deactivate another admin
  // (recommended)
  if (
    currentUser.role === "admin" &&
    targetUser.role === "admin"
  ) {
    throw new ApiError(
      403,
      "Admins cannot deactivate admins"
    );
  }

  // Already inactive
  if (!targetUser.isActive) {
    throw new ApiError(
      400,
      "User is already deactivated"
    );
  }

  // Deactivate user
  targetUser.isActive = false;

  await targetUser.save();

  await sendAccountDeactivatedEmail({
    to: targetUser.email,
    name: targetUser.name
  });

  res.status(200).json(
    new ApiResponse(
      200,
      {},
      "User deactivated successfully"
    )
  );
});

export const addUser = asyncHandler(async (req, res) => {
  const currentUser = req.user;

  const { name, email, role } = req.body;

  if (!name || !email || !role) {
    throw new ApiError(
      400,
      "Name, email and role are required"
    );
  }

  
  if (currentUser.role === "student") {
    throw new ApiError(
      403,
      "Students cannot create users"
    );
  }

  
  if (
    currentUser.role === "teacher" &&
    role !== "student"
  ) {
    throw new ApiError(
      403,
      "Teachers can only create student accounts"
    );
  }

  
  if (
    currentUser.role === "admin" &&
    !["teacher", "student"].includes(role)
  ) {
    throw new ApiError(
      403,
      "Admins can only create teacher or student accounts"
    );
  }

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new ApiError(
      409,
      "A user with this email already exists"
    );
  }

  const temporaryPassword = crypto
    .randomBytes(16)
    .toString("hex");

  
  const hashedPassword = await bcrypt.hash(
    temporaryPassword,
    10
  );

 
  const setupToken = crypto
    .randomBytes(32)
    .toString("hex");

  
  const setupTokenExpires = new Date(
    Date.now() + 60 * 60 * 1000
  );

 
  const newUser = await User.create({
    name,
    email,
    role,
    password: hashedPassword,
    isEmailVerified: false,
    isActive: true,
    passwordSetupToken: setupToken,
    passwordSetupExpires: setupTokenExpires,
  });

  const setupLink =
  `${ENV.FRONTEND_URL}/setup-password?token=${setupToken}`;

  await sendSetupPasswordEmail({
  to: newUser.email,
  name: newUser.name,
  role: newUser.role,
  setupLink,
  });


  res.status(201).json(
    new ApiResponse(
      201,
      {
        _id: newUser._id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
      },
      "User created successfully"
    )
  );
});

