/**
 * Rewrite CTAs on existing personal Instagram content (reels + carousels) to the
 * "Comment '[KEYWORD]' and I'll DM you the [guide / step-by-step plan]" format.
 *
 *   npx tsx scripts/rewrite-personal-ctas.ts
 */
import { createClient } from "@supabase/supabase-js";
import { generateWithClaude, extractJSON } from "../src/lib/claude/client";

const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!URL_ || !KEY) throw new Error("Missing SUPABASE env vars");

const supabase = createClient(URL_, KEY, { auth: { persistSession: false } });

async function rewriteCta(topic: string, body: string): Promise<{ keyword: string; cta: string }> {
  const system = `You write Instagram engagement CTAs. Given a post topic + body, produce ONE comment-keyword CTA.

Rules:
- Pick ONE short uppercase keyword closely tied to the topic (e.g. "AI", "PLAYBOOK", "GUIDE", "STACK", "SYSTEM", "SCALE", "FOUNDER")
- Output JSON: {"keyword":"KEYWORD","cta":"Comment 'KEYWORD' and I'll DM you the [guide / step-by-step plan / playbook / breakdown]"}
- Max 12 words in cta. No URLs. No emojis.
- Pick the DM reward ("guide", "step-by-step plan", "playbook", "breakdown") that fits the topic best.`;
  const user = `Topic: ${topic}\n\nBody:\n${body.slice(0, 1500)}`;
  const raw = await generateWithClaude(system, user);
  const parsed = extractJSON(raw) as { keyword: string; cta: string };
  return parsed;
}

async function rewriteReels() {
  const { data: reelPosts, error } = await supabase
    .from("generated_content")
    .select("id, title, body, reel_scripts(id, cta, hook, body_script)")
    .eq("platform", "instagram")
    .eq("account", "personal")
    .eq("content_type", "reel");

  if (error) { console.error("reels error:", error.message); return; }
  if (!reelPosts) return;

  console.log(`\nReels: ${reelPosts.length} personal reel posts`);
  for (const post of reelPosts as Array<{ id: string; title: string; body: string | null; reel_scripts: Array<{ id: string; cta: string | null; hook: string | null; body_script: string | null }> }>) {
    const script = post.reel_scripts?.[0];
    if (!script) { console.log(`  - ${post.title}: no script, skipping`); continue; }
    try {
      const body = [script.hook, script.body_script, post.body].filter(Boolean).join("\n");
      const { cta } = await rewriteCta(post.title, body);
      const { error: uErr } = await supabase.from("reel_scripts").update({ cta }).eq("id", script.id);
      if (uErr) { console.warn(`  ! ${post.title}: ${uErr.message}`); continue; }
      console.log(`  ✓ ${post.title}\n      -> ${cta}`);
    } catch (e) {
      console.warn(`  ! ${post.title}: ${e instanceof Error ? e.message : e}`);
    }
  }
}

async function rewriteCarousels() {
  const { data: posts, error } = await supabase
    .from("generated_content")
    .select("id, title, body, carousel_slides(id, slide_number, slide_type, headline, body_text)")
    .eq("platform", "instagram")
    .eq("account", "personal")
    .eq("content_type", "carousel");

  if (error) { console.error("carousels error:", error.message); return; }
  if (!posts) return;

  console.log(`\nCarousels: ${posts.length} personal carousel posts`);
  for (const post of posts as Array<{ id: string; title: string; body: string | null; carousel_slides: Array<{ id: string; slide_number: number; slide_type: string; headline: string | null; body_text: string | null }> }>) {
    const slides = post.carousel_slides || [];
    const ctaSlide = slides.find((s) => s.slide_type === "cta");
    if (!ctaSlide) { console.log(`  - ${post.title}: no CTA slide, skipping`); continue; }
    try {
      const summary = slides
        .sort((a, b) => a.slide_number - b.slide_number)
        .map((s) => `${s.headline || ""} ${s.body_text || ""}`.trim())
        .join("\n");
      const { cta } = await rewriteCta(post.title, summary);
      const { error: uErr } = await supabase
        .from("carousel_slides")
        .update({ body_text: cta, image_url: null })
        .eq("id", ctaSlide.id);
      if (uErr) { console.warn(`  ! ${post.title}: ${uErr.message}`); continue; }
      console.log(`  ✓ ${post.title}\n      -> ${cta}`);
    } catch (e) {
      console.warn(`  ! ${post.title}: ${e instanceof Error ? e.message : e}`);
    }
  }
}

async function main() {
  console.log("Rewriting CTAs on personal IG content at", URL_);
  await rewriteReels();
  await rewriteCarousels();
  console.log("\nDone. Carousel CTA slides had their image_url cleared — they will regenerate on next view.");
}

main().catch((e) => { console.error(e); process.exit(1); });
