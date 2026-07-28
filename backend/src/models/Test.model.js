import mongoose from "mongoose";

const testQuestionSchema = new mongoose.Schema(
  {
    question: { type: mongoose.Schema.Types.ObjectId, ref: "Question", required: true },
    marks: { type: Number, required: true },
    order: { type: Number, default: 0 },
  },
  { _id: false }
);

const testSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, default: "" },
    questions: [testQuestionSchema],
    durationMinutes: { type: Number, required: true },
    passingScore: { type: Number, required: true },
    totalMarks: { type: Number, default: 0 },
    shuffleQuestions: { type: Boolean, default: true },
    shuffleOptions: { type: Boolean, default: true },
    maxAttempts: { type: Number, default: 1 },
    visibility: { type: String, enum: ["draft", "published", "archived"], default: "draft" },
    scheduledStart: { type: Date, default: null },
    scheduledEnd: { type: Date, default: null },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  },
  { timestamps: true }
);

testSchema.pre("save", function (next) {
  this.totalMarks = this.questions.reduce((sum, q) => sum + q.marks, 0);
  next();
});

export default mongoose.model("Test", testSchema);
