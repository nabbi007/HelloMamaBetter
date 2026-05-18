"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { apiPost } from "@/lib/api";

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
    university: "",
    username: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const update = (field) => (e) =>
    setForm((f) => ({ ...f, [field]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const payload = {
        full_name: form.full_name,
        email: form.email,
        password: form.password,
      };
      if (form.university) payload.university = form.university;
      if (form.username) payload.username = form.username;
      await apiPost("/auth/register", payload);
      router.push(`/verify-otp?email=${encodeURIComponent(form.email)}`);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
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
        <Field
          id="password"
          label="Password"
          type="password"
          required
          value={form.password}
          onChange={update("password")}
          autoComplete="new-password"
          hint="8+ chars · uppercase · number · special character"
        />
        <Field
          id="username"
          label="Username (optional)"
          type="text"
          value={form.username}
          onChange={update("username")}
          autoComplete="username"
          hint="Leave blank and we'll give you a random one — for forums and chat. You can change it later."
        />
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
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full rounded-lg bg-black px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-neutral-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {loading ? "Creating account…" : "Create account"}
        </button>
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
