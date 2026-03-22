"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

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
    <Card className="mt-6">
      <div className="text-white text-sm font-semibold mb-3">Analyze a URL</div>
      <div className="flex gap-2">
        <input
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="Paste a URL to analyze..."
          className="flex-1 bg-azen-bg border border-azen-border rounded-md px-3 py-2 text-white text-xs placeholder:text-azen-text focus:outline-none focus:border-azen-accent"
        />
        <Button onClick={handleAnalyze} disabled={loading}>
          {loading ? "Analyzing..." : "Analyze"}
        </Button>
      </div>
      {result && (
        <div className="mt-3 border-l-2 border-azen-accent pl-3">
          {result.key_insight && (
            <div className="mb-1">
              <span className="text-azen-text text-[10px]">Insight: </span>
              <span className="text-white text-xs">{result.key_insight}</span>
            </div>
          )}
          {result.content_opportunity && (
            <div className="mb-1">
              <span className="text-azen-text text-[10px]">Opportunity: </span>
              <span className="text-white text-xs">{result.content_opportunity}</span>
            </div>
          )}
          {result.suggested_pillar && (
            <div>
              <span className="text-azen-text text-[10px]">Pillar: </span>
              <span className="text-azen-accent text-xs">{result.suggested_pillar}</span>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}
