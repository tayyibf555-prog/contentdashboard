import { Card } from "@/components/ui/card";

type Stat = { label: string; value: string | number; sub: string; subColor?: string };

export function StatsRow({ stats }: { stats: Stat[] }) {
  return (
    <div className="grid grid-cols-4 gap-3 mb-6">
      {stats.map((stat) => (
        <Card key={stat.label}>
          <div className="text-azen-text text-[11px] uppercase tracking-wider">{stat.label}</div>
          <div className="text-white text-[28px] font-bold mt-1.5">{stat.value}</div>
          <div className="text-xs mt-1" style={{ color: stat.subColor || "#8892b0" }}>
            {stat.sub}
          </div>
        </Card>
      ))}
    </div>
  );
}
