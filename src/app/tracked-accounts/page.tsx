import { TopBar } from "@/components/layout/top-bar";
import { Card } from "@/components/ui/card";
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
        title="Tracked Accounts"
        subtitle="Manage the accounts you scrape for research"
        actions={
          <button className="bg-azen-accent text-azen-bg px-3.5 py-2 rounded-md text-xs font-semibold">
            Add Account
          </button>
        }
      />
      <TrackedAccountsList accounts={accounts || []} />
    </div>
  );
}
