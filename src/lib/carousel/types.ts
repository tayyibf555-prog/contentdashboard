export type TemplateVariant = "azen" | "tayyib" | "architect" | "gradient" | "minimal" | "bold";

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
  backgroundImage?: string;
};

export type ContentSlideProps = {
  headline: string;
  bodyText: string;
  slideNumber: number;
  totalSlides: number;
  account: "business" | "personal";
  theme: SlideTheme;
  backgroundImage?: string;
};

export type CtaSlideProps = {
  headline: string;
  ctaText: string;
  account: "business" | "personal";
  theme: SlideTheme;
  slideNumber: number;
  totalSlides: number;
  backgroundImage?: string;
};
