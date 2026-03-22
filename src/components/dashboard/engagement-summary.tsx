import { Card } from "@/components/ui/card";

type EngagementData = {
  likes: { value: number; change: number };
  comments: { value: number; change: number };
  shares: { value: number; change: number };
  bestPost: { title: string; platform: string };
};

export function EngagementSummary({ data }: { data: EngagementData }) {
  return (
    <Card className="mb-6">
      <div className="flex justify-between items-center mb-3">
        <span className="text-white text-sm font-semibold">This Week&apos;s Engagement</span>
        <span className="text-azen-text text-[11px]">vs last week</span>
      </div>
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: "Likes", ...data.likes },
          { label: "Comments", ...data.comments },
          { label: "Shares", ...data.shares },
        ].map((m) => (
          <div key={m.label}>
            <div className="text-azen-text text-[11px]">{m.label}</div>
            <div className="text-white text-lg font-bold mt-0.5">
              {m.value.toLocaleString()}{" "}
              <span className={`text-[11px] ${m.change >= 0 ? "text-azen-accent" : "text-red-400"}`}>
                {m.change >= 0 ? "+" : ""}{m.change}%
              </span>
            </div>
          </div>
        ))}
        <div>
          <div className="text-azen-text text-[11px]">Best Post</div>
          <div className="text-white text-xs font-medium mt-1">{data.bestPost.title}</div>
        </div>
      </div>
    </Card>
  );
}
