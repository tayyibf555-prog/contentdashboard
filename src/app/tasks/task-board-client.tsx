"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { TaskCard } from "@/components/tasks/task-card";
import { TaskForm } from "@/components/tasks/task-form";
import { Plus, Inbox } from "lucide-react";
import type { Task } from "@/types";

type LinkableContent = { id: string; title: string; platform: string; content_type: string };

const COLUMNS: Array<{ key: Task["status"]; label: string; accent: string }> = [
  { key: "backlog", label: "Backlog", accent: "#6A7592" },
  { key: "todo", label: "To do", accent: "#F3A01B" },
  { key: "in_progress", label: "In progress", accent: "#3B82F6" },
  { key: "done", label: "Done", accent: "#5ACB7B" },
];

const STATUS_ORDER: Task["status"][] = COLUMNS.map((c) => c.key);

export function TaskBoardClient({
  initialTasks,
  linkableContent,
}: {
  initialTasks: Task[];
  linkableContent: LinkableContent[];
}) {
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>(initialTasks);
  const [formOpen, setFormOpen] = useState(false);
  const [editing, setEditing] = useState<Task | null>(null);
  const [formDefaultStatus, setFormDefaultStatus] = useState<Task["status"]>("backlog");

  const linkedMap = useMemo(() => {
    const m = new Map<string, string>();
    for (const c of linkableContent) m.set(c.id, c.title);
    return m;
  }, [linkableContent]);

  const byStatus = useMemo(() => {
    const groups: Record<Task["status"], Task[]> = { backlog: [], todo: [], in_progress: [], done: [] };
    for (const t of tasks) groups[t.status].push(t);
    return groups;
  }, [tasks]);

  function openAdd(status: Task["status"] = "backlog") {
    setEditing(null);
    setFormDefaultStatus(status);
    setFormOpen(true);
  }

  function openEdit(t: Task) {
    setEditing(t);
    setFormOpen(true);
  }

  function onSaved() {
    setFormOpen(false);
    router.refresh();
  }

  async function updateTask(id: string, patch: Partial<Task>) {
    // Optimistic update
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, ...patch, updated_at: new Date().toISOString() } : t)));
    try {
      await fetch(`/api/tasks/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
    } catch (e) {
      console.error(e);
      router.refresh();
    }
  }

  async function deleteTask(t: Task) {
    if (!confirm(`Delete "${t.title}"?`)) return;
    setTasks((prev) => prev.filter((x) => x.id !== t.id));
    try {
      await fetch(`/api/tasks/${t.id}`, { method: "DELETE" });
    } catch (e) {
      console.error(e);
      router.refresh();
    }
  }

  function moveTask(t: Task, dir: 1 | -1) {
    const idx = STATUS_ORDER.indexOf(t.status);
    const nextIdx = Math.max(0, Math.min(STATUS_ORDER.length - 1, idx + dir));
    if (nextIdx === idx) return;
    updateTask(t.id, { status: STATUS_ORDER[nextIdx] });
  }

  return (
    <div>
      <div className="flex justify-end mb-4">
        <Button variant="primary" size="md" onClick={() => openAdd()}>
          <Plus size={13} /> New task
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 stagger">
        {COLUMNS.map((col) => {
          const columnTasks = byStatus[col.key];
          return (
            <div
              key={col.key}
              className="bg-white/[0.02] border border-white/[0.06] backdrop-blur-md rounded-lg p-3 min-h-[200px]"
            >
              <div className="flex items-center justify-between mb-3 px-1">
                <div className="inline-flex items-center gap-2">
                  <span
                    className="h-1.5 w-1.5 rounded-full"
                    style={{ backgroundColor: col.accent, boxShadow: `0 0 6px ${col.accent}aa` }}
                  />
                  <span className="text-[10.5px] font-semibold uppercase tracking-[0.2em] text-azen-text-strong">
                    {col.label}
                  </span>
                </div>
                <span className="text-[10px] font-mono text-azen-muted">{columnTasks.length}</span>
              </div>

              <div className="space-y-2">
                {columnTasks.length === 0 ? (
                  <div className="text-[11px] text-azen-muted flex items-center gap-1.5 py-4 px-2 rounded-md border border-dashed border-white/[0.08]">
                    <Inbox size={12} /> No tasks
                  </div>
                ) : (
                  columnTasks.map((t) => (
                    <TaskCard
                      key={t.id}
                      task={t}
                      linkedTitle={t.linked_content_id ? linkedMap.get(t.linked_content_id) : undefined}
                      onEdit={openEdit}
                      onDelete={deleteTask}
                      onMove={moveTask}
                    />
                  ))
                )}

                <button
                  onClick={() => openAdd(col.key)}
                  className="w-full text-[11px] text-azen-muted hover:text-white transition-colors py-1.5 border border-dashed border-white/[0.06] rounded-md hover:border-azen-accent/40 flex items-center justify-center gap-1"
                >
                  <Plus size={11} /> Add
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <TaskForm
        open={formOpen}
        onClose={() => setFormOpen(false)}
        initial={editing}
        linkableContent={linkableContent}
        defaultStatus={formDefaultStatus}
        onSaved={onSaved}
      />
    </div>
  );
}
