"use client";

import { useParams, useRouter } from "next/navigation";
import Card from "@/src/components/ui/Card";
import Button from "@/src/components/ui/Button";
import Spinner from "@/src/components/ui/Spinner";
import useFetch from "@/src/hooks/useFetch";

const TestResultPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const { data: attempts, isLoading, error } = useFetch("/attempts/me");

  if (isLoading) return <Spinner />;
  if (error) return <p className="text-sm text-red-600">{error}</p>;

  const attempt = attempts?.find((item) => item.test?._id === id);
  if (!attempt) return <p className="text-sm text-gray-500">No result found for this test.</p>;

  const awaitingReview = attempt.status === "submitted";
  const expired = attempt.status === "expired";

  return (
    <Card className="max-w-md">
      <h2 className="text-lg font-bold text-gray-900">{attempt.test.title}</h2>
      {expired ? (
        <p className="mt-2 text-sm text-gray-600">This attempt expired before it was submitted.</p>
      ) : (
        <>
          <p className="mt-2 text-sm text-gray-600">Score: {attempt.score} / {attempt.test.totalMarks} ({attempt.percentage}%)</p>
          <p className="text-sm text-gray-600">
            {awaitingReview ? "Awaiting teacher review." : attempt.passed ? "You passed!" : "You did not pass."}
          </p>
        </>
      )}
      <Button className="mt-4" onClick={() => router.push(`/dashboard/tests/${id}`)}>Back to test</Button>
    </Card>
  );
};

export default TestResultPage;
