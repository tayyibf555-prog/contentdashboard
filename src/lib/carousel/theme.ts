import { BUSINESS_PILLARS, PERSONAL_PILLARS } from "@/lib/constants";
import type { TemplateVariant, SlideTheme } from "./types";

const ACCOUNT_VARIANTS: Record<string, TemplateVariant[]> = {
  business: ["architect", "minimal"],
  personal: ["gradient", "bold"],
};

export function resolveTheme(
  account: "business" | "personal",
  pillar: string,
  variantOverride?: TemplateVariant
): SlideTheme {
  const pillars = account === "business" ? BUSINESS_PILLARS : PERSONAL_PILLARS;
  const pillarDef = pillars.find((p) => p.key === pillar);
  const accentColor = pillarDef?.color || "#00d4aa";

  let variant: TemplateVariant;
  if (variantOverride) {
    variant = variantOverride;
  } else {
    const defaults = ACCOUNT_VARIANTS[account];
    const pillarIndex = pillars.findIndex((p) => p.key === pillar);
    variant = defaults[Math.max(0, pillarIndex) % defaults.length];
  }

  return { variant, accentColor, account, pillar };
}
