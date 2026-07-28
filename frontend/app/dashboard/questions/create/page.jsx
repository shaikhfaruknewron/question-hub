"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Card from "@/src/components/ui/Card";
import QuestionForm from "@/src/components/questions/QuestionForm";
import useFetch from "@/src/hooks/useFetch";
import { api } from "@/src/utils/api";

const CreateQuestionPage = () => {
  const router = useRouter();
  const { data: categories } = useFetch("/categories");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (payload) => {
    setIsSubmitting(true);
    try {
      await api.post("/questions", payload);
      router.push("/dashboard/questions");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-bold text-gray-900">Create question</h2>
      <Card className="max-w-2xl">
        <QuestionForm categories={categories || []} onSubmit={handleSubmit} isSubmitting={isSubmitting} />
      </Card>
    </div>
  );
};

export default CreateQuestionPage;
