"use client";

import { useState } from "react";
import PropTypes from "prop-types";
import { Plus, Trash2 } from "lucide-react";
import Input from "@/src/components/ui/Input";
import Select from "@/src/components/ui/Select";
import Button from "@/src/components/ui/Button";
import { QUESTION_TYPES, DIFFICULTY_LEVELS } from "@/src/utils/constants";

const emptyOption = () => ({ text: "", isCorrect: false });

const QuestionForm = ({ initialValues, categories, onSubmit, isSubmitting }) => {
  const [form, setForm] = useState({
    title: initialValues?.title || "",
    type: initialValues?.type || "single-choice",
    category: initialValues?.category?._id || initialValues?.category || "",
    difficulty: initialValues?.difficulty || "medium",
    marks: initialValues?.marks || 1,
    negativeMarks: initialValues?.negativeMarks || 0,
    options: initialValues?.options?.length ? initialValues.options : [emptyOption(), emptyOption()],
    explanation: initialValues?.explanation || "",
  });

  const updateField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const updateOption = (index, field, value) => {
    setForm((prev) => {
      const options = [...prev.options];
      options[index] = { ...options[index], [field]: value };
      return { ...prev, options };
    });
  };

  const addOption = () => setForm((prev) => ({ ...prev, options: [...prev.options, emptyOption()] }));

  const removeOption = (index) =>
    setForm((prev) => ({ ...prev, options: prev.options.filter((_, i) => i !== index) }));

  const handleSubmit = (event) => {
    event.preventDefault();
    onSubmit({ ...form, marks: Number(form.marks), negativeMarks: Number(form.negativeMarks) });
  };

  const showOptions = form.type === "single-choice" || form.type === "multiple-choice" || form.type === "true-false";

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      <Input
        id="title"
        label="Question title"
        value={form.title}
        onChange={(e) => updateField("title", e.target.value)}
        required
      />

      <div className="grid grid-cols-2 gap-4">
        <Select
          id="type"
          label="Question type"
          value={form.type}
          onChange={(e) => updateField("type", e.target.value)}
          options={QUESTION_TYPES}
        />
        <Select
          id="category"
          label="Category"
          value={form.category}
          onChange={(e) => updateField("category", e.target.value)}
          options={categories.map((c) => ({ value: c._id, label: c.name }))}
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
          <span className="text-sm font-medium text-gray-700">Options</span>
          {form.options.map((option, index) => (
            <div key={`option-${index}`} className="flex items-center gap-3">
              <input
                type="checkbox"
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
                className="text-gray-400 hover:text-red-600"
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

      <Button type="submit" disabled={isSubmitting}>
        {isSubmitting ? "Saving..." : "Save question"}
      </Button>
    </form>
  );
};

QuestionForm.propTypes = {
  initialValues: PropTypes.object,
  categories: PropTypes.arrayOf(PropTypes.object).isRequired,
  onSubmit: PropTypes.func.isRequired,
  isSubmitting: PropTypes.bool,
};

QuestionForm.defaultProps = {
  initialValues: null,
  isSubmitting: false,
};

export default QuestionForm;
