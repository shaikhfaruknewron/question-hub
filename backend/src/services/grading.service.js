import Question from "../models/Question.model.js";

export const gradeAnswer = async (question, answer) => {
  if (question.type === "single-choice" || question.type === "true-false") {
    const correctOption = question.options.find((opt) => opt.isCorrect);
    const selected = answer.selectedOptions?.[0]?.toString();
    const isCorrect = correctOption && selected === correctOption._id.toString();
    return {
      isCorrect,
      marksAwarded: isCorrect ? question.marks : -question.negativeMarks,
    };
  }

  if (question.type === "multiple-choice") {
    const correctIds = question.options
      .filter((opt) => opt.isCorrect)
      .map((opt) => opt._id.toString())
      .sort();
    const selectedIds = (answer.selectedOptions || []).map((id) => id.toString()).sort();
    const isCorrect =
      correctIds.length === selectedIds.length &&
      correctIds.every((id, i) => id === selectedIds[i]);
    return {
      isCorrect,
      marksAwarded: isCorrect ? question.marks : -question.negativeMarks,
    };
  }

  return { isCorrect: null, marksAwarded: 0 };
};

export const gradeAttempt = async (attempt) => {
  let score = 0;
  let totalMarks = 0;
  let needsManualReview = false;

  for (const answer of attempt.answers) {
    const question = await Question.findById(answer.question);
    if (!question) continue;

    totalMarks += question.marks;

    if (question.type === "descriptive" || question.type === "coding") {
      needsManualReview = true;
      continue;
    }

    const { isCorrect, marksAwarded } = await gradeAnswer(question, answer);
    answer.isCorrect = isCorrect;
    answer.marksAwarded = marksAwarded;
    score += marksAwarded;

    question.stats.timesAttempted += 1;
    if (isCorrect) question.stats.timesCorrect += 1;
    await question.save();
  }

  attempt.score = Math.max(score, 0);
  attempt.percentage = totalMarks > 0 ? Number(((score / totalMarks) * 100).toFixed(2)) : 0;
  attempt.status = needsManualReview ? "submitted" : "graded";

  return attempt;
};
