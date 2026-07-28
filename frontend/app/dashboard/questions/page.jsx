"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import Button from "@/src/components/ui/Button";
import Select from "@/src/components/ui/Select";
import Spinner from "@/src/components/ui/Spinner";
import QuestionList from "@/src/components/questions/QuestionList";
import useFetch from "@/src/hooks/useFetch";
import { api } from "@/src/utils/api";
import { DIFFICULTY_LEVELS } from "@/src/utils/constants";

const DIFFICULTY_OPTIONS = [{ value: "", label: "All difficulties" }, ...DIFFICULTY_LEVELS.map((d) => ({ value: d, label: d }))];

const QuestionsPage = () => {
  const router = useRouter();
  const [difficulty, setDifficulty] = useState("");
  const { data, isLoading, refetch } = useFetch(
    `/questions${difficulty ? `?difficulty=${difficulty}` : ""}`,
    [difficulty]
  );

  const handleEdit = (id) => router.push(`/dashboard/questions/${id}`);

  const handleDelete = async (id) => {
    await api.delete(`/questions/${id}`);
    refetch();
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Questions</h2>
        <Link href="/dashboard/questions/create">
          <Button>
            <Plus size={16} />
            New question
          </Button>
        </Link>
      </div>

      <div className="w-48">
        <Select
          id="difficulty-filter"
          value={difficulty}
          onChange={(e) => setDifficulty(e.target.value)}
          options={DIFFICULTY_OPTIONS}
        />
      </div>

      {isLoading ? (
        <Spinner />
      ) : (
        <QuestionList questions={data?.questions || []} onEdit={handleEdit} onDelete={handleDelete} />
      )}
    </div>
  );
};

export default QuestionsPage;
