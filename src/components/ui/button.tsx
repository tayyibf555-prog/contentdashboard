import { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "icon" | "danger" | "ghost";

export function Button({
  variant = "primary",
  children,
  className = "",
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { variant?: ButtonVariant }) {
  const base = "rounded-md text-[11px] font-semibold transition-colors disabled:opacity-50";
  const variants: Record<ButtonVariant, string> = {
    primary: "bg-azen-accent text-azen-bg px-3 py-1.5 hover:bg-azen-accent/90",
    secondary: "bg-azen-border text-azen-text px-3 py-1.5 hover:text-white",
    icon: "bg-azen-border text-azen-text px-3 py-1.5 hover:text-white",
    danger: "bg-red-500/20 text-red-400 px-3 py-1.5 hover:bg-red-500/30",
    ghost: "text-azen-text px-3 py-1.5 hover:text-white hover:bg-azen-border/50",
  };

  return (
    <button className={`${base} ${variants[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
}
