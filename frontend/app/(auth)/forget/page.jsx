"use client";

import { useState } from "react";
import Card from "@/src/components/ui/Card";
import Input from "@/src/components/ui/Input";
import Button from "@/src/components/ui/Button";
import Link from "next/link";
import useAuth from "@/src/hooks/useAuth";

const Forget = () => {
  const { forgetPassword } = useAuth();
  const [form, setForm] = useState({ email: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);

  const updateField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setIsSubmitting(true);
    try {
      await forgetPassword(form.email);
      setSent(true);
    } catch (err) {
      setError(err.message || "Failed to send reset link");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-sm p-4">
        <h1 className="mb-4 text-xl font-bold text-gray-900">Forgot your password?</h1>

        {sent ? (
          <div className="text-center">
            <p className="rounded-md bg-green-50 p-4 text-sm text-green-700 mb-4">
              Password reset link has been sent to your email. Please check your inbox.
            </p>
            <Link href="/login" className="inline-block text-sm font-medium text-indigo-600 hover:underline">
              Back to Login
            </Link>
          </div>
        ) : (
          <>
            <p className="mb-4 text-sm text-gray-600">
              Enter the email address associated with your account and we will send you a reset link.
            </p>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
              <Input
                id="email"
                label="Email"
                type="email"
                value={form.email}
                onChange={(e) => updateField("email", e.target.value)}
                required
              />
              {error && <p className="rounded-md bg-red-100 p-2 text-sm text-red-700">{error}</p>}
              <Button type="submit" disabled={isSubmitting} className="w-full">
                {isSubmitting ? "Sending..." : "Send Reset Link"}
              </Button>
            </form>
            <p className="mt-4 text-center text-sm text-gray-500">
              Back to{" "}
              <Link href="/login" className="font-medium text-indigo-600 hover:underline">
                Login
              </Link>
            </p>
          </>
        )}
      </Card>
    </div>
  );
};

export default Forget;
