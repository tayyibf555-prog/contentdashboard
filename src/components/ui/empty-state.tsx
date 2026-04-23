import React from "react";

export function EmptyState({
  icon,
  title,
  body,
  action,
  className = "",
}: {
  icon?: React.ReactNode;
  title: string;
  body?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`flex flex-col items-center justify-center text-center py-12 px-6 rounded-lg border border-dashed border-azen-line bg-azen-surface/40 ${className}`}>
      {icon && (
        <div className="h-11 w-11 rounded-xl bg-azen-surface-2 border border-azen-line flex items-center justify-center text-azen-text mb-4">
          {icon}
        </div>
      )}
      <h3 className="text-white text-[15px] font-semibold tracking-tight">{title}</h3>
      {body && <p className="text-azen-text text-[12px] mt-2 max-w-sm leading-relaxed">{body}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
