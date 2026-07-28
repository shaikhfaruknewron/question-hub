import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import Category from "../models/Category.model.js";

const toSlug = (name) => name.toLowerCase().trim().replace(/\s+/g, "-");

export const createCategory = asyncHandler(async (req, res) => {
  const { name, description, parent } = req.body;

  const slug = toSlug(name);
  const existing = await Category.findOne({ slug });
  if (existing) {
    throw new ApiError(409, "A category with this name already exists");
  }

  const category = await Category.create({
    name,
    slug,
    description,
    parent: parent || null,
    createdBy: req.user._id,
  });

  res.status(201).json(new ApiResponse(201, category, "Category created"));
});

export const getCategories = asyncHandler(async (req, res) => {
  const categories = await Category.find().populate("parent", "name").sort({ name: 1 });
  res.status(200).json(new ApiResponse(200, categories, "Categories fetched"));
});

export const updateCategory = asyncHandler(async (req, res) => {
  const category = await Category.findById(req.params.id);
  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  if (req.body.name) {
    category.name = req.body.name;
    category.slug = toSlug(req.body.name);
  }
  if (req.body.description !== undefined) category.description = req.body.description;
  if (req.body.parent !== undefined) category.parent = req.body.parent;

  await category.save();

  res.status(200).json(new ApiResponse(200, category, "Category updated"));
});

export const deleteCategory = asyncHandler(async (req, res) => {
  const category = await Category.findByIdAndDelete(req.params.id);
  if (!category) {
    throw new ApiError(404, "Category not found");
  }

  res.status(200).json(new ApiResponse(200, {}, "Category deleted"));
});
