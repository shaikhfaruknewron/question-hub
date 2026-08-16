import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

import {Class} from "../models/Class.model.js";
import Subject from "../models/subject.model.js";
import ClassSubject from "../models/classSubject.model.js";

export const assignSubjectToClass = asyncHandler(
  async (req, res) => {
    const { classId, subjectId } = req.body;

    // Check class exists
    const classExists = await Class.findById(classId);

    if (!classExists) {
      throw new ApiError(
        404,
        "Class not found"
      );
    }

    // Check subject exists
    const subjectExists = await Subject.findById(
      subjectId
    );

    if (!subjectExists) {
      throw new ApiError(
        404,
        "Subject not found"
      );
    }

    // Don't allow inactive subjects
    if (!subjectExists.isActive) {
      throw new ApiError(
        400,
        "Cannot assign an inactive subject"
      );
    }

    // Check if already assigned
    const existingMapping =
      await ClassSubject.findOne({
        class: classId,
        subject: subjectId,
      });

    if (existingMapping) {
      throw new ApiError(
        409,
        "Subject is already assigned to this class"
      );
    }

    // Create mapping
    const classSubject =
      await ClassSubject.create({
        class: classId,
        subject: subjectId,
      });

    res.status(201).json(
      new ApiResponse(
        201,
        classSubject,
        "Subject assigned to class successfully"
      )
    );
  }
);

export const getClassSubjects = asyncHandler(
  async (req, res) => {
    const { classId } = req.params;

    const classExists = await Class.findById(
      classId
    );

    if (!classExists) {
      throw new ApiError(
        404,
        "Class not found"
      );
    }

    const classSubjects =
      await ClassSubject.find({
        class: classId,
      })
        .populate(
          "subject",
          "name code description isActive"
        )
        .sort({ createdAt: -1 });

    res.status(200).json(
      new ApiResponse(
        200,
        classSubjects,
        "Class subjects fetched successfully"
      )
    );
  }
);

export const removeSubjectFromClass = asyncHandler(
  async (req, res) => {
    const { classId, subjectId } = req.params;

    const mapping =
      await ClassSubject.findOne({
        class: classId,
        subject: subjectId,
      });

    if (!mapping) {
      throw new ApiError(
        404,
        "Subject is not assigned to this class"
      );
    }

    await ClassSubject.findByIdAndDelete(
      mapping._id
    );

    res.status(200).json(
      new ApiResponse(
        200,
        null,
        "Subject removed from class successfully"
      )
    );
  }
);

