import { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "icon" | "danger" | "ghost" | "link";
type ButtonSize = "sm" | "md" | "lg";

const base =
  "inline-flex items-center justify-center gap-1.5 rounded-md font-semibold tracking-tight transition-all duration-200 " +
  "disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-azen-accent focus-visible:ring-offset-2 focus-visible:ring-offset-azen-bg";

const sizes: Record<ButtonSize, string> = {
  sm: "px-2.5 py-1 text-[11px]",
  md: "px-3.5 py-2 text-[12px]",
  lg: "px-5 py-2.5 text-[13px]",
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "bg-azen-accent text-azen-bg shadow-accent hover:shadow-accent-strong hover:-translate-y-px",
  secondary:
    "bg-azen-surface-2 text-azen-text-strong border border-azen-line hover:border-azen-line-strong hover:bg-azen-surface",
  icon:
    "bg-azen-surface-2 text-azen-text border border-azen-line hover:text-white hover:border-azen-line-strong h-8 w-8 p-0",
  danger:
    "bg-red-500/15 text-red-300 border border-red-500/30 hover:bg-red-500/25",
  ghost:
    "bg-transparent text-azen-text hover:text-white hover:bg-azen-surface",
  link:
    "bg-transparent text-azen-accent px-0 hover:underline underline-offset-4",
};

export function Button({
  variant = "primary",
  size = "md",
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
}) {
  const sizeClasses = variant === "icon" ? "" : sizes[size];
  return (
    <button className={`${base} ${sizeClasses} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
