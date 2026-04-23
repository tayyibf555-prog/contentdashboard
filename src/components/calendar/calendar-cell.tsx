"use client";

import { useDroppable } from "@dnd-kit/core";
import { useDraggable } from "@dnd-kit/core";
import { PlatformBadge, StatusBadge } from "@/components/ui/badge";
import type { GeneratedContent } from "@/types";

function DraggablePost({ content }: { content: GeneratedContent }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: content.id,
  });

  const style = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)`, opacity: isDragging ? 0.5 : 1 }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      {...listeners}
      {...attributes}
      style={style}
      className="bg-azen-bg rounded p-1.5 mb-1 cursor-grab active:cursor-grabbing"
    >
      <div className="flex items-center gap-1 mb-0.5">
        <PlatformBadge platform={content.platform} />
        <StatusBadge status={content.status} />
      </div>
      <div className="text-white text-[9px] font-medium truncate">{content.title}</div>
    </div>
  );
}

export function CalendarCell({
  date,
  posts,
  isToday,
  isOtherMonth,
}: {
  date: string;
  posts: GeneratedContent[];
  isToday?: boolean;
  isOtherMonth?: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: date });
  const day = new Date(date).getDate();

  return (
    <div
      ref={setNodeRef}
      className={`min-h-[100px] border border-azen-border rounded-md p-2 transition-colors ${
        isOver ? "bg-azen-accent/10 border-azen-accent" : ""
      } ${isOtherMonth ? "opacity-40" : ""}`}
    >
      <div className={`text-[11px] font-semibold mb-1 ${isToday ? "text-white" : "text-azen-text"}`}>
        {day}
      </div>
      {posts.map((post) => (
        <DraggablePost key={post.id} content={post} />
      ))}
    </div>
  );
}
