"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useContext, useMemo, useState } from "react";
import AuthShowcase from "@/components/AuthShowcase";
import SignupShowcase from "@/components/SignupShowcase";

const SignupSuccessContext = createContext({
  signupSuccess: false,
  setSignupSuccess: () => {},
  passwordFocused: false,
  setPasswordFocused: () => {},
});

export const useSignupSuccess = () => useContext(SignupSuccessContext);

export default function AuthLayout({ children }) {
  const pathname = usePathname();
  const [signupSuccess, setSignupSuccess] = useState(false);
  const [passwordFocused, setPasswordFocused] = useState(false);
  const isSignup = pathname === "/signup";

  const ctxValue = useMemo(
    () => ({
      signupSuccess,
      setSignupSuccess,
      passwordFocused,
      setPasswordFocused,
    }),
    [signupSuccess, passwordFocused],
  );

  return (
    <SignupSuccessContext.Provider value={ctxValue}>
      <main className="grid min-h-screen grid-cols-1 lg:grid-cols-2">
        {/* LEFT — form panel */}
        <div className="relative flex flex-col bg-white px-6 py-8 sm:px-10">
          {/* Logo top-left */}
          <Link
            href="/"
            className="inline-flex items-center gap-2 self-start text-lg font-bold tracking-[0.18em] text-black"
          >
            <span className="flex h-7 w-7 items-center justify-center rounded-md bg-black text-[10px] font-bold tracking-normal text-white">
              HMB
            </span>{" "}
            HelloMama
          </Link>

          {/* Centered form */}
          <div className="flex flex-1 items-center justify-center">
            <div className="w-full max-w-md">{children}</div>
          </div>

          {/* Footer mini-links */}
          <div className="mt-6 flex flex-wrap items-center justify-center gap-x-5 gap-y-2 text-xs text-gray-500">
            <Link href="/terms" className="hover:text-black hover:underline">
              Terms
            </Link>
            <Link href="/privacy" className="hover:text-black hover:underline">
              Privacy
            </Link>
            <Link href="/support" className="hover:text-black hover:underline">
              Support
            </Link>
            <span className="text-gray-400">© 2026 HelloMama</span>
          </div>
        </div>

        {/* RIGHT — bean/kidding visual on /signup, rotating showcase elsewhere */}
        {isSignup ? (
          <SignupShowcase
            success={signupSuccess}
            peeping={passwordFocused}
          />
        ) : (
          <AuthShowcase />
        )}
      </main>
    </SignupSuccessContext.Provider>
  );
}
