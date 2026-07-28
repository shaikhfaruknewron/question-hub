import { z } from "zod";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Must be a valid id");

export const categorySchema = z.object({
  name: z.string().min(2),
  description: z.string().optional(),
  parent: objectId.nullable().optional(),
});

export const updateCategorySchema = categorySchema.partial();
