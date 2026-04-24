import { TopBar } from "@/components/layout/top-bar";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { TaskBoardClient } from "./task-board-client";
import type { Task } from "@/types";

export default async function TasksPage() {
  const supabase = await createServerSupabaseClient();

  const [{ data: tasks }, { data: linkableContent }] = await Promise.all([
    supabase.from("tasks").select("*").order("sort_order", { ascending: true }).order("created_at", { ascending: false }),
    supabase
      .from("generated_content")
      .select("id, title, platform, content_type")
      .in("status", ["pending", "approved", "scheduled", "draft"])
      .order("created_at", { ascending: false })
      .limit(100),
  ]);

  const openCount = (tasks || []).filter((t) => t.status !== "done").length;

  return (
    <div>
      <TopBar
        eyebrow="Workflow"
        title="Tasks."
        subtitle={`${openCount} open · drag between columns to move, click any card to edit.`}
      />
      <TaskBoardClient
        initialTasks={(tasks || []) as Task[]}
        linkableContent={(linkableContent || []) as Array<{ id: string; title: string; platform: string; content_type: string }>}
      />
    </div>
  );
}
