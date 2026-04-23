"use client";

import { useMemo, useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { AccountQuickView } from "@/components/tracked-accounts/account-quickview";
import { addTrackedAccount, deleteTrackedAccount, updateTrackedAccount, seedAIIndustryAccounts } from "./actions";
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
      <div className="flex items-center gap-3 mb-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search by name or handle…"
          className="flex-1 max-w-md bg-azen-card border border-azen-border rounded-md px-3 py-2 text-xs text-white placeholder-azen-text/50 focus:outline-none focus:border-azen-accent"
        />
        {search && (
          <span className="text-[10px] text-azen-text">
            {filtered.length} match{filtered.length === 1 ? "" : "es"}
          </span>
        )}
      </div>
      <div className="flex gap-4 mb-6">
        {(["all", "leader", "competitor", "other"] as const).map((t) => (
          <button
            key={t}
            onClick={() => setFilter(t)}
            className={`text-xs font-semibold pb-1 border-b-2 transition-colors ${
              filter === t ? "text-azen-accent border-azen-accent" : "text-azen-text border-transparent hover:text-white"
            }`}
          >
            {t.charAt(0).toUpperCase() + t.slice(1)} ({t === "all" ? accounts.length : accounts.filter((a) => a.category === t).length})
          </button>
        ))}
        <div className="ml-auto flex gap-2">
          <button
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
            className="bg-azen-card border border-azen-border text-white px-3 py-1 rounded text-[11px] font-semibold disabled:opacity-50"
          >
            {seeding ? "Adding..." : "Populate AI Industry"}
          </button>
          <button
            onClick={openAdd}
            className="bg-azen-accent text-azen-bg px-3 py-1 rounded text-[11px] font-semibold"
          >
            + Add Account
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {filtered.map((account) => (
          <div
            key={account.id}
            onClick={() => setQuickView(account)}
            className="cursor-pointer"
          >
            <Card border={account.category === "competitor" ? "#ff7675" : undefined}>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <div className="text-white text-sm font-semibold">{account.name}</div>
                  <span className={`text-[9px] font-semibold ${
                    account.category === "competitor" ? "text-red-400" : "text-azen-accent"
                  }`}>
                    {account.category.toUpperCase()}
                  </span>
                </div>
                <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
                  <Button variant="secondary" onClick={() => openEdit(account)}>Edit</Button>
                  <Button variant="icon" onClick={() => handleDelete(account.id)} disabled={deleting === account.id}>
                    {deleting === account.id ? "..." : "x"}
                  </Button>
                </div>
              </div>
              <div className="flex gap-2 mb-2">
                {(account.platforms as string[]).map((p) => (
                  <span key={p} className="text-azen-text text-[10px]">{p}</span>
                ))}
              </div>
              <div className="text-azen-text text-[10px]">
                {Object.entries(account.handles as Record<string, string>).map(([platform, handle]) => (
                  <div key={platform}>{platform}: {handle}</div>
                ))}
              </div>
              <div className="text-[10px] text-azen-accent mt-2">Click to view top posts →</div>
            </Card>
          </div>
        ))}
      </div>

      <AccountQuickView account={quickView} onClose={() => setQuickView(null)} />

      {filtered.length === 0 && (
        <p className="text-azen-text text-sm text-center mt-8">
          No tracked accounts{filter !== "all" ? ` in "${filter}" category` : ""}. Add one to start scraping.
        </p>
      )}

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
