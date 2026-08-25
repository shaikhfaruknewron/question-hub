"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import Badge from "@/src/components/ui/Badge";
import Button from "@/src/components/ui/Button";
import Card from "@/src/components/ui/Card";
import Spinner from "@/src/components/ui/Spinner";
import useFetch from "@/src/hooks/useFetch";

const ResultsPage = () => {
  const { id } = useParams();
  const router = useRouter();
  const { data: attempts, isLoading, error } = useFetch(`/attempts/test/${id}`);

  if (isLoading) return <Spinner />;
  if (error) return <p className="text-sm text-red-600">{error}</p>;

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Test results</h2>
          <p className="text-sm text-gray-500">Open an attempt to review descriptive and coding answers.</p>
        </div>
        <Button variant="outline" onClick={() => router.push(`/dashboard/tests/${id}`)}>Back to test</Button>
      </div>

      {!attempts?.length ? (
        <p className="text-sm text-gray-500">No student attempts yet.</p>
      ) : (
        <div className="grid gap-3">
          {attempts.map((attempt) => (
            <Card key={attempt._id} className="flex items-center justify-between gap-4 py-4">
              <div>
                <h3 className="text-sm font-semibold text-gray-900">{attempt.student?.name || "Student"}</h3>
                <p className="text-xs text-gray-500">{attempt.student?.email} · Attempt {attempt.attemptNumber}</p>
                <p className="mt-1 text-xs text-gray-500">
                  Score: {attempt.score} · {attempt.percentage}%
                  {attempt.submittedAt ? ` · Submitted ${new Date(attempt.submittedAt).toLocaleString()}` : ""}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <Badge label={attempt.status} tone={attempt.status === "graded" ? "published" : "draft"} />
                <Link className="text-sm font-medium text-primary-600 hover:underline" href={`/dashboard/tests/${id}/results/${attempt._id}`}>
                  Open attempt
                </Link>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default ResultsPage;
