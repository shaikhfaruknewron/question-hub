"use client";

import Card from "@/src/components/ui/Card";
import Badge from "@/src/components/ui/Badge";
import Spinner from "@/src/components/ui/Spinner";
import useAuth from "@/src/hooks/useAuth";
import useFetch from "@/src/hooks/useFetch";

const StaffAnalytics = () => {
  const { data: questionStats, isLoading, error } = useFetch("/analytics/questions");

  if (isLoading) return <Spinner />;
  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!questionStats?.length) {
    return <p className="text-sm text-gray-500">No questions to analyse yet.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {questionStats.map((q) => (
        <Card key={q.id}>
          <h3 className="text-sm font-semibold text-gray-900">{q.title}</h3>
          <p className="mt-2 text-xs text-gray-500">Difficulty: {q.difficulty}</p>
          <p className="text-xs text-gray-500">Attempts: {q.timesAttempted}</p>
          <p className="text-xs text-gray-500">
            Accuracy: {q.accuracy !== null ? `${q.accuracy}%` : "No data yet"}
          </p>
        </Card>
      ))}
    </div>
  );
};

const StudentAnalytics = () => {
  const { data: results, isLoading, error } = useFetch("/analytics/student");

  if (isLoading) return <Spinner />;
  if (error) return <p className="text-sm text-red-600">{error}</p>;
  if (!results?.length) {
    return <p className="text-sm text-gray-500">You have no graded results yet.</p>;
  }

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {results.map((result, index) => (
        <Card key={`${result.test}-${index}`} className="flex flex-col gap-2">
          <div className="flex items-start justify-between gap-4">
            <h3 className="text-sm font-semibold text-gray-900">{result.test}</h3>
            <Badge
              label={result.passed ? "passed" : "failed"}
              tone={result.passed ? "published" : "hard"}
            />
          </div>
          <p className="text-xs text-gray-500">
            Score: {result.score} ({result.percentage}%)
          </p>
          <p className="text-xs text-gray-500">
            Submitted:{" "}
            {result.submittedAt ? new Date(result.submittedAt).toLocaleString() : "—"}
          </p>
        </Card>
      ))}
    </div>
  );
};

const AnalyticsPage = () => {
  const { user } = useAuth();
  const isStudent = user?.role === "student";

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-bold text-gray-900">
        {isStudent ? "My results" : "Question analytics"}
      </h2>
      {isStudent ? <StudentAnalytics /> : <StaffAnalytics />}
    </div>
  );
};

export default AnalyticsPage;
