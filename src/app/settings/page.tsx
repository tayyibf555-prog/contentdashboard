import { TopBar } from "@/components/layout/top-bar";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { VoiceSettingsEditor } from "./voice-settings-editor";

export default async function SettingsPage() {
  const supabase = await createServerSupabaseClient();

  const { data: businessVoice } = await supabase
    .from("voice_settings")
    .select("*")
    .eq("account_type", "business")
    .maybeSingle();

  const { data: personalVoice } = await supabase
    .from("voice_settings")
    .select("*")
    .eq("account_type", "personal")
    .maybeSingle();

  return (
    <div>
      <TopBar
        title="Voice Settings"
        subtitle="Train the AI to match your brand voice"
      />
      <div className="grid grid-cols-2 gap-6">
        <VoiceSettingsEditor
          accountType="business"
          label="Business (@azen_ai)"
          settings={businessVoice}
        />
        <VoiceSettingsEditor
          accountType="personal"
          label="Personal (@tayyib.ai)"
          settings={personalVoice}
        />
      </div>
    </div>
  );
}
