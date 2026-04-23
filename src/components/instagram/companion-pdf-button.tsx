"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { FileText, Download, Loader2 } from "lucide-react";

export function CompanionPdfButton({
  contentId,
  pdfUrl,
  account,
  contentType,
}: {
  contentId: string;
  pdfUrl: string | null;
  account: "business" | "personal";
  contentType: string;
}) {
  const router = useRouter();
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Only personal carousels + reels get a companion PDF
  if (account !== "personal" || !["carousel", "reel"].includes(contentType)) return null;

  async function generate() {
    setError(null);
    setGenerating(true);
    try {
      const res = await fetch("/api/companion-pdf", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ contentId }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      router.refresh();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Failed");
    } finally {
      setGenerating(false);
    }
  }

  if (pdfUrl) {
    return (
      <div className="mt-3 flex items-center gap-2">
        <a
          href={pdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-2 text-[12px] font-semibold text-white bg-azen-surface-2 border border-azen-line hover:border-azen-accent rounded-md px-3 py-2 transition-colors"
        >
          <FileText size={13} className="text-azen-accent" />
          Preview playbook
        </a>
        <a
          href={pdfUrl}
          download
          className="inline-flex items-center gap-2 text-[12px] font-semibold text-white bg-azen-surface-2 border border-azen-line hover:border-azen-accent rounded-md px-3 py-2 transition-colors"
        >
          <Download size={13} />
          Download
        </a>
        <Button variant="ghost" size="sm" onClick={generate} disabled={generating}>
          {generating ? "Regenerating…" : "Regenerate"}
        </Button>
      </div>
    );
  }

  return (
    <div className="mt-3">
      <Button variant="secondary" size="md" onClick={generate} disabled={generating}>
        {generating ? (
          <>
            <Loader2 size={13} className="animate-spin" /> Generating playbook PDF…
          </>
        ) : (
          <>
            <FileText size={13} /> Generate companion playbook PDF
          </>
        )}
      </Button>
      {error && <div className="mt-1 text-[11px] text-red-400">{error}</div>}
      {generating && (
        <div className="mt-1 text-[11px] text-azen-muted">
          Claude is expanding the post into a 5-8 page playbook — takes ~20-30s.
        </div>
      )}
    </div>
  );
}
