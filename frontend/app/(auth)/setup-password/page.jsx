"use client";

import React from 'react'
import { useState, Suspense } from 'react';
import {useRouter,useSearchParams} from "next/navigation";
import { api } from "@/src/utils/api";


const SetupPasswordContent = () => {
    const router = useRouter();
  const searchParams = useSearchParams();

  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();

    setError("");
    setSuccess("");

    // Check token
    if (!token) {
      setError("Invalid or missing setup link.");
      return;
    }

    // Check password
    if (!password || !confirmPassword) {
      setError("Please enter both password fields.");
      return;
    }

    // Check password length
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    // Check passwords match
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      await api.post("/auth/setup-password", {
        token,
        newPassword: password,
      });

      setSuccess(
        "Password created successfully. Redirecting to login..."
      );

      setTimeout(() => {
        router.replace("/login");
      }, 1500);

    } catch (err) {
      setError(
        err.response?.data?.message ||
        err.message ||
        "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
   <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">

      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8">

        <h1 className="text-2xl font-bold text-center mb-2">
          Create Your Password
        </h1>

        <p className="text-gray-500 text-center mb-6">
          Complete your Question Hub account setup.
        </p>

        {error && (
          <div className="mb-4 rounded-lg bg-red-100 text-red-700 px-4 py-3 text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 rounded-lg bg-green-100 text-green-700 px-4 py-3 text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          {/* Password */}
          <div className="mb-4">

            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Password
            </label>

            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />

          </div>

          {/* Confirm Password */}
          <div className="mb-6">

            <label
              htmlFor="confirmPassword"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Confirm Password
            </label>

            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) =>
                setConfirmPassword(e.target.value)
              }
              placeholder="Confirm your password"
              className="w-full rounded-lg border border-gray-300 px-4 py-2.5 outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loading}
            />

          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-white font-medium hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Creating Password..." : "Create Password"}
          </button>

        </form>

      </div>

    </div>
  )
}

const SetupPassword = () => {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
          <div className="w-full max-w-md bg-white rounded-2xl shadow-lg p-8 text-center">
            <p className="text-sm text-gray-600">Loading...</p>
          </div>
        </div>
      }
    >
      <SetupPasswordContent />
    </Suspense>
  );
};

export default SetupPassword;
