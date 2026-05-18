import Link from "next/link";

export default function AuthLayout({ children }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-neutral-100 px-4 py-12">
      <div className="w-full max-w-md rounded-2xl bg-white p-8 shadow-xl md:p-10">
        <div className="mb-8 text-center">
          <Link
            href="/"
            className="text-4xl text-black [font-family:var(--font-script)]"
          >
            Logo
          </Link>
        </div>
        {children}
      </div>
    </main>
  );
}
