"use client";

import { useEffect, useState } from "react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export function Stat({
  label,
  value,
  sub,
  delta,
  sparkline,
  format = "number",
  size = "md",
  animate = true,
}: {
  label: string;
  value: number | string;
  sub?: string;
  delta?: number | null;
  sparkline?: number[];
  format?: "number" | "plain";
  size?: "md" | "lg" | "hero";
  animate?: boolean;
}) {
  const numericValue = typeof value === "number" ? value : null;
  const [display, setDisplay] = useState<number | string>(animate && numericValue !== null ? 0 : value);

  useEffect(() => {
    if (!animate || numericValue === null) {
      setDisplay(value);
      return;
    }
    const start = performance.now();
    const duration = 700;
    let frame: number;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - t, 3);
      setDisplay(Math.round(numericValue * eased));
      if (t < 1) frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [numericValue, value, animate]);

  const valueClass = size === "hero"
    ? "text-hero font-display font-semibold"
    : size === "lg"
      ? "text-display-sm font-display font-semibold"
      : "text-display-sm font-mono";

  const formatted = typeof display === "number" && format === "number"
    ? display.toLocaleString()
    : String(display);

  return (
    <div className="flex flex-col gap-2">
      <div className="text-[10px] font-semibold uppercase tracking-[0.18em] text-azen-muted">{label}</div>
      <div className="flex items-end gap-3">
        <span className={`text-white leading-none ${valueClass}`}>{formatted}</span>
        {delta !== undefined && delta !== null && <DeltaChip value={delta} />}
      </div>
      {sub && <div className="text-[11px] text-azen-text">{sub}</div>}
      {sparkline && sparkline.length > 1 && <Sparkline values={sparkline} />}
    </div>
  );
}

export function DeltaChip({ value }: { value: number }) {
  const positive = value > 0;
  const neutral = value === 0;
  const color = neutral ? "text-azen-muted" : positive ? "text-azen-accent" : "text-red-400";
  const Icon = neutral ? Minus : positive ? TrendingUp : TrendingDown;
  return (
    <span className={`inline-flex items-center gap-1 text-[11px] font-mono font-medium ${color} mb-1`}>
      <Icon size={12} strokeWidth={2.5} />
      {positive ? "+" : ""}{value}%
    </span>
  );
}

function Sparkline({ values }: { values: number[] }) {
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const w = 120;
  const h = 32;
  const step = w / (values.length - 1);
  const points = values.map((v, i) => {
    const x = i * step;
    const y = h - ((v - min) / range) * h;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="mt-1">
      <defs>
        <linearGradient id="spark" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="var(--color-azen-accent)" stopOpacity="0.4" />
          <stop offset="100%" stopColor="var(--color-azen-accent)" stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline points={points} fill="none" stroke="var(--color-azen-accent)" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round" />
      <polygon points={`0,${h} ${points} ${w},${h}`} fill="url(#spark)" />
    </svg>
  );
}
