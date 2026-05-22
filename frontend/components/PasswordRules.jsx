"use client";

const RULES = [
  { key: "len", label: "At least 8 characters", test: (p) => p.length >= 8 },
  { key: "upper", label: "An uppercase letter", test: (p) => /[A-Z]/.test(p) },
  { key: "number", label: "A number", test: (p) => /\d/.test(p) },
  {
    key: "special",
    label: "A special character (!@#$%^&* …)",
    test: (p) => /[!@#$%^&*(),.?":{}|<>_\-]/.test(p),
  },
  {
    key: "space",
    label: "No spaces",
    test: (p) => p.length === 0 || !/\s/.test(p),
  },
];

function ruleClassName(passed, touched) {
  if (!touched) return "text-gray-400";
  if (passed) return "text-green-700";
  return "text-red-600";
}

function RuleIcon({ passed, touched }) {
  if (!touched) {
    return (
      <span className="block h-1.5 w-1.5 flex-shrink-0 rounded-full bg-gray-300" />
    );
  }
  if (passed) {
    return (
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
    );
  }
  return (
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
  );
}

export function PasswordRules({ password = "" }) {
  const touched = password.length > 0;
  return (
    <ul className="mt-2 space-y-1">
      {RULES.map((rule) => {
        const passed = rule.test(password);
        return (
          <li
            key={rule.key}
            className={`flex items-center gap-2 text-xs transition-colors ${ruleClassName(passed, touched)}`}
          >
            <RuleIcon passed={passed} touched={touched} />
            <span>{rule.label}</span>
          </li>
        );
      })}
    </ul>
  );
}
