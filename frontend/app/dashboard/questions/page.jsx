"use client";

import { useMemo, useState ,useEffect} from "react";
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
import { api} from "@/src/utils/api";
import { DIFFICULTY_LEVELS, QUESTION_TYPES, QUESTION_TOPICS } from "@/src/utils/constants";


const DIFFICULTY_OPTIONS = [
  { value: "", label: "All difficulties" },
  ...DIFFICULTY_LEVELS.map((d) => ({ value: d, label: d })),
];

const TYPE_OPTIONS = [{ value: "", label: "All types" }, ...QUESTION_TYPES];

const TOPIC_OPTIONS = [{ value: "", label: "All topics" }, ...QUESTION_TOPICS];

const QuestionsPage = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [difficulty, setDifficulty] = useState("");
  const [type, setType] = useState("");
  const [topic, setTopic] = useState("");
  const [actionError, setActionError] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [questions, setQuestions] = useState([]);
  const limit = 12;

  const endpoint = useMemo(() => {
  const params = new URLSearchParams({
    page: String(currentPage),
    limit: String(limit),
  });
 
  if (difficulty) params.set("difficulty", difficulty);
  if (type) params.set("type", type);
  if (topic) params.set("topic", topic);

  return `/questions?${params.toString()}`;
}, [ difficulty, type, topic, currentPage]);

  const { data, isLoading, error, refetch } = useFetch(endpoint);

  useEffect(() => {
  if (!data?.questions) return;

  if (currentPage === 1) {
    setQuestions(data.questions);
  } else {
    setQuestions((prevQuestions) => {
      const existingIds = new Set(
        prevQuestions.map((question) => question._id)
      );

      const newQuestions = data.questions.filter(
        (question) => !existingIds.has(question._id)
      );

      return [...prevQuestions, ...newQuestions];
    });
  }
}, [data, currentPage]);

  const canManage = user?.role === "admin" || user?.role === "teacher";

  const changePage = (page) => {
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

  const resetAndChangeFilter = (setter, value) => {
  setter(value);
  setCurrentPage(1);
  setQuestions([]);
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

      <div className="flex flex-wrap gap-4">
  <div className="w-48">
    <Select
      id="difficulty-filter"
      value={difficulty}
      onChange={(e) => {
        resetAndChangeFilter(setDifficulty, e.target.value)
        }}
      options={DIFFICULTY_OPTIONS}
    />
  </div>

  <div className="w-48">
    <Select
      id="type-filter"
      value={type}
      onChange={(e) => {
       resetAndChangeFilter(setType, e.target.value)
      }}
      options={TYPE_OPTIONS}
    />
  </div>
   <div className="w-48">
  <Select
    id="topic-filter"
    value={topic}
    onChange={(e) => {
      resetAndChangeFilter(setTopic, e.target.value)
    }}
    options={TOPIC_OPTIONS}
  />
</div>
</div>

      {actionError && <p className="text-sm text-red-600">{actionError}</p>}

      {isLoading && questions.length === 0 ? (
  <Spinner />
) : error ? (
  <p className="text-sm text-red-600">{error}</p>
) : (
  <>
    <p className="text-xs text-gray-500">
      {data?.total ?? 0} question(s)
    </p>

    <QuestionList
      questions={questions}
      canManage={canManage}
      onEdit={handleEdit}
      onDelete={handleDelete}
    />

    {currentPage < (data?.pages || 1) && (
      <div className="flex justify-center">
        <Button
          onClick={() => changePage(currentPage + 1)}
          disabled={isLoading}
        >
          {isLoading ? "Loading..." : "Load More"}
        </Button>
      </div>
    )}
  </>
)}
    </div>
  );
};

export default QuestionsPage;
