import { Router } from "express";
import {
  createCategory,
  getCategories,
  updateCategory,
  deleteCategory,
} from "../controllers/category.controller.js";
import { verifyJWT, authorizeRoles } from "../middlewares/auth.middleware.js";
import validate from "../middlewares/validate.middleware.js";
import { categorySchema, updateCategorySchema } from "../validators/category.validator.js";

const router = Router();

router.use(verifyJWT);

router.get("/", getCategories);
router.post("/", authorizeRoles("admin", "teacher"), validate(categorySchema), createCategory);
router.patch("/:id", authorizeRoles("admin", "teacher"), validate(updateCategorySchema), updateCategory);
router.delete("/:id", authorizeRoles("admin"), deleteCategory);

export default router;
