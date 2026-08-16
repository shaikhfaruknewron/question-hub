import mongoose from "mongoose";

const classSubjectTeacherSchema = new mongoose.Schema(
  {
    class: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Class",
      required: true,
    },

    subject: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Subject",
      required: true,
    },

    teacher: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

// Prevent duplicate teacher assignment
classSubjectTeacherSchema.index(
  { class: 1, subject: 1 },
  { unique: true }
);

const ClassSubjectTeacher =
  mongoose.model(
    "ClassSubjectTeacher",
    classSubjectTeacherSchema
  );

export default ClassSubjectTeacher;