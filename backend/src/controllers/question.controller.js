import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import Question from "../models/Question.model.js";

export const createQuestion = asyncHandler(async (req, res) => {
  const question = await Question.create({ ...req.body, createdBy: req.user._id });
  res.status(201).json(new ApiResponse(201, question, "Question created"));
});

export const getQuestions = asyncHandler(async (req, res) => {
  const { category, difficulty, type, tag, search, page = 1, limit = 20 } = req.query;

  const filter = { isActive: true };
  if (category) filter.category = category;
  if (difficulty) filter.difficulty = difficulty;
  if (type) filter.type = type;
  if (tag) filter.tags = tag;
  if (search) filter.$text = { $search: search };

  const skip = (Number(page) - 1) * Number(limit);

  const [questions, total] = await Promise.all([
    Question.find(filter)
      .populate("category", "name")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),
    Question.countDocuments(filter),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      { questions, total, page: Number(page), pages: Math.ceil(total / Number(limit)) },
      "Questions fetched"
    )
  );
});

export const getQuestionById = asyncHandler(async (req, res) => {
  const question = await Question.findById(req.params.id).populate("category", "name");
  if (!question) {
    throw new ApiError(404, "Question not found");
  }
  res.status(200).json(new ApiResponse(200, question, "Question fetched"));
});

export const updateQuestion = asyncHandler(async (req, res) => {
  const question = await Question.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });
  if (!question) {
    throw new ApiError(404, "Question not found");
  }
  res.status(200).json(new ApiResponse(200, question, "Question updated"));
});

export const deleteQuestion = asyncHandler(async (req, res) => {
  const question = await Question.findByIdAndUpdate(
    req.params.id,
    { isActive: false },
    { new: true }
  );
  if (!question) {
    throw new ApiError(404, "Question not found");
  }
  res.status(200).json(new ApiResponse(200, {}, "Question archived"));
});

export const bulkImportQuestions = asyncHandler(async (req, res) => {
  const { questions } = req.body;
  if (!Array.isArray(questions) || questions.length === 0) {
    throw new ApiError(400, "No questions provided for import");
  }

  const docs = questions.map((q) => ({ ...q, createdBy: req.user._id }));
  const created = await Question.insertMany(docs, { ordered: false });

  res.status(201).json(new ApiResponse(201, { count: created.length }, "Questions imported"));
});
