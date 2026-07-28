import TestAttempt from "../models/TestAttempt.model.js";
import Question from "../models/Question.model.js";

export const getTestPerformance = async (testId) => {
  const attempts = await TestAttempt.find({ test: testId, status: "graded" });

  if (attempts.length === 0) {
    return { totalAttempts: 0, averageScore: 0, passRate: 0, highestScore: 0, lowestScore: 0 };
  }

  const scores = attempts.map((a) => a.percentage);
  const passed = attempts.filter((a) => a.passed).length;

  return {
    totalAttempts: attempts.length,
    averageScore: Number((scores.reduce((a, b) => a + b, 0) / scores.length).toFixed(2)),
    passRate: Number(((passed / attempts.length) * 100).toFixed(2)),
    highestScore: Math.max(...scores),
    lowestScore: Math.min(...scores),
  };
};

export const getQuestionDifficulty = async (categoryId) => {
  const filter = categoryId ? { category: categoryId } : {};
  const questions = await Question.find(filter).select("title stats difficulty");

  return questions.map((q) => ({
    id: q._id,
    title: q.title,
    difficulty: q.difficulty,
    accuracy:
      q.stats.timesAttempted > 0
        ? Number(((q.stats.timesCorrect / q.stats.timesAttempted) * 100).toFixed(2))
        : null,
    timesAttempted: q.stats.timesAttempted,
  }));
};

export const getStudentPerformance = async (studentId) => {
  const attempts = await TestAttempt.find({ student: studentId, status: "graded" }).populate(
    "test",
    "title totalMarks"
  );

  return attempts.map((a) => ({
    test: a.test?.title,
    score: a.score,
    percentage: a.percentage,
    passed: a.passed,
    submittedAt: a.submittedAt,
  }));
};
