import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";

import User from "../models/user.model.js";
import {Class} from "../models/Class.model.js";


// Assign student to a class
export const assignStudentToClass = asyncHandler(
  async (req, res) => {
    const { studentId, classId } = req.body;

    // 1. Check student exists
    const student = await User.findById(studentId);

    if (!student) {
      throw new ApiError(
        404,
        "Student not found"
      );
    }

    // 2. Make sure selected user is actually a student
    if (student.role !== "student") {
      throw new ApiError(
        400,
        "Selected user is not a student"
      );
    }

    // 3. Check class exists
    const classExists = await Class.findById(classId);

    if (!classExists) {
      throw new ApiError(
        404,
        "Class not found"
      );
    }

    // 4. Check if student already belongs to a class
    if (student.class) {
      throw new ApiError(
        409,
        "Student is already assigned to a class"
      );
    }

    // 5. Assign class
    student.class = classId;

    await student.save();

    // 6. Return updated student
    const updatedStudent = await User.findById(
      studentId
    ).populate(
      "class",
      "name description isActive"
    );

    res.status(200).json(
      new ApiResponse(
        200,
        updatedStudent,
        "Student assigned to class successfully"
      )
    );
  }
);

// Get all students assigned to a class
export const getStudentsByClass = asyncHandler(
  async (req, res) => {
    const { classId } = req.params;

    // 1. Check class exists
    const classExists = await Class.findById(classId);

    if (!classExists) {
      throw new ApiError(
        404,
        "Class not found"
      );
    }

    // 2. Find all students belonging to this class
    const students = await User.find({
      role: "student",
      class: classId,
      isActive: true,
    })
      .select(
        "name email avatar isEmailVerified createdAt"
      )
      .sort({ name: 1 });

    res.status(200).json(
      new ApiResponse(
        200,
        students,
        "Students fetched successfully"
      )
    );
  }
);

// Change student's class
export const updateStudentClass = asyncHandler(
  async (req, res) => {
    const { studentId } = req.params;
    const { classId } = req.body;

    // 1. Check student exists
    const student = await User.findById(studentId);

    if (!student) {
      throw new ApiError(
        404,
        "Student not found"
      );
    }

    // 2. Make sure the user is a student
    if (student.role !== "student") {
      throw new ApiError(
        400,
        "Selected user is not a student"
      );
    }

    // 3. Check new class exists
    const classExists = await Class.findById(classId);

    if (!classExists) {
      throw new ApiError(
        404,
        "Class not found"
      );
    }

    // 4. Check if student is already in this class
    if (
      student.class &&
      student.class.toString() === classId
    ) {
      throw new ApiError(
        400,
        "Student is already assigned to this class"
      );
    }

    // 5. Update class
    student.class = classId;

    await student.save();

    // 6. Return updated student with class details
    const updatedStudent = await User.findById(
      studentId
    ).populate(
      "class",
      "name description isActive"
    );

    res.status(200).json(
      new ApiResponse(
        200,
        updatedStudent,
        "Student class updated successfully"
      )
    );
  }
);

// Remove student from class
export const removeStudentFromClass = asyncHandler(
  async (req, res) => {
    const { studentId } = req.params;

    // 1. Check student exists
    const student = await User.findById(studentId);

    if (!student) {
      throw new ApiError(
        404,
        "Student not found"
      );
    }

    // 2. Make sure the user is a student
    if (student.role !== "student") {
      throw new ApiError(
        400,
        "Selected user is not a student"
      );
    }

    // 3. Check if student actually has a class
    if (!student.class) {
      throw new ApiError(
        400,
        "Student is not assigned to any class"
      );
    }

    // 4. Remove class assignment
    student.class = null;

    await student.save();

    // 5. Return updated student
    res.status(200).json(
      new ApiResponse(
        200,
        student,
        "Student removed from class successfully"
      )
    );
  }
);