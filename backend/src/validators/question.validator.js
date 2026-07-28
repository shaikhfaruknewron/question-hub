import { z } from "zod";

const optionSchema = z.object({
  text: z.string().min(1),
  isCorrect: z.boolean().optional(),
});

export const createQuestionSchema = z.object({
  title: z.string().min(3),
  type: z.enum(["single-choice", "multiple-choice", "true-false", "descriptive", "coding"]),
  category: z.string().min(1),
  tags: z.array(z.string()).optional(),
  difficulty: z.enum(["easy", "medium", "hard"]).optional(),
  options: z.array(optionSchema).optional(),
  correctAnswer: z.string().optional(),
  explanation: z.string().optional(),
  marks: z.number().positive().optional(),
  negativeMarks: z.number().min(0).optional(),
  timeLimitSeconds: z.number().positive().optional(),
  codingConfig: z
    .object({
      language: z.string().optional(),
      starterCode: z.string().optional(),
      testCases: z
        .array(
          z.object({
            input: z.string().optional(),
            expectedOutput: z.string().optional(),
            isHidden: z.boolean().optional(),
          })
        )
        .optional(),
    })
    .optional(),
});

export const updateQuestionSchema = createQuestionSchema.partial();
