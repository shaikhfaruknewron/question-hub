import { connectDB, disconnectDB } from "../config/db.js";
import User from "../models/User.model.js";
import Category from "../models/Category.model.js";
import Question from "../models/Question.model.js";
import { CONCEPT_BANKS } from "./data/index.js";
import { buildQuestionsForBank, QUESTIONS_PER_CONCEPT } from "./lib/questionFactory.js";

const AUTHOR = {
  name: "Tina Teacher",
  email: "teacher@questionhub.dev",
  role: "teacher",
  password: "Password123",
};

const INSERT_BATCH_SIZE = 200;
const LOOKUP_BATCH_SIZE = 500;

const chunk = (items, size) => {
  const batches = [];
  for (let index = 0; index < items.length; index += size) {
    batches.push(items.slice(index, index + size));
  }
  return batches;
};

const toSlug = (name) => name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const resolveAuthor = async () => {
  const existing = await User.findOne({ email: AUTHOR.email });
  if (existing) return existing;
  return User.create(AUTHOR);
};

const resolveCategory = async (bank, createdBy) => {
  const slug = toSlug(bank.name);
  const existing = await Category.findOne({ slug });
  if (existing) return existing;
  return Category.create({ name: bank.name, slug, description: bank.description, createdBy });
};

const findExistingTitles = async (titles) => {
  const found = new Set();
  for (const batch of chunk(titles, LOOKUP_BATCH_SIZE)) {
    const rows = await Question.find({ title: { $in: batch } }).select("title").lean();
    rows.forEach((row) => found.add(row.title));
  }
  return found;
};

const insertQuestions = async (questions) => {
  let inserted = 0;
  for (const batch of chunk(questions, INSERT_BATCH_SIZE)) {
    const rows = await Question.insertMany(batch, { ordered: false });
    inserted += rows.length;
    console.log(`[seed:questions] inserted ${inserted}/${questions.length}`);
  }
  return inserted;
};

const seedQuestions = async () => {
  await connectDB();

  const author = await resolveAuthor();

  const banks = [];
  for (const bank of CONCEPT_BANKS) {
    const category = await resolveCategory(bank, author._id);
    banks.push({ ...bank, categoryId: category._id, createdBy: author._id });
  }

  const built = banks.flatMap((bank) =>
    buildQuestionsForBank(bank).map((question) => ({ ...question, bankName: bank.name }))
  );

  const duplicateTitles = built
    .map((question) => question.title)
    .filter((title, index, titles) => titles.indexOf(title) !== index);

  if (duplicateTitles.length > 0) {
    throw new Error(`Generated duplicate titles: ${[...new Set(duplicateTitles)].join(" | ")}`);
  }

  const existingTitles = await findExistingTitles(built.map((question) => question.title));
  const pending = built.filter((question) => !existingTitles.has(question.title));

  const summary = banks.map((bank) => ({
    category: bank.name,
    concepts: bank.concepts.length,
    generated: bank.concepts.length * QUESTIONS_PER_CONCEPT,
    inserted: pending.filter((question) => question.bankName === bank.name).length,
  }));

  const payload = pending.map(({ bankName, ...question }) => question);
  const inserted = payload.length > 0 ? await insertQuestions(payload) : 0;

  const byType = payload.reduce((counts, question) => {
    counts[question.type] = (counts[question.type] || 0) + 1;
    return counts;
  }, {});

  console.log("\nQuestion seed complete.\n");
  console.table(summary);
  console.table(byType);
  console.log(`Generated: ${built.length}`);
  console.log(`Already present: ${built.length - pending.length}`);
  console.log(`Inserted: ${inserted}`);
  console.log(`Author: ${author.email}\n`);

  await disconnectDB();
};

seedQuestions().catch(async (error) => {
  console.error("[seed:questions] Failed:", error);
  await disconnectDB().catch(() => {});
  process.exit(1);
});
