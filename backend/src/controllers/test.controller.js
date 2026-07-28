import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import Test from "../models/Test.model.js";

export const createTest = asyncHandler(async (req, res) => {
  const test = await Test.create({ ...req.body, createdBy: req.user._id });
  res.status(201).json(new ApiResponse(201, test, "Test created"));
});

export const getTests = asyncHandler(async (req, res) => {
  const { visibility, page = 1, limit = 20 } = req.query;

  const filter = {};
  if (visibility) filter.visibility = visibility;
  if (req.user.role === "student") {
    filter.visibility = "published";
    filter.assignedTo = req.user._id;
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [tests, total] = await Promise.all([
    Test.find(filter)
      .populate("createdBy", "name")
      .select("-questions")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Test.countDocuments(filter),
  ]);

  res.status(200).json(
    new ApiResponse(200, { tests, total, page: Number(page), pages: Math.ceil(total / Number(limit)) }, "Tests fetched")
  );
});

export const getTestById = asyncHandler(async (req, res) => {
  const populateQuestions = req.user.role !== "student";
  const query = Test.findById(req.params.id);

  if (populateQuestions) {
    query.populate("questions.question");
  }

  const test = await query;
  if (!test) {
    throw new ApiError(404, "Test not found");
  }

  res.status(200).json(new ApiResponse(200, test, "Test fetched"));
});

export const updateTest = asyncHandler(async (req, res) => {
  const test = await Test.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!test) {
    throw new ApiError(404, "Test not found");
  }
  res.status(200).json(new ApiResponse(200, test, "Test updated"));
});

export const publishTest = asyncHandler(async (req, res) => {
  const test = await Test.findByIdAndUpdate(
    req.params.id,
    { visibility: "published" },
    { new: true }
  );
  if (!test) {
    throw new ApiError(404, "Test not found");
  }
  res.status(200).json(new ApiResponse(200, test, "Test published"));
});

export const deleteTest = asyncHandler(async (req, res) => {
  const test = await Test.findByIdAndUpdate(req.params.id, { visibility: "archived" }, { new: true });
  if (!test) {
    throw new ApiError(404, "Test not found");
  }
  res.status(200).json(new ApiResponse(200, {}, "Test archived"));
});
