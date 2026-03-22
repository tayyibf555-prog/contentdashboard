import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        azen: {
          bg: "#0a0e1a",
          card: "#0d1220",
          border: "#1a2340",
          accent: "#00d4aa",
          text: "#8892b0",
          white: "#ffffff",
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
    },
  },
  plugins: [],
};
export default config;
