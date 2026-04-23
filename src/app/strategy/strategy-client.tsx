"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/empty-state";
import { StrategyCard } from "@/components/strategy/strategy-card";
import { StrategyForm } from "@/components/strategy/strategy-form";
import { BookOpen, Plus, Search } from "lucide-react";
import type { Strategy } from "@/types";

type Account = "personal" | "business";

export function StrategyClient({
  strategies,
  activePlatform,
  activeAccount,
}: {
  strategies: Strategy[];
  activePlatform: Strategy["platform"];
  activeAccount: Account;
}) {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [accountFilter, setAccountFilter] = useState<Account>(activeAccount);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Strategy | null>(null);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return strategies
      .filter((s) => s.account === accountFilter || s.account === "both")
      .filter((s) => {
        if (!q) return true;
        return (
          s.title.toLowerCase().includes(q) ||
          s.summary.toLowerCase().includes(q) ||
          s.why_it_works.toLowerCase().includes(q) ||
          s.category.toLowerCase().includes(q)
        );
      });
  }, [strategies, accountFilter, search]);

  async function archive(s: Strategy) {
    if (!confirm(`Archive "${s.title}"? It can be unarchived from the database if needed.`)) return;
    await fetch(`/api/strategies/${s.id}`, { method: "DELETE" });
    router.refresh();
  }

  function openAdd() {
    setEditing(null);
    setFormOpen(true);
  }
  function openEdit(s: Strategy) {
    setEditing(s);
    setFormOpen(true);
  }
  function onSaved() {
    setFormOpen(false);
    router.refresh();
  }

  const PlatformLabel: Record<Strategy["platform"], string> = {
    instagram: "Instagram",
    linkedin: "LinkedIn",
    twitter: "Twitter / X",
    youtube: "YouTube",
  };

  return (
    <div>
      {/* Account toggle + search + add */}
      <div className="flex flex-wrap items-center gap-3 mb-6">
        <div className="inline-flex items-center gap-0 p-0.5 rounded-lg bg-azen-surface-2 border border-azen-line">
          {(["personal", "business"] as const).map((a) => (
            <button
              key={a}
              onClick={() => setAccountFilter(a)}
              className={`px-3 py-1.5 rounded-md text-[11.5px] font-semibold transition-all duration-200 ${
                accountFilter === a
                  ? "bg-azen-accent text-azen-bg shadow-accent"
                  : "text-azen-text hover:text-white"
              }`}
            >
              {a.charAt(0).toUpperCase() + a.slice(1)}
            </button>
          ))}
        </div>

        <div className="flex-1 min-w-[200px] max-w-sm flex items-center gap-2 bg-azen-surface border border-azen-line rounded-md px-3 py-2 focus-within:border-azen-accent transition-colors">
          <Search size={13} className="text-azen-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search strategies…"
            className="flex-1 bg-transparent text-[12px] text-white placeholder-azen-muted focus:outline-none"
          />
          {search && <span className="text-[10px] font-mono text-azen-muted">{filtered.length}</span>}
        </div>

        <Button variant="primary" size="md" onClick={openAdd} className="ml-auto">
          <Plus size={13} /> Add strategy
        </Button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<BookOpen size={20} />}
          title={`No ${accountFilter} strategies for ${PlatformLabel[activePlatform]} yet`}
          body={
            search
              ? "Nothing matches that search. Clear the search box or switch account."
              : strategies.length === 0
                ? "This platform doesn't have any strategies yet — add one or run the seed script."
                : "Switch to the other account to see more plays."
          }
          action={
            <Button variant="primary" size="md" onClick={openAdd}>
              <Plus size={13} /> Add one
            </Button>
          }
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 stagger">
          {filtered.map((s) => (
            <StrategyCard key={s.id} strategy={s} onEdit={openEdit} onArchive={archive} />
          ))}
        </div>
      )}

      <StrategyForm open={formOpen} onClose={() => setFormOpen(false)} initial={editing} onSaved={onSaved} />
    </div>
  );
}
