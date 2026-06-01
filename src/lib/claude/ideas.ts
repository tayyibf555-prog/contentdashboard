import { generateWithClaude, extractJSON } from "./client";

export type ReelIdea = {
  source_post_id: string;
  topic: string;
  idea: string;
  framings: string[];
};

/**
 * Given the top-performing competitor reels, distill the CORE IDEA behind each
 * one (what made it work as a piece of content — not a script) plus 2-3 short,
 * casual angles for how the user could frame the same idea. One idea per reel.
 */
export async function generateReelIdeas(
  account: "business" | "personal",
  reels: Array<{ id: string; title: string; content: string; engagement: Record<string, number>; url: string }>
): Promise<ReelIdea[]> {
  const voice = account === "business"
    ? "Azen — an AI agency helping founders Audit, Educate, and Deploy AI tools. Direct, founder-focused, practical."
    : "Tayyib — a solo founder documenting AI + business lessons. Personal, opinionated, conversational 'founder voice'.";

  const systemPrompt = `You are a senior Instagram content strategist studying the highest-performing reels from competitor / peer accounts.

Account voice: ${voice}

Your job: for EACH reel provided, distill the underlying CONTENT IDEA — the reusable concept that made it perform — so the user can make their own version. You are NOT writing a script, hook line, caption, or shot list. Just the idea, and a few ways to angle it.

For each reel, output an object with:
- source_post_id: the id of the reel this idea came from (echo it back exactly)
- topic: a short 3-8 word label of what it's about
- idea: 1-2 sentences describing the core, reusable idea behind the reel (the concept, not the execution)
- framings: an array of EXACTLY 2-3 short, casual angles for approaching this idea — each written like a quick note to self, NOT polished copy. Examples of the STYLE: "frame it as a mistake you made early on", "go contrarian — argue most people do this backwards", "make it a step-by-step you wish someone told you". Keep each under ~15 words.

Produce exactly one idea object per reel provided — do not merge reels or invent extra ones.
Return ONLY a JSON array of these objects, wrapped in \`\`\`json ... \`\`\` if you must format it.`;

  const reelsPayload = reels
    .map((p) => `ID: ${p.id}\nURL: ${p.url}\nTitle: ${p.title}\nCaption: ${p.content}\nEngagement: ${JSON.stringify(p.engagement)}`)
    .join("\n\n---\n\n");

  const raw = await generateWithClaude(systemPrompt, reelsPayload);
  const parsed = extractJSON(raw);
  if (!Array.isArray(parsed)) throw new Error("Claude did not return a JSON array");
  return (parsed as ReelIdea[])
    .filter((i) => i && i.source_post_id && i.idea)
    .map((i) => ({
      source_post_id: i.source_post_id,
      topic: i.topic || "",
      idea: i.idea,
      framings: Array.isArray(i.framings) ? i.framings.slice(0, 3) : [],
    }));
}

export type VideoIdeaResult = {
  source_post_id: string;
  video_title: string;
  overview: string;
  how_to_recreate: string;
  niche: string;
};

/**
 * Given the top-performing competitor YouTube long-form videos, produce for each
 * a recreate-able video idea: a title the user could use for their own version,
 * a brief overview of the source video, and how to recreate it. Themed toward
 * content that attracts business-owner clients who need AI. One idea per video.
 */
export async function generateVideoIdeas(
  account: "business" | "personal",
  videos: Array<{ id: string; title: string; content: string; engagement: Record<string, number>; url: string }>
): Promise<VideoIdeaResult[]> {
  const voice = account === "business"
    ? "Azen — an AI agency helping founders Audit, Educate, and Deploy AI tools. Direct, founder-focused, practical."
    : "Tayyib — a solo founder documenting AI + business lessons, founder of Azen AI (an agency that builds custom AI solutions for businesses). Personal, opinionated, conversational 'founder voice'.";

  const systemPrompt = `You are a senior YouTube strategist studying the highest-performing long-form videos from peer / competitor channels.

Account voice: ${voice}

GOAL: the user makes YouTube videos to attract business-owner clients who need AI for their business. The best-fitting angles are: founder takes on AI, personal stories about building with AI, practical "AI for your business" breakdowns, and lead-generating content. Every idea should ladder up to "this makes a business owner trust Tayyib and want to work with Azen."

For EACH video provided, distill a recreate-able idea (NOT a script). Output an object with:
- source_post_id: the id of the source video (echo it back exactly)
- video_title: a compelling YouTube title the user could use for their OWN video on the same idea — in their voice, oriented toward attracting AI clients. Do NOT copy the original title.
- overview: 1-2 sentences on what the source video is about.
- how_to_recreate: a short, practical note on how the user would make their own version — the angle/approach to take, not a full script.
- niche: which lane it fits — one of "Founder takes on AI", "Personal story", "Client acquisition", "AI use-cases", or a similarly short label.

Produce exactly one idea object per video provided — do not merge videos or invent extra ones.
Return ONLY a JSON array of these objects, wrapped in \`\`\`json ... \`\`\` if you must format it.`;

  const videosPayload = videos
    .map((p) => `ID: ${p.id}\nURL: ${p.url}\nTitle: ${p.title}\nDescription: ${p.content}\nEngagement: ${JSON.stringify(p.engagement)}`)
    .join("\n\n---\n\n");

  const raw = await generateWithClaude(systemPrompt, videosPayload);
  const parsed = extractJSON(raw);
  if (!Array.isArray(parsed)) throw new Error("Claude did not return a JSON array");
  return (parsed as VideoIdeaResult[])
    .filter((i) => i && i.source_post_id && i.video_title)
    .map((i) => ({
      source_post_id: i.source_post_id,
      video_title: i.video_title,
      overview: i.overview || "",
      how_to_recreate: i.how_to_recreate || "",
      niche: i.niche || "",
    }));
}

/**
 * Given a scraped post OR a plain description, return a recreation plan the
 * user can execute themselves — tailored to their voice.
 */
export async function generateRecreationPlan(
  account: "business" | "personal",
  source: {
    url?: string;
    caption?: string;
    engagement?: Record<string, number | string>;
    description?: string;
    forceFormat?: "carousel" | "reel" | "post";
  }
): Promise<{
  format: "reel" | "carousel" | "post";
  topic: string;
  hook: string;
  structure: Array<{ slide_or_beat: string; on_screen_text?: string; voiceover?: string; notes?: string }>;
  engagement_mechanic: string;
  cta: string;
  shot_list_or_slide_notes: string;
  recording_tips?: string;
}> {
  const voice = account === "business"
    ? "Azen — an AI agency helping founders Audit, Educate, Deploy. Direct, founder-focused, practical."
    : "Tayyib — a solo founder documenting AI + business lessons. Personal, opinionated, conversational.";

  const formatRule = source.forceFormat
    ? `\n\nMANDATORY FORMAT: The output MUST be a "${source.forceFormat}". Do not pick a different format — the source post is a ${source.forceFormat} and the user wants the recreation in the same format.`
    : "";

  const systemPrompt = `You are a senior content strategist helping the user recreate high-performing Instagram content in their own voice.

Account voice: ${voice}${formatRule}

Given the source (either a URL + caption with engagement stats, OR a plain description), produce a recreation plan.

Output JSON with these exact keys:
- format: "reel" | "carousel" | "post"${source.forceFormat ? ` (MUST be "${source.forceFormat}")` : ""}
- topic: 3-8 words
- hook: the exact opening line to use (voice-matched)
- structure: ordered array. For reels: objects with beat, on_screen_text, voiceover, notes. For carousels: 6-8 objects with slide_or_beat (slide headline) + notes.
- engagement_mechanic: exact wording of the mechanic (e.g. "Comment 'PLAYBOOK' and I'll DM you the Notion template")
- cta: final CTA line
- shot_list_or_slide_notes: for reels = shot list as plain text; for carousels = slide-by-slide visual direction
- recording_tips: optional, brief tips on delivery / pace / visuals

Do NOT copy exact wording from the source — adapt to the user's voice.
Return ONLY a JSON object, wrapped in \`\`\`json ... \`\`\` if you must format it.`;

  const userPrompt = source.description
    ? `Description from user:\n${source.description}`
    : `Source URL: ${source.url || "unknown"}\nSource format: ${source.forceFormat || "unknown"}\nCaption: ${source.caption || ""}\nEngagement: ${JSON.stringify(source.engagement || {})}`;

  const raw = await generateWithClaude(systemPrompt, userPrompt);
  const parsed = extractJSON(raw) as {
    format: "reel" | "carousel" | "post";
    topic: string;
    hook: string;
    structure: Array<{ slide_or_beat: string; on_screen_text?: string; voiceover?: string; notes?: string }>;
    engagement_mechanic: string;
    cta: string;
    shot_list_or_slide_notes: string;
    recording_tips?: string;
  };
  // If caller forced a format, override whatever Claude returned — be strict
  if (source.forceFormat) parsed.format = source.forceFormat;
  return parsed;
}
