"use client";

import Link from "next/link";

const TABS = [
  { key: "all", label: "All" },
  { key: "instagram", label: "Instagram" },
  { key: "youtube", label: "YouTube" },
  { key: "twitter", label: "Twitter/X" },
  { key: "linkedin", label: "LinkedIn" },
] as const;

export function PlatformTabs({ active, counts }: { active: string; counts: Record<string, number> }) {
  return (
    <div className="flex gap-2 mb-4 flex-wrap">
      {TABS.map((t) => {
        const href = t.key === "all" ? "/research" : `/research?platform=${t.key}`;
        const isActive = active === t.key || (t.key === "all" && !active);
        const count = t.key === "all"
          ? Object.values(counts).reduce((a, b) => a + b, 0)
          : (counts[t.key] || 0);
        return (
          <Link
            key={t.key}
            href={href}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors flex items-center gap-1.5 ${
              isActive
                ? "bg-azen-accent text-azen-bg"
                : "bg-azen-card text-azen-text border border-azen-border hover:text-white"
            }`}
          >
            {t.label}
            <span className={`text-[10px] px-1.5 py-0.5 rounded ${isActive ? "bg-azen-bg/20 text-azen-bg" : "bg-azen-border text-azen-text"}`}>
              {count}
            </span>
          </Link>
        );
      })}
    </div>
  );
}
