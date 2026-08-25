import mongoose from "mongoose";

const answerSchema = new mongoose.Schema(
  {
    question: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
    selectedOptions: [{ type: mongoose.Schema.Types.ObjectId }],
    textAnswer: { type: String, default: "" },
    codeAnswer: { type: String, default: "" },
    isCorrect: { type: Boolean, default: null },
    marksAwarded: { type: Number, default: 0 },
    feedback: { type: String, default: "", trim: true },
    timeSpentSeconds: { type: Number, default: 0 },
    reviewedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  },
  { _id: false }
);

const testAttemptSchema = new mongoose.Schema(
  {
    test: { type: mongoose.Schema.Types.ObjectId, ref: "Test", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    attemptNumber: { type: Number, default: 1 },
    answers: [answerSchema],
    status: {
      type: String,
      enum: ["in-progress", "submitted", "graded", "expired"],
      default: "in-progress",
    },
    score: { type: Number, default: 0 },
    percentage: { type: Number, default: 0 },
    passed: { type: Boolean, default: false },
    startedAt: { type: Date, default: Date.now },
    submittedAt: { type: Date, default: null },
  },
  { timestamps: true }
);

testAttemptSchema.index({ test: 1, student: 1, attemptNumber: 1 }, { unique: true });

export default mongoose.model("TestAttempt", testAttemptSchema);
