export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export const QUESTION_TYPES = [
  { value: "single-choice", label: "Single Choice" },
  { value: "multiple-choice", label: "Multiple Choice" },
  { value: "true-false", label: "True / False" },
  { value: "descriptive", label: "Descriptive" },
  { value: "coding", label: "Coding" },
];

export const DIFFICULTY_LEVELS = ["easy", "medium", "hard"];

export const QUESTION_TOPICS = [
  { value: "javascript", label: "JavaScript" },
  { value: "databases", label: "Databases" },
  { value: "react", label: "React" },
  { value: "nodejs", label: "Node.js" },
  { value: "dsa", label: "Data Structures and Algorithms" },
  { value: "networking", label: "Computer Networks" },
  { value: "operating-systems", label: "Operating Systems" },
  { value: "python", label: "Python" },
  { value: "web-fundamentals", label: "Web Fundamentals" },
  { value: "git", label: "Git and Version Control" },
];
