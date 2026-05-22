"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { apiGet, apiPost } from "@/lib/api";
import { PasswordField } from "@/components/PasswordField";
import { PasswordRules } from "@/components/PasswordRules";
import { AuthButton } from "@/components/AuthButton";
import { useSignupSuccess } from "../layout";

const FIELD_LABELS = {
  password: "Password",
  email: "Email",
  username: "Username",
  full_name: "Full name",
  confirm_password: "Confirm password",
  university: "University",
};

function formatValidationError(fieldErrors) {
  const first = fieldErrors?.[0];
  if (!first) return "Please check the form and try again.";
  const field = first.loc?.[first.loc.length - 1];
  const label = FIELD_LABELS[field] || "Field";
  return `${label}: ${first.msg || "invalid value."}`;
}

function UsernameStatus({ status }) {
  if (!status) return null;
  const config = {
    invalid: {
      cls: "text-red-600",
      text: "3–30 characters, letters / numbers / underscore only.",
    },
    checking: { cls: "text-gray-500", text: "Checking availability…" },
    available: { cls: "text-green-700", text: "Available" },
    taken: { cls: "text-red-600", text: "Already taken — pick another." },
  }[status];
  if (!config) return null;
  return (
    <p className={`mt-2 flex items-center gap-2 text-xs ${config.cls}`}>
      {status === "checking" ? (
        <span className="block h-1.5 w-1.5 flex-shrink-0 animate-pulse rounded-full bg-gray-400" />
      ) : status === "available" ? (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="h-3.5 w-3.5 flex-shrink-0"
        >
          <path d="M5 13l4 4L19 7" />
        </svg>
      ) : (
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="3"
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="h-3.5 w-3.5 flex-shrink-0"
        >
          <line x1="6" y1="6" x2="18" y2="18" />
          <line x1="18" y1="6" x2="6" y2="18" />
        </svg>
      )}
      <span>{config.text}</span>
    </p>
  );
}

function Field({ id, label, type, required, value, onChange, hint, autoComplete }) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1 block text-sm font-medium text-gray-700"
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        required={required}
        value={value}
        onChange={onChange}
        autoComplete={autoComplete}
        className="w-full rounded-lg border border-gray-300 px-4 py-3 text-sm focus:border-black focus:outline-none focus:ring-1 focus:ring-black"
      />
      {hint && <p className="mt-1 text-xs text-gray-500">{hint}</p>}
    </div>
  );
}

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    confirm_password: "",
    university: "",
    username: "",
  });
  const [error, setError] = useState(null);
  const [state, setState] = useState("idle"); // 'idle' | 'loading' | 'success'
  const [usernameStatus, setUsernameStatus] = useState(null); // null | 'invalid' | 'checking' | 'available' | 'taken'
  const { setSignupSuccess, setPasswordFocused } = useSignupSuccess();

  const update = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  useEffect(() => {
    const u = form.username;
    if (!u) {
      setUsernameStatus(null);
      return undefined;
    }
    if (!/^[A-Za-z0-9_]{3,30}$/.test(u)) {
      setUsernameStatus("invalid");
      return undefined;
    }
    setUsernameStatus("checking");
    const t = setTimeout(async () => {
      try {
        const data = await apiGet(
          `/auth/username-available?username=${encodeURIComponent(u)}`,
        );
        setUsernameStatus(data?.available ? "available" : "taken");
      } catch {
        // Soft-fail: leave it ambiguous rather than alarming the user.
        setUsernameStatus(null);
      }
    }, 400);
    return () => clearTimeout(t);
  }, [form.username]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (form.password !== form.confirm_password) {
      setError({ message: "Passwords don't match." });
      return;
    }
    setState("loading");
    try {
      const payload = {
        full_name: form.full_name,
        email: form.email,
        password: form.password,
      };
      if (form.university) payload.university = form.university;
      if (form.username) payload.username = form.username;
      await apiPost("/auth/register", payload);
      setSignupSuccess(true);
      setState("success");
      setTimeout(
        () =>
          router.push(`/verify-otp?email=${encodeURIComponent(form.email)}`),
        2600,
      );
    } catch (err) {
      setState("idle");
      if (err.code === "email_already_registered") {
        setError({
          message: "This email is already registered.",
          action: { href: "/login", label: "Log in instead." },
        });
      } else if (err.code === "username_taken") {
        setError({
          message:
            "That username is already taken. Try another, or leave it blank for a random one.",
        });
      } else if (err.code === "validation_error") {
        setError({ message: formatValidationError(err.fieldErrors) });
      } else {
        setError({ message: err.message });
      }
    }
  };

  return (
    <>
      <h1 className="mb-2 text-2xl font-bold text-black">
        Create your account
      </h1>
      <p className="mb-6 text-sm text-gray-600">
        Private, judgment-free, made for students.
      </p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Field
          id="full_name"
          label="Full name"
          type="text"
          required
          value={form.full_name}
          onChange={update("full_name")}
          autoComplete="name"
        />
        <Field
          id="email"
          label="Email"
          type="email"
          required
          value={form.email}
          onChange={update("email")}
          autoComplete="email"
        />
        <div
          onFocusCapture={() => setPasswordFocused(true)}
          onBlurCapture={(e) => {
            // Only flip off when focus actually leaves this wrapper entirely
            // (e.g. eye-toggle click inside should keep it on).
            if (!e.currentTarget.contains(e.relatedTarget)) {
              setPasswordFocused(false);
            }
          }}
        >
          <div className="group">
            <PasswordField
              id="password"
              label="Password"
              required
              value={form.password}
              onChange={update("password")}
              autoComplete="new-password"
            />
            <div className="hidden group-focus-within:block">
              <PasswordRules password={form.password} />
            </div>
          </div>
          <div className="mt-4">
            <PasswordField
              id="confirm_password"
              label="Confirm password"
              required
              value={form.confirm_password}
              onChange={update("confirm_password")}
              autoComplete="new-password"
            />
          {form.confirm_password && (
            <p
              className={`mt-2 flex items-center gap-2 text-xs ${
                form.password === form.confirm_password
                  ? "text-green-700"
                  : "text-red-600"
              }`}
            >
              {form.password === form.confirm_password ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="h-3.5 w-3.5 flex-shrink-0"
                >
                  <path d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="3"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  aria-hidden="true"
                  className="h-3.5 w-3.5 flex-shrink-0"
                >
                  <line x1="6" y1="6" x2="18" y2="18" />
                  <line x1="18" y1="6" x2="6" y2="18" />
                </svg>
              )}
              <span>
                {form.password === form.confirm_password
                  ? "Passwords match"
                  : "Passwords don't match"}
              </span>
            </p>
          )}
          </div>
        </div>
        <div>
          <Field
            id="username"
            label="Username (optional)"
            type="text"
            value={form.username}
            onChange={update("username")}
            autoComplete="username"
            hint="Leave blank and we'll give you a random one — for forums and chat. You can change it later."
          />
          <UsernameStatus status={usernameStatus} />
        </div>
        <Field
          id="university"
          label="University (optional)"
          type="text"
          value={form.university}
          onChange={update("university")}
          autoComplete="organization"
        />

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
          idleLabel="Create account"
          loadingLabel="Creating account…"
          successLabel="Account created!"
        />
      </form>

      <p className="mt-6 text-center text-sm text-gray-600">
        Already have an account?{" "}
        <Link href="/login" className="font-semibold text-black hover:underline">
          Log in
        </Link>
      </p>

    </>
  );
}
