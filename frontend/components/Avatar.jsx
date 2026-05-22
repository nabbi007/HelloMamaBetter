"use client";

// A small palette that always reads well against white text.
const AVATAR_COLORS = [
  "#2563EB", // blue-600
  "#7C3AED", // violet-600
  "#DB2777", // pink-600
  "#D97706", // amber-600
  "#059669", // emerald-600
  "#0891B2", // cyan-600
  "#DC2626", // red-600
  "#4F46E5", // indigo-600
  "#0D9488", // teal-600
  "#9333EA", // purple-600
];

function hashColor(seed) {
  if (!seed) return AVATAR_COLORS[0];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash << 5) - hash + seed.charCodeAt(i);
    hash |= 0;
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

function getInitials(name, fallback) {
  if (name) {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length >= 2) {
      return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
    }
    if (parts[0]) return parts[0].slice(0, 2).toUpperCase();
  }
  if (fallback) return fallback.slice(0, 2).toUpperCase();
  return "?";
}

export function Avatar({ user, size = 36, className = "" }) {
  const seed = user?.username || user?.email || "?";
  const initials = getInitials(user?.full_name, user?.username || user?.email);
  const bg = hashColor(seed);
  const fontSize = Math.round(size * 0.4);

  return (
    <span
      className={`inline-flex flex-shrink-0 items-center justify-center rounded-full font-semibold text-white ${className}`}
      style={{
        width: `${size}px`,
        height: `${size}px`,
        fontSize: `${fontSize}px`,
        backgroundColor: bg,
        letterSpacing: "0.02em",
      }}
      aria-hidden="true"
    >
      {initials}
    </span>
  );
}
