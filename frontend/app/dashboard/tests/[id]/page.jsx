"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Card from "@/src/components/ui/Card";
import Badge from "@/src/components/ui/Badge";
import Button from "@/src/components/ui/Button";
import Spinner from "@/src/components/ui/Spinner";
import useAuth from "@/src/hooks/useAuth";
import useFetch from "@/src/hooks/useFetch";
import { api } from "@/src/utils/api";

const TestDetailPage = () => {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const { data: test, isLoading, error, refetch } = useFetch(`/tests/${params.id}`);
  const [actionError, setActionError] = useState("");

  const isStudent = user?.role === "student";
  const isStaff = user?.role === "admin" || user?.role === "teacher";

  const handlePublish = async () => {
    setActionError("");
    try {
      await api.patch(`/tests/${params.id}/publish`);
      refetch();
    } catch (err) {
      setActionError(err.message);
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  if (error || !test) {
    return <p className="text-sm text-red-600">{error || "Test not found."}</p>;
  }

  const questionCount = test.questionCount ?? test.questions?.length ?? 0;
  const attemptStatus = test.studentStatus;
  const currentAttempt = test.currentAttempt;
  const canStart = attemptStatus === "available" || attemptStatus === "completed";

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">{test.title}</h2>
          <p className="text-sm text-gray-500">{test.description}</p>
        </div>
        <Badge label={test.visibility} tone={test.visibility} />
      </div>

      <Card className="max-w-xl">
        <div className="grid grid-cols-2 gap-4 text-sm">
          <div>
            <span className="text-gray-500">Duration</span>
            <p className="font-medium">{test.durationMinutes} minutes</p>
          </div>
          <div>
            <span className="text-gray-500">Total marks</span>
            <p className="font-medium">{test.totalMarks}</p>
          </div>
          <div>
            <span className="text-gray-500">Passing score</span>
            <p className="font-medium">{test.passingScore}</p>
          </div>
          <div>
            <span className="text-gray-500">Questions</span>
            <p className="font-medium">{questionCount}</p>
          </div>
          <div>
            <span className="text-gray-500">Attempts allowed</span>
            <p className="font-medium">{test.maxAttempts}</p>
          </div>
          {isStudent && (
            <>
              <div>
                <span className="text-gray-500">Attempts used</span>
                <p className="font-medium">{test.attemptsUsed}/{test.maxAttempts}</p>
              </div>
              <div>
                <span className="text-gray-500">Attempts remaining</span>
                <p className="font-medium">{test.attemptsRemaining}</p>
              </div>
              <div>
                <span className="text-gray-500">Current status</span>
                <p className="font-medium capitalize">{attemptStatus?.replace("-", " ")}</p>
              </div>
            </>
          )}
        </div>
      </Card>

      {actionError && <p className="text-sm text-red-600">{actionError}</p>}

      <div className="flex gap-3">
        {!isStudent && test.visibility === "draft" && (
          <Button onClick={handlePublish}>Publish test</Button>
        )}
        {isStaff && (
          <Button onClick={() => router.push(`/dashboard/tests/${params.id}/results`)}>
            View results
          </Button>
        )}
        {isStudent && attemptStatus === "in-progress" && (
          <Button onClick={() => router.push(`/dashboard/tests/${params.id}/attempt`)}>Continue</Button>
        )}
        {isStudent && canStart && (
          <Button onClick={() => router.push(`/dashboard/tests/${params.id}/attempt`)}>
            {attemptStatus === "completed" ? "Start Again" : "Start"}
          </Button>
        )}
        {isStudent && currentAttempt && currentAttempt.status !== "in-progress" && (
          <Button
            variant="outline"
            onClick={() => router.push(`/dashboard/tests/${params.id}/result`)}
          >
            View Result
          </Button>
        )}
        {isStudent && attemptStatus === "exhausted" && <Button disabled>Attempts Exhausted</Button>}
        {isStudent && attemptStatus === "expired" && <Button disabled>Expired</Button>}
        <Button variant="outline" onClick={() => router.push("/dashboard/tests")}>
          Back to tests
        </Button>
      </div>
    </div>
  );
};

export default TestDetailPage;
