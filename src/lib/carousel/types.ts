export type TemplateVariant = "azen" | "architect" | "gradient" | "minimal" | "bold";

export type SlideTheme = {
  variant: TemplateVariant;
  accentColor: string;
  account: "business" | "personal";
  pillar: string;
};

export type CoverSlideProps = {
  headline: string;
  accentWord: string;
  subtitle?: string;
  account: "business" | "personal";
  theme: SlideTheme;
  slideNumber: number;
  totalSlides: number;
};

export type ContentSlideProps = {
  headline: string;
  bodyText: string;
  slideNumber: number;
  totalSlides: number;
  account: "business" | "personal";
  theme: SlideTheme;
};

export type CtaSlideProps = {
  headline: string;
  ctaText: string;
  account: "business" | "personal";
  theme: SlideTheme;
  slideNumber: number;
  totalSlides: number;
};
