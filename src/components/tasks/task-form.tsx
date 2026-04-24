"use client";

import { useState, useEffect } from "react";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import type { Task } from "@/types";

type LinkableContent = { id: string; title: string; platform: string; content_type: string };

type FormState = {
  title: string;
  description: string;
  status: Task["status"];
  priority: Task["priority"];
  due_date: string;          // yyyy-mm-dd
  linked_content_id: string; // "" = none
};

const EMPTY: FormState = {
  title: "",
  description: "",
  status: "backlog",
  priority: "medium",
  due_date: "",
  linked_content_id: "",
};

export function TaskForm({
  open,
  onClose,
  onSaved,
  initial,
  linkableContent,
  defaultStatus = "backlog",
}: {
  open: boolean;
  onClose: () => void;
  onSaved: () => void;
  initial?: Task | null;
  linkableContent: LinkableContent[];
  defaultStatus?: Task["status"];
}) {
  const [form, setForm] = useState<FormState>(EMPTY);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (initial) {
      setForm({
        title: initial.title,
        description: initial.description || "",
        status: initial.status,
        priority: initial.priority,
        due_date: initial.due_date ? initial.due_date.slice(0, 10) : "",
        linked_content_id: initial.linked_content_id || "",
      });
    } else {
      setForm({ ...EMPTY, status: defaultStatus });
    }
    setError(null);
  }, [initial, open, defaultStatus]);

  async function save() {
    if (!form.title.trim()) return;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        status: form.status,
        priority: form.priority,
        due_date: form.due_date ? new Date(form.due_date).toISOString() : null,
        linked_content_id: form.linked_content_id || null,
      };
      const url = initial ? `/api/tasks/${initial.id}` : "/api/tasks";
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

  return (
    <Modal isOpen={open} onClose={onClose} title={initial ? "Edit task" : "New task"} size="md">
      <div className="space-y-4">
        <Input label="Title" value={form.title} onChange={(v) => setForm({ ...form, title: v })} placeholder="Record the AI-automation reel" autoFocus />

        <Textarea
          label="Description (optional)"
          value={form.description}
          onChange={(v) => setForm({ ...form, description: v })}
          rows={3}
          placeholder="Script, talking points, notes…"
        />

        <div className="grid grid-cols-3 gap-3">
          <Select label="Status" value={form.status} onChange={(v) => setForm({ ...form, status: v as Task["status"] })}>
            <option value="backlog">Backlog</option>
            <option value="todo">To do</option>
            <option value="in_progress">In progress</option>
            <option value="done">Done</option>
          </Select>
          <Select label="Priority" value={form.priority} onChange={(v) => setForm({ ...form, priority: v as Task["priority"] })}>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </Select>
          <Input label="Due date" value={form.due_date} onChange={(v) => setForm({ ...form, due_date: v })} type="date" />
        </div>

        {linkableContent.length > 0 && (
          <Select label="Link to a post (optional)" value={form.linked_content_id} onChange={(v) => setForm({ ...form, linked_content_id: v })}>
            <option value="">— none —</option>
            {linkableContent.map((c) => (
              <option key={c.id} value={c.id}>
                [{c.platform}·{c.content_type}] {c.title.slice(0, 70)}
              </option>
            ))}
          </Select>
        )}

        {error && <div className="text-[12px] text-red-400 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2">{error}</div>}

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-azen-line">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={save} disabled={!form.title.trim() || saving}>
            {saving ? "Saving…" : initial ? "Save changes" : "Create task"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function Label({ children }: { children: React.ReactNode }) {
  return <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-azen-muted mb-1.5">{children}</div>;
}

function Input({ label, value, onChange, placeholder, type = "text", autoFocus }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string; type?: string; autoFocus?: boolean }) {
  return (
    <div>
      <Label>{label}</Label>
      <input
        type={type}
        autoFocus={autoFocus}
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
