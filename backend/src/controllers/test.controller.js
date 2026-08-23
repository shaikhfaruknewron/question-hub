import asyncHandler from "../utils/asyncHandler.js";
import ApiError from "../utils/ApiError.js";
import ApiResponse from "../utils/ApiResponse.js";
import Test from "../models/Test.model.js";
import Question from "../models/Question.model.js";
import ClassSubjectTeacher from "../models/classSubjectTeacher.model.js";
import { Class } from "../models/Class.model.js";
import Subject from "../models/subject.model.js";
import User from "../models/User.model.js";

const assertQuestionsExist = async (questions) => {
  if (!questions) return;
  const ids = questions.map((q) => q.question);
  const found = await Question.countDocuments({ _id: { $in: ids }, isActive: true });
  if (found !== new Set(ids.map(String)).size) {
    throw new ApiError(400, "One or more selected questions do not exist");
  }
};

const assertTeacherCanManageClassSubject = async (
  user,
  classId,
  subjectId
) => {
  // Admin can manage any class + subject
  if (user.role === "admin") {
    return;
  }

  // Teacher must have an assignment for this class + subject
  const assignment = await ClassSubjectTeacher.findOne({
    class: classId,
    subject: subjectId,
    teacher: user._id,
  });

  if (!assignment) {
    throw new ApiError(
      403,
      "You are not assigned to this class and subject"
    );
  }
};




export const createTest = asyncHandler(async (req, res) => {
  const { class: classId, subject: subjectId } = req.body;

  // Make sure the class exists
  const classExists = await Class.findById(classId);

  if (!classExists) {
    throw new ApiError(404, "Class not found");
  }

  // Make sure the subject exists
  const subjectExists = await Subject.findById(subjectId);

  if (!subjectExists) {
    throw new ApiError(404, "Subject not found");
  }

  // Make sure teacher is actually assigned to this class + subject
  await assertTeacherCanManageClassSubject(
    req.user,
    classId,
    subjectId
  );

  // Make sure selected questions exist
  await assertQuestionsExist(req.body.questions);

  const test = await Test.create({
    ...req.body,
    createdBy: req.user._id,
  });

  res.status(201).json(
    new ApiResponse(201, test, "Test created")
  );
});

export const getTests = asyncHandler(async (req, res) => {
  const { visibility, page = 1, limit = 20 } = req.query;

  const filter = {};

  if (req.user.role === "student") {
    // Get the student's current class
    const student = await User.findById(req.user._id).select("class");

    if (!student) {
      throw new ApiError(404, "Student not found");
    }

    // Student must belong to a class
    if (!student.class) {
      return res.status(200).json(
        new ApiResponse(
          200,
          {
            tests: [],
            total: 0,
            page: Number(page),
            pages: 0,
          },
          "No tests available"
        )
      );
    }

    // Students can only see published tests
    filter.visibility = "published";

    // Only tests belonging to the student's class
    filter.class = student.class;

    // Normally a test is available to everyone in the class.
    // assignedTo can still be used for specifically assigned tests.
    filter.$or = [
      { assignedTo: { $size: 0 } },
      { assignedTo: req.user._id },
    ];
  } else {
    // Admin/teacher
    filter.visibility = visibility || { $ne: "archived" };

    // If a specific visibility was requested, use it
    if (visibility) {
      filter.visibility = visibility;
    }
  }

  const skip = (Number(page) - 1) * Number(limit);

  const [tests, total] = await Promise.all([
    Test.find(filter)
      .populate("createdBy", "name")
      .populate("class", "name department")
      .populate("subject", "name code")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit)),

    Test.countDocuments(filter),
  ]);

  res.status(200).json(
    new ApiResponse(
      200,
      {
        tests,
        total,
        page: Number(page),
        pages: Math.ceil(total / Number(limit)),
      },
      "Tests fetched"
    )
  );
});

export const getTestById = asyncHandler(async (req, res) => {
  const isStudent = req.user.role === "student";

  const query = Test.findById(req.params.id);

  if (!isStudent) {
    query
      .populate("questions.question")
      .populate("class", "name department")
      .populate("subject", "name code")
      .populate("createdBy", "name");
  }

  const test = await query;

  if (!test) {
    throw new ApiError(404, "Test not found");
  }

  if (isStudent) {
    // Student can only access published tests
    if (test.visibility !== "published") {
      throw new ApiError(404, "Test not found");
    }

    // Get student's class
    const student = await User.findById(req.user._id)
      .select("class");

    if (!student || !student.class) {
      throw new ApiError(404, "Test not found");
    }

    // Student must belong to the test's class
    if (test.class.toString() !== student.class.toString()) {
      throw new ApiError(404, "Test not found");
    }

    // If the test is specifically assigned to students,
    // this student must be included.
    if (
      test.assignedTo &&
      test.assignedTo.length > 0 &&
      !test.assignedTo.some(
        (studentId) =>
          studentId.toString() === req.user._id.toString()
      )
    ) {
      throw new ApiError(404, "Test not found");
    }
  }

  const payload = test.toObject();

  if (isStudent) {
    // Students should never receive question bodies
    payload.questionCount = payload.questions.length;

    delete payload.questions;
    delete payload.assignedTo;
  }

  res.status(200).json(
    new ApiResponse(
      200,
      payload,
      "Test fetched"
    )
  );
});

export const updateTest = asyncHandler(async (req, res) => {
  const test = await Test.findById(req.params.id);

  if (!test) {
    throw new ApiError(404, "Test not found");
  }

  // Use the existing class/subject if they aren't being changed
  const classId = req.body.class ?? test.class;
  const subjectId = req.body.subject ?? test.subject;

  // Check whether the logged-in user can manage this
  // class + subject combination
  await assertTeacherCanManageClassSubject(
    req.user,
    classId,
    subjectId
  );

  // Validate selected questions if questions are being updated
  if (req.body.questions) {
    await assertQuestionsExist(req.body.questions);
  }

  test.set(req.body);

  await test.save();

  res.status(200).json(
    new ApiResponse(200, test, "Test updated")
  );
});

export const publishTest = asyncHandler(async (req, res) => {
  const test = await Test.findById(req.params.id);

  if (!test) {
    throw new ApiError(404, "Test not found");
  }

  // Check whether the logged-in user can manage
  // this test's class + subject
  await assertTeacherCanManageClassSubject(
    req.user,
    test.class,
    test.subject
  );

  if (test.questions.length === 0) {
    throw new ApiError(
      400,
      "Cannot publish a test with no questions"
    );
  }

  test.visibility = "published";

  await test.save();

  res.status(200).json(
    new ApiResponse(200, test, "Test published")
  );
});

export const deleteTest = asyncHandler(async (req, res) => {
  const test = await Test.findById(req.params.id);

  if (!test) {
    throw new ApiError(404, "Test not found");
  }

  // Check whether the logged-in user can manage
  // this test's class + subject
  await assertTeacherCanManageClassSubject(
    req.user,
    test.class,
    test.subject
  );

  // Archive instead of permanently deleting
  test.visibility = "archived";

  await test.save();

  res.status(200).json(
    new ApiResponse(200, {}, "Test archived")
  );
});
