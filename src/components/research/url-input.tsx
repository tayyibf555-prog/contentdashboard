"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Link2 } from "lucide-react";

export function UrlInput() {
  const [url, setUrl] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<{
    key_insight?: string;
    content_opportunity?: string;
    suggested_pillar?: string;
  } | null>(null);

  async function handleAnalyze() {
    if (!url.trim()) return;
    setLoading(true);
    setResult(null);
    try {
      const res = await fetch("/api/analyze-url", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ key_insight: "Failed to analyze URL" });
    }
    setLoading(false);
  }

  return (
    <Card variant="elevated" className="mt-8">
      <div className="flex items-end justify-between flex-wrap gap-2 mb-4">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-azen-muted mb-1">URL Analysis</div>
          <h3 className="text-white font-display font-semibold text-display-sm tracking-tight leading-none">Analyse any link</h3>
        </div>
      </div>
      <div className="flex gap-2">
        <div className="flex-1 flex items-center gap-2 bg-azen-bg border border-azen-line rounded-md px-3 py-2 focus-within:border-azen-accent transition-colors">
          <Link2 size={14} className="text-azen-muted" />
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Paste a URL — article, social post, doc…"
            className="flex-1 bg-transparent text-white text-[12.5px] placeholder:text-azen-muted focus:outline-none"
          />
        </div>
        <Button variant="primary" size="md" onClick={handleAnalyze} disabled={loading}>
          {loading ? "Analysing…" : "Analyse"}
        </Button>
      </div>
      {result && (
        <div className="mt-4 rounded-lg bg-azen-accent/5 border border-azen-accent/20 p-3 space-y-1.5">
          {result.key_insight && (
            <div className="text-[12px]">
              <span className="text-azen-muted">Insight · </span>
              <span className="text-white">{result.key_insight}</span>
            </div>
          )}
          {result.content_opportunity && (
            <div className="text-[12px]">
              <span className="text-azen-muted">Opportunity · </span>
              <span className="text-white">{result.content_opportunity}</span>
            </div>
          )}
          {result.suggested_pillar && (
            <div className="text-[12px]">
              <span className="text-azen-muted">Pillar · </span>
              <span className="text-azen-accent font-semibold">{result.suggested_pillar}</span>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
