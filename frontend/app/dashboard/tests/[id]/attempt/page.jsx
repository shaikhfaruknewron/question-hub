"use client";

import { useEffect, useState } from "react";
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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const start = async () => {
      const res = await api.post(`/attempts/${params.id}/start`, {});
      setAttempt(res.data);
      setIsLoading(false);
    };
    start();
  }, [params.id]);

  if (isLoading) {
    return <Spinner />;
  }

  if (result) {
    return (
      <Card className="max-w-md">
        <h2 className="text-lg font-bold text-gray-900">Test submitted</h2>
        <p className="mt-2 text-sm text-gray-600">
          Score: {result.score} ({result.percentage}%)
        </p>
        <p className="text-sm text-gray-600">{result.passed ? "You passed!" : "You did not pass."}</p>
        <Button onClick={() => router.push("/dashboard/tests")} className="mt-4">
          Back to tests
        </Button>
      </Card>
    );
  }

  return (
    <TestAttemptRunner
      attemptId={attempt.attemptId}
      questions={attempt.questions}
      durationMinutes={attempt.durationMinutes}
      onComplete={setResult}
    />
  );
};

export default TestAttemptPage;
