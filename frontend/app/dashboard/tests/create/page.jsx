"use client";

import { useState } from "react";
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
  const [form, setForm] = useState({ title: "", description: "", durationMinutes: 30, passingScore: 10 });
  const [selected, setSelected] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

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
    setIsSubmitting(true);
    try {
      const payload = {
        ...form,
        durationMinutes: Number(form.durationMinutes),
        passingScore: Number(form.passingScore),
        questions: Object.entries(selected).map(([question, marks], order) => ({
          question,
          marks,
          order,
        })),
      };
      await api.post("/tests", payload);
      router.push("/dashboard/tests");
    } finally {
      setIsSubmitting(false);
    }
  };

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
            />
            <Input
              id="description"
              label="Description"
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            />
            <div className="grid grid-cols-2 gap-4">
              <Input
                id="durationMinutes"
                label="Duration (minutes)"
                type="number"
                value={form.durationMinutes}
                onChange={(e) => setForm((prev) => ({ ...prev, durationMinutes: e.target.value }))}
              />
              <Input
                id="passingScore"
                label="Passing score"
                type="number"
                value={form.passingScore}
                onChange={(e) => setForm((prev) => ({ ...prev, passingScore: e.target.value }))}
              />
            </div>
          </div>
        </Card>

        <Card className="max-w-2xl">
          <span className="mb-3 block text-sm font-medium text-gray-700">
            Select questions ({Object.keys(selected).length} selected)
          </span>
          {isLoading ? (
            <Spinner />
          ) : (
            <div className="flex max-h-80 flex-col gap-2 overflow-y-auto">
              {questionsData?.questions?.map((question) => (
                <label
                  key={question._id}
                  className="flex items-center gap-3 rounded-xl border border-gray-200 px-3 py-2 text-sm"
                >
                  <input
                    type="checkbox"
                    checked={Boolean(selected[question._id])}
                    onChange={() => toggleQuestion(question)}
                  />
                  {question.title}
                </label>
              ))}
            </div>
          )}
        </Card>

        <Button type="submit" disabled={isSubmitting} className="w-fit">
          {isSubmitting ? "Creating..." : "Create test"}
        </Button>
      </form>
    </div>
  );
};

export default CreateTestPage;
