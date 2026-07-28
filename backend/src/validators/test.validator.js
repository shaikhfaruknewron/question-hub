import { z } from "zod";

const testQuestionSchema = z.object({
  question: z.string().min(1),
  marks: z.number().positive(),
  order: z.number().optional(),
});

export const createTestSchema = z.object({
  title: z.string().min(3),
  description: z.string().optional(),
  questions: z.array(testQuestionSchema).min(1),
  durationMinutes: z.number().positive(),
  passingScore: z.number().positive(),
  shuffleQuestions: z.boolean().optional(),
  shuffleOptions: z.boolean().optional(),
  maxAttempts: z.number().positive().optional(),
  scheduledStart: z.string().optional(),
  scheduledEnd: z.string().optional(),
  assignedTo: z.array(z.string()).optional(),
});

export const updateTestSchema = createTestSchema.partial();

export const submitAnswerSchema = z.object({
  question: z.string().min(1),
  selectedOptions: z.array(z.string()).optional(),
  textAnswer: z.string().optional(),
  codeAnswer: z.string().optional(),
  timeSpentSeconds: z.number().min(0).optional(),
});
