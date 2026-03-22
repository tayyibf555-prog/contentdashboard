import Anthropic from "@anthropic-ai/sdk";

function getAnthropic() {
  return new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY,
  });
}

export async function generateContent(
  prompt: string,
  voiceSettings?: { tone_guidelines: string | null; writing_samples: string[]; avoid_words: string[]; preferred_words: string[] }
) {
  const systemParts = [
    "You are a content strategist for Azen, an AI agency that helps businesses implement custom AI solutions with a strategy-first approach (Audit, Educate, Deploy).",
    "Website: azen.io. Tagline: The Future Made Simple.",
    "Never use emojis. Use clean, professional text formatting.",
    "Write content that sounds human and authentic, not AI-generated.",
  ];

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

export async function analyzeResearch(scrapedContent: string) {
  return generateContent(
    `Analyze this scraped social media content and extract:\n1. Key Insight: What makes this post notable\n2. Content Opportunity: How an AI agency (Azen) could create content inspired by this\n3. Suggested Pillar: Which content pillar it maps to (AI Education, Case Studies, Industry Trends, Strategy & Process, CTA/Lead Gen, Behind the Scenes, Hot Takes, Tips & Tools, Journey & Lessons, Curated Insights)\n4. Trending Topics: Any trending themes mentioned\n\nRespond in JSON format: { "key_insight": "", "content_opportunity": "", "suggested_pillar": "", "trending_topics": [] }\n\nContent:\n${scrapedContent}`
  );
}
