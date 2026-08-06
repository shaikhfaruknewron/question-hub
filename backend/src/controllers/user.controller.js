import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import User from "../models/User.model.js";
import {sendAccountDeactivatedEmail} from "../services/email.service.js";


export const getUsers = asyncHandler(async (req, res) => {
  const { role } = req.query;

  const filter = {
    isActive: true,
  };

  if (role) {
    filter.role = role;
  }
  const users = await User.find(filter)
    .select("-password ")
    .sort({ createdAt: -1 });
  res.status(200).json(new ApiResponse(200, users, "Users fetched"));
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

