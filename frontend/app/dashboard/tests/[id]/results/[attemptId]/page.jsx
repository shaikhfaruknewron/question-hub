"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Badge from "@/src/components/ui/Badge";
import Button from "@/src/components/ui/Button";
import Card from "@/src/components/ui/Card";
import Spinner from "@/src/components/ui/Spinner";
import useFetch from "@/src/hooks/useFetch";
import { api } from "@/src/utils/api";

const MANUAL_TYPES = new Set(["descriptive", "coding"]);

const AttemptEvaluationPage = () => {
  const { id, attemptId } = useParams();
  const router = useRouter();
  const { data: attempt, isLoading, error, refetch } = useFetch(`/attempts/${attemptId}`);
  const [drafts, setDrafts] = useState({});
  const [savingQuestion, setSavingQuestion] = useState("");
  const [actionError, setActionError] = useState("");

  if (isLoading) return <Spinner />;
  if (error || !attempt) return <p className="text-sm text-red-600">{error || "Attempt not found."}</p>;

  const questionMap = new Map(
    (attempt.test?.questions || []).map((item) => [String(item.question?._id), item])
  );
  const manualAnswers = attempt.answers.filter((answer) =>
    MANUAL_TYPES.has(questionMap.get(String(answer.question))?.question?.type)
  );

  const updateDraft = (questionId, field, value) => {
    setDrafts((current) => ({
      ...current,
      [questionId]: { ...current[questionId], [field]: value },
    }));
  };

  const saveGrade = async (answer, question) => {
    const draft = drafts[String(answer.question)] || {};
    const marksAwarded = Number(draft.marksAwarded ?? answer.marksAwarded ?? 0);
    if (!Number.isFinite(marksAwarded) || marksAwarded < 0 || marksAwarded > question.marks) {
      setActionError(`Enter marks from 0 to ${question.marks}.`);
      return;
    }

    setSavingQuestion(String(answer.question));
    setActionError("");
    try {
      await api.patch(`/attempts/${attemptId}/grade/${answer.question}`, {
        marksAwarded,
        feedback: draft.feedback ?? answer.feedback ?? "",
      });
      await refetch();
      setDrafts((current) => {
        const next = { ...current };
        delete next[String(answer.question)];
        return next;
      });
    } catch (err) {
      setActionError(err.message);
    } finally {
      setSavingQuestion("");
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{attempt.student?.name || "Student"}&apos;s attempt</h2>
          <p className="text-sm text-gray-500">{attempt.test?.title} · Attempt {attempt.attemptNumber}</p>
          <p className="mt-1 text-sm text-gray-600">Current score: {attempt.score}/{attempt.test?.totalMarks} ({attempt.percentage}%)</p>
        </div>
        <Badge label={attempt.status} tone={attempt.status === "graded" ? "published" : "draft"} />
      </div>

      {actionError && <p className="text-sm text-red-600">{actionError}</p>}
      <Card className="flex flex-col gap-4">
  <div className="flex items-center justify-between">
    <div>
      <h3 className="text-base font-semibold text-gray-900">
        Proctoring Summary
      </h3>
      <p className="text-sm text-gray-500">
        Monitoring information recorded during this attempt
      </p>
    </div>

    <Badge
      label={attempt.proctoring?.status || "pending"}
      tone={
        attempt.proctoring?.status === "violated"
          ? "draft"
          : "published"
      }
    />
  </div>

  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
    <div className="rounded-xl border border-gray-200 p-3">
      <p className="text-xs text-gray-500">Tab switches</p>
      <p className="mt-1 text-lg font-semibold text-gray-900">
        {attempt.proctoring?.tabSwitchCount ?? 0}
      </p>
    </div>

    <div className="rounded-xl border border-gray-200 p-3">
      <p className="text-xs text-gray-500">Fullscreen exits</p>
      <p className="mt-1 text-lg font-semibold text-gray-900">
        {attempt.proctoring?.fullscreenExitCount ?? 0}
      </p>
    </div>

    <div className="rounded-xl border border-gray-200 p-3">
      <p className="text-xs text-gray-500">Copy attempts</p>
      <p className="mt-1 text-lg font-semibold text-gray-900">
        {attempt.proctoring?.copyAttemptCount ?? 0}
      </p>
    </div>

    <div className="rounded-xl border border-gray-200 p-3">
      <p className="text-xs text-gray-500">Paste attempts</p>
      <p className="mt-1 text-lg font-semibold text-gray-900">
        {attempt.proctoring?.pasteAttemptCount ?? 0}
      </p>
    </div>

    <div className="rounded-xl border border-gray-200 p-3">
      <p className="text-xs text-gray-500">Cut attempts</p>
      <p className="mt-1 text-lg font-semibold text-gray-900">
        {attempt.proctoring?.cutAttemptCount ?? 0}
      </p>
    </div>

    <div className="rounded-xl border border-gray-200 p-3">
      <p className="text-xs text-gray-500">Right-click attempts</p>
      <p className="mt-1 text-lg font-semibold text-gray-900">
        {attempt.proctoring?.rightClickCount ?? 0}
      </p>
    </div>

    <div className="rounded-xl border border-gray-200 p-3">
      <p className="text-xs text-gray-500">Camera violations</p>
      <p className="mt-1 text-lg font-semibold text-gray-900">
        {attempt.proctoring?.cameraViolationCount ?? 0}
      </p>
    </div>

    <div className="rounded-xl border border-gray-200 p-3">
      <p className="text-xs text-gray-500">Microphone violations</p>
      <p className="mt-1 text-lg font-semibold text-gray-900">
        {attempt.proctoring?.microphoneViolationCount ?? 0}
      </p>
    </div>
  </div>

  <div className="flex flex-wrap gap-3 border-t border-gray-200 pt-4">
    <div className="rounded-lg bg-gray-50 px-3 py-2 text-sm">
      <span className="text-gray-500">Total violations:</span>{" "}
      <span className="font-semibold text-gray-900">
        {attempt.proctoring?.totalViolations ?? 0}
      </span>
    </div>

    <div className="rounded-lg bg-gray-50 px-3 py-2 text-sm">
      <span className="text-gray-500">Submission reason:</span>{" "}
      <span className="font-semibold text-gray-900">
        {attempt.submissionReason || "Not submitted yet"}
      </span>
    </div>
  </div>
</Card>

      {manualAnswers.length === 0 ? (
        <Card><p className="text-sm text-gray-500">This attempt has no descriptive or coding answers to evaluate.</p></Card>
      ) : manualAnswers.map((answer) => {
        const question = questionMap.get(String(answer.question));
        const draft = drafts[String(answer.question)] || {};
        const response = question.question.type === "coding" ? answer.codeAnswer : answer.textAnswer;
        const isSaving = savingQuestion === String(answer.question);

        return (
          <Card key={String(answer.question)} className="flex flex-col gap-4">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">{question.question.title}</h3>
                <p className="text-xs text-gray-500">{question.marks} marks · {question.question.type}</p>
              </div>
              <Badge label={answer.reviewedBy ? "reviewed" : "pending"} tone={answer.reviewedBy ? "published" : "draft"} />
            </div>
            <pre className="whitespace-pre-wrap rounded-xl bg-gray-50 p-4 text-sm text-gray-800">{response || "No response submitted."}</pre>
            <div className="grid gap-3 md:grid-cols-[160px_1fr_auto] md:items-end">
              <label className="text-sm text-gray-700">Marks (max {question.marks})
                <input
                  type="number"
                  min="0"
                  max={question.marks}
                  step="0.01"
                  value={draft.marksAwarded ?? answer.marksAwarded ?? 0}
                  onChange={(event) => updateDraft(String(answer.question), "marksAwarded", event.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                />
              </label>
              <label className="text-sm text-gray-700">Feedback
                <textarea
                  rows={2}
                  value={draft.feedback ?? answer.feedback ?? ""}
                  onChange={(event) => updateDraft(String(answer.question), "feedback", event.target.value)}
                  className="mt-1 w-full rounded-xl border border-gray-300 px-3 py-2 text-sm"
                  placeholder="Optional feedback for the student"
                />
              </label>
              <Button onClick={() => saveGrade(answer, question)} disabled={isSaving}>
                {isSaving ? "Saving..." : "Save grade"}
              </Button>
            </div>
          </Card>
        );
      })}

      <Button variant="outline" className="w-fit" onClick={() => router.push(`/dashboard/tests/${id}/results`)}>Back to results</Button>
    </div>
  );
};

export default AttemptEvaluationPage;
