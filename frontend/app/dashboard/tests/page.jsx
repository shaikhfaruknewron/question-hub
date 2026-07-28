"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import Button from "@/src/components/ui/Button";
import Spinner from "@/src/components/ui/Spinner";
import TestList from "@/src/components/tests/TestList";
import useFetch from "@/src/hooks/useFetch";

const TestsPage = () => {
  const { data, isLoading } = useFetch("/tests");

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold text-gray-900">Tests</h2>
        <Link href="/dashboard/tests/create">
          <Button>
            <Plus size={16} />
            New test
          </Button>
        </Link>
      </div>

      {isLoading ? <Spinner /> : <TestList tests={data?.tests || []} />}
    </div>
  );
};

export default TestsPage;
