"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiPost } from "@/lib/api";
import { saveTokens } from "@/lib/auth";
import { useAuth } from "@/lib/AuthContext";
import { PasswordField } from "@/components/PasswordField";
import { AuthButton } from "@/components/AuthButton";

export default function LoginPage() {
  const router = useRouter();
  const { refresh } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);
  const [state, setState] = useState("idle"); // 'idle' | 'loading' | 'success'

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setState("loading");
    try {
      const tokens = await apiPost("/auth/login", { email, password });
      saveTokens(tokens);
      await refresh();
      setState("success");
      setTimeout(() => router.push("/"), 1000);
    } catch (err) {
      setState("idle");
      if (err.code === "invalid_credentials") {
        setError({ message: "Email or password is incorrect." });
      } else if (err.code === "account_not_verified") {
        setError({
          message: "Your email isn't verified yet.",
          action: {
            href: `/verify-otp?email=${encodeURIComponent(email)}`,
            label: "Verify it now.",
          },
        });
      } else if (err.code === "account_inactive") {
        setError({
          message: "Your account has been deactivated. Please contact support.",
        });
      } else {
        setError({ message: err.message });
      }
    }
  };

  return (
    <>
      <h1 className="mb-2 text-2xl font-bold text-black">Welcome back</h1>
      <p className="mb-6 text-sm text-gray-600">Log in to your account.</p>

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

        <div>
          <PasswordField
            id="password"
            label="Password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            autoComplete="current-password"
          />
          <p className="mt-1 text-right text-xs">
            <Link
              href="/forgot-password"
              className="font-medium text-gray-600 hover:text-black hover:underline"
            >
              Forgot password?
            </Link>
          </p>
        </div>

        {error && (
          <div
            role="alert"
            className="rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error.message}
            {error.action && (
              <>
                {" "}
                <Link
                  href={error.action.href}
                  className="font-semibold text-red-900 underline"
                >
                  {error.action.label}
                </Link>
              </>
            )}
          </div>
        )}

        <AuthButton
          state={state}
          idleLabel="Log in"
          loadingLabel="Logging in…"
          successLabel="Signed in!"
        />
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Don&apos;t have an account?{" "}
        <Link href="/signup" className="font-semibold text-black hover:underline">
          Sign up
        </Link>
      </p>

    </>
  );
}
