"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Card from "@/src/components/ui/Card";
import QuestionForm from "@/src/components/questions/QuestionForm";
import useFetch from "@/src/hooks/useFetch";
import { api } from "@/src/utils/api";

const CreateQuestionPage = () => {
  const router = useRouter();
  const { data: categories } = useFetch("/categories");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (payload) => {
    setIsSubmitting(true);
    setError("");
    try {
      await api.post("/questions", payload);
      router.push("/dashboard/questions");
    } catch (err) {
      const detail = err.errors?.map((e) => e.message).join(", ");
      setError(detail ? `${err.message}: ${detail}` : err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <h2 className="text-xl font-bold text-gray-900">Create question</h2>

      {categories?.length === 0 && (
        <p className="text-sm text-amber-700">
          You have no categories yet.{" "}
          <Link href="/dashboard/categories" className="font-medium underline">
            Create one first
          </Link>
          .
        </p>
      )}

      <Card className="max-w-2xl">
        <QuestionForm
          categories={categories || []}
          onSubmit={handleSubmit}
          isSubmitting={isSubmitting}
          error={error}
        />
      </Card>
    </div>
  );
};

export default CreateQuestionPage;
