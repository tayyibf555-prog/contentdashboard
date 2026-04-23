import { Card } from "@/components/ui/card";
import { Stat } from "@/components/ui/stat";

type StatInput = { label: string; value: string | number; sub: string; subColor?: string };

export function StatsRow({ stats }: { stats: StatInput[] }) {
  return (
    <div className="grid grid-cols-4 gap-4 mb-8">
      {stats.map((s, i) => (
        <Card key={s.label} variant="surface" accent={i === 0} interactive>
          <Stat label={s.label} value={s.value} sub={s.sub} size={i === 0 ? "lg" : "md"} />
        </Card>
      ))}
    </div>
  );
}
