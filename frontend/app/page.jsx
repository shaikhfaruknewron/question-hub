"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import useAuth from "@/src/hooks/useAuth";
import Spinner from "@/src/components/ui/Spinner";

const HomePage = () => {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isLoading) return;
    router.replace(user ? "/dashboard" : "/login");
  }, [user, isLoading, router]);

  return (
    <div className="flex h-screen items-center justify-center">
      <Spinner />
    </div>
  );
};

export default HomePage;
