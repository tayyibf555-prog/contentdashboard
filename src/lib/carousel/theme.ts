import { BUSINESS_PILLARS, PERSONAL_PILLARS } from "@/lib/constants";
import type { TemplateVariant, SlideTheme } from "./types";

/**
 * Every generated carousel — business or personal — now defaults to the
 * tayyib template (black + royal-blue radial + subtle grain + spec-literal
 * typography). Manual template overrides from the UI still work via
 * variantOverride, so you can pick a different variant per-post if needed.
 */
export function resolveTheme(
  account: "business" | "personal",
  pillar: string,
  variantOverride?: TemplateVariant
): SlideTheme {
  const pillars = account === "business" ? BUSINESS_PILLARS : PERSONAL_PILLARS;
  const pillarDef = pillars.find((p) => p.key === pillar);
  // Accent defaults to the tayyib royal blue; a non-default variant can still
  // read the pillar colour if it wants to
  const accentColor = pillarDef?.color || "#3B82F6";

  const variant: TemplateVariant = variantOverride || "tayyib";

  return { variant, accentColor, account, pillar };
}
