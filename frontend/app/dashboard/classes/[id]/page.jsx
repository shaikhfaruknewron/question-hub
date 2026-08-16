"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { getClassById } from "@/src/utils/api";

export default function ClassDetailsPage() {
  const params = useParams();
  const router = useRouter();

  const [classData, setClassData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchClass = async () => {
      try {
        setLoading(true);
        setError("");

        const data = await getClassById(params.id);

        console.log("CLASS DETAILS:", data);

        setClassData(data);
      } catch (error) {
        console.error("Failed to fetch class:", error);

        setError(
          error?.message || "Failed to load class"
        );
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchClass();
    }
  }, [params.id]);

  if (loading) {
    return (
      <div className="p-6">
        <p>Loading class...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <p className="text-red-500">{error}</p>

        <button
          onClick={() => router.push("/dashboard/classes")}
          className="mt-4 rounded-lg border px-4 py-2"
        >
          Back to Classes
        </button>
      </div>
    );
  }

  if (!classData) {
    return (
      <div className="p-6">
        <p>Class not found.</p>
      </div>
    );
  }

  return (
    <div className="p-6">

      {/* Header */}
      <div className="mb-6">
        <button
          onClick={() => router.push("/dashboard/classes")}
          className="
            mb-4 rounded-lg px-3 py-1.5
            text-sm font-medium text-gray-600
            transition-all duration-200
            hover:bg-gray-100
            active:scale-95
          "
        >
          ← Back to Classes
        </button>

        <h1 className="text-2xl font-bold">
          {classData.name}
        </h1>

        <p className="mt-1 text-gray-500">
          Department: {classData.department}
        </p>
      </div>

      {/* Class Information */}
      <div className="rounded-xl border bg-white p-6">
        <h2 className="mb-4 text-lg font-semibold">
          Class Information
        </h2>

        <div className="grid gap-4 md:grid-cols-3">

          <div>
            <p className="text-sm text-gray-500">
              Class Name
            </p>

            <p className="font-medium">
              {classData.name}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Department
            </p>

            <p className="font-medium">
              {classData.department}
            </p>
          </div>

          <div>
            <p className="text-sm text-gray-500">
              Status
            </p>

            <p
              className={
                classData.isActive
                  ? "font-medium text-green-600"
                  : "font-medium text-red-500"
              }
            >
              {classData.isActive
                ? "Active"
                : "Inactive"}
            </p>
          </div>

        </div>
      </div>

    </div>
  );
}