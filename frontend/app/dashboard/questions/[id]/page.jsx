"use client";

import { useState } from "react";
import { useRouter, useParams } from "next/navigation";
import Card from "@/src/components/ui/Card";
import Spinner from "@/src/components/ui/Spinner";
import QuestionForm from "@/src/components/questions/QuestionForm";
import useFetch from "@/src/hooks/useFetch";
import { api } from "@/src/utils/api";

const EditQuestionPage = () => {
  const router = useRouter();
  const params = useParams();
  const { data: question, isLoading } = useFetch(`/questions/${params.id}`, [params.id]);
  const { data: categories } = useFetch("/categories");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (payload) => {
    setIsSubmitting(true);
    try {
      await api.patch(`/questions/${params.id}`, payload);
      router.push("/dashboard/questions");
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return <Spinner />;
  }

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-bold text-gray-900">Edit question</h2>
      <Card className="max-w-2xl">
        <QuestionForm
          initialValues={question}
          categories={categories || []}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
        />
      </Card>
    </div>
  );
};

export default EditQuestionPage;
