"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { VoiceSettings } from "@/types";

export function VoiceSettingsEditor({
  accountType,
  label,
  settings,
}: {
  accountType: "business" | "personal";
  label: string;
  settings: VoiceSettings | null;
}) {
  const [toneGuidelines, setToneGuidelines] = useState(settings?.tone_guidelines || "");
  const [writingSamples, setWritingSamples] = useState(settings?.writing_samples?.join("\n---\n") || "");
  const [avoidWords, setAvoidWords] = useState(settings?.avoid_words?.join(", ") || "");
  const [preferredWords, setPreferredWords] = useState(settings?.preferred_words?.join(", ") || "");
  const [preview, setPreview] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleTest() {
    setLoading(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: "linkedin",
          account: accountType,
          pillar: "education",
          contentType: "short",
          researchContext: "Test voice preview",
        }),
      });
      const data = await res.json();
      setPreview(data.parsed?.body || data.content?.body || "Preview generation failed");
    } catch {
      setPreview("Failed to generate preview");
    }
    setLoading(false);
  }

  return (
    <Card>
      <h3 className="text-white text-sm font-semibold mb-4">{label}</h3>

      <div className="space-y-4">
        <div>
          <label className="text-azen-text text-[11px] block mb-1">Tone Guidelines</label>
          <textarea
            value={toneGuidelines}
            onChange={(e) => setToneGuidelines(e.target.value)}
            rows={3}
            placeholder="e.g., Professional but approachable, avoid jargon, be direct..."
            className="w-full bg-azen-bg border border-azen-border rounded-md px-3 py-2 text-white text-xs resize-none focus:outline-none focus:border-azen-accent placeholder:text-azen-text"
          />
        </div>

        <div>
          <label className="text-azen-text text-[11px] block mb-1">Writing Samples (separate with ---)</label>
          <textarea
            value={writingSamples}
            onChange={(e) => setWritingSamples(e.target.value)}
            rows={5}
            placeholder="Paste examples of your writing style here..."
            className="w-full bg-azen-bg border border-azen-border rounded-md px-3 py-2 text-white text-xs resize-none focus:outline-none focus:border-azen-accent placeholder:text-azen-text"
          />
        </div>

        <div>
          <label className="text-azen-text text-[11px] block mb-1">Words to Avoid (comma-separated)</label>
          <input
            value={avoidWords}
            onChange={(e) => setAvoidWords(e.target.value)}
            placeholder="e.g., synergy, leverage, cutting-edge"
            className="w-full bg-azen-bg border border-azen-border rounded-md px-3 py-2 text-white text-xs focus:outline-none focus:border-azen-accent placeholder:text-azen-text"
          />
        </div>

        <div>
          <label className="text-azen-text text-[11px] block mb-1">Preferred Words (comma-separated)</label>
          <input
            value={preferredWords}
            onChange={(e) => setPreferredWords(e.target.value)}
            placeholder="e.g., practical, measurable, implementation"
            className="w-full bg-azen-bg border border-azen-border rounded-md px-3 py-2 text-white text-xs focus:outline-none focus:border-azen-accent placeholder:text-azen-text"
          />
        </div>

        <div className="flex gap-2">
          <Button variant="primary">Save Settings</Button>
          <Button variant="secondary" onClick={handleTest} disabled={loading}>
            {loading ? "Generating..." : "Preview & Test"}
          </Button>
        </div>

        {preview && (
          <div className="mt-3 border-l-2 border-azen-accent pl-3">
            <div className="text-azen-text text-[10px] uppercase tracking-wider mb-1">Voice Preview</div>
            <div className="text-white text-xs leading-relaxed whitespace-pre-wrap">{preview}</div>
          </div>
        )}
      </div>
    </Card>
  );
}
