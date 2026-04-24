"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Wand2 } from "lucide-react";

export function ChangesBox({ contentId, contentType }: { contentId: string; contentType: string }) {
  const router = useRouter();
  const [instructions, setInstructions] = useState("");
  const [applying, setApplying] = useState(false);
  const [status, setStatus] = useState<{ ok: boolean; message: string } | null>(null);

  if (contentType !== "carousel") return null;

  async function apply() {
    if (!instructions.trim()) return;
    setApplying(true);
    setStatus(null);
    try {
      const res = await fetch("/api/content/apply-changes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentId, instructions: instructions.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setStatus({
        ok: true,
        message:
          data.changed > 0
            ? `Applied to ${data.changed} slide${data.changed === 1 ? "" : "s"}. ${data.note || ""}`
            : `No changes made. ${data.note || ""}`.trim(),
      });
      if (data.changed > 0) {
        setInstructions("");
        router.refresh();
      }
    } catch (e) {
      setStatus({ ok: false, message: e instanceof Error ? e.message : "Failed" });
    } finally {
      setApplying(false);
    }
  }

  return (
    <div className="mt-4 bg-azen-surface/50 border border-white/[0.06] backdrop-blur-md rounded-lg p-3.5">
      <div className="flex items-center gap-2 mb-2">
        <Wand2 size={14} className="text-azen-accent" />
        <span className="text-[11px] font-semibold text-white uppercase tracking-[0.15em]">
          Changes to make
        </span>
      </div>
      <textarea
        value={instructions}
        onChange={(e) => setInstructions(e.target.value)}
        placeholder={"e.g. 'Slide 3: fix the duplicated word solved solved → solved' · 'Slide 5: shorten to one sentence' · 'Change the hook on slide 1 to mention AI agents'"}
        rows={3}
        className="w-full bg-azen-bg border border-azen-line rounded-md px-3 py-2 text-[12.5px] text-white placeholder-azen-muted leading-relaxed focus:outline-none focus:border-azen-accent resize-none"
      />
      <div className="flex items-center justify-between mt-2 gap-2">
        <span className="text-[10.5px] text-azen-muted">
          Claude applies the fix literally to the slides you mention — images regenerate automatically.
        </span>
        <Button variant="primary" size="sm" onClick={apply} disabled={applying || !instructions.trim()}>
          {applying ? "Applying…" : "Apply"}
        </Button>
      </div>
      {status && (
        <div
          className={`mt-2 text-[11px] ${status.ok ? "text-azen-accent" : "text-red-400"} bg-azen-bg/50 border border-azen-line rounded-md px-2.5 py-1.5`}
        >
          {status.message}
        </div>
      )}
    </div>
  );
}
