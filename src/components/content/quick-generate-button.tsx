"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Modal } from "@/components/ui/modal";

interface QuickGenerateButtonProps {
  platform: string;
  contentType: string;
  label: string;
  defaultPillar: string;
}

export function QuickGenerateButton({ platform, contentType, label, defaultPillar }: QuickGenerateButtonProps) {
  const router = useRouter();
  const [showModal, setShowModal] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [topic, setTopic] = useState("");

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await fetch("/api/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          platform,
          account: "personal",
          pillar: defaultPillar,
          contentType,
          researchContext: topic || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || `Generation failed (${res.status})`);
      }

      setShowModal(false);
      setTopic("");
      router.push(`/${platform}?account=personal`);
      router.refresh();
    } catch (e) {
      alert(e instanceof Error ? e.message : "Failed to generate. Please try again.");
    } finally {
      setGenerating(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="bg-azen-card border border-azen-border text-azen-text px-3.5 py-2 rounded-md text-xs font-semibold hover:text-white hover:border-azen-accent transition-colors"
      >
        {label}
      </button>

      <Modal isOpen={showModal} onClose={() => setShowModal(false)} title={`Generate ${label}`}>
        <div className="space-y-3">
          <div>
            <label className="text-azen-text text-[11px] block mb-1">Topic / Context (optional)</label>
            <textarea
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="Describe what the post should be about, or leave blank and AI will decide..."
              rows={4}
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
