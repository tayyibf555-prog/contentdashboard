/**
 * Restore ./supabase-backup/ into a fresh Supabase project.
 * Run AFTER updating .env.local with the NEW project's URL + service role key
 * and AFTER running migrations/000_full_setup.sql in the new project.
 *
 *   npx tsx scripts/import-supabase.ts
 */
import { createClient } from "@supabase/supabase-js";
import { readFileSync, readdirSync, statSync, existsSync } from "fs";
import path from "path";

const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!URL_ || !KEY) throw new Error("Missing SUPABASE env vars");

const supabase = createClient(URL_, KEY, { auth: { persistSession: false } });

// Order matters: parents before children (foreign keys)
const TABLES_IN_ORDER = [
  "tracked_accounts",
  "scraped_posts",
  "ai_analysis",
  "generated_content",
  "carousel_slides",
  "youtube_scripts",
  "reel_scripts",
  "engagement_metrics",
  "social_auth_tokens",
  "voice_settings",
  "evergreen_content",
];

const BACKUP = "supabase-backup";
const BACKUP_TABLES = path.join(BACKUP, "tables");
const BACKUP_STORAGE = path.join(BACKUP, "storage", "carousel-images");

async function restoreTables() {
  for (const table of TABLES_IN_ORDER) {
    const file = path.join(BACKUP_TABLES, `${table}.json`);
    if (!existsSync(file)) { console.log(`  (skip ${table}: no backup file)`); continue; }
    const rows = JSON.parse(readFileSync(file, "utf8")) as Record<string, unknown>[];
    if (rows.length === 0) { console.log(`  ${table}: 0 rows`); continue; }

    // Upsert in chunks of 500
    const chunk = 500;
    let inserted = 0;
    for (let i = 0; i < rows.length; i += chunk) {
      const slice = rows.slice(i, i + chunk);
      const { error } = await supabase.from(table).upsert(slice, { onConflict: "id" });
      if (error) { console.warn(`  ! ${table} chunk ${i}: ${error.message}`); break; }
      inserted += slice.length;
    }
    console.log(`  ${table}: ${inserted} rows`);
  }
}

async function restoreStorage() {
  if (!existsSync(BACKUP_STORAGE)) { console.log("  (no storage backup)"); return; }

  function walk(dir: string): string[] {
    const entries = readdirSync(dir);
    const files: string[] = [];
    for (const e of entries) {
      const full = path.join(dir, e);
      if (statSync(full).isDirectory()) files.push(...walk(full));
      else files.push(full);
    }
    return files;
  }

  const files = walk(BACKUP_STORAGE);
  for (const f of files) {
    const key = path.relative(BACKUP_STORAGE, f).split(path.sep).join("/");
    const data = readFileSync(f);
    const contentType = key.endsWith(".png") ? "image/png" : key.endsWith(".jpg") ? "image/jpeg" : "application/octet-stream";
    const { error } = await supabase.storage.from("carousel-images").upload(key, data, { contentType, upsert: true });
    if (error) console.warn(`  ! ${key}: ${error.message}`);
    else console.log(`  -> ${key}`);
  }
}

async function main() {
  console.log("Importing into", URL_);
  console.log("\nRestoring tables...");
  await restoreTables();
  console.log("\nRestoring storage...");
  await restoreStorage();
  console.log("\nDone.");
}

main().catch((e) => { console.error(e); process.exit(1); });
