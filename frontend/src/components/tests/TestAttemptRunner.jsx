"use client";

import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import Button from "@/src/components/ui/Button";
import Card from "@/src/components/ui/Card";
import { api } from "@/src/utils/api";

const TEXT_TYPES = ["descriptive", "coding"];

const buildInitialAnswers = (savedAnswers = []) =>
  savedAnswers.reduce((acc, saved) => {
    acc[saved.question] = {
      selectedOptions: (saved.selectedOptions || []).map(String),
      textAnswer: saved.textAnswer || "",
      codeAnswer: saved.codeAnswer || "",
    };
    return acc;
  }, {});

const emptyAnswer = { selectedOptions: [], textAnswer: "", codeAnswer: "" };

const hasResponse = (answer) =>
  Boolean(answer) &&
  (answer.selectedOptions?.length > 0 ||
    answer.textAnswer?.trim() ||
    answer.codeAnswer?.trim());

const TestAttemptRunner = ({
  attemptId,
  attemptNumber,
  maxAttempts,
  remainingAttempts,
  questions,
  secondsRemaining,
  savedAnswers,
  onComplete,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState(() => buildInitialAnswers(savedAnswers));
  const [secondsLeft, setSecondsLeft] = useState(secondsRemaining);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  // Auto-submit on timeout must fire exactly once.
  const submittedRef = useRef(false);

  const currentQuestion = questions[currentIndex];

   const saveAnswer = useCallback(
    async (questionId, answer) => {
      try {
        await api.patch(`/attempts/${attemptId}/answer`, {
          question: questionId,
          selectedOptions: answer.selectedOptions,
          textAnswer: answer.textAnswer,
          codeAnswer: answer.codeAnswer,
        });
        setError("");
      } catch (err) {
        setError(`Could not save your answer: ${err.message}`);
        throw err;
      }
    },
    [attemptId]
  );

 const handleSubmitTest = useCallback(async () => {
  if (submittedRef.current) return;

  submittedRef.current = true;
  setIsSubmitting(true);
  setError("");

  try {
    // Save the latest answer currently shown on screen.
    const currentAnswer = answers[currentQuestion.id];

    if (currentAnswer && hasResponse(currentAnswer)) {
      await saveAnswer(currentQuestion.id, currentAnswer);
    }

    // Now submit the complete attempt.
    const result = await api.patch(`/attempts/${attemptId}/submit`);

    onComplete(result.data);
  } catch (err) {
    submittedRef.current = false;
    setError(err.message);
    setIsSubmitting(false);
  }
}, [
  answers, attemptId, currentQuestion, onComplete, saveAnswer,]);

  useEffect(() => {
    // One interval for the whole run; the tick reads from the state updater.
    const timer = setInterval(() => {
      setSecondsLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleSubmitTest();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [handleSubmitTest]);

  const timeDisplay = useMemo(() => {
    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, [secondsLeft]);

 

  const selectOption = (optionId) => {
    const isMulti = currentQuestion.type === "multiple-choice";
    const previous = answers[currentQuestion.id] || emptyAnswer;
    const current = previous.selectedOptions;

    const selectedOptions = isMulti
      ? current.includes(optionId)
        ? current.filter((id) => id !== optionId)
        : [...current, optionId]
      : [optionId];

    const next = { ...previous, selectedOptions };
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: next }));
    saveAnswer(currentQuestion.id, next);
  };

  const updateText = (field, value) => {
    setAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: { ...(prev[currentQuestion.id] || emptyAnswer), [field]: value },
    }));
  };

  // Text answers are saved when the field loses focus rather than on every keystroke.
  const flushText = () => {
    const answer = answers[currentQuestion.id];
    if (answer) saveAnswer(currentQuestion.id, answer);
  };

  const goToQuestion = (index) => setCurrentIndex(index);

  const currentAnswer = answers[currentQuestion.id] || emptyAnswer;
  const isTextQuestion = TEXT_TYPES.includes(currentQuestion.type);
  const answeredCount = questions.filter((q) => hasResponse(answers[q.id])).length;
  const isLowOnTime = secondsLeft <= 60;

  return (
    <div className="flex flex-col gap-4 lg:flex-row lg:gap-6">
      <div className="flex-1">
        <Card className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div>
            <span className="text-sm font-medium text-gray-500">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span className="text-xs text-gray-500">
               Attempt {attemptNumber} of {maxAttempts} ·{" "}
               {remainingAttempts} attempt
               {remainingAttempts !== 1 ? "s" : ""} remaining
             </span>
             </div>
            <span
              aria-live="polite"
              className={`rounded-xl px-3 py-1 text-sm font-semibold ${
                isLowOnTime ? "bg-red-50 text-red-700" : "bg-primary-50 text-primary-700"
              }`}
            >
              {timeDisplay}
            </span>
          </div>

          <div>
            <h2 className="text-base font-semibold text-gray-900">{currentQuestion.title}</h2>
            <p className="mt-1 text-xs text-gray-500">
              {currentQuestion.marks} mark(s)
              {currentQuestion.type === "multiple-choice" && " · select all that apply"}
            </p>
          </div>

          {isTextQuestion ? (
            <textarea
              aria-label="Your answer"
              rows={currentQuestion.type === "coding" ? 12 : 6}
              value={
                currentQuestion.type === "coding"
                  ? currentAnswer.codeAnswer || currentQuestion.codingConfig?.starterCode || ""
                  : currentAnswer.textAnswer
              }
              onChange={(e) =>
                updateText(
                  currentQuestion.type === "coding" ? "codeAnswer" : "textAnswer",
                  e.target.value
                )
              }
              onBlur={flushText}
              className={`w-full rounded-xl border border-gray-300 px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 ${
                currentQuestion.type === "coding" ? "font-mono" : ""
              }`}
              placeholder="Type your answer here..."
            />
          ) : (
            <div className="flex flex-col gap-2">
              {currentQuestion.options?.map((option) => {
                const isSelected = currentAnswer.selectedOptions.includes(option._id);
                return (
                  <button
                    key={option._id}
                    type="button"
                    onClick={() => selectOption(option._id)}
                    aria-pressed={isSelected}
                    className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
                      isSelected
                        ? "border-primary-500 bg-primary-50"
                        : "border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {option.text}
                  </button>
                );
              })}
            </div>
          )}

          {error && (
            <p role="alert" className="text-sm text-red-600">
              {error}
            </p>
          )}

          <div className="flex justify-between pt-4">
            <Button
              variant="outline"
              onClick={() => goToQuestion(currentIndex - 1)}
              disabled={currentIndex === 0}
            >
              Previous
            </Button>
            {currentIndex === questions.length - 1 ? (
              <Button onClick={handleSubmitTest} disabled={isSubmitting}>
                {isSubmitting ? "Submitting..." : "Submit test"}
              </Button>
            ) : (
              <Button onClick={() => goToQuestion(currentIndex + 1)}>Next</Button>
            )}
          </div>
        </Card>
      </div>

      <Card className="h-fit lg:w-56">
        <span className="mb-3 block text-sm font-medium text-gray-700">
          Answered {answeredCount}/{questions.length}
        </span>
        <div className="grid grid-cols-5 gap-2">
          {questions.map((question, index) => (
            <button
              key={question.id}
              type="button"
              onClick={() => goToQuestion(index)}
              aria-label={`Go to question ${index + 1}`}
              aria-current={index === currentIndex ? "true" : undefined}
              className={`h-8 w-8 rounded-lg text-xs font-medium ${
                hasResponse(answers[question.id])
                  ? "bg-primary-600 text-white"
                  : index === currentIndex
                    ? "border border-primary-500 text-primary-700"
                    : "bg-gray-100 text-gray-600"
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
        <Button
          onClick={handleSubmitTest}
          disabled={isSubmitting}
          className="mt-4 w-full"
          variant="secondary"
        >
          {isSubmitting ? "Submitting..." : "Finish"}
        </Button>
      </Card>
    </div>
  );
};

export default TestAttemptRunner;
