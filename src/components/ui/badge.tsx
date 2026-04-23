import { PLATFORMS } from "@/lib/constants";

export function Badge({
  children,
  color = "#8892b0",
  className = "",
}: {
  children: React.ReactNode;
  color?: string;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center text-[10px] font-medium px-2 py-0.5 rounded ${className}`}
      style={{ backgroundColor: `${color}20`, color }}
    >
      {children}
    </span>
  );
}

export function PlatformBadge({ platform }: { platform: string }) {
  const config = PLATFORMS[platform as keyof typeof PLATFORMS];
  if (!config) return null;

  return (
    <span
      className="px-2 py-0.5 rounded text-[10px] text-white font-semibold"
      style={{ backgroundColor: config.color }}
    >
      {config.label}
    </span>
  );
}

export function PillarBadge({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="px-1.5 py-0.5 rounded text-[9px] font-semibold"
      style={{ backgroundColor: color, color: "#0a0e1a" }}
    >
      {label}
    </span>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, string> = {
    pending: "#ffa500",
    approved: "#00d4aa",
    scheduled: "#00d4aa",
    posted: "#4CAF50",
    draft: "#8892b0",
  };

  return (
    <span className="text-[8px] font-semibold" style={{ color: colors[status] || "#8892b0" }}>
      {status.charAt(0).toUpperCase() + status.slice(1)}
    </span>
  );
}
