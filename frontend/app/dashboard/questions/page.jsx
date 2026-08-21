"use client";

import { useMemo, useState , useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import Button from "@/src/components/ui/Button";
import Input from "@/src/components/ui/Input";
import Select from "@/src/components/ui/Select";
import Spinner from "@/src/components/ui/Spinner";
import QuestionList from "@/src/components/questions/QuestionList";
import useAuth from "@/src/hooks/useAuth";
import useFetch from "@/src/hooks/useFetch";
import { api } from "@/src/utils/api";
import { DIFFICULTY_LEVELS, QUESTION_TYPES } from "@/src/utils/constants";

const DIFFICULTY_OPTIONS = [
  { value: "", label: "All difficulties" },
  ...DIFFICULTY_LEVELS.map((d) => ({ value: d, label: d })),
];

const TYPE_OPTIONS = [{ value: "", label: "All types" }, ...QUESTION_TYPES];

const QuestionsPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [difficulty, setDifficulty] = useState("");
  const [type, setType] = useState("");
  const [actionError, setActionError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const limit = 12;

  useEffect(() => {
  setPageInput(String(currentPage));
}, [currentPage]);

  const [pageInput, setPageInput] = useState("1");

  const endpoint = useMemo(() => {
  const params = new URLSearchParams({
    page: String(currentPage),
    limit: String(limit),
  });

  if (difficulty) params.set("difficulty", difficulty);
  if (type) params.set("type", type);

  return `/questions?${params.toString()}`;
}, [difficulty, type, currentPage]);

  const { data, isLoading, error, refetch } = useFetch(endpoint);

  const canManage = user?.role === "admin" || user?.role === "teacher";

  const goToPage = () => {
  const page = Number(pageInput);

  if (!Number.isInteger(page)) {
    setPageInput(String(currentPage));
    return;
  }

  if (page < 1 || page > (data?.pages || 1)) {
    setPageInput(String(currentPage));
    return;
  }

  setCurrentPage(page);
};

  const handleEdit = (id) => router.push(`/dashboard/questions/${id}`);

  const handleDelete = async (id) => {
    setActionError("");
    try {
      await api.delete(`/questions/${id}`);
      refetch();
    } catch (err) {
      setActionError(err.message);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Questions</h2>
        {canManage && (
          <Link href="/dashboard/questions/create">
            <Button>
              <Plus size={16} />
              New question
            </Button>
          </Link>
        )}
      </div>

      <div className="flex gap-4">
        <div className="w-48">
          <Select
            id="difficulty-filter"
            value={difficulty}
            onChange={(e) => { setDifficulty(e.target.value);
              setCurrentPage(1);
            }}
            
            options={DIFFICULTY_OPTIONS}
          />
        </div>
        <div className="w-48">
          <Select
            id="type-filter"
            value={type}
            onChange={(e) => {setType(e.target.value)
              setCurrentPage(1);
            }}
            options={TYPE_OPTIONS}
          />
        </div>
      </div>

      {actionError && <p className="text-sm text-red-600">{actionError}</p>}

      {isLoading ? (
        <Spinner />
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : (
        <>
  <p className="text-xs text-gray-500">
    {data?.total ?? 0} question(s)
  </p>

  <QuestionList
    questions={data?.questions || []}
    canManage={canManage}
    onEdit={handleEdit}
    onDelete={handleDelete}
  />

  {data?.pages > 1 && (
    <div className="flex items-center justify-center gap-3">
      <Button
        onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
        disabled={currentPage === 1}
      >
        Previous
      </Button>

      <span className="text-sm text-gray-600">
        Page
      </span>
      
      <Input
      id="page-input"
      type="number"
      min="1"
      max={data?.pages}
      value={pageInput}
      onChange={(e) => setPageInput(e.target.value)}
      onKeyDown={(e) => {
      if (e.key === "Enter") {
        goToPage();
      }
      }}
     />

     <span className="text-sm text-gray-600">
    of {data?.pages}
    </span>

     <Button onClick={goToPage}>
      Go
     </Button>

      <Button
        onClick={() =>
          setCurrentPage((prev) => Math.min(prev + 1, data?.pages))
        }
        disabled={currentPage === data?.pages}
      >
        Next
      </Button>
    </div>
  )}
</>
      )}
    </div>
  );
};

export default QuestionsPage;
