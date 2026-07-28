import mongoose from "mongoose";

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
      enum: ["single-choice", "multiple-choice", "true-false", "descriptive", "coding"],
      required: true,
    },
    category: { type: mongoose.Schema.Types.ObjectId, ref: "Category", required: true },
    tags: [{ type: String, trim: true }],
    difficulty: { type: String, enum: ["easy", "medium", "hard"], default: "medium" },
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

questionSchema.index({ title: "text", tags: 1 });
questionSchema.index({ category: 1, difficulty: 1, type: 1 });

export default mongoose.model("Question", questionSchema);
