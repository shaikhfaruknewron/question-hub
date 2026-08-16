import mongoose from "mongoose";

const classSubjectSchema = new mongoose.Schema(
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
  },
  {
    timestamps: true,
  }
);

classSubjectSchema.index(
  { class: 1, subject: 1 },
  { unique: true }
);

const ClassSubject = mongoose.model(
  "ClassSubject",
  classSubjectSchema
);

export default ClassSubject;