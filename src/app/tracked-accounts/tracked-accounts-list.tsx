"use client";

import { useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { AccountQuickView } from "@/components/tracked-accounts/account-quickview";
import { addTrackedAccount, deleteTrackedAccount, updateTrackedAccount, seedAIIndustryAccounts } from "./actions";
import { Search, ArrowUpRight, Trash2, Pencil } from "lucide-react";
import { PLATFORMS } from "@/lib/constants";
import type { TrackedAccount } from "@/types";

type FormData = {
  name: string;
  category: string;
  instagram: string;
  linkedin: string;
  twitter: string;
  youtube: string;
};

const emptyForm: FormData = { name: "", category: "leader", instagram: "", linkedin: "", twitter: "", youtube: "" };

export function TrackedAccountsList({ accounts }: { accounts: TrackedAccount[] }) {
  const [filter, setFilter] = useState<"all" | "leader" | "competitor" | "other">("all");
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormData>(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [seeding, setSeeding] = useState(false);
  const [quickView, setQuickView] = useState<TrackedAccount | null>(null);
  const [scraping, setScraping] = useState<{ current: string; done: number; total: number; errors: number } | null>(null);
  const cancelScrapeRef = useRef(false);
  const router = useRouter();

  async function scrapeAll() {
    const jobs: Array<{ account: TrackedAccount; platform: string; handle: string }> = [];
    for (const account of accounts) {
      const handles = (account.handles as Record<string, string>) || {};
      for (const [platform, handle] of Object.entries(handles)) {
        if (handle) jobs.push({ account, platform, handle });
      }
    }
    if (jobs.length === 0) {
      alert("No account handles to scrape.");
      return;
    }
    if (!confirm(`About to scrape ${jobs.length} account-platform combinations. This can take a while. Continue?`)) return;

    cancelScrapeRef.current = false;
    let errors = 0;
    setScraping({ current: "", done: 0, total: jobs.length, errors: 0 });

    for (let i = 0; i < jobs.length; i++) {
      if (cancelScrapeRef.current) break;
      const { account, platform, handle } = jobs[i];
      setScraping({ current: `${account.name} · ${platform}`, done: i, total: jobs.length, errors });
      try {
        const res = await fetch("/api/scrape", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ accountId: account.id, platform, handle }),
        });
        if (!res.ok) errors++;
      } catch {
        errors++;
      }
      setScraping({ current: `${account.name} · ${platform}`, done: i + 1, total: jobs.length, errors });
    }

    setScraping(null);
    router.refresh();
  }

  function cancelScrape() {
    cancelScrapeRef.current = true;
  }

  const filtered = useMemo(() => {
    const byCategory = filter === "all" ? accounts : accounts.filter((a) => a.category === filter);
    const q = search.trim().toLowerCase();
    if (!q) return byCategory;
    return byCategory.filter((a) => {
      if (a.name.toLowerCase().includes(q)) return true;
      const handles = a.handles as Record<string, string>;
      return Object.values(handles).some((h) => h && h.toLowerCase().includes(q));
    });
  }, [accounts, filter, search]);

  const openAdd = () => {
    setEditingId(null);
    setForm(emptyForm);
    setShowModal(true);
  };

  const openEdit = (account: TrackedAccount) => {
    const handles = account.handles as Record<string, string>;
    setEditingId(account.id);
    setForm({
      name: account.name,
      category: account.category,
      instagram: handles.instagram || "",
      linkedin: handles.linkedin || "",
      twitter: handles.twitter || "",
      youtube: handles.youtube || "",
    });
    setShowModal(true);
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) return;
    setSaving(true);
    try {
      if (editingId) {
        await updateTrackedAccount(editingId, form);
      } else {
        await addTrackedAccount(form);
      }
      setShowModal(false);
      setForm(emptyForm);
      setEditingId(null);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this tracked account and all its scraped data?")) return;
    setDeleting(id);
    try {
      await deleteTrackedAccount(id);
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to delete");
    } finally {
      setDeleting(null);
    }
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex-1 min-w-[240px] max-w-md flex items-center gap-2 bg-azen-surface border border-azen-line rounded-md px-3 py-2 focus-within:border-azen-accent transition-colors">
          <Search size={14} className="text-azen-muted" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or handle…"
            className="flex-1 bg-transparent text-[12px] text-white placeholder-azen-muted focus:outline-none"
          />
          {search && (
            <span className="text-[10px] font-mono text-azen-muted">
              {filtered.length}
            </span>
          )}
        </div>
        <div className="ml-auto flex gap-2">
          <Button variant={scraping ? "danger" : "secondary"} size="md" onClick={scraping ? cancelScrape : scrapeAll}>
            {scraping ? "Cancel scrape" : "Scrape all"}
          </Button>
          <Button
            variant="secondary"
            size="md"
            onClick={async () => {
              setSeeding(true);
              try {
                const result = await seedAIIndustryAccounts();
                alert(`Added ${result.added} accounts (${result.skipped} already existed)`);
              } catch (e) {
                alert(e instanceof Error ? e.message : "Failed to seed");
              } finally {
                setSeeding(false);
              }
            }}
            disabled={seeding}
          >
            {seeding ? "Adding…" : "Populate AI industry"}
          </Button>
          <Button variant="primary" size="md" onClick={openAdd}>+ Add account</Button>
        </div>
      </div>

      <div className="flex items-center gap-1 border-b border-azen-line mb-6">
        {(["all", "leader", "competitor", "other"] as const).map((t) => {
          const active = filter === t;
          const count = t === "all" ? accounts.length : accounts.filter((a) => a.category === t).length;
          return (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`relative px-3.5 py-2 text-[12px] font-semibold transition-colors ${
                active ? "text-white" : "text-azen-text hover:text-white"
              }`}
            >
              <span className="inline-flex items-center gap-1.5">
                {t.charAt(0).toUpperCase() + t.slice(1)}
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${active ? "bg-azen-accent/15 text-azen-accent" : "bg-azen-surface-2 text-azen-muted"}`}>
                  {count}
                </span>
              </span>
              {active && (
                <span className="absolute bottom-0 left-2 right-2 h-[2px] bg-azen-accent rounded-full" style={{ boxShadow: "0 0 12px rgba(0,212,170,0.6)" }} />
              )}
            </button>
          );
        })}
      </div>

      {scraping && (
        <div className="mb-6 rounded-lg bg-azen-surface border border-azen-line shadow-lift p-4">
          <div className="flex items-center justify-between gap-3 mb-2.5">
            <div className="inline-flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-azen-accent animate-pulse-dot" style={{ boxShadow: "0 0 8px rgba(0,212,170,0.8)" }} />
              <span className="text-[12px] text-white">
                Scraping <span className="text-azen-accent font-semibold">{scraping.current || "…"}</span>
              </span>
            </div>
            <div className="text-[11px] font-mono text-azen-text">
              {scraping.done} / {scraping.total}{scraping.errors > 0 ? ` · ${scraping.errors} errors` : ""}
            </div>
          </div>
          <div className="h-1 bg-azen-line rounded-full overflow-hidden">
            <div
              className="h-full bg-azen-accent transition-all duration-500 rounded-full"
              style={{ width: `${(scraping.done / scraping.total) * 100}%`, boxShadow: "0 0 12px rgba(0,212,170,0.6)" }}
            />
          </div>
        </div>
      )}

      {filtered.length === 0 ? (
        <div className="text-center py-16 text-azen-text text-sm">
          No tracked accounts{filter !== "all" ? ` in "${filter}" category` : ""}. Add one to start scraping.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 stagger">
          {filtered.map((account) => {
            const handles = account.handles as Record<string, string>;
            const activeHandles = Object.entries(handles).filter(([, v]) => v);
            const isCompetitor = account.category === "competitor";
            return (
              <div key={account.id} onClick={() => setQuickView(account)} className="cursor-pointer group">
                <Card variant="surface" interactive accent={isCompetitor} className="h-full flex flex-col">
                  <div className="flex items-start justify-between gap-3 mb-3">
                    <div className="min-w-0">
                      <div className="text-white text-[15px] font-semibold tracking-tight truncate">{account.name}</div>
                      <div className={`mt-0.5 text-[9px] font-semibold uppercase tracking-[0.2em] ${isCompetitor ? "text-red-300" : "text-azen-accent"}`}>
                        {account.category}
                      </div>
                    </div>
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                      <Button variant="icon" onClick={() => openEdit(account)} aria-label="Edit"><Pencil size={13} /></Button>
                      <Button variant="icon" onClick={() => handleDelete(account.id)} disabled={deleting === account.id} aria-label="Delete">
                        {deleting === account.id ? "…" : <Trash2 size={13} />}
                      </Button>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-1.5 mb-4">
                    {activeHandles.map(([platform, handle]) => {
                      const p = PLATFORMS[platform as keyof typeof PLATFORMS];
                      return (
                        <span
                          key={platform}
                          className="inline-flex items-center gap-1.5 bg-azen-surface-2 border border-azen-line px-2 py-1 rounded-md text-[10.5px] text-azen-text-strong"
                        >
                          <span
                            className="h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: p?.color || "#8892b0", boxShadow: `0 0 6px ${p?.color || "#8892b0"}88` }}
                          />
                          <span className="font-mono">{handle}</span>
                        </span>
                      );
                    })}
                  </div>

                  <div className="flex-1" />
                  <div className="flex items-center justify-between gap-3 pt-3 border-t border-azen-line">
                    <span className="text-[10px] font-mono text-azen-muted uppercase tracking-wider">
                      {activeHandles.length} {activeHandles.length === 1 ? "platform" : "platforms"}
                    </span>
                    <span className="inline-flex items-center gap-1 text-[11px] text-azen-accent font-semibold group-hover:gap-2 transition-all">
                      View top posts <ArrowUpRight size={12} />
                    </span>
                  </div>
                </Card>
              </div>
            );
          })}
        </div>
      )}

      <AccountQuickView account={quickView} onClose={() => setQuickView(null)} />

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={editingId ? "Edit Account" : "Add Tracked Account"}>
        <div className="space-y-3">
          <div>
            <label className="text-azen-text text-[11px] block mb-1">Name</label>
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full bg-azen-bg border border-azen-border rounded-md px-3 py-2 text-white text-xs" placeholder="e.g. Liam Ottley" />
          </div>
          <div>
            <label className="text-azen-text text-[11px] block mb-1">Category</label>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="w-full bg-azen-bg border border-azen-border rounded-md px-3 py-2 text-white text-xs">
              <option value="leader">Leader</option>
              <option value="competitor">Competitor</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="text-azen-text text-[11px] block mb-1">Instagram Handle</label>
            <input value={form.instagram} onChange={(e) => setForm({ ...form, instagram: e.target.value })} className="w-full bg-azen-bg border border-azen-border rounded-md px-3 py-2 text-white text-xs" placeholder="@handle" />
          </div>
          <div>
            <label className="text-azen-text text-[11px] block mb-1">LinkedIn</label>
            <input value={form.linkedin} onChange={(e) => setForm({ ...form, linkedin: e.target.value })} className="w-full bg-azen-bg border border-azen-border rounded-md px-3 py-2 text-white text-xs" placeholder="username" />
          </div>
          <div>
            <label className="text-azen-text text-[11px] block mb-1">Twitter/X Handle</label>
            <input value={form.twitter} onChange={(e) => setForm({ ...form, twitter: e.target.value })} className="w-full bg-azen-bg border border-azen-border rounded-md px-3 py-2 text-white text-xs" placeholder="@handle" />
          </div>
          <div>
            <label className="text-azen-text text-[11px] block mb-1">YouTube Channel</label>
            <input value={form.youtube} onChange={(e) => setForm({ ...form, youtube: e.target.value })} className="w-full bg-azen-bg border border-azen-border rounded-md px-3 py-2 text-white text-xs" placeholder="@channel" />
          </div>
          <button onClick={handleSubmit} disabled={saving || !form.name.trim()} className="w-full bg-azen-accent text-azen-bg px-3 py-2 rounded-md text-xs font-semibold disabled:opacity-50">
            {saving ? "Saving..." : editingId ? "Update Account" : "Add Account"}
          </button>
        </div>
      </Modal>
    </div>
  );
}
