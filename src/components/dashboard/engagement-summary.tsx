import { Card } from "@/components/ui/card";
import { Stat } from "@/components/ui/stat";

type EngagementData = {
  likes: { value: number; change: number };
  comments: { value: number; change: number };
  shares: { value: number; change: number };
  bestPost: { title: string; platform: string };
};

export function EngagementSummary({ data }: { data: EngagementData }) {
  return (
    <Card variant="elevated" className="mb-8">
      <div className="flex items-end justify-between mb-5 flex-wrap gap-2">
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-azen-muted mb-1">Engagement</div>
          <h3 className="text-white font-display font-semibold text-display-sm tracking-tight leading-none">This week&apos;s pulse</h3>
        </div>
        <span className="text-azen-text text-[11px]">vs. last 7 days</span>
      </div>
      <div className="grid grid-cols-4 gap-6">
        <Stat label="Likes" value={data.likes.value} delta={data.likes.change} />
        <Stat label="Comments" value={data.comments.value} delta={data.comments.change} />
        <Stat label="Shares" value={data.shares.value} delta={data.shares.change} />
        <div>
          <div className="text-[10px] font-semibold uppercase tracking-[0.2em] text-azen-muted mb-2">Best post</div>
          <div className="text-white text-[13px] font-medium leading-snug line-clamp-3">{data.bestPost.title}</div>
          {data.bestPost.platform && (
            <div className="text-azen-text text-[10px] uppercase tracking-wider mt-1.5">{data.bestPost.platform}</div>
          )}
        </div>
      </div>
    </Card>
  );
}
