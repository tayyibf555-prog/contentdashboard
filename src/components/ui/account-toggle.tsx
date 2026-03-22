"use client";

import { useAccount } from "@/lib/account-context";

export function AccountToggle() {
  const { account, setAccount } = useAccount();

  return (
    <div className="flex gap-2">
      <button
        onClick={() => setAccount("business")}
        className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
          account === "business"
            ? "bg-azen-accent text-azen-bg"
            : "bg-transparent text-azen-text border border-azen-border hover:text-white"
        }`}
      >
        Business
      </button>
      <button
        onClick={() => setAccount("personal")}
        className={`px-2 py-0.5 rounded text-[11px] font-semibold transition-colors ${
          account === "personal"
            ? "bg-azen-accent text-azen-bg"
            : "bg-transparent text-azen-text border border-azen-border hover:text-white"
        }`}
      >
        Personal
      </button>
    </div>
  );
}
