import React from "react";

export function TopBar({
  title,
  subtitle,
  eyebrow,
  actions,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  actions?: React.ReactNode;
}) {
  return (
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
      <div className="min-w-0">
        {eyebrow && (
          <div className="text-[10px] font-semibold uppercase tracking-[0.25em] text-azen-muted mb-2">
            {eyebrow}
          </div>
        )}
        <h1 className="text-white font-display font-semibold text-display leading-none tracking-[-0.02em]">{title}</h1>
        {subtitle && (
          <p className="text-azen-text text-[13px] mt-3 max-w-2xl leading-relaxed">{subtitle}</p>
        )}
      </div>
      {actions && <div className="flex items-center gap-2">{actions}</div>}
    </div>
  );
}
