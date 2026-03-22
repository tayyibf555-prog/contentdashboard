import { BUSINESS_PILLARS, PERSONAL_PILLARS } from "@/lib/constants";

export function PillarLegend({ account }: { account: "business" | "personal" }) {
  const pillars = account === "business" ? BUSINESS_PILLARS : PERSONAL_PILLARS;

  return (
    <div className="flex gap-3 flex-wrap mb-4">
      {pillars.map((p) => (
        <div key={p.key} className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
          <span className="text-azen-text text-[10px]">{p.label}</span>
        </div>
      ))}
    </div>
  );
}
