import Question from "../models/Question.model.js";
import { QUESTION_TYPES } from "../constants/question.constants.js";

export const MANUAL_TYPES = [QUESTION_TYPES.DESCRIPTIVE, QUESTION_TYPES.CODING];

const isAnswered = (answer) =>
  (answer.selectedOptions || []).length > 0 ||
  Boolean(answer.textAnswer?.trim()) ||
  Boolean(answer.codeAnswer?.trim());

// `marks` comes from the test definition so the same question can be worth a
// different amount in different tests.
export const gradeAnswer = (question, answer, marks = question.marks) => {
  // An unanswered question is never penalised.
  if (!isAnswered(answer)) {
    return { isCorrect: false, marksAwarded: 0 };
  }

  if (
    question.type === QUESTION_TYPES.SINGLE_CHOICE ||
    question.type === QUESTION_TYPES.TRUE_FALSE
  ) {
    const correctOption = question.options.find((opt) => opt.isCorrect);
    const selected = answer.selectedOptions?.[0]?.toString();
    const isCorrect = Boolean(correctOption) && selected === correctOption._id.toString();
    return { isCorrect, marksAwarded: isCorrect ? marks : -question.negativeMarks };
  }

  if (question.type === QUESTION_TYPES.MULTIPLE_CHOICE) {
    const correctIds = question.options
      .filter((opt) => opt.isCorrect)
      .map((opt) => opt._id.toString())
      .sort();
    const selectedIds = (answer.selectedOptions || []).map((id) => id.toString()).sort();
    const isCorrect =
      correctIds.length > 0 &&
      correctIds.length === selectedIds.length &&
      correctIds.every((id, i) => id === selectedIds[i]);
    return { isCorrect, marksAwarded: isCorrect ? marks : -question.negativeMarks };
  }

  return { isCorrect: null, marksAwarded: 0 };
};

export const gradeAttempt = async (attempt, test) => {
  // Marks are keyed off the test, not the question bank, and unanswered questions
  // still count towards the denominator.
  const marksByQuestion = new Map(
    test.questions.map((tq) => [
      (tq.question?._id || tq.question).toString(),
      tq.marks,
    ])
  );

  const questions = await Question.find({ _id: { $in: [...marksByQuestion.keys()] } });
  const questionById = new Map(questions.map((q) => [q._id.toString(), q]));

  let score = 0;
  let needsManualReview = false;
  const statUpdates = [];

  for (const answer of attempt.answers) {
    const questionId = answer.question.toString();
    const question = questionById.get(questionId);
    if (!question) continue;

    if (MANUAL_TYPES.includes(question.type)) {
      needsManualReview = true;
      answer.isCorrect = null;
      answer.marksAwarded = 0;
      continue;
    }

    const marks = marksByQuestion.get(questionId) ?? question.marks;
    const { isCorrect, marksAwarded } = gradeAnswer(question, answer, marks);

    answer.isCorrect = isCorrect;
    answer.marksAwarded = marksAwarded;
    score += marksAwarded;

    statUpdates.push({
      updateOne: {
        filter: { _id: question._id },
        update: {
          $inc: {
            "stats.timesAttempted": 1,
            "stats.timesCorrect": isCorrect ? 1 : 0,
          },
        },
      },
    });
  }

  if (statUpdates.length > 0) {
    await Question.bulkWrite(statUpdates);
  }

  const totalMarks =
    test.totalMarks || [...marksByQuestion.values()].reduce((sum, m) => sum + m, 0);

  attempt.score = Math.max(score, 0);
  attempt.percentage =
    totalMarks > 0 ? Number(((attempt.score / totalMarks) * 100).toFixed(2)) : 0;
  attempt.status = needsManualReview ? "submitted" : "graded";
  attempt.passed = !needsManualReview && attempt.score >= test.passingScore;

  return attempt;
};
