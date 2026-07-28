import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import Test from "../models/Test.model.js";
import Question from "../models/Question.model.js";

const assertQuestionsExist = async (questions) => {
  if (!questions) return;
  const ids = questions.map((q) => q.question);
  const found = await Question.countDocuments({ _id: { $in: ids }, isActive: true });
  if (found !== new Set(ids.map(String)).size) {
    throw new ApiError(400, "One or more selected questions do not exist");
  }
};

export const createTest = asyncHandler(async (req, res) => {
  await assertQuestionsExist(req.body.questions);
  const test = await Test.create({ ...req.body, createdBy: req.user._id });
  res.status(201).json(new ApiResponse(201, test, "Test created"));
});

export const getTests = asyncHandler(async (req, res) => {
  const { visibility, page = 1, limit = 20 } = req.query;

  const filter = {};
  if (visibility) filter.visibility = visibility;

  if (req.user.role === "student") {
    filter.visibility = "published";
    // A test with an empty assignment list is open to every student.
    filter.$or = [{ assignedTo: req.user._id }, { assignedTo: { $size: 0 } }];
  } else {
    filter.visibility = visibility || { $ne: "archived" };
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [tests, total] = await Promise.all([
    Test.find(filter)
      .populate("createdBy", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Test.countDocuments(filter),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      { tests, total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
      "Tests fetched"
    )
  );
});

export const getTestById = asyncHandler(async (req, res) => {
  const isStudent = req.user.role === "student";
  const query = Test.findById(req.params.id);

  if (!isStudent) {
    query.populate("questions.question");
  }

  const test = await query;
  if (!test) {
    throw new ApiError(404, "Test not found");
  }

  if (isStudent && test.visibility !== "published") {
    throw new ApiError(404, "Test not found");
  }

  const payload = test.toObject();
  if (isStudent) {
    // Students get the metadata and the question count, never the question bodies.
    payload.questionCount = payload.questions.length;
    delete payload.questions;
    delete payload.assignedTo;
  }

  res.status(200).json(new ApiResponse(200, payload, "Test fetched"));
});

export const updateTest = asyncHandler(async (req, res) => {
  await assertQuestionsExist(req.body.questions);

  const test = await Test.findById(req.params.id);
  if (!test) {
    throw new ApiError(404, "Test not found");
  }

  // Assign then save (rather than findByIdAndUpdate) so the pre-save hook recomputes totalMarks.
  test.set(req.body);
  await test.save();

  res.status(200).json(new ApiResponse(200, test, "Test updated"));
});

export const publishTest = asyncHandler(async (req, res) => {
  const test = await Test.findById(req.params.id);
  if (!test) {
    throw new ApiError(404, "Test not found");
  }
  if (test.questions.length === 0) {
    throw new ApiError(400, "Cannot publish a test with no questions");
  }

  test.visibility = "published";
  await test.save();

  res.status(200).json(new ApiResponse(200, test, "Test published"));
});

export const deleteTest = asyncHandler(async (req, res) => {
  const test = await Test.findByIdAndUpdate(
    req.params.id,
    { visibility: "archived" },
    { new: true }
  );
  if (!test) {
    throw new ApiError(404, "Test not found");
  }
  res.status(200).json(new ApiResponse(200, {}, "Test archived"));
});
