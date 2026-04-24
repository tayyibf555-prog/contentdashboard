"use client";

import { Pencil, Trash2, ArrowRight, ArrowLeft, CheckCircle2 } from "lucide-react";
import type { Task } from "@/types";

const PRIORITY_COLORS: Record<Task["priority"], string> = {
  low: "#6A7592",
  medium: "#F3A01B",
  high: "#EF4444",
};

const STATUS_ORDER: Task["status"][] = ["backlog", "todo", "in_progress", "done"];

export function TaskCard({
  task,
  linkedTitle,
  onEdit,
  onDelete,
  onMove,
}: {
  task: Task;
  linkedTitle?: string;
  onEdit: (t: Task) => void;
  onDelete: (t: Task) => void;
  onMove: (t: Task, dir: 1 | -1) => void;
}) {
  const idx = STATUS_ORDER.indexOf(task.status);
  const canPrev = idx > 0;
  const canNext = idx < STATUS_ORDER.length - 1;

  const due = task.due_date ? new Date(task.due_date) : null;
  const overdue = due && due < new Date() && task.status !== "done";
  const dueLabel = due
    ? due.toLocaleDateString(undefined, { month: "short", day: "numeric" })
    : null;

  return (
    <div className="group relative bg-white/[0.03] backdrop-blur-md border border-white/[0.06] rounded-lg p-3 hover:border-white/[0.14] hover:bg-white/[0.05] transition-all cursor-pointer">
      <div className="flex items-start gap-2 mb-2">
        <span
          className="h-1.5 w-1.5 rounded-full mt-1.5 flex-shrink-0"
          style={{ backgroundColor: PRIORITY_COLORS[task.priority], boxShadow: `0 0 6px ${PRIORITY_COLORS[task.priority]}88` }}
        />
        <button
          onClick={() => onEdit(task)}
          className="flex-1 min-w-0 text-left text-white text-[13px] font-semibold leading-snug tracking-tight"
        >
          {task.title}
        </button>
      </div>

      {task.description && (
        <div className="text-azen-text text-[11.5px] leading-relaxed line-clamp-2 mb-2">
          {task.description}
        </div>
      )}

      <div className="flex items-center flex-wrap gap-2">
        {dueLabel && (
          <span
            className={`inline-flex items-center gap-1 text-[10px] font-mono px-1.5 py-0.5 rounded ${
              overdue ? "bg-red-500/15 text-red-300 border border-red-500/30" : "bg-azen-surface-2 text-azen-text border border-azen-line"
            }`}
          >
            {overdue ? "overdue · " : ""}{dueLabel}
          </span>
        )}
        {linkedTitle && (
          <span className="text-[10px] text-azen-muted truncate max-w-[180px]" title={linkedTitle}>
            ↳ {linkedTitle}
          </span>
        )}
      </div>

      <div className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 absolute top-2 right-2">
        {canPrev && (
          <button
            onClick={(e) => { e.stopPropagation(); onMove(task, -1); }}
            className="h-6 w-6 rounded bg-azen-surface/70 border border-azen-line text-azen-text hover:text-white flex items-center justify-center"
            aria-label="Move back"
          >
            <ArrowLeft size={12} />
          </button>
        )}
        {canNext && (
          <button
            onClick={(e) => { e.stopPropagation(); onMove(task, 1); }}
            className="h-6 w-6 rounded bg-azen-surface/70 border border-azen-line text-azen-accent hover:bg-azen-accent/15 flex items-center justify-center"
            aria-label="Move forward"
          >
            {task.status === "in_progress" ? <CheckCircle2 size={12} /> : <ArrowRight size={12} />}
          </button>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onEdit(task); }}
          className="h-6 w-6 rounded bg-azen-surface/70 border border-azen-line text-azen-text hover:text-white flex items-center justify-center"
          aria-label="Edit"
        >
          <Pencil size={12} />
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); onDelete(task); }}
          className="h-6 w-6 rounded bg-azen-surface/70 border border-azen-line text-azen-text hover:text-red-400 flex items-center justify-center"
          aria-label="Delete"
        >
          <Trash2 size={12} />
        </button>
      </div>
    </div>
  );
}
