import { connectDB, disconnectDB } from "../config/db.js";
import Category from "../models/Category.model.js";
import Question from "../models/Question.model.js";
import { CONCEPT_BANKS } from "./data/index.js";

const toSlug = (name) => name.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const backfillTopics = async () => {
  await connectDB();

  const rows = [];

  for (const bank of CONCEPT_BANKS) {
    const category = await Category.findOne({ slug: toSlug(bank.name) });

    if (!category) {
      rows.push({ category: bank.name, topic: bank.topic, matched: 0, updated: 0, note: "category missing" });
      continue;
    }

    const matched = await Question.countDocuments({ category: category._id });
    const result = await Question.updateMany(
      { category: category._id, topic: { $ne: bank.topic } },
      { $set: { topic: bank.topic } }
    );

    rows.push({
      category: bank.name,
      topic: bank.topic,
      matched,
      updated: result.modifiedCount,
      note: "",
    });
  }

  const remaining = await Question.find({
    $or: [{ topic: { $exists: false } }, { topic: null }, { topic: "" }],
  })
    .populate("category", "name")
    .select("title category")
    .lean();

  console.log("\nTopic backfill complete.\n");
  console.table(rows);
  console.log(`Total questions: ${await Question.countDocuments({})}`);
  console.log(`Still without a topic: ${remaining.length}`);

  if (remaining.length > 0) {
    console.log("\nThese need a topic set manually:");
    console.table(
      remaining.map((question) => ({
        title: question.title.slice(0, 70),
        category: question.category?.name || "(none)",
      }))
    );
  }

  console.log("");
  await disconnectDB();
};

backfillTopics().catch(async (error) => {
  console.error("[backfill:topics] Failed:", error);
  await disconnectDB().catch(() => {});
  process.exit(1);
});
