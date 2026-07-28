"use client";

import Card from "@/src/components/ui/Card";
import Spinner from "@/src/components/ui/Spinner";
import useFetch from "@/src/hooks/useFetch";

const AnalyticsPage = () => {
  const { data: questionStats, isLoading } = useFetch("/analytics/questions");

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-bold text-gray-900">Question analytics</h2>

      {isLoading ? (
        <Spinner />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {questionStats?.map((q) => (
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
      )}
    </div>
  );
};

export default AnalyticsPage;
