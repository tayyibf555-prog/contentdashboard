import { PLATFORMS } from "@/lib/constants";

// Legacy catch-all — keeps older callers compiling
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
      className={`inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider px-2 py-1 rounded-md ${className}`}
      style={{ backgroundColor: `${color}18`, color, border: `1px solid ${color}33` }}
    >
      <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: color }} />
      {children}
    </span>
  );
}

/**
 * Preferred pattern: a colored dot + label on a neutral pill.
 * Uses less visual weight than a fully-filled colored badge.
 */
export function DotBadge({
  label,
  color,
  className = "",
  size = "md",
}: {
  label: string;
  color: string;
  className?: string;
  size?: "sm" | "md";
}) {
  const pad = size === "sm" ? "px-1.5 py-0.5 text-[9px]" : "px-2 py-1 text-[10px]";
  const dot = size === "sm" ? "h-1 w-1" : "h-1.5 w-1.5";
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-semibold uppercase tracking-wider rounded-md bg-azen-surface-2 border border-azen-line text-azen-text-strong ${pad} ${className}`}
    >
      <span className={`${dot} rounded-full`} style={{ backgroundColor: color, boxShadow: `0 0 6px ${color}88` }} />
      {label}
    </span>
  );
}

export function PlatformBadge({ platform }: { platform: string }) {
  const config = PLATFORMS[platform as keyof typeof PLATFORMS];
  if (!config) return null;
  return <DotBadge label={config.label} color={config.color} />;
}

/**
 * Pillar tag — a quiet tinted pill with the pillar accent color.
 */
export function PillarBadge({ label, color }: { label: string; color: string }) {
  return (
    <span
      className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold uppercase tracking-wider border"
      style={{ backgroundColor: `${color}14`, color, borderColor: `${color}33` }}
    >
      {label}
    </span>
  );
}

/**
 * Status chip — includes a pulsing dot for "live" statuses.
 */
export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { color: string; pulse?: boolean }> = {
    pending: { color: "#F3A01B", pulse: true },
    approved: { color: "#00d4aa" },
    scheduled: { color: "#00d4aa", pulse: true },
    posted: { color: "#5ACB7B" },
    draft: { color: "#8892b0" },
    live: { color: "#00d4aa", pulse: true },
  };
  const cfg = map[status] || { color: "#8892b0" };
  return (
    <span
      className="inline-flex items-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-md border"
      style={{ color: cfg.color, borderColor: `${cfg.color}33`, backgroundColor: `${cfg.color}10` }}
    >
      <span
        className={`h-1.5 w-1.5 rounded-full ${cfg.pulse ? "animate-pulse-dot" : ""}`}
        style={{ backgroundColor: cfg.color }}
      />
      {status}
    </span>
  );
}
