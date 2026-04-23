"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type RecreationPlan = {
  format: "reel" | "carousel" | "post";
  topic: string;
  hook: string;
  structure: Array<{ slide_or_beat: string; on_screen_text?: string; voiceover?: string; notes?: string }>;
  engagement_mechanic: string;
  cta: string;
  shot_list_or_slide_notes: string;
  recording_tips?: string;
};

export function RecreateTab({ account }: { account: "business" | "personal" }) {
  const router = useRouter();
  const [mode, setMode] = useState<"url" | "description">("url");
  const [url, setUrl] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [plan, setPlan] = useState<RecreationPlan | null>(null);
  const [savedId, setSavedId] = useState<string | null>(null);

  async function submit() {
    setError(null);
    setPlan(null);
    setSavedId(null);
    setLoading(true);
    try {
      const body = mode === "url" ? { url, account } : { description, account };
      const res = await fetch("/api/recreate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setPlan(data.plan);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setLoading(false);
    }
  }

  async function saveAsDraft() {
    if (!plan) return;
    setSaving(true);
    setError(null);
    try {
      const body = mode === "url" ? { url, account, saveAsDraft: true } : { description, account, saveAsDraft: true };
      const res = await fetch("/api/recreate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setSavedId(data.draftId);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="max-w-4xl">
      {/* Input */}
      <div className="bg-azen-card border border-azen-border rounded-xl p-4 mb-6">
        <div className="flex gap-2 mb-3">
          <button
            onClick={() => setMode("url")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              mode === "url" ? "bg-azen-accent text-azen-bg" : "bg-azen-bg text-white border border-azen-border"
            }`}
          >
            From URL
          </button>
          <button
            onClick={() => setMode("description")}
            className={`px-3 py-1.5 rounded-md text-xs font-semibold transition-colors ${
              mode === "description" ? "bg-azen-accent text-azen-bg" : "bg-azen-bg text-white border border-azen-border"
            }`}
          >
            From description
          </button>
        </div>

        {mode === "url" ? (
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://www.instagram.com/reel/…"
            className="w-full bg-azen-bg border border-azen-border rounded-md px-3 py-2 text-sm text-white placeholder-azen-text/50 focus:outline-none focus:border-azen-accent"
          />
        ) : (
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={4}
            placeholder="Describe the post you saw — what it was about, what format, how they got engagement…"
            className="w-full bg-azen-bg border border-azen-border rounded-md px-3 py-2 text-sm text-white placeholder-azen-text/50 focus:outline-none focus:border-azen-accent resize-none"
          />
        )}

        <button
          onClick={submit}
          disabled={loading || (mode === "url" ? !url : !description)}
          className="mt-3 px-4 py-2 rounded-md text-xs font-semibold bg-azen-accent text-azen-bg hover:opacity-90 disabled:opacity-50"
        >
          {loading ? "Analyzing…" : "Get recreation plan"}
        </button>
      </div>

      {error && <div className="mb-4 text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-lg p-3">{error}</div>}

      {/* Plan output */}
      {plan && (
        <div className="bg-azen-card border border-azen-border rounded-xl p-5 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                plan.format === "reel" ? "bg-purple-500/20 text-purple-300" :
                plan.format === "carousel" ? "bg-azen-accent/20 text-azen-accent" : "bg-azen-border text-azen-text"
              }`}>{plan.format}</span>
              <span className="text-sm font-semibold text-white">{plan.topic}</span>
            </div>
            {savedId ? (
              <span className="text-xs text-azen-accent">Saved as draft</span>
            ) : (
              <button
                onClick={saveAsDraft}
                disabled={saving}
                className="px-3 py-1.5 rounded-md text-xs font-semibold bg-azen-accent text-azen-bg hover:opacity-90 disabled:opacity-50"
              >
                {saving ? "Saving…" : "Save as draft"}
              </button>
            )}
          </div>

          <Section label="Hook" body={plan.hook} italic />
          <Section label="Engagement mechanic" body={plan.engagement_mechanic} accent />

          <div>
            <div className="text-[10px] text-azen-text uppercase font-semibold mb-2">
              {plan.format === "carousel" ? "Slide outline" : "Reel beats"}
            </div>
            <ol className="space-y-2">
              {plan.structure.map((step, i) => (
                <li key={i} className="bg-azen-bg border border-azen-border rounded-md p-3">
                  <div className="text-xs font-semibold text-white mb-1">
                    {i + 1}. {step.slide_or_beat}
                  </div>
                  {step.on_screen_text && <div className="text-[11px] text-azen-accent mb-1">Text: {step.on_screen_text}</div>}
                  {step.voiceover && <div className="text-[11px] text-white/80 mb-1">VO: {step.voiceover}</div>}
                  {step.notes && <div className="text-[11px] text-azen-text">{step.notes}</div>}
                </li>
              ))}
            </ol>
          </div>

          <Section label="CTA" body={plan.cta} />
          <Section label={plan.format === "carousel" ? "Slide notes" : "Shot list"} body={plan.shot_list_or_slide_notes} />
          {plan.recording_tips && <Section label="Recording tips" body={plan.recording_tips} />}
        </div>
      )}
    </div>
  );
}

function Section({ label, body, italic, accent }: { label: string; body: string; italic?: boolean; accent?: boolean }) {
  return (
    <div>
      <div className="text-[10px] text-azen-text uppercase font-semibold mb-1">{label}</div>
      <div className={`text-sm ${accent ? "text-azen-accent" : "text-white/90"} ${italic ? "italic" : ""}`}>{body}</div>
    </div>
  );
}
