"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useState } from "react";
import { apiPost } from "@/lib/api";
import { AuthButton } from "@/components/AuthButton";
import { PasswordField } from "@/components/PasswordField";
import { PasswordRules } from "@/components/PasswordRules";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "";
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState(null);
  const [state, setState] = useState("idle"); // 'idle' | 'loading' | 'success'

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (newPassword !== confirmPassword) {
      setError({ message: "Passwords don't match." });
      return;
    }
    setState("loading");
    try {
      await apiPost("/auth/reset-password", {
        email,
        code,
        new_password: newPassword,
      });
      setState("success");
      setTimeout(() => router.push("/login"), 1200);
    } catch (err) {
      setState("idle");
      if (err.code === "invalid_otp") {
        setError({
          message: "That code is invalid or expired. Request a new one.",
          action: {
            href: `/forgot-password?email=${encodeURIComponent(email)}`,
            label: "Resend code.",
          },
        });
      } else if (err.code === "validation_error") {
        const first = err.fieldErrors?.[0];
        setError({
          message: first?.msg || "Please check the form and try again.",
        });
      } else {
        setError({ message: err.message });
      }
    }
  };

  return (
    <>
      <h1 className="mb-2 text-2xl font-bold text-black">Reset password</h1>
      <p className="mb-6 text-sm text-gray-600">
        Enter the code we sent to{" "}
        <span className="font-medium text-black">{email || "your email"}</span>{" "}
        and pick a new password.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label
            htmlFor="code"
            className="mb-1 block text-sm font-medium text-gray-700"
          >
            Verification code
          </label>
          <input
            id="code"
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            required
            value={code}
            onChange={(e) => setCode(e.target.value)}
            maxLength={12}
            className="w-full rounded-lg border border-gray-300 px-4 py-3 text-center text-lg tracking-widest focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
          />
        </div>

        <div className="group">
          <PasswordField
            id="new_password"
            label="New password"
            required
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            autoComplete="new-password"
          />
          <div className="hidden group-focus-within:block">
            <PasswordRules password={newPassword} />
          </div>
        </div>

        <div>
          <PasswordField
            id="confirm_password"
            label="Confirm new password"
            required
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            autoComplete="new-password"
          />
          {confirmPassword && (
            <p
              className={`mt-2 flex items-center gap-2 text-xs ${
                newPassword === confirmPassword
                  ? "text-green-700"
                  : "text-red-600"
              }`}
            >
              <span>
                {newPassword === confirmPassword
                  ? "✓ Passwords match"
                  : "✗ Passwords don't match"}
              </span>
            </p>
          )}
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
          idleLabel="Reset password"
          loadingLabel="Resetting…"
          successLabel="Password reset!"
        />
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        <Link href="/login" className="font-semibold text-black hover:underline">
          Back to log in
        </Link>
      </p>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetPasswordForm />
    </Suspense>
  );
}
