import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import Question from "../models/Question.model.js";
import redisClient from "../config/redis.js";
import { clearQuestionsCache } from "../utils/questionCache.js";


export const createQuestion = asyncHandler(async (req, res) => {
  const question = await Question.create({ ...req.body, createdBy: req.user._id });
  await clearQuestionsCache();
  res.status(201).json(new ApiResponse(201, question, "Question created"));
});

export const getQuestions = asyncHandler(async (req, res) => {
  const {
    category,
    topic,
    difficulty,
    type,
    tag,
    search,
    page = 1,
    limit = 20,
  } = req.query;

  // Create a unique key for every filter + pagination combination
  const cacheKey = `questions:${JSON.stringify({
    category,
    topic,
    difficulty,
    type,
    tag,
    search,
    page,
    limit,
  })}`;

  // 1. Check Redis first
  const cachedQuestions = await redisClient.get(cacheKey);

  if (cachedQuestions) {
    console.log("[redis] Questions served from cache");

    res.set("X-Cache", "HIT");

    return res
      .status(200)
      .json(JSON.parse(cachedQuestions));
  }

  // Cache miss
  res.set("X-Cache", "MISS");

  // 2. Build MongoDB filter
  const filter = { isActive: true };

  if (category) filter.category = category;

  if (topic) {
    filter.topic = {
      $regex: `^${topic}$`,
      $options: "i",
    };
  }

  if (difficulty) filter.difficulty = difficulty;

  if (type) filter.type = type;

  if (tag) filter.tags = tag;

  if (search) filter.$text = { $search: search };

  const skip = (Number(page) - 1) * Number(limit);

  // 3. Fetch from MongoDB
  const [questions, total] = await Promise.all([
    Question.find(filter)
      .populate("category", "name")
      .populate("createdBy", "name")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),

    Question.countDocuments(filter),
  ]);

  const response = new ApiResponse(
    200,
    {
      questions,
      total,
      page: Number(page),
      pages: Math.ceil(total / Number(limit)),
    },
    "Questions fetched"
  );

  // 4. Store response in Redis for 5 minutes
  await redisClient.setEx(
    cacheKey,
    300,
    JSON.stringify(response)
  );

  console.log("[redis] Questions fetched from MongoDB and cached");

  // 5. Return response
  res.status(200).json(response);
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
  await clearQuestionsCache();
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
  await clearQuestionsCache();
  res.status(200).json(new ApiResponse(200, {}, "Question archived"));
});

export const bulkImportQuestions = asyncHandler(async (req, res) => {
  const { questions } = req.body;
  if (!Array.isArray(questions) || questions.length === 0) {
    throw new ApiError(400, "No questions provided for import");
  }

  const docs = questions.map((q) => ({ ...q, createdBy: req.user._id }));
  const created = await Question.insertMany(docs, { ordered: false });

  await clearQuestionsCache();

  res.status(201).json(new ApiResponse(201, { count: created.length }, "Questions imported"));
});
