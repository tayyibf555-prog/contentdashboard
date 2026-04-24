import { generateWithClaude, extractJSON } from "./client";

export type SlideEdit = {
  id: string;
  slide_number: number;
  slide_type: "cover" | "content" | "cta";
  headline: string | null;
  body_text: string | null;
};

export type AppliedChanges = {
  // Only the slides that actually changed. Unchanged slides are NOT returned.
  updated: Array<{ id: string; headline: string | null; body_text: string | null }>;
  note: string; // short summary of what was changed
};

/**
 * Ask Claude to apply the user's plain-language fix to a carousel.
 * Claude receives the current slide array + the instruction, and returns
 * ONLY the slides that need updating. This keeps unchanged slides untouched
 * so we don't regenerate images unnecessarily.
 */
export async function applyChangesToSlides(
  slides: SlideEdit[],
  instructions: string
): Promise<AppliedChanges> {
  const systemPrompt = `You are a careful editor applying a single instruction to an Instagram carousel.

You will receive:
- The current slides as a JSON array (each has id, slide_number, slide_type, headline, body_text)
- A plain-language instruction from the creator about what to change

Apply the instruction literally and surgically:
- Only touch what the instruction explicitly asks to change
- Do NOT rewrite or improve anything else
- Do NOT change slide order or add/remove slides
- Preserve tone, voice, length, capitalisation except where the instruction says otherwise
- If the instruction mentions a slide number, only touch that slide
- If the instruction says to fix a duplicated word or typo, fix ONLY that occurrence

Return a JSON object with two keys:
- updated: array of { id, headline, body_text } — ONLY include slides that actually changed
- note: one-sentence plain summary of what you changed

If nothing needs to change or the instruction is unclear, return updated: [] and explain in note.`;

  const userPrompt = `CURRENT SLIDES:
${JSON.stringify(slides, null, 2)}

INSTRUCTION:
${instructions}

Return the JSON object.`;

  const raw = await generateWithClaude(systemPrompt, userPrompt, { model: "haiku", maxTokens: 3000 });
  const parsed = extractJSON(raw) as AppliedChanges;
  if (!Array.isArray(parsed.updated)) {
    throw new Error("Claude did not return an 'updated' array");
  }
  return parsed;
}
