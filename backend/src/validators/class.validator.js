import { z } from "zod";

export const createClassSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Class name is required"),

  department: z
    .string()
    .trim()
    .min(1, "Department is required"),
});

export const updateClassSchema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "Class name cannot be empty")
    .optional(),

  department: z
    .string()
    .trim()
    .min(1, "Department cannot be empty")
    .optional(),
});