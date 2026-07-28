"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Input from "@/src/components/ui/Input";
import Select from "@/src/components/ui/Select";
import Button from "@/src/components/ui/Button";
import Card from "@/src/components/ui/Card";
import useAuth from "@/src/hooks/useAuth";

const ROLE_OPTIONS = [
  { value: "student", label: "Student" },
  { value: "teacher", label: "Teacher" },
];

const RegisterPage = () => {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "", role: "student" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const updateField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");
    setIsSubmitting(true);
    try {
      await register(form);
      router.push("/login");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-sm">
        <h1 className="mb-6 text-xl font-bold text-gray-900">Create your account</h1>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input id="name" label="Full name" value={form.name} onChange={(e) => updateField("name", e.target.value)} required />
          <Input id="email" label="Email" type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} required />
          <Input id="password" label="Password" type="password" value={form.password} onChange={(e) => updateField("password", e.target.value)} required />
          <Select id="role" label="Role" value={form.role} onChange={(e) => updateField("role", e.target.value)} options={ROLE_OPTIONS} />
          {error && <p className="text-sm text-red-600">{error}</p>}
          <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Creating account..." : "Create account"}
          </Button>
        </form>
        <p className="mt-4 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <Link href="/login" className="font-medium text-primary-600 hover:underline">
            Sign in
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default RegisterPage;
