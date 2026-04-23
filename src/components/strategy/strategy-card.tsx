"use client";

import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ChevronDown, ExternalLink, Pencil, Archive } from "lucide-react";
import type { Strategy } from "@/types";

const CATEGORY_COLORS: Record<Strategy["category"], string> = {
  hook: "#F3A01B",
  format: "#5BC4F7",
  engagement: "#C5F04A",
  cadence: "#A29BFE",
  distribution: "#FAB1A0",
  positioning: "#55EFC4",
};

export function StrategyCard({
  strategy,
  onEdit,
  onArchive,
}: {
  strategy: Strategy;
  onEdit: (s: Strategy) => void;
  onArchive: (s: Strategy) => void;
}) {
  const [expanded, setExpanded] = useState(false);
  const dotColor = CATEGORY_COLORS[strategy.category];

  return (
    <Card variant="surface" className="group">
      <div className="flex items-start justify-between gap-3 mb-3">
        <span className="inline-flex items-center gap-1.5 text-[9px] font-semibold uppercase tracking-[0.2em] px-2 py-0.5 rounded-md bg-azen-surface-2 border border-azen-line text-azen-text-strong">
          <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: dotColor, boxShadow: `0 0 6px ${dotColor}88` }} />
          {strategy.category}
        </span>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          <Button variant="icon" onClick={() => onEdit(strategy)} aria-label="Edit"><Pencil size={13} /></Button>
          <Button variant="icon" onClick={() => onArchive(strategy)} aria-label="Archive"><Archive size={13} /></Button>
        </div>
      </div>

      <h3 className="text-white font-display font-semibold text-[20px] tracking-tight leading-[1.2] mb-2">
        {strategy.title}
      </h3>
      <p className="text-azen-text text-[13px] leading-relaxed mb-4">{strategy.summary}</p>

      <button
        onClick={() => setExpanded((v) => !v)}
        className="inline-flex items-center gap-1 text-[11px] font-semibold text-white hover:text-azen-accent transition-colors"
      >
        {expanded ? "Hide details" : "Read more"}
        <ChevronDown size={13} className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`} />
      </button>

      {expanded && (
        <div className="mt-4 pt-4 border-t border-azen-line space-y-4 animate-fade-in">
          <Section label="When to use" body={strategy.when_to_use} />
          {strategy.how_to_apply.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-azen-muted mb-1.5">How to apply</div>
              <ul className="space-y-1.5">
                {strategy.how_to_apply.map((step, i) => (
                  <li key={i} className="text-[12.5px] text-azen-text-strong flex gap-2 leading-relaxed">
                    <span className="text-azen-muted font-mono text-[10px] mt-[3px] min-w-[16px]">{String(i + 1).padStart(2, "0")}</span>
                    <span>{step}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
          {strategy.example && (
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-azen-muted mb-1.5">Example</div>
              <div className="text-[12.5px] text-white/90 italic bg-azen-surface-2 border border-azen-line rounded-md p-3 leading-relaxed">
                {strategy.example}
              </div>
            </div>
          )}
          <Section label="Why it works" body={strategy.why_it_works} />
          {strategy.sources && strategy.sources.length > 0 && (
            <div>
              <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-azen-muted mb-1.5">Sources</div>
              <ul className="space-y-1">
                {strategy.sources.map((s, i) => (
                  <li key={i}>
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-[11.5px] text-azen-text hover:text-white transition-colors"
                    >
                      <ExternalLink size={11} />
                      {s.title}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </Card>
  );
}

function Section({ label, body }: { label: string; body: string }) {
  return (
    <div>
      <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-azen-muted mb-1.5">{label}</div>
      <div className="text-[12.5px] text-azen-text-strong leading-relaxed">{body}</div>
    </div>
  );
}
