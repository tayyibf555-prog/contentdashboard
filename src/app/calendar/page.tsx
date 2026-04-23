import { TopBar } from "@/components/layout/top-bar";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { CalendarView } from "./calendar-view";

export default async function CalendarPage() {
  const supabase = await createServerSupabaseClient();

  // Fetch content for current month range
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();

  const { data: posts } = await supabase
    .from("generated_content")
    .select("*")
    .or(`scheduled_for.gte.${startOfMonth},created_at.gte.${startOfMonth}`)
    .order("scheduled_for", { ascending: true });

  return (
    <div>
      <TopBar
        eyebrow="Operations"
        title="Content calendar."
        subtitle="Drag any card to reschedule. Hover a day for a quick preview."
      />
      <CalendarView posts={posts || []} />
    </div>
  );
}
