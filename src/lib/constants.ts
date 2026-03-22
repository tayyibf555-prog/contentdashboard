export const BUSINESS_PILLARS = [
  { key: "education", label: "AI Education", color: "#00d4aa" },
  { key: "casestudy", label: "Case Studies & Results", color: "#fab1a0" },
  { key: "trends", label: "Industry Trends", color: "#81ecec" },
  { key: "strategy", label: "Strategy & Process", color: "#a29bfe" },
  { key: "cta", label: "CTA / Lead Gen", color: "#ff7675" },
] as const;

export const PERSONAL_PILLARS = [
  { key: "bts", label: "Behind the Scenes", color: "#ffeaa7" },
  { key: "hottakes", label: "Hot Takes & Opinions", color: "#74b9ff" },
  { key: "tips", label: "Tips & Tools", color: "#55efc4" },
  { key: "journey", label: "Journey & Lessons", color: "#fdcb6e" },
  { key: "curated", label: "Curated Insights", color: "#e17055" },
] as const;

export const PLATFORMS = {
  instagram: { key: "instagram", label: "IG", color: "#E1306C" },
  linkedin: { key: "linkedin", label: "LI", color: "#0A66C2" },
  youtube: { key: "youtube", label: "YT", color: "#FF0000" },
  twitter: { key: "twitter", label: "X", color: "#1DA1F2" },
} as const;

export const POSTING_SCHEDULE = {
  business: {
    instagram: { time: "12:30", label: "12:30 PM" },
    linkedin: { time: "09:00", label: "9:00 AM" },
    twitter: { time: "10:00", label: "10:00 AM" },
  },
  personal: {
    instagram: { time: "17:30", label: "5:30 PM" },
    linkedin: { time: "08:00", label: "8:00 AM" },
    twitter: { time: "11:00", label: "11:00 AM" },
    youtube: { time: "14:00", label: "2:00 PM", day: "Sunday" },
  },
} as const;

export const ACCOUNTS = {
  business: {
    instagram: "@azen_ai",
    linkedin: "Azen AI",
    twitter: "@azen_ai",
  },
  personal: {
    instagram: "@tayyib.ai",
    linkedin: "@tayyib.ai",
    twitter: "@tayyib.ai",
    youtube: "@tayyib.ai",
  },
} as const;
