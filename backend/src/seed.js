/**
 * Populates the database with a demo admin/teacher/student, categories, questions
 * and one published test so the app is usable immediately.
 *
 *   npm run seed
 */
import { connectDB, disconnectDB } from "./config/db.js";
import User from "./models/User.model.js";
import Category from "./models/Category.model.js";
import Question from "./models/Question.model.js";
import Test from "./models/Test.model.js";

const DEMO_PASSWORD = "Password123";

const USERS = [
  { name: "Ada Admin", email: "admin@questionhub.dev", role: "admin", isEmailVerified: true },
  { name: "Tina Teacher", email: "teacher@questionhub.dev", role: "teacher", isEmailVerified: true },
  { name: "Sam Student", email: "student@questionhub.dev", role: "student", isEmailVerified: false },
];

const upsertUser = async ({ name, email, role }) => {
  const existing = await User.findOne({ email });
  if (existing) return existing;
  // Created via `create` so the pre-save hook hashes the password.
  return User.create({ name, email, role, password: DEMO_PASSWORD });
};

const upsertCategory = async (name, description, createdBy) => {
  const slug = name.toLowerCase().trim().replace(/\s+/g, "-");
  const existing = await Category.findOne({ slug });
  if (existing) return existing;
  return Category.create({ name, slug, description, createdBy });
};

const seed = async () => {
  await connectDB();

  const [admin, teacher, student] = await Promise.all(USERS.map(upsertUser));

  const javascript = await upsertCategory("JavaScript",
     "Core language questions", 
     teacher._id);

  const databases = await upsertCategory("Databases",
     "Data modelling and query questions",
      teacher._id);

  const questionSeeds = [
    {
      title: "Which keyword declares a block-scoped variable that cannot be reassigned?",
      type: "single-choice",
      category: javascript._id,
      difficulty: "easy",
      marks: 2,
      negativeMarks: 0,
      tags: ["variables", "es6"],
      options: [
        { text: "var", isCorrect: false },
        { text: "let", isCorrect: false },
        { text: "const", isCorrect: true },
        { text: "static", isCorrect: false },
      ],
      explanation: "`const` is block scoped and its binding cannot be reassigned.",
    },
    {
      title: "Select every value that is falsy in JavaScript.",
      type: "multiple-choice",
      category: javascript._id,
      difficulty: "medium",
      marks: 3,
      negativeMarks: 1,
      tags: ["types"],
      options: [
        { text: "0", isCorrect: true },
        { text: '""', isCorrect: true },
        { text: "[]", isCorrect: false },
        { text: "NaN", isCorrect: true },
      ],
      explanation: "An empty array is an object, and objects are always truthy.",
    },
    {
      title: "A MongoDB collection enforces a fixed schema by default.",
      type: "true-false",
      category: databases._id,
      difficulty: "easy",
      marks: 1,
      options: [
        { text: "True", isCorrect: false },
        { text: "False", isCorrect: true },
      ],
      explanation: "MongoDB is schema-flexible; validation rules are opt-in.",
    },
    {
      title: "Explain the difference between an index scan and a collection scan.",
      type: "descriptive",
      category: databases._id,
      difficulty: "hard",
      marks: 4,
      explanation: "Graded manually by a teacher.",
    },
  ];

  const questions = [];
  for (const seedQuestion of questionSeeds) {
    const existing = await Question.findOne({ title: seedQuestion.title });
    questions.push(existing || (await Question.create({ ...seedQuestion, createdBy: teacher._id })));
  }

  const testTitle = "JavaScript & Databases Basics";
  let test = await Test.findOne({ title: testTitle });

  if (!test) {
    test = new Test({
      title: testTitle,
      description: "A short mixed quiz covering language basics and database concepts.",
      questions: questions.map((q, order) => ({ question: q._id, marks: q.marks, order })),
      durationMinutes: 20,
      passingScore: 5,
      maxAttempts: 3,
      visibility: "published",
      createdBy: teacher._id,
      assignedTo: [],
    });
    await test.save();
  }

  console.log("\nSeed complete.\n");
  console.table(USERS.map((u) => ({ ...u, password: DEMO_PASSWORD })));
  console.log(`Categories: ${javascript.name}, ${databases.name}`);
  console.log(`Questions: ${questions.length}`);
  console.log(`Test: "${test.title}" (${test.totalMarks} marks, ${test.visibility})`);
  console.log(`Admin id: ${admin._id}, student id: ${student._id}\n`);

  await disconnectDB();
};

seed().catch(async (error) => {
  console.error("[seed] Failed:", error);
  await disconnectDB().catch(() => {});
  process.exit(1);
});
