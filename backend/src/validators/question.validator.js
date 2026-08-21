import { z } from "zod";
import {
  QUESTION_TYPES,
  QUESTION_TYPE_VALUES,
  QUESTION_CHOICE_TYPES,
  QUESTION_DIFFICULTY_VALUES,
} from "../constants/question.constants.js";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Must be a valid id");

const optionSchema = z.object({
  text: z.string().min(1, "Option text is required"),
  isCorrect: z.boolean().optional(),
});

const questionShape = z.object({
  title: z.string().min(3),
  type: z.enum(QUESTION_TYPE_VALUES),
  category: objectId,
  tags: z.array(z.string()).optional(),
  difficulty: z.enum(QUESTION_DIFFICULTY_VALUES).optional(),
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

// Choice questions are useless without options and a correct answer, and the
// grader silently marks everything wrong if they are missing.
const checkChoiceOptions = (value, ctx) => {
  if (!value.type || !QUESTION_CHOICE_TYPES.includes(value.type)) return;

  const options = value.options || [];
  if (options.length < 2) {
    ctx.addIssue({
      code: "custom",
      path: ["options"],
      message: "Choice questions need at least two options",
    });
    return;
  }

  const correctCount = options.filter((opt) => opt.isCorrect).length;
  if (correctCount === 0) {
    ctx.addIssue({
      code: "custom",
      path: ["options"],
      message: "Mark at least one option as correct",
    });
  }
  if (value.type !== QUESTION_TYPES.MULTIPLE_CHOICE && correctCount > 1) {
    ctx.addIssue({
      code: "custom",
      path: ["options"],
      message: "Only one option can be correct for this question type",
    });
  }
};

export const createQuestionSchema = questionShape.superRefine(checkChoiceOptions);

export const updateQuestionSchema = questionShape.partial().superRefine((value, ctx) => {
  if (value.type) checkChoiceOptions(value, ctx);
});
