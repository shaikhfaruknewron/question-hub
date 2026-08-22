export const QUESTION_TYPES = {
  SINGLE_CHOICE: "single-choice",
  MULTIPLE_CHOICE: "multiple-choice",
  TRUE_FALSE: "true-false",
  DESCRIPTIVE: "descriptive",
  CODING: "coding",
};

export const QUESTION_TYPE_VALUES = Object.values(QUESTION_TYPES);

export const QUESTION_CHOICE_TYPES = [
  QUESTION_TYPES.SINGLE_CHOICE,
  QUESTION_TYPES.MULTIPLE_CHOICE,
  QUESTION_TYPES.TRUE_FALSE,
];

export const QUESTION_DIFFICULTIES = {
  EASY: "easy",
  MEDIUM: "medium",
  HARD: "hard",
};

export const QUESTION_DIFFICULTY_VALUES = Object.values(QUESTION_DIFFICULTIES);
