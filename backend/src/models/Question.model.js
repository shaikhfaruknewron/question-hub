import mongoose from "mongoose";
import {
  QUESTION_TYPE_VALUES,
  QUESTION_DIFFICULTY_VALUES,
  QUESTION_DIFFICULTIES,
} from "../constants/question.constants.js";

const optionSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
    isCorrect: { type: Boolean, default: false },
  },
  { _id: true }
);

const questionSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: QUESTION_TYPE_VALUES,
      required: true,
    },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    topic: {type: String,required: true,trim: true,},
    tags: [{ type: String, trim: true }],
    difficulty: {
      type: String,
      enum: QUESTION_DIFFICULTY_VALUES,
      default: QUESTION_DIFFICULTIES.MEDIUM,
    },
    options: [optionSchema],
    correctAnswer: { type: String, default: "" },
    explanation: { type: String, default: "" },
    marks: { type: Number, default: 1 },
    negativeMarks: { type: Number, default: 0 },
    timeLimitSeconds: { type: Number, default: 60 },
    codingConfig: {
      language: { type: String, default: "" },
      starterCode: { type: String, default: "" },
      testCases: [
        {
          input: { type: String, default: "" },
          expectedOutput: { type: String, default: "" },
          isHidden: { type: Boolean, default: false },
        },
      ],
    },
    attachments: [{ type: String }],
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    usageCount: { type: Number, default: 0 },
    stats: {
      timesAttempted: { type: Number, default: 0 },
      timesCorrect: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

// `tags` must be part of the text index, not a compound b-tree key: a compound text
// index cannot have an array in its non-text field, which rejects every tagged question.
questionSchema.index({ title: "text", tags: "text" });
questionSchema.index({ tags: 1 });
questionSchema.index({subject:1, category: 1, difficulty: 1, type: 1 });

export default mongoose.model("Question", questionSchema);
