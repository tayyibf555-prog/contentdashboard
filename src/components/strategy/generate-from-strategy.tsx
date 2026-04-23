"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { Button } from "@/components/ui/button";
import { BUSINESS_PILLARS, PERSONAL_PILLARS } from "@/lib/constants";
import type { Strategy } from "@/types";

const PLATFORM_TYPES: Record<Strategy["platform"], { label: string; value: string }[]> = {
  instagram: [
    { label: "Carousel", value: "carousel" },
    { label: "Reel Script", value: "reel" },
  ],
  linkedin: [
    { label: "Long-form Post", value: "long_form" },
    { label: "Short Post", value: "short" },
  ],
  twitter: [
    { label: "Tweet", value: "tweet" },
    { label: "Thread", value: "thread" },
  ],
  youtube: [{ label: "Video Script", value: "video_script" }],
};

export function GenerateFromStrategy({
  open,
  onClose,
  strategy,
}: {
  open: boolean;
  onClose: () => void;
  strategy: Strategy | null;
}) {
  const router = useRouter();
  const [contentType, setContentType] = useState(strategy ? PLATFORM_TYPES[strategy.platform][0].value : "carousel");
  // Default to the strategy's account (or personal if 'both')
  const [genAccount, setGenAccount] = useState<"business" | "personal">(
    strategy?.account === "business" ? "business" : "personal"
  );
  const [pillar, setPillar] = useState(genAccount === "business" ? "education" : "bts");
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!strategy) return null;

  const pillars = genAccount === "business" ? BUSINESS_PILLARS : PERSONAL_PILLARS;
  const contentTypes = PLATFORM_TYPES[strategy.platform];

  async function handleGenerate() {
    if (!strategy) return;
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform: strategy.platform,
          account: genAccount,
          pillar,
          contentType,
          strategyId: strategy.id,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      onClose();
      router.push(`/${strategy.platform}?account=${genAccount}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <Modal isOpen={open} onClose={onClose} size="md" title={`Generate from: ${strategy.title}`}>
      <div className="space-y-4">
        <div className="text-[12px] text-azen-text bg-azen-bg border border-azen-line rounded-md p-3 leading-relaxed">
          Claude will follow this strategy&apos;s hook pattern, format, and engagement mechanic. The draft lands in your {strategy.platform} pending queue.
        </div>

        <Field label="Account">
          <select
            value={genAccount}
            onChange={(e) => {
              const a = e.target.value as "business" | "personal";
              setGenAccount(a);
              setPillar(a === "business" ? "education" : "bts");
            }}
            className="w-full bg-azen-bg border border-azen-line rounded-md px-3 py-2 text-[13px] text-white focus:outline-none focus:border-azen-accent"
            disabled={strategy.account !== "both"}
          >
            <option value="personal">Personal (@tayyib.ai)</option>
            <option value="business">Business (@azen_ai)</option>
          </select>
          {strategy.account !== "both" && (
            <div className="text-[10px] text-azen-muted mt-1">Locked — this strategy is {strategy.account}-only.</div>
          )}
        </Field>

        <Field label="Content type">
          <select
            value={contentType}
            onChange={(e) => setContentType(e.target.value)}
            className="w-full bg-azen-bg border border-azen-line rounded-md px-3 py-2 text-[13px] text-white focus:outline-none focus:border-azen-accent"
          >
            {contentTypes.map((t) => (
              <option key={t.value} value={t.value}>{t.label}</option>
            ))}
          </select>
        </Field>

        <Field label="Content pillar">
          <select
            value={pillar}
            onChange={(e) => setPillar(e.target.value)}
            className="w-full bg-azen-bg border border-azen-line rounded-md px-3 py-2 text-[13px] text-white focus:outline-none focus:border-azen-accent"
          >
            {pillars.map((p) => (
              <option key={p.key} value={p.key}>{p.label}</option>
            ))}
          </select>
        </Field>

        {error && <div className="text-[12px] text-red-400 bg-red-500/10 border border-red-500/30 rounded-md px-3 py-2">{error}</div>}

        <div className="flex items-center justify-end gap-2 pt-2 border-t border-azen-line">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button variant="primary" onClick={handleGenerate} disabled={generating}>
            {generating ? "Generating…" : "Generate draft"}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-azen-muted mb-1.5">{label}</div>
      {children}
    </div>
  );
}
