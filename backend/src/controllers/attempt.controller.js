import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import Test from "../models/Test.model.js";
import TestAttempt from "../models/TestAttempt.model.js";
import { gradeAttempt, MANUAL_TYPES } from "../services/grading.service.js";
import shuffleArray from "../utils/shuffle.js";

// Never send `isCorrect` to the person taking the test.
const toStudentQuestion = (question, marks, shuffleOptions) => {
  const options = (question.options || []).map((opt) => ({
    _id: opt._id,
    text: opt.text,
  }));

  return {
    id: question._id,
    title: question.title,
    type: question.type,
    options: shuffleOptions ? shuffleArray(options) : options,
    codingConfig:
      question.type === "coding"
        ? {
            language: question.codingConfig?.language || "",
            starterCode: question.codingConfig?.starterCode || "",
          }
        : undefined,
    marks,
    timeLimitSeconds: question.timeLimitSeconds,
  };
};

export const startAttempt = asyncHandler(async (req, res) => {
  const test = await Test.findById(req.params.testId).populate("questions.question");
  if (!test || test.visibility !== "published") {
    throw new ApiError(404, "Test not available");
  }

  const now = new Date();
  if (test.scheduledStart && now < test.scheduledStart) {
    throw new ApiError(403, "This test has not opened yet");
  }
  if (test.scheduledEnd && now > test.scheduledEnd) {
    throw new ApiError(403, "This test has closed");
  }

  const validQuestions = test.questions.filter((tq) => tq.question);
  if (validQuestions.length === 0) {
    throw new ApiError(400, "This test has no questions");
  }

  // Resume instead of creating a second row: a double-submitted start request
  // would otherwise burn an attempt (or trip the unique index).
  let attempt = await TestAttempt.findOne({
    test: test._id,
    student: req.user._id,
    status: "in-progress",
  });

  if (!attempt) {
    const previousAttempts = await TestAttempt.countDocuments({
      test: test._id,
      student: req.user._id,
    });

    if (previousAttempts >= test.maxAttempts) {
      throw new ApiError(403, "Maximum attempts reached for this test");
    }

    attempt = await TestAttempt.create({
      test: test._id,
      student: req.user._id,
      attemptNumber: previousAttempts + 1,
      answers: [],
    });
  }

  const ordered = test.shuffleQuestions ? shuffleArray(validQuestions) : validQuestions;
  const questions = ordered.map((tq) =>
    toStudentQuestion(tq.question, tq.marks, test.shuffleOptions)
  );

  const elapsedSeconds = Math.floor((now - attempt.startedAt) / 1000);
  const secondsRemaining = Math.max(test.durationMinutes * 60 - elapsedSeconds, 0);

  res.status(201).json(
    new ApiResponse(
      201,
      {
        attemptId: attempt._id,
        durationMinutes: test.durationMinutes,
        secondsRemaining,
        savedAnswers: attempt.answers.map((a) => ({
          question: a.question,
          selectedOptions: a.selectedOptions,
          textAnswer: a.textAnswer,
          codeAnswer: a.codeAnswer,
        })),
        questions,
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

  const existing = attempt.answers.find((a) => a.question.toString() === req.body.question);

  if (existing) {
    // `set` keeps this a real subdocument — spreading one copies Mongoose internals.
    existing.set(req.body);
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
  if (!test) {
    throw new ApiError(404, "Test not found");
  }

  attempt.submittedAt = new Date();
  await gradeAttempt(attempt, test);
  await attempt.save();

  res.status(200).json(
    new ApiResponse(
      200,
      {
        _id: attempt._id,
        status: attempt.status,
        score: attempt.score,
        percentage: attempt.percentage,
        passed: attempt.passed,
        totalMarks: test.totalMarks,
        awaitingReview: attempt.status === "submitted",
      },
      "Attempt submitted"
    )
  );
});

export const gradeManualAnswer = asyncHandler(async (req, res) => {
  const { attemptId, questionId } = req.params;
  const { marksAwarded, isCorrect } = req.body;

  if (typeof marksAwarded !== "number" || Number.isNaN(marksAwarded)) {
    throw new ApiError(400, "marksAwarded must be a number");
  }

  const attempt = await TestAttempt.findById(attemptId);
  if (!attempt) {
    throw new ApiError(404, "Attempt not found");
  }
  if (attempt.status === "in-progress") {
    throw new ApiError(400, "This attempt has not been submitted yet");
  }

  const answer = attempt.answers.find((a) => a.question.toString() === questionId);
  if (!answer) {
    throw new ApiError(404, "Answer not found");
  }

  answer.marksAwarded = marksAwarded;
  answer.isCorrect = typeof isCorrect === "boolean" ? isCorrect : marksAwarded > 0;
  answer.reviewedBy = req.user._id;

  const test = await Test.findById(attempt.test).populate("questions.question", "type");
  const manualQuestionIds = new Set(
    test.questions
      .filter((tq) => tq.question && MANUAL_TYPES.includes(tq.question.type))
      .map((tq) => tq.question._id.toString())
  );

  const pendingReview = attempt.answers.some(
    (a) => manualQuestionIds.has(a.question.toString()) && !a.reviewedBy
  );

  attempt.score = Math.max(
    attempt.answers.reduce((sum, a) => sum + (a.marksAwarded || 0), 0),
    0
  );
  attempt.percentage =
    test.totalMarks > 0 ? Number(((attempt.score / test.totalMarks) * 100).toFixed(2)) : 0;

  if (!pendingReview) {
    attempt.status = "graded";
    attempt.passed = attempt.score >= test.passingScore;
  }

  await attempt.save();

  res.status(200).json(new ApiResponse(200, attempt, "Answer graded"));
});

export const getMyAttempts = asyncHandler(async (req, res) => {
  const attempts = await TestAttempt.find({ student: req.user._id })
    .populate("test", "title totalMarks passingScore")
    .sort({ createdAt: -1 });

  res.status(200).json(new ApiResponse(200, attempts, "Attempts fetched"));
});

export const getAttemptsForTest = asyncHandler(async (req, res) => {
  const attempts = await TestAttempt.find({ test: req.params.testId })
    .populate("student", "name email")
    .sort({ createdAt: -1 });

  res.status(200).json(new ApiResponse(200, attempts, "Attempts fetched"));
});
