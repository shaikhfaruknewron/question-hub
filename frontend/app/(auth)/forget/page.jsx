"use client";

import { useState } from 'react';
import { forgetPassword } from "@/src/utils/api";
import React from 'react'
import Card from "@/src/components/ui/Card";
import Input from '@/src/components/ui/Input';
import Button from '@/src/components/ui/Button';
import Link from 'next/link';
import useAuth from '@/src/hooks/useAuth';


const Forget = () => {
  const { forgetPassword } = useAuth();
  const [form, setForm] = useState({  email: "" });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const updateField = (field, value) => setForm((prev) => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setIsSubmitting(true);
    try {
        await forgotPassword(form.email);
        sessionStorage.setItem("resetEmail", form.email);
        router.push("/reset-password");
    } catch(err){
        setError(err.message);
    } finally{
        setIsSubmitting(false);
    }
}

  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
      <Card className="w-full max-w-sm">
      <h1 className="mb-6 text-xl font-bold text-gray-900">Forgot your password ?</h1>
      <h4 className="mb-4">Enter the email address you'd like your password reset information sent to</h4>
       <form onSubmit={handleSubmit} className="flex flex-col gap-4">
         <Input id="email" label="Email" type="email" value={form.email} onChange={(e) => updateField("email", e.target.value)} required />
         <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Sending..." : "Send"}
          </Button>
      </form>
      <p className="mt-4 text-center text-sm text-gray-500">
          Back to Login{" "}
          <Link href="/login" className="font-medium text-primary-600 hover:underline">
            Login
          </Link>
        </p>
      </Card>
    </div>
  );
};

export default Forget;
