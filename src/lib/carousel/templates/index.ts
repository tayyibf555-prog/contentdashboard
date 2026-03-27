import type { TemplateVariant } from "../types";
import { ArchitectCover, ArchitectContent, ArchitectCta } from "./architect";
import { GradientCover, GradientContent, GradientCta } from "./gradient";
import { MinimalCover, MinimalContent, MinimalCta } from "./minimal";
import { BoldCover, BoldContent, BoldCta } from "./bold";

/* eslint-disable @typescript-eslint/no-explicit-any */
type TemplateSet = {
  cover: React.FC<any>;
  content: React.FC<any>;
  cta: React.FC<any>;
};

const REGISTRY: Record<TemplateVariant, TemplateSet> = {
  architect: { cover: ArchitectCover, content: ArchitectContent, cta: ArchitectCta },
  gradient: { cover: GradientCover, content: GradientContent, cta: GradientCta },
  minimal: { cover: MinimalCover, content: MinimalContent, cta: MinimalCta },
  bold: { cover: BoldCover, content: BoldContent, cta: BoldCta },
};

export function getTemplate(variant: TemplateVariant, slideType: "cover" | "content" | "cta") {
  return REGISTRY[variant][slideType];
}
