"use client";

import { Card } from "@/components/ui/card";
import { QueueItem } from "@/components/content/queue-item";
import type { GeneratedContent } from "@/types";

export function ContentQueue({
  items,
  onApprove,
  onRegenerate,
}: {
  items: GeneratedContent[];
  onApprove: (id: string) => void;
  onRegenerate: (id: string) => void;
}) {
  return (
    <Card>
      <h2 className="text-white text-base font-semibold mb-4">Today&apos;s Content Queue</h2>
      {items.length === 0 ? (
        <p className="text-azen-text text-sm">No content pending. Check back after 9 AM.</p>
      ) : (
        items.map((item) => (
          <QueueItem
            key={item.id}
            content={item}
            onApprove={onApprove}
            onRegenerate={onRegenerate}
          />
        ))
      )}
    </Card>
  );
}
