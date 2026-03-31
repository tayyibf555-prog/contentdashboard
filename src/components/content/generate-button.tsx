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

interface GenerateButtonProps {
  platform: string;
  account: string;
  label?: string;
}

export function GenerateButton({ platform, account, label = "Generate New" }: GenerateButtonProps) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [genAccount, setGenAccount] = useState(account);
  const [genType, setGenType] = useState(PLATFORM_TYPES[platform]?.[0]?.value || "short");
  const [genPillar, setGenPillar] = useState("education");
  const [topic, setTopic] = useState("");

  const pillars = genAccount === "business" ? BUSINESS_PILLARS : PERSONAL_PILLARS;

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          account: genAccount,
          pillar: genPillar,
          contentType: genType,
          researchContext: topic || undefined,
        }),
      });

      if (!res.ok) throw new Error("Generation failed");

      setShowModal(false);
      setTopic("");
      router.push(`/${platform}?account=${genAccount}`);
      router.refresh();
    } catch {
      alert("Failed to generate content. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="bg-azen-accent text-azen-bg px-3.5 py-2 rounded-md text-xs font-semibold hover:bg-azen-accent/90 transition-colors"
      >
        {label}
      </button>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title="Generate Content">
        <div className="space-y-3">
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

          <div>
            <label className="text-azen-text text-[11px] block mb-1">Topic / Context (optional)</label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Describe what this post should be about, or leave blank for AI to decide based on the pillar..."
              rows={3}
              className="w-full bg-azen-bg border border-azen-border rounded-md px-3 py-2 text-white text-xs leading-relaxed resize-none focus:outline-none focus:border-azen-accent"
            />
          </div>

          <button
            onClick={handleGenerate}
            disabled={generating}
            className="w-full bg-azen-accent text-azen-bg px-3 py-2 rounded-md text-xs font-semibold disabled:opacity-50 hover:bg-azen-accent/90 transition-colors"
          >
            {generating ? "Generating..." : "Generate"}
          </button>
        </div>
      </Modal>
    </>
  );
}
