export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export const QUESTION_TYPES = [
  { value: "single-choice", label: "Single Choice" },
  { value: "multiple-choice", label: "Multiple Choice" },
  { value: "true-false", label: "True / False" },
  { value: "descriptive", label: "Descriptive" },
  { value: "coding", label: "Coding" },
];

export const DIFFICULTY_LEVELS = ["easy", "medium", "hard"];
