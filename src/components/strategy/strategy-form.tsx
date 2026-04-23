"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { Plus, Trash2 } from "lucide-react";
import type { Strategy } from "@/types";

type FormState = {
  platform: Strategy["platform"];
  account: Strategy["account"];
  category: Strategy["category"];
  title: string;
  summary: string;
  when_to_use: string;
  how_to_apply: string[];
  example: string;
  why_it_works: string;
  sources: Array<{ title: string; url: string }>;
};

const EMPTY: FormState = {
  platform: "instagram",
  account: "personal",
  category: "hook",
  title: "",
  summary: "",
  when_to_use: "",
  how_to_apply: [""],
  example: "",
  why_it_works: "",
  sources: [],
};

export function StrategyForm({
  open,
  onClose,
  onSaved,
  initial,
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initial?: Strategy | null;
}) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initial) {
      setForm({
        platform: initial.platform,
        account: initial.account,
        category: initial.category,
        title: initial.title,
        summary: initial.summary,
        when_to_use: initial.when_to_use,
        how_to_apply: initial.how_to_apply.length ? initial.how_to_apply : [""],
        example: initial.example || "",
        why_it_works: initial.why_it_works,
        sources: initial.sources || [],
      });
    } else {
      setForm(EMPTY);
    }
    setError(null);
  }, [initial, open]);

  async function save() {
    setError(null);
    setSaving(true);
    try {
      const payload = {
        ...form,
        how_to_apply: form.how_to_apply.filter((s) => s.trim()),
        example: form.example.trim() || null,
        sources: form.sources.filter((s) => s.title.trim() && s.url.trim()),
      };
      const url = initial ? `/api/strategies/${initial.id}` : "/api/strategies";
      const method = initial ? "PATCH" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  const valid = form.title.trim() && form.summary.trim() && form.when_to_use.trim() && form.why_it_works.trim();

  return (
    <Modal isOpen={open} onClose={onClose} title={initial ? "Edit strategy" : "Add strategy"} size="lg">
      <div className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
        <div className="grid grid-cols-3 gap-3">
          <Select label="Platform" value={form.platform} onChange={(v) => setForm({ ...form, platform: v as Strategy["platform"] })}>
            <option value="instagram">Instagram</option>
            <option value="linkedin">LinkedIn</option>
            <option value="twitter">Twitter / X</option>
            <option value="youtube">YouTube</option>
          </Select>
          <Select label="Account" value={form.account} onChange={(v) => setForm({ ...form, account: v as Strategy["account"] })}>
            <option value="personal">Personal</option>
            <option value="business">Business</option>
            <option value="both">Both</option>
          </Select>
          <Select label="Category" value={form.category} onChange={(v) => setForm({ ...form, category: v as Strategy["category"] })}>
            <option value="hook">Hook</option>
            <option value="format">Format</option>
            <option value="engagement">Engagement</option>
            <option value="cadence">Cadence</option>
            <option value="distribution">Distribution</option>
            <option value="positioning">Positioning</option>
          </Select>
        </div>

        <Input label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} placeholder="Two-line title-card cover" />
        <Textarea label="Summary (1-2 line tl;dr)" value={form.summary} onChange={(v) => setForm({ ...form, summary: v })} rows={2} />
        <Textarea label="When to use" value={form.when_to_use} onChange={(v) => setForm({ ...form, when_to_use: v })} rows={2} />

        <div>
          <Label>How to apply (bullet steps)</Label>
          <div className="space-y-2">
            {form.how_to_apply.map((step, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={step}
                  onChange={(e) => {
                    const next = [...form.how_to_apply];
                    next[i] = e.target.value;
                    setForm({ ...form, how_to_apply: next });
                  }}
                  className="flex-1 bg-azen-bg border border-azen-line rounded-md px-3 py-2 text-[12.5px] text-white focus:outline-none focus:border-azen-accent"
                  placeholder={`Step ${i + 1}`}
                />
                <Button
                  variant="icon"
                  onClick={() => setForm({ ...form, how_to_apply: form.how_to_apply.filter((_, j) => j !== i) })}
                  aria-label="Remove"
                >
                  <Trash2 size={13} />
                </Button>
              </div>
            ))}
            <Button variant="ghost" size="sm" onClick={() => setForm({ ...form, how_to_apply: [...form.how_to_apply, ""] })}>
              <Plus size={12} /> Add step
            </Button>
          </div>
        </div>

        <Textarea label="Example (optional)" value={form.example} onChange={(v) => setForm({ ...form, example: v })} rows={3} placeholder="An example post, hook, or thread opening" />
        <Textarea label="Why it works" value={form.why_it_works} onChange={(v) => setForm({ ...form, why_it_works: v })} rows={3} />

        <div>
          <Label>Sources (title + URL)</Label>
          <div className="space-y-2">
            {form.sources.map((s, i) => (
              <div key={i} className="flex gap-2">
                <input
                  value={s.title}
                  onChange={(e) => {
                    const next = [...form.sources];
                    next[i] = { ...next[i], title: e.target.value };
                    setForm({ ...form, sources: next });
                  }}
                  placeholder="Source title"
                  className="w-2/5 bg-azen-bg border border-azen-line rounded-md px-3 py-2 text-[12.5px] text-white focus:outline-none focus:border-azen-accent"
                />
                <input
                  value={s.url}
                  onChange={(e) => {
                    const next = [...form.sources];
                    next[i] = { ...next[i], url: e.target.value };
                    setForm({ ...form, sources: next });
                  }}
                  placeholder="https://…"
                  className="flex-1 bg-azen-bg border border-azen-line rounded-md px-3 py-2 text-[12.5px] text-white focus:outline-none focus:border-azen-accent"
                />
                <Button
                  variant="icon"
                  onClick={() => setForm({ ...form, sources: form.sources.filter((_, j) => j !== i) })}
                  aria-label="Remove"
                >
                  <Trash2 size={13} />
                </Button>
              </div>
            ))}
            <Button variant="ghost" size="sm" onClick={() => setForm({ ...form, sources: [...form.sources, { title: "", url: "" }] })}>
              <Plus size={12} /> Add source
            </Button>
          </div>
        </div>

        {error && <div className="text-[12px] text-red-400 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2">{error}</div>}

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-azen-line">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={save} disabled={!valid || saving}>
            {saving ? "Saving…" : initial ? "Save changes" : "Add strategy"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-azen-muted mb-1.5">{children}</div>;
}

function Input({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div>
      <Label>{label}</Label>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-azen-bg border border-azen-line rounded-md px-3 py-2 text-[13px] text-white focus:outline-none focus:border-azen-accent"
      />
    </div>
  );
}

function Textarea({ label, value, onChange, rows = 3, placeholder }: { label: string; value: string; onChange: (v: string) => void; rows?: number; placeholder?: string }) {
  return (
    <div>
      <Label>{label}</Label>
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={rows}
        placeholder={placeholder}
        className="w-full bg-azen-bg border border-azen-line rounded-md px-3 py-2 text-[13px] text-white leading-relaxed focus:outline-none focus:border-azen-accent resize-none"
      />
    </div>
  );
}

function Select({ label, value, onChange, children }: { label: string; value: string; onChange: (v: string) => void; children: React.ReactNode }) {
  return (
    <div>
      <Label>{label}</Label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-azen-bg border border-azen-line rounded-md px-3 py-2 text-[13px] text-white focus:outline-none focus:border-azen-accent"
      >
        {children}
      </select>
    </div>
  );
}
