import { generateWithClaude, extractJSON } from "./client";

/**
 * Analyze a batch of scraped Instagram posts from tracked accounts and return
 * ideation templates: topics + hook + format + engagement mechanic.
 * Focus is specifically on engagement-triggering mechanics the creator used
 * (comment-for-DM keyword, save-for-later, follow-for-more, poll, quiz, etc.).
 */
export async function generateEngagementIdeas(
  account: "business" | "personal",
  scrapedPosts: Array<{ id: string; title: string; content: string; engagement: Record<string, number>; url: string }>
): Promise<
  Array<{
    source_post_ids: string[];
    topic: string;
    hook_template: string;
    format: "reel" | "carousel" | "post";
    engagement_mechanic: string;
    rationale: string;
  }>
> {
  const voice = account === "business"
    ? "Azen — an AI agency helping founders Audit, Educate, and Deploy AI tools. Tone is direct, founder-focused, practical."
    : "Tayyib — a solo founder documenting AI + business lessons. Tone is personal, opinionated, 'founder voice'.";

  const systemPrompt = `You are a senior Instagram growth strategist studying competitor / peer content.

Your job: read the scraped posts from tracked accounts and extract POST IDEAS the user can create, focused specifically on ENGAGEMENT MECHANICS (how they get viewers to comment, save, share, or DM).

Account voice: ${voice}

For each idea, output:
- source_post_ids: which of the provided posts inspired this idea (by id)
- topic: what the post is ABOUT (short, 3-8 words)
- hook_template: the opening line the user would post (written in their voice)
- format: "reel", "carousel", or "post"
- engagement_mechanic: the exact mechanic, e.g. "Comment 'AI' to get the free framework DM'd", "7 slides → save for later", "Poll on slide 2 + explanation on slide 3"
- rationale: why this works for the tracked-account audience, citing the engagement numbers from the sourced posts

Return 5-8 ideas as a JSON array. Avoid duplicating a single mechanic twice — each idea should use a distinct engagement approach.
Return ONLY a JSON array, wrapped in \`\`\`json ... \`\`\` if you must format it.`;

  const postsPayload = scrapedPosts
    .map((p) => `ID: ${p.id}\nURL: ${p.url}\nTitle: ${p.title}\nCaption: ${p.content}\nEngagement: ${JSON.stringify(p.engagement)}`)
    .join("\n\n---\n\n");

  const raw = await generateWithClaude(systemPrompt, postsPayload);
  const parsed = extractJSON(raw);
  if (!Array.isArray(parsed)) throw new Error("Claude did not return a JSON array");
  return parsed as Array<{
    source_post_ids: string[];
    topic: string;
    hook_template: string;
    format: "reel" | "carousel" | "post";
    engagement_mechanic: string;
    rationale: string;
  }>;
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
