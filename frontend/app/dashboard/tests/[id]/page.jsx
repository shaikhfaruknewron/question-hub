"use client";

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
  const { data: test, isLoading, refetch } = useFetch(`/tests/${params.id}`, [params.id]);

  const handlePublish = async () => {
    await api.patch(`/tests/${params.id}/publish`, {});
    refetch();
  };

  const handleStartAttempt = () => {
    router.push(`/dashboard/tests/${params.id}/attempt`);
  };

  if (isLoading || !test) {
    return <Spinner />;
  }

  const isStudent = user?.role === "student";

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
            <p className="font-medium">{test.questions?.length}</p>
          </div>
        </div>
      </Card>

      {!isStudent && test.visibility === "draft" && <Button onClick={handlePublish}>Publish test</Button>}
      {isStudent && test.visibility === "published" && (
        <Button onClick={handleStartAttempt} className="w-fit">
          Start attempt
        </Button>
      )}
    </div>
  );
};

export default TestDetailPage;
