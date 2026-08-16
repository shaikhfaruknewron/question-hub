import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

import {Class} from "../models/Class.model.js";
import Subject from "../models/subject.model.js";
import User from "../models/User.model.js";
import ClassSubject from "../models/classSubject.model.js";
import ClassSubjectTeacher from "../models/classSubjectTeacher.model.js";


// Assign teacher to a class + subject
export const assignTeacherToClassSubject = asyncHandler(
  async (req, res) => {
    const { classId, subjectId, teacherId } = req.body;

    // 1. Check class exists
    const classExists = await Class.findById(classId);

    if (!classExists) {
      throw new ApiError(404, "Class not found");
    }

    // 2. Check subject exists
    const subjectExists = await Subject.findById(subjectId);

    if (!subjectExists) {
      throw new ApiError(404, "Subject not found");
    }

    // 3. Check teacher exists
    const teacherExists = await User.findById(teacherId);

    if (!teacherExists) {
      throw new ApiError(404, "Teacher not found");
    }

    // 4. Make sure the user is actually a teacher
    if (teacherExists.role !== "teacher") {
      throw new ApiError(
        400,
        "Selected user is not a teacher"
      );
    }

    // 5. Check whether subject is assigned to this class
    const classSubjectExists =
      await ClassSubject.findOne({
        class: classId,
        subject: subjectId,
      });

    if (!classSubjectExists) {
      throw new ApiError(
        400,
        "This subject is not assigned to this class"
      );
    }

    // 6. Check if teacher is already assigned
    const existingAssignment =
      await ClassSubjectTeacher.findOne({
        class: classId,
        subject: subjectId,
      });

    if (existingAssignment) {
      throw new ApiError(
        409,
        "A teacher is already assigned to this class and subject"
      );
    }

    // 7. Create assignment
    const assignment =
      await ClassSubjectTeacher.create({
        class: classId,
        subject: subjectId,
        teacher: teacherId,
      });

    res.status(201).json(
      new ApiResponse(
        201,
        assignment,
        "Teacher assigned successfully"
      )
    );
  }
);

// Get teacher assignments for a class
export const getClassSubjectTeachers = asyncHandler(
  async (req, res) => {
    const { classId } = req.params;

    // Check class exists
    const classExists = await Class.findById(classId);

    if (!classExists) {
      throw new ApiError(
        404,
        "Class not found"
      );
    }

    // Get all teacher assignments for this class
    const assignments =
      await ClassSubjectTeacher.find({
        class: classId,
      })
        .populate(
          "subject",
          "name code description"
        )
        .populate(
          "teacher",
          "name email role avatar"
        )
        .sort({ createdAt: -1 });

    res.status(200).json(
      new ApiResponse(
        200,
        assignments,
        "Teacher assignments fetched successfully"
      )
    );
  }
);

// Change teacher assigned to a class + subject
export const updateClassSubjectTeacher = asyncHandler(
  async (req, res) => {
    const { id } = req.params;
    const { teacherId } = req.body;

    // 1. Check assignment exists
    const assignment =
      await ClassSubjectTeacher.findById(id);

    if (!assignment) {
      throw new ApiError(
        404,
        "Teacher assignment not found"
      );
    }

    // 2. Check teacher exists
    const teacherExists =
      await User.findById(teacherId);

    if (!teacherExists) {
      throw new ApiError(
        404,
        "Teacher not found"
      );
    }

    // 3. Make sure selected user is a teacher
    if (teacherExists.role !== "teacher") {
      throw new ApiError(
        400,
        "Selected user is not a teacher"
      );
    }

    // 4. Update teacher
    assignment.teacher = teacherId;

    await assignment.save();

    // 5. Populate data for frontend
    await assignment.populate(
      "subject",
      "name code description"
    );

    await assignment.populate(
      "teacher",
      "name email role avatar"
    );

    res.status(200).json(
      new ApiResponse(
        200,
        assignment,
        "Teacher updated successfully"
      )
    );
  }
);

// Remove teacher assignment
export const removeClassSubjectTeacher = asyncHandler(
  async (req, res) => {
    const { id } = req.params;

    const assignment =
      await ClassSubjectTeacher.findById(id);

    if (!assignment) {
      throw new ApiError(
        404,
        "Teacher assignment not found"
      );
    }

    await ClassSubjectTeacher.findByIdAndDelete(id);

    res.status(200).json(
      new ApiResponse(
        200,
        null,
        "Teacher removed successfully"
      )
    );
  }
);