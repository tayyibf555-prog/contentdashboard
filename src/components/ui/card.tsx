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
  const base =
    "relative rounded-lg p-5 transition-all duration-300 " +
    "before:pointer-events-none before:absolute before:inset-x-0 before:top-0 before:h-px before:bg-white/[0.04]";

  // True clear-glass: barely any bg, heavy blur, soft white hairline
  const variants: Record<Variant, string> = {
    surface:
      "bg-white/[0.025] backdrop-blur-2xl backdrop-saturate-150 border border-white/[0.07] shadow-raised",
    elevated:
      "bg-white/[0.04] backdrop-blur-2xl backdrop-saturate-150 border border-white/[0.09] shadow-lift",
    outlined:
      "bg-transparent backdrop-blur-md border border-white/[0.08]",
    ghost:
      "bg-white/[0.015] backdrop-blur-lg border border-white/[0.05]",
  };

  const interactiveClasses = interactive
    ? "hover:-translate-y-0.5 hover:border-white/[0.14] hover:shadow-pop hover:bg-white/[0.045] cursor-pointer"
    : "";
  const accentClasses = accent ? "overflow-hidden" : "";

  const style = border ? { borderColor: border } : undefined;

  return (
    <div className={`${base} ${variants[variant]} ${interactiveClasses} ${accentClasses} ${className}`} style={style}>
      {accent && (
        <span className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-azen-accent/70 to-transparent" />
      )}
      {children}
    </div>
  );
}
