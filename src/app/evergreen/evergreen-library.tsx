"use client";

import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlatformBadge, PillarBadge } from "@/components/ui/badge";
import { BUSINESS_PILLARS, PERSONAL_PILLARS } from "@/lib/constants";
import type { GeneratedContent } from "@/types";

type EvergreenItem = {
  id: string;
  generated_content_id: string;
  flagged_at: string;
  last_reshared_at: string | null;
  reshare_count: number;
  cooldown_days: number;
  eligible_for_reshare: boolean;
  days_until_eligible: number;
  generated_content: GeneratedContent;
};

export function EvergreenLibrary({ items }: { items: EvergreenItem[] }) {
  if (items.length === 0) {
    return (
      <p className="text-azen-text text-sm">
        No evergreen content yet. Flag high-performing posts from any platform page to add them here.
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3">
      {items.map((item) => {
        const content = item.generated_content;
        const pillars = content.account === "business" ? BUSINESS_PILLARS : PERSONAL_PILLARS;
        const pillar = pillars.find((p) => p.key === content.pillar);

        return (
          <Card key={item.id}>
            <div className="flex items-start justify-between mb-2">
              <div className="flex items-center gap-2">
                <PlatformBadge platform={content.platform} />
                {pillar && <PillarBadge label={pillar.label} color={pillar.color} />}
              </div>
              {item.eligible_for_reshare ? (
                <span className="text-white text-[9px] font-semibold">ELIGIBLE</span>
              ) : (
                <span className="text-azen-text text-[9px]">
                  {item.days_until_eligible}d cooldown
                </span>
              )}
            </div>
            <div className="text-white text-xs font-medium mb-1">{content.title}</div>
            <div className="text-azen-text text-[10px] mb-3 line-clamp-2">{content.body}</div>
            <div className="flex gap-3 text-[10px] text-azen-text mb-3">
              <span>Reshared {item.reshare_count}x</span>
              {item.last_reshared_at && (
                <span>Last: {new Date(item.last_reshared_at).toLocaleDateString()}</span>
              )}
              <span>Flagged: {new Date(item.flagged_at).toLocaleDateString()}</span>
            </div>
            <div className="flex gap-2">
              <Button variant="primary" disabled={!item.eligible_for_reshare}>
                Reshare Now
              </Button>
              <Button variant="secondary">Edit Before Reshare</Button>
              <Button variant="icon">Remove</Button>
            </div>
          </Card>
        );
      })}
    </div>
  );
}
