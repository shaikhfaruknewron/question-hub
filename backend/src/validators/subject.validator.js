import { z } from "zod";

export const createSubjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Subject name must be at least 2 characters"),

  code: z
    .string()
    .trim()
    .min(2, "Subject code must be at least 2 characters")
    .max(10, "Subject code cannot exceed 10 characters"),

  description: z
    .string()
    .trim()
    .optional()
    .default(""),
});

export const updateSubjectSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Subject name must be at least 2 characters")
    .optional(),

  code: z
    .string()
    .trim()
    .min(2, "Subject code must be at least 2 characters")
    .max(10, "Subject code cannot exceed 10 characters")
    .optional(),

  description: z
    .string()
    .trim()
    .optional(),
});