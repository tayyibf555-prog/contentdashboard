"use client";

import { DndContext, DragEndEvent } from "@dnd-kit/core";
import { CalendarCell } from "./calendar-cell";
import type { GeneratedContent } from "@/types";

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export function MonthView({
  year,
  month,
  posts,
  onReschedule,
}: {
  year: number;
  month: number;
  posts: GeneratedContent[];
  onReschedule: (contentId: string, newDate: string) => void;
}) {
  // Build calendar grid
  const firstDay = new Date(year, month, 1);
  const lastDay = new Date(year, month + 1, 0);
  const startOffset = (firstDay.getDay() + 6) % 7; // Monday=0

  const dates: { date: string; isOtherMonth: boolean }[] = [];

  // Previous month padding
  for (let i = startOffset - 1; i >= 0; i--) {
    const d = new Date(year, month, -i);
    dates.push({ date: d.toISOString().split("T")[0], isOtherMonth: true });
  }
  // Current month
  for (let i = 1; i <= lastDay.getDate(); i++) {
    const d = new Date(year, month, i);
    dates.push({ date: d.toISOString().split("T")[0], isOtherMonth: false });
  }
  // Next month padding
  while (dates.length % 7 !== 0) {
    const d = new Date(year, month + 1, dates.length - startOffset - lastDay.getDate() + 1);
    dates.push({ date: d.toISOString().split("T")[0], isOtherMonth: true });
  }

  const today = new Date().toISOString().split("T")[0];

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;
    onReschedule(active.id as string, over.id as string);
  }

  function getPostsForDate(date: string) {
    return posts.filter((p) => p.scheduled_for?.startsWith(date));
  }

  return (
    <DndContext onDragEnd={handleDragEnd}>
      <div className="grid grid-cols-7 gap-1">
        {DAYS.map((day) => (
          <div key={day} className="text-center text-azen-text text-[10px] uppercase tracking-wider py-2">
            {day}
          </div>
        ))}
        {dates.map(({ date, isOtherMonth }) => (
          <CalendarCell
            key={date}
            date={date}
            posts={getPostsForDate(date)}
            isToday={date === today}
            isOtherMonth={isOtherMonth}
          />
        ))}
      </div>
    </DndContext>
  );
}
