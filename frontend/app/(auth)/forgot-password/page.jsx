"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiPost } from "@/lib/api";
import { AuthButton } from "@/components/AuthButton";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [error, setError] = useState(null);
  const [state, setState] = useState("idle"); // 'idle' | 'loading' | 'success'

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setState("loading");
    try {
      await apiPost("/auth/resend-otp", { email, purpose: "password_reset" });
      setState("success");
      setTimeout(
        () => router.push(`/reset-password?email=${encodeURIComponent(email)}`),
        1000,
      );
    } catch (err) {
      setState("idle");
      setError({ message: err.message });
    }
  };

  return (
    <>
      <h1 className="mb-2 text-2xl font-bold text-black">Forgot password?</h1>
      <p className="mb-6 text-sm text-gray-600">
        Enter your email and we&apos;ll send a reset code if your account exists.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="email"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Email
          </label>
          <input
            id="email"
            type="email"
            required
            autoComplete="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
          />
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error.message}
          </div>
        )}

        <AuthButton
          state={state}
          idleLabel="Send reset code"
          loadingLabel="Sending…"
          successLabel="Code sent!"
        />
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Remembered it?{" "}
        <Link href="/login" className="font-semibold text-black hover:underline">
          Log in
        </Link>
      </p>
    </>
  );
}
