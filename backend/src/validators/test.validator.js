import { z } from "zod";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Must be a valid id");

const testQuestionSchema = z.object({
  question: objectId,
  marks: z.number().positive(),
  order: z.number().optional(),
});

const testShape = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  class:objectId,
  subject:objectId,
  questions: z.array(testQuestionSchema).min(1, "Select at least one question"),
  durationMinutes: z.number().positive(),
  passingScore: z.number().min(0),
  shuffleQuestions: z.boolean().optional(),
  shuffleOptions: z.boolean().optional(),
  maxAttempts: z.number().positive().optional(),
  scheduledStart: z.string().datetime().nullable().optional(),
  scheduledEnd: z.string().datetime().nullable().optional(),
  assignedTo: z.array(objectId).optional(),
});

const checkPassingScore = (value, ctx) => {
  if (!value.questions || value.passingScore === undefined) return;
  const totalMarks = value.questions.reduce((sum, q) => sum + q.marks, 0);
  if (value.passingScore > totalMarks) {
    ctx.addIssue({
      code: "custom",
      path: ["passingScore"],
      message: `Passing score cannot exceed the total marks (${totalMarks})`,
    });
  }
};

export const createTestSchema = testShape.superRefine(checkPassingScore);

export const updateTestSchema = testShape.partial().superRefine(checkPassingScore);

export const submitAnswerSchema = z.object({
  question: objectId,
  selectedOptions: z.array(objectId).optional(),
  textAnswer: z.string().optional(),
  codeAnswer: z.string().optional(),
  timeSpentSeconds: z.number().min(0).optional(),
});
