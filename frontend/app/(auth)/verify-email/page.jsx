"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import Card from "@/src/components/ui/Card";
import Button from "@/src/components/ui/Button";
import Input from "@/src/components/ui/Input";
import useAuth from "@/src/hooks/useAuth";

const VerifyEmailContent = () => {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { verifyEmail, resendVerification } = useAuth();

  const token = searchParams.get("token");

  const [status, setStatus] = useState("verifying");
  const [message, setMessage] = useState("");
  const [email, setEmail] = useState("");
  const [isResending, setIsResending] = useState(false);

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Verification token is missing from URL");
      return;
    }

    let isMounted = true;
    verifyEmail(token)
      .then(() => {
        if (!isMounted) return;
        setStatus("success");
        setMessage("Your email has been successfully verified!");
      })
      .catch((err) => {
        if (!isMounted) return;
        setStatus("error");
        setMessage(err.message || "Invalid or expired verification token");
      });

    return () => {
      isMounted = false;
    };
  }, [token, verifyEmail]);

  const handleResend = async (e) => {
    e.preventDefault();
    if (!email) return;

    setIsResending(true);
    try {
      await resendVerification(email);
      setStatus("resent");
      setMessage("Verification link sent to your email.");
    } catch (err) {
      setMessage(err.message || "Failed to resend verification email");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-sm p-4">
        <h1 className="mb-4 text-xl font-bold text-gray-900 text-center">Email Verification</h1>

        {status === "verifying" && (
          <div className="text-center py-4">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-indigo-600 border-r-transparent mb-4"></div>
            <p className="text-sm text-gray-600">Verifying your email address...</p>
          </div>
        )}

        {status === "success" && (
          <div className="text-center">
            <p className="rounded-md bg-green-50 p-4 text-sm text-green-700 mb-4">{message}</p>
            <Button onClick={() => router.push("/login")} className="w-full">
              Proceed to Login
            </Button>
          </div>
        )}

        {status === "error" && (
          <div>
            <p className="rounded-md bg-red-50 p-4 text-sm text-red-700 mb-4">{message}</p>
            <form onSubmit={handleResend} className="flex flex-col gap-4">
              <Input
                id="resend-email"
                label="Enter email to resend link"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
              <Button type="submit" disabled={isResending} className="w-full">
                {isResending ? "Resending..." : "Resend Verification Email"}
              </Button>
            </form>
          </div>
        )}

        {status === "resent" && (
          <div className="text-center">
            <p className="rounded-md bg-blue-50 p-4 text-sm text-blue-700 mb-4">{message}</p>
            <Link href="/login" className="inline-block text-sm font-medium text-indigo-600 hover:underline">
              Back to Login
            </Link>
          </div>
        )}

        <div className="mt-4 text-center text-sm text-gray-500">
          Already verified?{" "}
          <Link href="/login" className="font-medium text-indigo-600 hover:underline">
            Login
          </Link>
        </div>
      </Card>
    </div>
  );
};

const VerifyEmail = () => {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
          <Card className="w-full max-w-sm p-4 text-center">
            <p className="text-sm text-gray-600">Loading...</p>
          </Card>
        </div>
      }
    >
      <VerifyEmailContent />
    </Suspense>
  );
};

export default VerifyEmail;
