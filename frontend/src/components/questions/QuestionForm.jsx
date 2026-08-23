"use client";

import { useState , useEffect } from "react";
import { Plus, Trash2 } from "lucide-react";
import Input from "@/src/components/ui/Input";
import Select from "@/src/components/ui/Select";
import Button from "@/src/components/ui/Button";
import { QUESTION_TYPES, DIFFICULTY_LEVELS } from "@/src/utils/constants";
import { getSubjects } from "@/src/utils/api";

const emptyOption = () => ({ text: "", isCorrect: false });

const CHOICE_TYPES = ["single-choice", "multiple-choice", "true-false"];

const QuestionForm = ({ initialValues, categories, onSubmit, isSubmitting = false, error = "", }) => {
  const [form, setForm] = useState({
    title: initialValues?.title || "",
    type: initialValues?.type || "single-choice",
    category: initialValues?.category?._id || initialValues?.category || "",
    subject:initialValues?.subject?._id ||initialValues?.subject || "",
    difficulty: initialValues?.difficulty || "medium",
    marks: initialValues?.marks ?? 1,
    negativeMarks: initialValues?.negativeMarks ?? 0,
    options: initialValues?.options?.length
      ? initialValues.options.map((o) => ({ text: o.text, isCorrect: Boolean(o.isCorrect) }))
      : [emptyOption(), emptyOption()],
    explanation: initialValues?.explanation || "",
  });
  const [validationError, setValidationError] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(true); 

  useEffect(() => {
  const loadSubjects = async () => {
    try {
      setIsLoadingSubjects(true);

      const data = await getSubjects();

      setSubjects(data?.subjects || data || []);
    } catch (err) {
      setValidationError(
        err.message || "Failed to load subjects."
      );
    } finally {
      setIsLoadingSubjects(false);
    }
  };

  loadSubjects();
}, []);

  const updateField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const updateOption = (index, field, value) => {
    setForm((prev) => {
      const options = [...prev.options];
      // Single-choice and true/false allow exactly one correct answer.
      if (field === "isCorrect" && value && prev.type !== "multiple-choice") {
        return {
          ...prev,
          options: options.map((opt, i) => ({ ...opt, isCorrect: i === index })),
        };
      }
      options[index] = { ...options[index], [field]: value };
      return { ...prev, options };
    });
  };

  const addOption = () =>
    setForm((prev) => ({ ...prev, options: [...prev.options, emptyOption()] }));

  const removeOption = (index) =>
    setForm((prev) => ({ ...prev, options: prev.options.filter((_, i) => i !== index) }));

  const showOptions = CHOICE_TYPES.includes(form.type);

  const handleSubmit = (event) => {
    event.preventDefault();
    setValidationError("");

    if (!form.category) {
      setValidationError("Pick a category first — create one if the list is empty.");
      return;
    }
    if (!form.subject) {
    setValidationError("Select a subject first.");
    return;
    }

    const payload = {
      title: form.title,
      type: form.type,
      category: form.category,
      subject: form.subject,
      difficulty: form.difficulty,
      marks: Number(form.marks),
      negativeMarks: Number(form.negativeMarks),
      explanation: form.explanation,
    };

    if (showOptions) {
      const options = form.options.filter((opt) => opt.text.trim());
      if (options.length < 2) {
        setValidationError("Add at least two options.");
        return;
      }
      if (!options.some((opt) => opt.isCorrect)) {
        setValidationError("Mark at least one option as correct.");
        return;
      }
      payload.options = options;
    } else {
      payload.options = [];
    }

    onSubmit(payload);
  };

  const message = validationError || error;

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Input
        id="title"
        label="Question title"
        value={form.title}
        onChange={(e) => updateField("title", e.target.value)}
        required
      />

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
  <Select
    id="type"
    label="Question type"
    value={form.type}
    onChange={(e) =>
      updateField("type", e.target.value)
    }
    options={QUESTION_TYPES}
  />

  <Select
    id="category"
    label="Category"
    value={form.category}
    onChange={(e) =>
      updateField("category", e.target.value)
    }
    placeholder={
      categories.length
        ? "Select a category"
        : "No categories yet"
    }
    options={categories.map((c) => ({
      value: c._id,
      label: c.name,
    }))}
    required
  />

  <Select
    id="subject"
    label="Subject"
    value={form.subject}
    onChange={(e) =>
      updateField("subject", e.target.value)
    }
    placeholder={
      isLoadingSubjects
        ? "Loading subjects..."
        : subjects.length
          ? "Select a subject"
          : "No subjects yet"
    }
    options={subjects.map((subject) => ({
      value: subject._id,
      label: `${subject.name} (${subject.code})`,
    }))}
    required
  />
</div>

      <div className="grid grid-cols-3 gap-4">
        <Select
          id="difficulty"
          label="Difficulty"
          value={form.difficulty}
          onChange={(e) => updateField("difficulty", e.target.value)}
          options={DIFFICULTY_LEVELS.map((d) => ({ value: d, label: d }))}
        />
        <Input
          id="marks"
          label="Marks"
          type="number"
          min="1"
          value={form.marks}
          onChange={(e) => updateField("marks", e.target.value)}
        />
        <Input
          id="negativeMarks"
          label="Negative marks"
          type="number"
          min="0"
          value={form.negativeMarks}
          onChange={(e) => updateField("negativeMarks", e.target.value)}
        />
      </div>

      {showOptions && (
        <div className="flex flex-col gap-3">
          <span className="text-sm font-medium text-gray-700">
            Options{" "}
            <span className="font-normal text-gray-500">
              (tick the correct {form.type === "multiple-choice" ? "answers" : "answer"})
            </span>
          </span>
          {form.options.map((option, index) => (
            <div key={`option-${index}`} className="flex items-center gap-3">
              <input
                type={form.type === "multiple-choice" ? "checkbox" : "radio"}
                name="correct-option"
                aria-label={`Mark option ${index + 1} as correct`}
                checked={option.isCorrect}
                onChange={(e) => updateOption(index, "isCorrect", e.target.checked)}
              />
              <input
                aria-label={`Option ${index + 1} text`}
                value={option.text}
                onChange={(e) => updateOption(index, "text", e.target.value)}
                className="flex-1 rounded-xl border border-gray-300 px-3 py-2 text-sm"
              />
              <button
                type="button"
                onClick={() => removeOption(index)}
                aria-label={`Remove option ${index + 1}`}
                disabled={form.options.length <= 2}
                className="text-gray-400 hover:text-red-600 disabled:opacity-40"
              >
                <Trash2 size={16} />
              </button>
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addOption} className="w-fit">
            <Plus size={16} />
            Add option
          </Button>
        </div>
      )}

      <Input
        id="explanation"
        label="Explanation (optional)"
        value={form.explanation}
        onChange={(e) => updateField("explanation", e.target.value)}
      />

      {message && (
        <p role="alert" className="text-sm text-red-600">
          {message}
        </p>
      )}

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Save question"}
      </Button>
    </form>
  );
};

export default QuestionForm;
