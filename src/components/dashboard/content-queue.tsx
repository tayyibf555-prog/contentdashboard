"use client";

import { Card } from "@/components/ui/card";
import { EmptyState } from "@/components/ui/empty-state";
import { QueueItem } from "@/components/content/queue-item";
import { Inbox } from "lucide-react";
import type { GeneratedContent } from "@/types";

export function ContentQueue({
  items,
  onApprove,
  onRegenerate,
  onApproveAndPost,
}: {
  items: GeneratedContent[];
  onApprove: (id: string) => void;
  onRegenerate: (id: string) => void;
  onApproveAndPost: (id: string) => void;
}) {
  return (
    <Card variant="elevated">
      <div className="flex items-end justify-between mb-5 flex-wrap gap-2">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-azen-muted mb-1">Queue</div>
          <h2 className="text-white font-display italic text-display-sm tracking-tight leading-none">
            Ready for approval
          </h2>
        </div>
        <span className="text-[11px] font-mono text-azen-muted">{items.length} items</span>
      </div>

      {items.length === 0 ? (
        <EmptyState
          icon={<Inbox size={20} />}
          title="Nothing pending"
          body="When new drafts finish generating they'll show up here for approval."
        />
      ) : (
        <div className="flex flex-col divide-y divide-azen-line/60">
          {items.map((item) => (
            <QueueItem
              key={item.id}
              content={item}
              onApprove={onApprove}
              onRegenerate={onRegenerate}
              onApproveAndPost={onApproveAndPost}
            />
          ))}
        </div>
      )}
    </Card>
  );
}
