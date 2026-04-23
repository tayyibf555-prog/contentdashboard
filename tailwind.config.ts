import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "monospace"],
      },
      fontSize: {
        "meta": ["11px", { lineHeight: "1.4", letterSpacing: "0.02em" }],
        "label": ["12px", { lineHeight: "1.4", letterSpacing: "0.04em" }],
        "body": ["14px", { lineHeight: "1.55" }],
        "title": ["16px", { lineHeight: "1.4", letterSpacing: "-0.005em" }],
        "headline": ["22px", { lineHeight: "1.2", letterSpacing: "-0.01em" }],
        "display-sm": ["32px", { lineHeight: "1.1", letterSpacing: "-0.02em" }],
        "display": ["44px", { lineHeight: "1.05", letterSpacing: "-0.025em" }],
        "display-lg": ["64px", { lineHeight: "1", letterSpacing: "-0.03em" }],
        "hero": ["88px", { lineHeight: "0.95", letterSpacing: "-0.04em" }],
      },
      colors: {
        azen: {
          // Depth layers
          bg: "#07090F",
          surface: "#0D1220",
          "surface-2": "#131A2D",
          line: "#1A2340",
          "line-strong": "#242F4F",
          muted: "#6A7592",
          text: "#8892b0",
          "text-strong": "#C8D1E8",
          white: "#ffffff",
          // Accent
          accent: "#00d4aa",
          "accent-soft": "#00d4aa22",
          "accent-glow": "#00d4aa66",
          // Legacy aliases to keep existing code compiling during migration
          card: "#0D1220",
          border: "#1A2340",
        },
        ink: {
          50: "#F4F7FB",
          100: "#D7DEEF",
          200: "#AAB4D0",
          300: "#7E8AAE",
          400: "#5E688A",
          500: "#3F4868",
          600: "#2B334E",
          700: "#1A2340",
          800: "#111833",
          900: "#07090F",
        },
        platform: {
          ig: "#E1306C",
          li: "#0A66C2",
          yt: "#FF0000",
          x: "#1DA1F2",
        },
        pillar: {
          education: "#00d4aa",
          strategy: "#a29bfe",
          bts: "#ffeaa7",
          casestudy: "#fab1a0",
          hottakes: "#74b9ff",
          cta: "#ff7675",
          tips: "#55efc4",
          journey: "#fdcb6e",
          curated: "#e17055",
          trends: "#81ecec",
        },
      },
      borderRadius: {
        "sm": "6px",
        DEFAULT: "10px",
        "lg": "14px",
        "xl": "20px",
        "pill": "999px",
      },
      boxShadow: {
        raised: "0 1px 0 rgba(255,255,255,0.04) inset, 0 1px 2px rgba(0,0,0,0.35)",
        lift: "0 8px 24px -12px rgba(0,0,0,0.6), 0 2px 0 rgba(255,255,255,0.03) inset",
        pop: "0 20px 60px -20px rgba(0,0,0,0.7), 0 4px 0 rgba(255,255,255,0.04) inset",
        accent:
          "0 0 0 1px rgba(var(--color-azen-accent-rgb), 0.26), 0 8px 30px -8px rgba(var(--color-azen-accent-rgb), 0.33)",
        "accent-strong":
          "0 0 0 1px rgba(var(--color-azen-accent-rgb), 0.55), 0 20px 60px -12px rgba(var(--color-azen-accent-rgb), 0.4)",
      },
      keyframes: {
        "fade-in-up": {
          "0%": { opacity: "0", transform: "translate3d(0, 10px, 0)" },
          "100%": { opacity: "1", transform: "translate3d(0, 0, 0)" },
        },
        "fade-in": {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        "scale-in": {
          "0%": { opacity: "0", transform: "scale(0.96)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        "pulse-dot": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.35" },
        },
      },
      animation: {
        "fade-in-up": "fade-in-up 500ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "fade-in": "fade-in 500ms ease-out both",
        "scale-in": "scale-in 220ms cubic-bezier(0.22, 1, 0.36, 1) both",
        "pulse-dot": "pulse-dot 1.6s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
export default config;
