"use client";

import { useMemo, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Card from "@/src/components/ui/Card";
import Input from "@/src/components/ui/Input";
import Button from "@/src/components/ui/Button";
import Spinner from "@/src/components/ui/Spinner";
import usePaginatedFetch from "@/src/hooks/usePaginatedFetch";
import DateTimePicker from "@/src/components/tests/DateTimePicker";
import { api } from "@/src/utils/api";
import { getClasses, getClassSubjects } from "@/src/utils/api";
import { QUESTION_TOPICS } from "@/src/utils/constants";

const QUESTION_FETCH_LIMIT = 12;

const CreateTestPage = () => {
  const router = useRouter();
  const [form, setForm] = useState({
  title: "",
  description: "",
  class: "",
  subject: "",
  durationMinutes: 30,
  passingScore: 10,
  maxAttempts: 1,
  scheduledStart: "",
  scheduledEnd: "",
  shuffleQuestions: true,
  shuffleOptions: true,
 });


  const [selected, setSelected] = useState({});
  const [topicFilter, setTopicFilter] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [classes, setClasses] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [isLoadingAcademicData, setIsLoadingAcademicData] = useState(true);
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);
  const [questionPage, setQuestionPage] = useState(1);

  const questionsEndpoint = useMemo(() => {
  const params = new URLSearchParams({
    page: String(questionPage),
    limit: String(QUESTION_FETCH_LIMIT),
  });

  if (topicFilter) {
    params.set("topic", topicFilter);
  }

  return `/questions?${params.toString()}`;
}, [topicFilter, questionPage]);

  const { items: questions, data: questionsData, isLoading } = usePaginatedFetch(
    questionsEndpoint,
    { page: questionPage, itemsKey: "questions" }
  );


useEffect(() => {
  const loadClasses = async () => {
    try {
      setIsLoadingAcademicData(true);

      const classesData = await getClasses();

      console.log("Classes response:", classesData);

      const classList =
        classesData?.classes ||
        classesData?.data ||
        classesData ||
        [];

      setClasses(Array.isArray(classList) ? classList : []);
    } catch (err) {
      console.error("Failed to load classes:", err);
      setClasses([]);
      setError(err.message || "Failed to load classes");
    } finally {
      setIsLoadingAcademicData(false);
    }
  };

  loadClasses();
}, []);

useEffect(() => {
  const loadSubjects = async () => {
    if (!form.class) {
      setSubjects([]);
      return;
    }

    try {
      setIsLoadingSubjects(true);

      const subjectsData = await getClassSubjects(form.class);

const classSubjects = subjectsData?.subjects || subjectsData || [];

setSubjects(
  classSubjects
    .map((item) => item.subject)
    .filter(Boolean)
);
    } catch (err) {
      setSubjects([]);
      setError(err.message || "Failed to load subjects");
    } finally {
      setIsLoadingSubjects(false);
    }
  };

  loadSubjects();
}, [form.class]);

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
    if (!form.class) {
  setError("Please select a class.");
  return;
}

if (!form.subject) {
  setError("Please select a subject.");
  return;
}

if (
  form.scheduledStart &&
  form.scheduledEnd &&
  new Date(form.scheduledEnd) <= new Date(form.scheduledStart)
) {
  setError(
    "End date and time must be after the start date and time."
  );
  return;
}

    setIsSubmitting(true);
    try {
      await api.post("/tests", {
  ...form,

  durationMinutes: Number(form.durationMinutes),
  passingScore: Number(form.passingScore),
  maxAttempts: Number(form.maxAttempts),

  scheduledStart: form.scheduledStart
    ? new Date(form.scheduledStart).toISOString()
    : null,

  scheduledEnd: form.scheduledEnd
    ? new Date(form.scheduledEnd).toISOString()
    : null,

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


  const totalAvailable = questionsData?.total ?? 0;

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

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
  <div className="flex flex-col gap-1.5">
    <label
      htmlFor="class"
      className="text-sm font-medium text-gray-700"
    >
      Class
    </label>

    <select
      id="class"
      value={form.class}
      onChange={(e) =>
        setForm((prev) => ({
          ...prev,
          class: e.target.value,
          subject:"",
        }))
      }
      required
      disabled={isLoadingAcademicData}
      className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
    >
      <option value="">Select class</option>

      {classes.map((item) => (
        <option key={item._id} value={item._id}>
          {item.name}
        </option>
      ))}
    </select>
  </div>

  <div className="flex flex-col gap-1.5">
    <label
      htmlFor="subject"
      className="text-sm font-medium text-gray-700"
    >
      Subject
    </label>

    <select
  id="subject"
  value={form.subject}
  onChange={(e) =>
    setForm((prev) => ({
      ...prev,
      subject: e.target.value,
    }))
  }
  required
  disabled={!form.class || isLoadingSubjects}
  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
>
  <option value="">
    {!form.class
      ? "Select a class first"
      : isLoadingSubjects
      ? "Loading subjects..."
      : subjects.length === 0
      ? "No subjects assigned"
      : "Select subject"}
  </option>

  {subjects.map((item) => (
    <option key={item._id} value={item._id}>
      {item.name} ({item.code})
    </option>
  ))}
</select>
  </div>
</div>
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <DateTimePicker
                label="Start date & time"
                value={form.scheduledStart}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    scheduledStart: value,
                  }))
                }
              />

              <DateTimePicker
                label="End date & time"
                value={form.scheduledEnd}
                min={form.scheduledStart}
                onChange={(value) =>
                  setForm((prev) => ({
                    ...prev,
                    scheduledEnd: value,
                  }))
                }
              />
            </div>

            <fieldset className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
              <legend className="px-1 text-sm font-medium text-gray-700">
                Question settings
              </legend>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-8">
                <label className="flex cursor-pointer items-center gap-2.5 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.shuffleQuestions}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        shuffleQuestions: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Shuffle questions
                </label>

                <label className="flex cursor-pointer items-center gap-2.5 text-sm text-gray-700">
                  <input
                    type="checkbox"
                    checked={form.shuffleOptions}
                    onChange={(e) =>
                      setForm((prev) => ({
                        ...prev,
                        shuffleOptions: e.target.checked,
                      }))
                    }
                    className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  Shuffle answer options
                </label>
              </div>
            </fieldset>
          </div>
        </Card>

        <Card className="max-w-2xl">
          <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
            <span className="text-sm font-medium text-gray-700">
              Select questions ({Object.keys(selected).length} selected · {totalMarks} marks)
            </span>

            <div className="w-full sm:w-56">
              <label htmlFor="question-topic-filter" className="mb-1.5 block text-sm font-medium text-gray-700">
                Filter by topic
              </label>
              <select
                id="question-topic-filter"
                value={topicFilter}
                onChange={(event) => {
                  setTopicFilter(event.target.value);
                  setQuestionPage(1);
                }}
                className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
              >
                <option value="">All topics</option>
                {QUESTION_TOPICS.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>
          {isLoading && questions.length === 0 ? (
            <Spinner />
          ) : questions.length === 0 ? (
            <p className="text-sm text-gray-500">
              {topicFilter
                ? "No questions found for this topic."
                : "No questions available. Create some questions first."}
            </p>
          ) : (
            <div
            className="flex max-h-80 flex-col gap-2 overflow-y-auto">
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

            {questions.length > 0 && questions.length< totalAvailable && (
  <div className="mt-3 flex justify-center">
    <Button
      type="button"
      onClick={() => setQuestionPage((prev) => prev + 1)}
      disabled={isLoading}
    >
      {isLoading ? "Loading..." : "Load More"}
    </Button>
  </div>
)}
          
          {questions.length > 0 && (
          <p className="mt-2 text-xs text-gray-500">
          Showing {questions.length} of {totalAvailable} questions.
          </p>
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
