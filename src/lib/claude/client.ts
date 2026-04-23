import Anthropic from "@anthropic-ai/sdk";

function getAnthropic() {
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
}

export async function generateContent(
  prompt: string,
  voiceSettings?: { tone_guidelines: string | null; writing_samples: string[]; avoid_words: string[]; preferred_words: string[] },
  account?: "business" | "personal"
) {
  const systemParts: string[] = [];

  if (account === "personal") {
    systemParts.push(
      "You are writing content for @tayyib.ai — the personal brand of Tayyib, founder of Azen AI (azen.io), an agency that builds custom AI solutions for businesses.",
      "Your audience is business owners, founders, and decision-makers who are curious about AI but haven't taken action yet. Your job is to educate them with real insights, practical frameworks, and clear thinking about how AI applies to real business problems — so they naturally realize they need help implementing it.",
      "Content strategy rules:\n- Lead with value. Teach something genuinely useful in every post.\n- Cover a wide range of AI and business topics: operations, marketing, sales, customer service, hiring, workflows, strategy, industry trends, real-world use cases — not just one tool or product.\n- Never be salesy or pitch services directly. The goal is to position Tayyib as the go-to person business owners trust on AI, so when they're ready to act, they come to him.\n- Share opinions and frameworks, not just news. Business owners respect someone who thinks, not someone who summarizes.\n- When referencing tools or technologies, talk about the business outcome they enable, not the technical details.\n- Make complex AI concepts feel simple and actionable.",
    );
  } else {
    systemParts.push(
      "You are a lead-generation content strategist for Azen AI (@azen_ai), an agency that builds and deploys custom AI solutions for businesses using the Audit, Educate, Deploy methodology.",
      "Website: azen.io. Tagline: The Future Made Simple.",
      "Your primary goal is to generate inbound leads for Azen AI. Every piece of content should make business owners realize they are leaving money on the table by not implementing AI — and position Azen as the obvious choice to help them.",
      "Content strategy rules:\n- Lead with business outcomes (revenue, time saved, competitive advantage), not technical details.\n- Show the gap: where businesses are now vs where AI could take them.\n- Use specificity: mention industries, roles, processes, and real numbers whenever possible.\n- Every post should have a clear next step: book a free AI audit at azen.io, DM for a strategy call, or visit azen.io.\n- Never sound desperate or salesy. Be confident and authoritative — you know AI implementation better than anyone.\n- Competitor content is research fuel: see what others talk about and find the angle they missed.\n- Content pillars to rotate: case studies/ROI, AI strategy frameworks, industry-specific use cases, common mistakes businesses make with AI, behind-the-scenes of implementations.",
    );
  }

  systemParts.push(
    `Today's date is ${new Date().toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}. All content must be current and reference the present time period — never reference past years as if they are the present.`,
    "Never use emojis. Use clean, professional text formatting.",
    "Write content that sounds human and authentic, not AI-generated.",
  );

  if (voiceSettings) {
    if (voiceSettings.tone_guidelines) {
      systemParts.push(`Tone guidelines: ${voiceSettings.tone_guidelines}`);
    }
    if (voiceSettings.writing_samples.length > 0) {
      systemParts.push(`Match the voice and style of these writing samples:\n${voiceSettings.writing_samples.join("\n---\n")}`);
    }
    if (voiceSettings.avoid_words.length > 0) {
      systemParts.push(`Never use these words/phrases: ${voiceSettings.avoid_words.join(", ")}`);
    }
    if (voiceSettings.preferred_words.length > 0) {
      systemParts.push(`Prefer using these words/phrases: ${voiceSettings.preferred_words.join(", ")}`);
    }
  }

  const anthropic = getAnthropic();
  const message = await anthropic.messages.create({
    model: "claude-sonnet-4-5-20250929",
    max_tokens: 4096,
    system: systemParts.join("\n\n"),
    messages: [{ role: "user", content: prompt }],
  });

  const textBlock = message.content.find((block) => block.type === "text");
  return textBlock ? textBlock.text : "";
}

export type ClaudeModel = "sonnet" | "haiku" | "opus";

const MODEL_IDS: Record<ClaudeModel, string> = {
  sonnet: "claude-sonnet-4-5-20250929",
  haiku: "claude-haiku-4-5-20251001",
  opus: "claude-opus-4-7",
};

export async function generateWithClaude(
  systemPrompt: string,
  userPrompt: string,
  opts: { model?: ClaudeModel; maxTokens?: number } = {}
): Promise<string> {
  const anthropic = getAnthropic();
  const message = await anthropic.messages.create({
    model: MODEL_IDS[opts.model || "sonnet"],
    max_tokens: opts.maxTokens ?? 4096,
    system: systemPrompt,
    messages: [{ role: "user", content: userPrompt }],
  });
  const textBlock = message.content.find((b) => b.type === "text");
  return textBlock?.text || "";
}

export function extractJSON(raw: string): unknown {
  const jsonMatch = raw.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    return JSON.parse(jsonMatch[1].trim());
  }
  const objectMatch = raw.match(/\{[\s\S]*\}/);
  return objectMatch ? JSON.parse(objectMatch[0]) : JSON.parse(raw);
}

export async function analyzeResearch(scrapedContent: string) {
  return generateContent(
    `Analyze this scraped social media content and extract:\n1. Key Insight: What makes this post notable\n2. Content Opportunity: How an AI agency (Azen) could create content inspired by this\n3. Suggested Pillar: Which content pillar it maps to (AI Education, Case Studies, Industry Trends, Strategy & Process, CTA/Lead Gen, Behind the Scenes, Hot Takes, Tips & Tools, Journey & Lessons, Curated Insights)\n4. Trending Topics: Any trending themes mentioned\n\nRespond in JSON format: { "key_insight": "", "content_opportunity": "", "suggested_pillar": "", "trending_topics": [] }\n\nContent:\n${scrapedContent}`
  );
}
