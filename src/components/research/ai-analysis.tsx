import { Card } from "@/components/ui/card";
import { PillarBadge } from "@/components/ui/badge";
import { BUSINESS_PILLARS, PERSONAL_PILLARS } from "@/lib/constants";

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
    <Card border="#00d4aa33">
      <div className="border-l-2 border-azen-accent pl-3">
        <div className="text-azen-text text-[10px] uppercase tracking-wider mb-2">AI Analysis</div>
        {analysis.key_insight && (
          <div className="mb-2">
            <span className="text-azen-text text-[10px]">Key Insight: </span>
            <span className="text-white text-xs">{analysis.key_insight}</span>
          </div>
        )}
        {analysis.content_opportunity && (
          <div className="mb-2">
            <span className="text-azen-text text-[10px]">Content Opportunity: </span>
            <span className="text-white text-xs">{analysis.content_opportunity}</span>
          </div>
        )}
        <div className="flex items-center gap-2 mt-2">
          {pillar && <PillarBadge label={pillar.label} color={pillar.color} />}
          {analysis.trending_topics?.map((topic) => (
            <span key={topic} className="text-azen-accent text-[10px]">#{topic}</span>
          ))}
        </div>
      </div>
    </Card>
  );
}
