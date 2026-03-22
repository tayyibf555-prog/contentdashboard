"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import type { TrackedAccount } from "@/types";

export function TrackedAccountsList({ accounts }: { accounts: TrackedAccount[] }) {
  const [filter, setFilter] = useState<"all" | "leader" | "competitor" | "other">("all");
  const [showModal, setShowModal] = useState(false);

  const filtered = filter === "all" ? accounts : accounts.filter((a) => a.category === filter);

  return (
    <div>
      {/* Tabs */}
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
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 gap-3">
        {filtered.map((account) => (
          <Card key={account.id} border={account.category === "competitor" ? "#ff7675" : undefined}>
            <div className="flex justify-between items-start mb-2">
              <div>
                <div className="text-white text-sm font-semibold">{account.name}</div>
                <span className={`text-[9px] font-semibold ${
                  account.category === "competitor" ? "text-red-400" : "text-azen-accent"
                }`}>
                  {account.category.toUpperCase()}
                </span>
              </div>
              <div className="flex gap-1">
                <Button variant="secondary">Edit</Button>
                <Button variant="icon">x</Button>
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
          </Card>
        ))}
      </div>

      {filtered.length === 0 && (
        <p className="text-azen-text text-sm text-center mt-8">
          No tracked accounts{filter !== "all" ? ` in "${filter}" category` : ""}. Add one to start scraping.
        </p>
      )}

      {/* Add Account Modal */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Add Tracked Account">
        <form className="space-y-3">
          <div>
            <label className="text-azen-text text-[11px] block mb-1">Name</label>
            <input className="w-full bg-azen-bg border border-azen-border rounded-md px-3 py-2 text-white text-xs" />
          </div>
          <div>
            <label className="text-azen-text text-[11px] block mb-1">Category</label>
            <select className="w-full bg-azen-bg border border-azen-border rounded-md px-3 py-2 text-white text-xs">
              <option value="leader">Leader</option>
              <option value="competitor">Competitor</option>
              <option value="other">Other</option>
            </select>
          </div>
          <div>
            <label className="text-azen-text text-[11px] block mb-1">Instagram Handle</label>
            <input className="w-full bg-azen-bg border border-azen-border rounded-md px-3 py-2 text-white text-xs" placeholder="@handle" />
          </div>
          <div>
            <label className="text-azen-text text-[11px] block mb-1">LinkedIn URL</label>
            <input className="w-full bg-azen-bg border border-azen-border rounded-md px-3 py-2 text-white text-xs" placeholder="Profile URL" />
          </div>
          <div>
            <label className="text-azen-text text-[11px] block mb-1">Twitter/X Handle</label>
            <input className="w-full bg-azen-bg border border-azen-border rounded-md px-3 py-2 text-white text-xs" placeholder="@handle" />
          </div>
          <div>
            <label className="text-azen-text text-[11px] block mb-1">YouTube Channel</label>
            <input className="w-full bg-azen-bg border border-azen-border rounded-md px-3 py-2 text-white text-xs" placeholder="@channel" />
          </div>
          <Button variant="primary" className="w-full">Add Account</Button>
        </form>
      </Modal>
    </div>
  );
}
