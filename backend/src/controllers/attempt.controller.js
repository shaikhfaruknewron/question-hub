import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import Test from "../models/Test.model.js";
import TestAttempt from "../models/TestAttempt.model.js";
import { gradeAttempt } from "../services/grading.service.js";
import shuffleArray from "../utils/shuffle.js";

export const startAttempt = asyncHandler(async (req, res) => {
  const test = await Test.findById(req.params.testId).populate("questions.question");
  if (!test || test.visibility !== "published") {
    throw new ApiError(404, "Test not available");
  }

  const previousAttempts = await TestAttempt.countDocuments({
    test: test._id,
    student: req.user._id,
  });

  if (previousAttempts >= test.maxAttempts) {
    throw new ApiError(403, "Maximum attempts reached for this test");
  }

  let questions = test.questions.map((q) => q.question);
  if (test.shuffleQuestions) {
    questions = shuffleArray(questions);
  }

  const attempt = await TestAttempt.create({
    test: test._id,
    student: req.user._id,
    attemptNumber: previousAttempts + 1,
    answers: [],
  });

  res.status(201).json(
    new ApiResponse(
      201,
      {
        attemptId: attempt._id,
        durationMinutes: test.durationMinutes,
        questions: questions.map((q) => ({
          id: q._id,
          title: q.title,
          type: q.type,
          options: test.shuffleOptions ? shuffleArray(q.options) : q.options,
          marks: q.marks,
          timeLimitSeconds: q.timeLimitSeconds,
        })),
      },
      "Attempt started"
    )
  );
});

export const submitAnswer = asyncHandler(async (req, res) => {
  const attempt = await TestAttempt.findById(req.params.attemptId);
  if (!attempt || attempt.student.toString() !== req.user._id.toString()) {
    throw new ApiError(404, "Attempt not found");
  }
  if (attempt.status !== "in-progress") {
    throw new ApiError(400, "This attempt is no longer active");
  }

  const existingIndex = attempt.answers.findIndex(
    (a) => a.question.toString() === req.body.question
  );

  if (existingIndex >= 0) {
    attempt.answers[existingIndex] = { ...attempt.answers[existingIndex], ...req.body };
  } else {
    attempt.answers.push(req.body);
  }

  await attempt.save();

  res.status(200).json(new ApiResponse(200, {}, "Answer saved"));
});

export const submitAttempt = asyncHandler(async (req, res) => {
  const attempt = await TestAttempt.findById(req.params.attemptId);
  if (!attempt || attempt.student.toString() !== req.user._id.toString()) {
    throw new ApiError(404, "Attempt not found");
  }
  if (attempt.status !== "in-progress") {
    throw new ApiError(400, "This attempt has already been submitted");
  }

  const test = await Test.findById(attempt.test);
  attempt.submittedAt = new Date();

  await gradeAttempt(attempt);
  attempt.passed = attempt.percentage >= (test.passingScore / test.totalMarks) * 100;

  await attempt.save();

  res.status(200).json(new ApiResponse(200, attempt, "Attempt submitted"));
});

export const gradeManualAnswer = asyncHandler(async (req, res) => {
  const { attemptId, questionId } = req.params;
  const { marksAwarded, isCorrect } = req.body;

  const attempt = await TestAttempt.findById(attemptId);
  if (!attempt) {
    throw new ApiError(404, "Attempt not found");
  }

  const answer = attempt.answers.find((a) => a.question.toString() === questionId);
  if (!answer) {
    throw new ApiError(404, "Answer not found");
  }

  answer.marksAwarded = marksAwarded;
  answer.isCorrect = isCorrect;
  answer.reviewedBy = req.user._id;

  const allReviewed = attempt.answers.every((a) => a.marksAwarded !== undefined);
  if (allReviewed) {
    attempt.score = attempt.answers.reduce((sum, a) => sum + a.marksAwarded, 0);
    attempt.status = "graded";
  }

  await attempt.save();

  res.status(200).json(new ApiResponse(200, attempt, "Answer graded"));
});

export const getMyAttempts = asyncHandler(async (req, res) => {
  const attempts = await TestAttempt.find({ student: req.user._id })
    .populate("test", "title totalMarks")
    .sort({ createdAt: -1 });

  res.status(200).json(new ApiResponse(200, attempts, "Attempts fetched"));
});

export const getAttemptsForTest = asyncHandler(async (req, res) => {
  const attempts = await TestAttempt.find({ test: req.params.testId })
    .populate("student", "name email")
    .sort({ createdAt: -1 });

  res.status(200).json(new ApiResponse(200, attempts, "Attempts fetched"));
});
