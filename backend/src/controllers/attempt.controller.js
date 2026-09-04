import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import Test from "../models/Test.model.js";
import TestAttempt from "../models/TestAttempt.model.js";
import User from "../models/User.model.js";
import ClassSubjectTeacher from "../models/classSubjectTeacher.model.js";
import { gradeAttempt, MANUAL_TYPES } from "../services/grading.service.js";
import shuffleArray from "../utils/shuffle.js";
import {
PROCTORING_EVENT_TYPES,
PROCTORING_EVENT_COUNTERS,
PROCTORING_ACTIONS,
PROCTORING_POLICY,
} from "../constants/proctoring.constants.js";


const assertStudentCanAccessTest = async (test, user) => {
  if (user.role !== "student") {
    throw new ApiError(403, "Only students can take tests");
  }

  if (!test || test.visibility !== "published") {
    throw new ApiError(404, "Test not available");
  }

  const student = await User.findById(user._id).select("class");
  const isAssigned = !test.assignedTo?.length || test.assignedTo.some(
    (studentId) => studentId.toString() === user._id.toString()
  );

  if (!student?.class || test.class.toString() !== student.class.toString() || !isAssigned) {
    throw new ApiError(404, "Test not available");
  }
};

const hasExpired = (attempt, test, now = new Date()) =>
  Boolean(
    (test.scheduledEnd && now > test.scheduledEnd) ||
      now >= new Date(attempt.startedAt).getTime() + test.durationMinutes * 60 * 1000
  );

const expireAttemptIfNeeded = async (attempt, test, now = new Date()) => {
  if (attempt.status === "in-progress" && hasExpired(attempt, test, now)) {
    attempt.status = "expired";
    attempt.submittedAt = now;
    await attempt.save();
  }
  return attempt;
};

const assertTestIsOpen = (test, now = new Date()) => {
  if (test.scheduledStart && now < test.scheduledStart) {
    throw new ApiError(403, "This test has not opened yet");
  }
  if (test.scheduledEnd && now > test.scheduledEnd) {
    throw new ApiError(403, "This test has closed");
  }
};

const assertStaffCanAccessTest = async (test, user) => {
  if (!test) throw new ApiError(404, "Test not found");
  if (user.role === "admin") return;
  if (user.role !== "teacher") throw new ApiError(403, "You do not have permission to view results");

  const assignment = await ClassSubjectTeacher.findOne({
    class: test.class,
    subject: test.subject,
    teacher: user._id,
  });
  if (!assignment) {
    throw new ApiError(403, "You are not assigned to this test's class and subject");
  }
};

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
  await assertStudentCanAccessTest(test, req.user);
  const now = new Date();
  assertTestIsOpen(test, now);

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

  if (attempt) {
    await expireAttemptIfNeeded(attempt, test, now);
    attempt = attempt.status === "in-progress" ? attempt : null;
  }

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
      proctoring: {
      enabled: true,
      status: "active",
      },
    });
  }

  const remainingAttempts = Math.max(
  test.maxAttempts - attempt.attemptNumber,
  0
);

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
        attemptNumber: attempt.attemptNumber,
        maxAttempts: test.maxAttempts,
        remainingAttempts,
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
  const test = await Test.findById(attempt.test);
  await assertStudentCanAccessTest(test, req.user);
  assertTestIsOpen(test);
  await expireAttemptIfNeeded(attempt, test);
  if (attempt.status !== "in-progress") throw new ApiError(400, "This attempt is no longer active");

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

export const logProctoringEvent = asyncHandler(async (req, res) => {
const { eventType, metadata = {} } = req.body;

if (!Object.values(PROCTORING_EVENT_TYPES).includes(eventType)) {
throw new ApiError(400, "Invalid proctoring event type");
}

const attempt = await TestAttempt.findById(req.params.attemptId);

if (
!attempt ||
attempt.student.toString() !== req.user._id.toString()
) {
throw new ApiError(404, "Attempt not found");
}

const test = await Test.findById(attempt.test);

await assertStudentCanAccessTest(test, req.user);

await expireAttemptIfNeeded(attempt, test);

if (attempt.status !== "in-progress") {
throw new ApiError(400, "This attempt is no longer active");
}

if (!attempt.proctoring?.enabled) {
throw new ApiError(400, "Proctoring is not enabled for this attempt");
}

const counterField = PROCTORING_EVENT_COUNTERS[eventType];

if (counterField) {
attempt.proctoring[counterField] += 1;
}

attempt.proctoring.totalViolations += 1;

attempt.proctoring.events.push({
eventType,
timestamp: new Date(),
metadata,
});

let action = PROCTORING_ACTIONS.WARNING;

if (
attempt.proctoring.tabSwitchCount >=
PROCTORING_POLICY.MAX_TAB_SWITCHES ||
attempt.proctoring.fullscreenExitCount >=
PROCTORING_POLICY.MAX_FULLSCREEN_EXITS ||
attempt.proctoring.totalViolations >=
PROCTORING_POLICY.MAX_TOTAL_VIOLATIONS
) {
action = PROCTORING_ACTIONS.AUTO_SUBMIT;
attempt.proctoring.status = "violated";
}

await attempt.save();

res.status(200).json(
new ApiResponse(
200,
{
action,
    proctoring: {
      tabSwitchCount: attempt.proctoring.tabSwitchCount,
      fullscreenExitCount:
        attempt.proctoring.fullscreenExitCount,
      copyAttemptCount:
        attempt.proctoring.copyAttemptCount,
      pasteAttemptCount:
        attempt.proctoring.pasteAttemptCount,
      cutAttemptCount:
        attempt.proctoring.cutAttemptCount,
      rightClickCount:
        attempt.proctoring.rightClickCount,
      cameraViolationCount:
        attempt.proctoring.cameraViolationCount,
      microphoneViolationCount:
        attempt.proctoring.microphoneViolationCount,
      totalViolations:
        attempt.proctoring.totalViolations,
    },
  },
  "Proctoring event recorded"
)


);
});


export const submitAttempt = asyncHandler(async (req, res) => {
  const { submissionReason = "student-submitted" } = req.body;
  const attempt = await TestAttempt.findById(req.params.attemptId);
  if (!attempt || attempt.student.toString() !== req.user._id.toString()) {
    throw new ApiError(404, "Attempt not found");
  }
  const test = await Test.findById(attempt.test);
  await assertStudentCanAccessTest(test, req.user);
  assertTestIsOpen(test);
  await expireAttemptIfNeeded(attempt, test);
  if (attempt.status !== "in-progress") throw new ApiError(400, "This attempt has already been submitted");

 attempt.submittedAt = new Date();
attempt.submissionReason = submissionReason;

if (attempt.proctoring?.enabled) {
  attempt.proctoring.status =
    submissionReason === "proctoring-violation"
      ? "violated"
      : "completed";
}
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
  const { marksAwarded, isCorrect, feedback } = req.body;

  if (typeof marksAwarded !== "number" || Number.isNaN(marksAwarded)) {
    throw new ApiError(400, "marksAwarded must be a number");
  }

  const attempt = await TestAttempt.findById(attemptId);
  if (!attempt) {
    throw new ApiError(404, "Attempt not found");
  }

  const test = await Test.findById(attempt.test).populate("questions.question", "type");
  await assertStaffCanAccessTest(test, req.user);
  if (attempt.status === "in-progress") {
    throw new ApiError(400, "This attempt has not been submitted yet");
  }

  const answer = attempt.answers.find((a) => a.question.toString() === questionId);
  if (!answer) {
    throw new ApiError(404, "Answer not found");
  }

  const testQuestion = test.questions.find(
    (item) => item.question && item.question._id.toString() === questionId
  );
  if (!testQuestion || !MANUAL_TYPES.includes(testQuestion.question.type)) {
    throw new ApiError(400, "Only descriptive and coding answers can be graded manually");
  }
  if (marksAwarded > testQuestion.marks) {
    throw new ApiError(400, `Marks cannot exceed the question maximum (${testQuestion.marks})`);
  }

  answer.marksAwarded = marksAwarded;
  answer.isCorrect = typeof isCorrect === "boolean" ? isCorrect : marksAwarded > 0;
  if (feedback !== undefined) answer.feedback = feedback;
  answer.reviewedBy = req.user._id;

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
  const test = await Test.findById(req.params.testId).select("class subject");
  await assertStaffCanAccessTest(test, req.user);

  const attempts = await TestAttempt.find({ test: req.params.testId })
    .populate("student", "name email")
    .sort({ createdAt: -1 });

  res.status(200).json(new ApiResponse(200, attempts, "Attempts fetched"));
});

export const getAttemptById = asyncHandler(async (req, res) => {
  const attempt = await TestAttempt.findById(req.params.attemptId)
    .populate("student", "name email")
    .populate({
      path: "test",
      select: "title totalMarks passingScore class subject questions",
      populate: { path: "questions.question", select: "title type" },
    });

  if (!attempt) throw new ApiError(404, "Attempt not found");
  await assertStaffCanAccessTest(attempt.test, req.user);

  res.status(200).json(new ApiResponse(200, attempt, "Attempt fetched"));
});
