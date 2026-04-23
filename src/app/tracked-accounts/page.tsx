import { TopBar } from "@/components/layout/top-bar";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { TrackedAccountsList } from "./tracked-accounts-list";

export default async function TrackedAccountsPage() {
  const supabase = await createServerSupabaseClient();

  const { data: accounts } = await supabase
    .from("tracked_accounts")
    .select("*")
    .order("created_at", { ascending: false });

  return (
    <div>
      <TopBar
        eyebrow="Operations"
        title="Tracked accounts."
        subtitle={`${accounts?.length || 0} creators and competitors feeding your research pipeline.`}
      />
      <TrackedAccountsList accounts={accounts || []} />
    </div>
  );
}
