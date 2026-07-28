"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import PropTypes from "prop-types";
import Button from "@/src/components/ui/Button";
import Card from "@/src/components/ui/Card";
import { api } from "@/src/utils/api";

const TestAttemptRunner = ({ attemptId, questions, durationMinutes, onComplete }) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState({});
  const [secondsLeft, setSecondsLeft] = useState(durationMinutes * 60);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const currentQuestion = questions[currentIndex];

  const handleSubmitTest = useCallback(async () => {
    setIsSubmitting(true);
    try {
      const result = await api.patch(`/attempts/${attemptId}/submit`, {});
      onComplete(result.data);
    } finally {
      setIsSubmitting(false);
    }
  }, [attemptId, onComplete]);

  useEffect(() => {
    if (secondsLeft <= 0) {
      handleSubmitTest();
      return undefined;
    }
    const timer = setInterval(() => setSecondsLeft((prev) => prev - 1), 1000);
    return () => clearInterval(timer);
  }, [secondsLeft, handleSubmitTest]);

  const timeDisplay = useMemo(() => {
    const minutes = Math.floor(secondsLeft / 60);
    const seconds = secondsLeft % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }, [secondsLeft]);

  const selectOption = async (optionId) => {
    setAnswers((prev) => ({ ...prev, [currentQuestion.id]: [optionId] }));
    await api.patch(`/attempts/${attemptId}/answer`, {
      question: currentQuestion.id,
      selectedOptions: [optionId],
    });
  };

  const goToQuestion = (index) => setCurrentIndex(index);

  return (
    <div className="flex gap-6">
      <div className="flex-1">
        <Card className="flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-gray-500">
              Question {currentIndex + 1} of {questions.length}
            </span>
            <span className="rounded-xl bg-primary-50 px-3 py-1 text-sm font-semibold text-primary-700">
              {timeDisplay}
            </span>
          </div>

          <h2 className="text-base font-semibold text-gray-900">{currentQuestion.title}</h2>

          <div className="flex flex-col gap-2">
            {currentQuestion.options?.map((option) => (
              <button
                key={option._id}
                type="button"
                onClick={() => selectOption(option._id)}
                aria-pressed={answers[currentQuestion.id]?.includes(option._id)}
                className={`rounded-xl border px-4 py-3 text-left text-sm transition ${
                  answers[currentQuestion.id]?.includes(option._id)
                    ? "border-primary-500 bg-primary-50"
                    : "border-gray-300 hover:bg-gray-50"
                }`}
              >
                {option.text}
              </button>
            ))}
          </div>

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

      <Card className="h-fit w-56">
        <span className="mb-3 block text-sm font-medium text-gray-700">Questions</span>
        <div className="grid grid-cols-5 gap-2">
          {questions.map((question, index) => (
            <button
              key={question.id}
              type="button"
              onClick={() => goToQuestion(index)}
              aria-label={`Go to question ${index + 1}`}
              className={`h-8 w-8 rounded-lg text-xs font-medium ${
                answers[question.id]
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
      </Card>
    </div>
  );
};

TestAttemptRunner.propTypes = {
  attemptId: PropTypes.string.isRequired,
  questions: PropTypes.arrayOf(PropTypes.object).isRequired,
  durationMinutes: PropTypes.number.isRequired,
  onComplete: PropTypes.func.isRequired,
};

export default TestAttemptRunner;
