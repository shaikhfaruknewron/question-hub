"use client";

import Card from "@/src/components/ui/Card";
import useAuth from "@/src/hooks/useAuth";
import useFetch from "@/src/hooks/useFetch";

const DashboardPage = () => {
  const { user } = useAuth();
  const { data: questionsData } = useFetch("/questions?limit=1");
  const { data: testsData } = useFetch("/tests?limit=1");

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Welcome, {user?.name}</h2>
        <p className="text-sm text-gray-500">Here is a quick overview of your workspace.</p>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Card>
          <span className="text-xs font-medium text-gray-500">Total questions</span>
          <p className="mt-2 text-2xl font-bold text-gray-900">{questionsData?.total ?? "-"}</p>
        </Card>
        <Card>
          <span className="text-xs font-medium text-gray-500">Total tests</span>
          <p className="mt-2 text-2xl font-bold text-gray-900">{testsData?.total ?? "-"}</p>
        </Card>
        <Card>
          <span className="text-xs font-medium text-gray-500">Your role</span>
          <p className="mt-2 text-2xl font-bold capitalize text-gray-900">{user?.role}</p>
        </Card>
      </div>
    </div>
  );
};

export default DashboardPage;
