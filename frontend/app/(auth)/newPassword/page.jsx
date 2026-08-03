"use client";

import { useState } from 'react';
import { useEffect } from 'react';
import { resetPassword } from "@/src/utils/api";
import React from 'react'
import Card from '@/src/components/ui/Card';
import Input from '@/src/components/ui/Input';
import Button from '@/src/components/ui/Button';
import useAuth from '@/src/hooks/useAuth';

const NewPassword = () => {

    const {resetPassword} = useAuth();
    const [form, setForm] = useState({ code:"", password: "" , confirmPassword: "" });
    const [error, setError]= useState("");
    const [isSubmitting, setIsSubmitting] = useState(false);
   const [email, setEmail] = useState("");

     useEffect(() => {
    setEmail(sessionStorage.getItem("resetEmail") || "");
     }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError("");

        if(!form.code.trim()){
            setError("Verification code is required");
            return;
        }

        if(!form.password){
            setError("Enter new password");
            return;
        }

        if(form.password !== form.confirmPassword){
            setError("Passwords do not match");
            return;
        } 

        try{
        await resetPassword({
            email,
            otp:form.otp,
            password:form.password
        });

        sessionStorage.removeItem("resetEmail");

        router.push("/login");

        } catch(err){
            setError(err.message);
        } finally{
            setIsSubmitting(false);
        }
    }
    
  return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
        <Card w-full max-w-sm>
            <h1 className="mb-6 text-xl font-bold text-gray-900">Reset Password</h1>
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
            id="code"
            label="Verification Code"
            type="text"
            value={form.code}
            onChange={(e) => setForm((prev) => ({ ...prev, code: e.target.value }))}
            required
            /> 
            <Input
            id="password"
            label="New Password"
            type="password"
            value={form.password}
            onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
            required
            />

            <Input
            id="confirmPassword"
            label="Confirm New Password"
            type="password"
            value={form.confirmPassword}
            onChange={(e) => setForm((prev) => ({ ...prev, confirmPassword: e.target.value }))}
            required
            />
             {error && (
            <p className="rounded-md bg-red-100 p-2 text-sm text-red-700">
             {error}
             </p>
              )}


            <Button type="submit" disabled={isSubmitting} className="w-full">
            {isSubmitting ? "Changing password..." : "Change Password"}
            </Button>
            </form>

        </Card>
      
    </div>
  )
}

export default NewPassword

