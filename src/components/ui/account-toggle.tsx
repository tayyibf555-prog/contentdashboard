"use client";

import { useAccount } from "@/lib/account-context";

export function AccountToggle() {
  const { account, setAccount } = useAccount();

  const cls = (on: boolean) =>
    `flex-1 py-1.5 rounded-md text-[11px] font-semibold transition-all duration-200 ${
      on
        ? "bg-azen-accent text-azen-bg shadow-accent"
        : "bg-transparent text-azen-text hover:text-white"
    }`;

  return (
    <div className="relative flex items-center gap-0 p-0.5 rounded-lg bg-azen-surface-2 border border-azen-line">
      <button onClick={() => setAccount("business")} className={cls(account === "business")}>Business</button>
      <button onClick={() => setAccount("personal")} className={cls(account === "personal")}>Personal</button>
    </div>
  );
}
