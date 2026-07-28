import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import {
  getTestPerformance,
  getQuestionDifficulty,
  getStudentPerformance,
} from "../services/analytics.service.js";

export const testAnalytics = asyncHandler(async (req, res) => {
  const data = await getTestPerformance(req.params.testId);
  res.status(200).json(new ApiResponse(200, data, "Test analytics fetched"));
});

export const questionAnalytics = asyncHandler(async (req, res) => {
  const data = await getQuestionDifficulty(req.query.category);
  res.status(200).json(new ApiResponse(200, data, "Question analytics fetched"));
});

export const studentAnalytics = asyncHandler(async (req, res) => {
  const studentId = req.params.studentId || req.user._id.toString();

  // Students may only read their own results.
  if (req.user.role === "student" && studentId !== req.user._id.toString()) {
    throw new ApiError(403, "You can only view your own results");
  }

  const data = await getStudentPerformance(studentId);
  res.status(200).json(new ApiResponse(200, data, "Student analytics fetched"));
});
