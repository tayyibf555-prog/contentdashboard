"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";
import { BUSINESS_PILLARS, PERSONAL_PILLARS } from "@/lib/constants";

const PLATFORM_TYPES: Record<string, { label: string; value: string }[]> = {
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

export function WinnersButton({ platform, account, label = "From Winners" }: { platform: string; account: string; label?: string }) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [genAccount, setGenAccount] = useState(account);
  const [genType, setGenType] = useState(PLATFORM_TYPES[platform]?.[0]?.value || "short");
  const [genPillar, setGenPillar] = useState(account === "business" ? "education" : "bts");

  const pillars = genAccount === "business" ? BUSINESS_PILLARS : PERSONAL_PILLARS;

  async function handleGenerate() {
    setGenerating(true);
    setError(null);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          account: genAccount,
          pillar: genPillar,
          contentType: genType,
          useWinners: true,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Generation failed");
      setShowModal(false);
      router.push(`/${platform}?account=${genAccount}`);
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setGenerating(false);
    }
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        title="Generate content seeded from your top-engagement tracked posts"
        className="bg-azen-card border border-azen-accent text-azen-accent px-3.5 py-2 rounded-md text-xs font-semibold hover:bg-azen-accent hover:text-azen-bg transition-colors"
      >
        {label}
      </button>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Generate from Winners">
        <div className="space-y-3">
          <div className="text-[11px] text-azen-text bg-azen-bg border border-azen-border rounded-md p-3 leading-relaxed">
            Pulls the top 5 highest-engagement scraped posts for <span className="text-white font-semibold">{platform}</span> (weighted by comments + shares + saves) and uses them as inspiration for hook patterns and engagement mechanics. No copying — Claude adapts to your voice.
          </div>

          <div>
            <label className="text-azen-text text-[11px] block mb-1">Account</label>
            <select
              value={genAccount}
              onChange={(e) => {
                setGenAccount(e.target.value);
                setGenPillar(e.target.value === "business" ? "education" : "bts");
              }}
              className="w-full bg-azen-bg border border-azen-border rounded-md px-3 py-2 text-white text-xs"
            >
              <option value="business">Business (@azen_ai)</option>
              <option value="personal">Personal (@tayyib.ai)</option>
            </select>
          </div>

          <div>
            <label className="text-azen-text text-[11px] block mb-1">Content Pillar</label>
            <select
              value={genPillar}
              onChange={(e) => setGenPillar(e.target.value)}
              className="w-full bg-azen-bg border border-azen-border rounded-md px-3 py-2 text-white text-xs"
            >
              {pillars.map((p) => (
                <option key={p.key} value={p.key}>{p.label}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="text-azen-text text-[11px] block mb-1">Content Type</label>
            <select
              value={genType}
              onChange={(e) => setGenType(e.target.value)}
              className="w-full bg-azen-bg border border-azen-border rounded-md px-3 py-2 text-white text-xs"
            >
              {(PLATFORM_TYPES[platform] || []).map((t) => (
                <option key={t.value} value={t.value}>{t.label}</option>
              ))}
            </select>
          </div>

          {error && <div className="text-xs text-red-400 bg-red-500/10 border border-red-500/30 rounded-md p-2">{error}</div>}

          <button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full bg-azen-accent text-azen-bg px-3 py-2 rounded-md text-xs font-semibold disabled:opacity-50 hover:bg-azen-accent/90 transition-colors"
          >
            {generating ? "Analyzing winners + generating…" : "Generate from winners"}
          </button>
        </div>
      </Modal>
    </>
  );
}
