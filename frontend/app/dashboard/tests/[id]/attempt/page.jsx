"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Card from "@/src/components/ui/Card";
import Spinner from "@/src/components/ui/Spinner";
import Button from "@/src/components/ui/Button";
import TestAttemptRunner from "@/src/components/tests/TestAttemptRunner";
import { api } from "@/src/utils/api";

const TestAttemptPage = () => {
  const params = useParams();
  const router = useRouter();
  const [attempt, setAttempt] = useState(null);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  // Strict Mode runs effects twice in dev; without this the attempt would be started twice.
  const startedRef = useRef(false);

  useEffect(() => {
    if (startedRef.current) return;
    startedRef.current = true;

    const start = async () => {
      try {
        const res = await api.post(`/attempts/${params.id}/start`);
        setAttempt(res.data);
      } catch (err) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    start();
  }, [params.id]);

  if (isLoading) {
    return <Spinner />;
  }

  if (error) {
    return (
      <Card className="max-w-md">
        <h2 className="text-lg font-bold text-gray-900">Cannot start this test</h2>
        <p className="mt-2 text-sm text-red-600">{error}</p>
        <Button onClick={() => router.push("/dashboard/tests")} className="mt-4">
          Back to tests
        </Button>
      </Card>
    );
  }

  if (result) {
    return (
      <Card className="max-w-md">
        <h2 className="text-lg font-bold text-gray-900">Test submitted</h2>
        <p className="mt-2 text-sm text-gray-600">
          Score: {result.score} / {result.totalMarks} ({result.percentage}%)
        </p>
        <p className="text-sm text-gray-600">
          {result.awaitingReview
            ? "Some answers need to be reviewed by a teacher before your final result is available."
            : result.passed
              ? "You passed!"
              : "You did not pass."}
        </p>
        <Button onClick={() => router.push("/dashboard/tests")} className="mt-4">
          Back to tests
        </Button>
      </Card>
    );
  }

  if (!attempt) {
    return <p className="text-sm text-gray-500">No attempt data.</p>;
  }

  return (
    <TestAttemptRunner
      attemptId={attempt.attemptId}
      questions={attempt.questions}
      secondsRemaining={attempt.secondsRemaining}
      savedAnswers={attempt.savedAnswers}
      onComplete={setResult}
    />
  );
};

export default TestAttemptPage;
