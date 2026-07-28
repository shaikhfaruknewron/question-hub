"use client";

import { useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import Card from "@/src/components/ui/Card";
import Input from "@/src/components/ui/Input";
import Button from "@/src/components/ui/Button";
import Spinner from "@/src/components/ui/Spinner";
import useAuth from "@/src/hooks/useAuth";
import useFetch from "@/src/hooks/useFetch";
import { api } from "@/src/utils/api";

const CategoriesPage = () => {
  const { user } = useAuth();
  const { data: categories, isLoading, error, refetch } = useFetch("/categories");
  const [form, setForm] = useState({ name: "", description: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const canManage = user?.role === "admin" || user?.role === "teacher";

  const handleSubmit = async (event) => {
    event.preventDefault();
    setIsSubmitting(true);
    setFormError("");
    try {
      await api.post("/categories", form);
      setForm({ name: "", description: "" });
      refetch();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id) => {
    setFormError("");
    try {
      await api.delete(`/categories/${id}`);
      refetch();
    } catch (err) {
      setFormError(err.message);
    }
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Categories</h2>
        <p className="text-sm text-gray-500">Every question belongs to a category.</p>
      </div>

      {canManage && (
        <Card className="max-w-2xl">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              id="category-name"
              label="Name"
              value={form.name}
              onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
              required
              minLength={2}
            />
            <Input
              id="category-description"
              label="Description (optional)"
              value={form.description}
              onChange={(e) => setForm((prev) => ({ ...prev, description: e.target.value }))}
            />
            {formError && (
              <p role="alert" className="text-sm text-red-600">
                {formError}
              </p>
            )}
            <Button type="submit" disabled={isSubmitting} className="w-fit">
              <Plus size={16} />
              {isSubmitting ? "Adding..." : "Add category"}
            </Button>
          </form>
        </Card>
      )}

      {isLoading ? (
        <Spinner />
      ) : error ? (
        <p className="text-sm text-red-600">{error}</p>
      ) : categories?.length === 0 ? (
        <p className="text-sm text-gray-500">No categories yet.</p>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {categories?.map((category) => (
            <Card key={category._id} className="flex flex-col gap-2">
              <div className="flex items-start justify-between gap-4">
                <h3 className="text-sm font-semibold text-gray-900">{category.name}</h3>
                {user?.role === "admin" && (
                  <button
                    type="button"
                    onClick={() => handleDelete(category._id)}
                    aria-label={`Delete ${category.name}`}
                    className="text-gray-400 hover:text-red-600"
                  >
                    <Trash2 size={16} />
                  </button>
                )}
              </div>
              <p className="text-xs text-gray-500">{category.description || "No description"}</p>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default CategoriesPage;
