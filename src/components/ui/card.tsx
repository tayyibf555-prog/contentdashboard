import React from "react";

type Variant = "surface" | "elevated" | "outlined" | "ghost";

export function Card({
  children,
  className = "",
  border,
  variant = "surface",
  interactive = false,
  accent = false,
}: {
  children: React.ReactNode;
  className?: string;
  border?: string;
  variant?: Variant;
  interactive?: boolean;
  accent?: boolean;
}) {
  const base = "rounded-lg p-5 transition-all duration-300";
  const variants: Record<Variant, string> = {
    surface: "bg-azen-surface border border-azen-line shadow-raised",
    elevated: "bg-azen-surface border border-azen-line shadow-lift",
    outlined: "bg-transparent border border-azen-line-strong",
    ghost: "bg-azen-surface/60 border border-azen-line/60 backdrop-blur-sm",
  };
  const interactiveClasses = interactive
    ? "hover:-translate-y-0.5 hover:border-azen-line-strong hover:shadow-pop cursor-pointer"
    : "";
  const accentClasses = accent ? "relative overflow-hidden" : "";

  // Legacy API — allow hardcoded border color to keep old callers working
  const style = border ? { borderColor: border } : undefined;

  return (
    <div className={`${base} ${variants[variant]} ${interactiveClasses} ${accentClasses} ${className}`} style={style}>
      {accent && (
        <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-azen-accent/60 to-transparent" />
      )}
      {children}
    </div>
  );
}
