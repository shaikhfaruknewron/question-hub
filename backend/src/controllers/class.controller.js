import { Class } from "../models/Class.model.js";
import  asyncHandler  from "../utils/asyncHandler.js";
import  ApiError  from "../utils/ApiError.js";
import  ApiResponse  from "../utils/ApiResponse.js";


// Create a new class
export const createClass = asyncHandler(async (req, res) => {
  const { name, department } = req.body;

  // Check required fields
  if (!name || !department) {
    throw new ApiError(
      400,
      "Class name and department are required"
    );
  }

  // Check if class already exists
  const existingClass = await Class.findOne({ name });

  if (existingClass) {
    throw new ApiError(
      409,
      "Class already exists"
    );
  }

  // Create class
  const newClass = await Class.create({
    name,
    department,
  });

  res.status(201).json(
    new ApiResponse(
      201,
      newClass,
      "Class created successfully"
    )
  );
});


// Get all classes
export const getClasses = asyncHandler(async (req, res) => {
  const classes = await Class.find()
    .sort({ createdAt: -1 });

  res.status(200).json(
    new ApiResponse(
      200,
      classes,
      "Classes fetched successfully"
    )
  );
});


// Get a single class
export const getClassById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const classData = await Class.findById(id);

  if (!classData) {
    throw new ApiError(
      404,
      "Class not found"
    );
  }

  res.status(200).json(
    new ApiResponse(
      200,
      classData,
      "Class fetched successfully"
    )
  );
});


// Update class
export const updateClass = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { name, department } = req.body;

  const classData = await Class.findById(id);

  if (!classData) {
    throw new ApiError(
      404,
      "Class not found"
    );
  }

  // Check if another class already has this name
  if (name && name !== classData.name) {
    const existingClass = await Class.findOne({ name });

    if (existingClass) {
      throw new ApiError(
        409,
        "Class with this name already exists"
      );
    }
  }

  if (name) {
    classData.name = name;
  }

  if (department) {
    classData.department = department;
  }

  await classData.save();

  res.status(200).json(
    new ApiResponse(
      200,
      classData,
      "Class updated successfully"
    )
  );
});


// Deactivate class
export const deactivateClass = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const classData = await Class.findById(id);

  if (!classData) {
    throw new ApiError(
      404,
      "Class not found"
    );
  }

  if (!classData.isActive) {
    throw new ApiError(
      400,
      "Class is already deactivated"
    );
  }

  classData.isActive = false;

  await classData.save();

  res.status(200).json(
    new ApiResponse(
      200,
      {},
      "Class deactivated successfully"
    )
  );
});