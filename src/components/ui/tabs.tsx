"use client";

import { useRef, useEffect, useState } from "react";
import Link from "next/link";

export type TabItem = {
  key: string;
  label: string;
  count?: number;
  href?: string;
  onClick?: () => void;
};

/**
 * Shared tab primitive. Active state moves via a smooth transform-based underline.
 * Tabs may be links (href) or buttons (onClick).
 */
export function Tabs({
  items,
  activeKey,
  onSelect,
  size = "md",
  className = "",
}: {
  items: TabItem[];
  activeKey: string;
  onSelect?: (key: string) => void;
  size?: "sm" | "md";
  className?: string;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [underline, setUnderline] = useState<{ left: number; width: number } | null>(null);

  useEffect(() => {
    const el = containerRef.current?.querySelector<HTMLElement>(`[data-tab-key="${activeKey}"]`);
    if (!el || !containerRef.current) return;
    const cRect = containerRef.current.getBoundingClientRect();
    const r = el.getBoundingClientRect();
    setUnderline({ left: r.left - cRect.left, width: r.width });
  }, [activeKey, items]);

  const padding = size === "sm" ? "px-2.5 py-1.5 text-[11px]" : "px-3.5 py-2 text-[12px]";

  const Inner = (it: TabItem) => {
    const isActive = activeKey === it.key;
    const content = (
      <span className={`inline-flex items-center gap-1.5 ${isActive ? "text-white" : "text-azen-text hover:text-white"} font-semibold tracking-tight transition-colors`}>
        {it.label}
        {typeof it.count === "number" && (
          <span
            className={`text-[10px] font-mono font-medium px-1.5 py-0.5 rounded ${
              isActive ? "bg-azen-accent/15 text-azen-accent" : "bg-azen-surface-2 text-azen-muted"
            }`}
          >
            {it.count}
          </span>
        )}
      </span>
    );
    const common = {
      "data-tab-key": it.key,
      className: `relative ${padding}`,
    } as Record<string, string>;
    if (it.href) {
      return (
        <Link key={it.key} href={it.href} {...common}>
          {content}
        </Link>
      );
    }
    return (
      <button
        key={it.key}
        onClick={() => {
          onSelect?.(it.key);
          it.onClick?.();
        }}
        {...common}
      >
        {content}
      </button>
    );
  };

  return (
    <div className={`relative ${className}`}>
      <div ref={containerRef} className="relative flex items-center gap-1 border-b border-azen-line overflow-x-auto no-scrollbar">
        {items.map(Inner)}
        {underline && (
          <span
            className="absolute bottom-0 h-[2px] bg-azen-accent rounded-full transition-all duration-300 ease-out"
            style={{
              transform: `translate3d(${underline.left}px, 0, 0)`,
              width: underline.width,
              boxShadow: "0 0 12px rgba(var(--color-azen-accent-rgb), 0.6)",
            }}
          />
        )}
      </div>
    </div>
  );
}
