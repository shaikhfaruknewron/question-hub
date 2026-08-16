import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import Subject from "../models/subject.model.js";


// Create Subject
export const createSubject = asyncHandler(async (req, res) => {
  const { name, code, description } = req.body;

  const existingSubject = await Subject.findOne({
    code: code.toUpperCase(),
  });

  if (existingSubject) {
    throw new ApiError(
      409,
      "A subject with this code already exists"
    );
  }

  const subject = await Subject.create({
    name,
    code: code.toUpperCase(),
    description,
  });

  res.status(201).json(
    new ApiResponse(
      201,
      subject,
      "Subject created successfully"
    )
  );
});


// Get All Subjects
export const getSubjects = asyncHandler(async (req, res) => {
  const subjects = await Subject.find()
    .sort({ createdAt: -1 });

  res.status(200).json(
    new ApiResponse(
      200,
      subjects,
      "Subjects fetched successfully"
    )
  );
});


// Get Subject By ID
export const getSubjectById = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const subject = await Subject.findById(id);

  if (!subject) {
    throw new ApiError(
      404,
      "Subject not found"
    );
  }

  res.status(200).json(
    new ApiResponse(
      200,
      subject,
      "Subject fetched successfully"
    )
  );
});


// Update Subject
export const updateSubject = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const { name, code, description } = req.body;

  const subject = await Subject.findById(id);

  if (!subject) {
    throw new ApiError(
      404,
      "Subject not found"
    );
  }

  if (code) {
    const existingSubject = await Subject.findOne({
      code: code.toUpperCase(),
      _id: { $ne: id },
    });

    if (existingSubject) {
      throw new ApiError(
        409,
        "A subject with this code already exists"
      );
    }

    subject.code = code.toUpperCase();
  }

  if (name !== undefined) {
    subject.name = name;
  }

  if (description !== undefined) {
    subject.description = description;
  }

  await subject.save();

  res.status(200).json(
    new ApiResponse(
      200,
      subject,
      "Subject updated successfully"
    )
  );
});


// Deactivate Subject
export const deactivateSubject = asyncHandler(async (req, res) => {
  const { id } = req.params;

  const subject = await Subject.findById(id);

  if (!subject) {
    throw new ApiError(
      404,
      "Subject not found"
    );
  }

  if (!subject.isActive) {
    throw new ApiError(
      400,
      "Subject is already inactive"
    );
  }

  subject.isActive = false;

  await subject.save();

  res.status(200).json(
    new ApiResponse(
      200,
      subject,
      "Subject deactivated successfully"
    )
  );
});