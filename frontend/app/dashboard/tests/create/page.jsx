"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/src/components/ui/Card";
import Input from "@/src/components/ui/Input";
import Button from "@/src/components/ui/Button";
import Spinner from "@/src/components/ui/Spinner";
import useFetch from "@/src/hooks/useFetch";
import { api } from "@/src/utils/api";

const CreateTestPage = () => {
  const router = useRouter();
  const { data: questionsData, isLoading } = useFetch("/questions?limit=100");
  const [form, setForm] = useState({
    title: "",
    description: "",
    durationMinutes: 30,
    passingScore: 10,
    maxAttempts: 1,
  });
  const [selected, setSelected] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const totalMarks = useMemo(
    () => Object.values(selected).reduce((sum, marks) => sum + marks, 0),
    [selected]
  );

  const toggleQuestion = (question) => {
    setSelected((prev) => {
      const next = { ...prev };
      if (next[question._id]) {
        delete next[question._id];
      } else {
        next[question._id] = question.marks;
      }
      return next;
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    const questions = Object.entries(selected).map(([question, marks], order) => ({
      question,
      marks,
      order,
    }));

    if (questions.length === 0) {
      setError("Select at least one question.");
      return;
    }
    if (Number(form.passingScore) > totalMarks) {
      setError(`Passing score cannot exceed the total marks (${totalMarks}).`);
      return;
    }

    setIsSubmitting(true);
    try {
      await api.post("/tests", {
        ...form,
        durationMinutes: Number(form.durationMinutes),
        passingScore: Number(form.passingScore),
        maxAttempts: Number(form.maxAttempts),
        questions,
      });
      router.push("/dashboard/tests");
    } catch (err) {
      const detail = err.errors?.map((e) => e.message).join(", ");
      setError(detail ? `${err.message}: ${detail}` : err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const questions = questionsData?.questions || [];

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-bold text-gray-900">Create test</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-6">
        <Card className="max-w-2xl">
          <div className="flex flex-col gap-4">
            <Input
              id="title"
              label="Test title"
              value={form.title}
              onChange={(e) => setForm((prev) => ({ ...prev, title: e.target.value }))}
              required
              minLength={3}
            />
            <Input
              id="description"
              label="Description"
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            />
            <div className="grid grid-cols-3 gap-4">
              <Input
                id="durationMinutes"
                label="Duration (minutes)"
                type="number"
                min="1"
                value={form.durationMinutes}
                onChange={(e) => setForm((prev) => ({ ...prev, durationMinutes: e.target.value }))}
                required
              />
              <Input
                id="passingScore"
                label="Passing score"
                type="number"
                min="0"
                value={form.passingScore}
                onChange={(e) => setForm((prev) => ({ ...prev, passingScore: e.target.value }))}
                required
              />
              <Input
                id="maxAttempts"
                label="Max attempts"
                type="number"
                min="1"
                value={form.maxAttempts}
                onChange={(e) => setForm((prev) => ({ ...prev, maxAttempts: e.target.value }))}
                required
              />
            </div>
          </div>
        </Card>

        <Card className="max-w-2xl">
          <span className="mb-3 block text-sm font-medium text-gray-700">
            Select questions ({Object.keys(selected).length} selected · {totalMarks} marks)
          </span>
          {isLoading ? (
            <Spinner />
          ) : questions.length === 0 ? (
            <p className="text-sm text-gray-500">
              No questions available. Create some questions first.
            </p>
          ) : (
            <div className="flex max-h-80 flex-col gap-2 overflow-y-auto">
              {questions.map((question) => (
                <label
                  key={question._id}
                  className="flex items-center gap-3 rounded-xl border border-gray-200 px-3 py-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={Boolean(selected[question._id])}
                    onChange={() => toggleQuestion(question)}
                  />
                  <span className="flex-1">{question.title}</span>
                  <span className="text-xs text-gray-500">{question.marks} marks</span>
                </label>
              ))}
            </div>
          )}
        </Card>

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        <Button type="submit" disabled={isSubmitting} className="w-fit">
          {isSubmitting ? "Creating..." : "Create test"}
        </Button>
      </form>
    </div>
  );
};

export default CreateTestPage;
