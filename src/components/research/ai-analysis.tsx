import { PillarBadge } from "@/components/ui/badge";
import { BUSINESS_PILLARS, PERSONAL_PILLARS } from "@/lib/constants";
import { Brain } from "lucide-react";

type Analysis = {
  key_insight: string | null;
  content_opportunity: string | null;
  suggested_pillar: string | null;
  trending_topics: string[];
};

export function AiAnalysisCard({ analysis }: { analysis: Analysis }) {
  const allPillars = [...BUSINESS_PILLARS, ...PERSONAL_PILLARS];
  const pillar = allPillars.find((p) => p.label === analysis.suggested_pillar || p.key === analysis.suggested_pillar);

  return (
    <div className="rounded-lg bg-azen-accent/5 border border-azen-accent/20 p-3 space-y-2">
      <div className="flex items-center gap-1.5 text-white text-[9px] font-semibold uppercase tracking-[0.2em] mb-1">
        <Brain size={11} strokeWidth={2.2} /> AI analysis
      </div>
      {analysis.key_insight && (
        <div className="text-azen-text-strong text-[12px] leading-snug">
          <span className="text-azen-muted">Insight · </span>{analysis.key_insight}
        </div>
      )}
      {analysis.content_opportunity && (
        <div className="text-azen-text-strong text-[12px] leading-snug">
          <span className="text-azen-muted">Opportunity · </span>{analysis.content_opportunity}
        </div>
      )}
      {(pillar || analysis.trending_topics?.length > 0) && (
        <div className="flex items-center gap-2 flex-wrap pt-1">
          {pillar && <PillarBadge label={pillar.label.split(" — ")[0]} color={pillar.color} />}
          {analysis.trending_topics?.map((topic) => (
            <span key={topic} className="text-white/70 text-[10px] font-mono">#{topic}</span>
          ))}
        </div>
      )}
    </div>
  );
}
