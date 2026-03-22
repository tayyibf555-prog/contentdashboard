"use client";

import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { CalendarCell } from "./calendar-cell";
import type { GeneratedContent } from "@/types";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function WeekView({
  weekStart,
  posts,
  onReschedule,
}: {
  weekStart: Date;
  posts: GeneratedContent[];
  onReschedule: (contentId: string, newDate: string) => void;
}) {
  const dates = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(weekStart);
    d.setDate(d.getDate() + i);
    return d.toISOString().split("T")[0];
  });

  const today = new Date().toISOString().split("T")[0];

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    const contentId = active.id as string;
    const newDate = over.id as string;
    onReschedule(contentId, newDate);
  }

  function getPostsForDate(date: string) {
    return posts.filter((p) => p.scheduled_for?.startsWith(date));
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-7 gap-2">
        {DAYS.map((day, i) => (
          <div key={day} className="text-center">
            <div className="text-azen-text text-[10px] uppercase tracking-wider mb-2">{day}</div>
            <div className="text-white text-xs mb-2">{new Date(dates[i]).getDate()}</div>
            <CalendarCell
              date={dates[i]}
              posts={getPostsForDate(dates[i])}
              isToday={dates[i] === today}
            />
          </div>
        ))}
      </div>
      {/* Week Summary */}
      <div className="mt-4 flex gap-4 text-[10px] text-azen-text">
        <span>Total: {posts.length} posts</span>
        <span>Pending: {posts.filter((p) => p.status === "pending").length}</span>
        <span>Approved: {posts.filter((p) => p.status === "approved").length}</span>
        <span>Posted: {posts.filter((p) => p.status === "posted").length}</span>
      </div>
    </DndContext>
  );
}
