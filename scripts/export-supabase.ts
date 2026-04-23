/**
 * Dump every table and every object in carousel-images to ./supabase-backup/.
 * Uses the OLD project credentials in .env.local — run BEFORE changing env vars.
 *
 *   npx tsx scripts/export-supabase.ts
 */
import { createClient } from "@supabase/supabase-js";
import { mkdirSync, writeFileSync } from "fs";
import path from "path";

const URL_ = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!URL_ || !KEY) throw new Error("Missing SUPABASE env vars");

const supabase = createClient(URL_, KEY, { auth: { persistSession: false } });

const TABLES = [
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

const OUT = "supabase-backup";
const OUT_TABLES = path.join(OUT, "tables");
const OUT_STORAGE = path.join(OUT, "storage", "carousel-images");

async function dumpTables() {
  mkdirSync(OUT_TABLES, { recursive: true });
  for (const table of TABLES) {
    let all: unknown[] = [];
    let from = 0;
    const page = 1000;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .range(from, from + page - 1);
      if (error) {
        console.warn(`  ! ${table}: ${error.message}`);
        break;
      }
      if (!data || data.length === 0) break;
      all = all.concat(data);
      if (data.length < page) break;
      from += page;
    }
    writeFileSync(path.join(OUT_TABLES, `${table}.json`), JSON.stringify(all, null, 2));
    console.log(`  ${table}: ${all.length} rows`);
  }
}

async function dumpStorage() {
  mkdirSync(OUT_STORAGE, { recursive: true });
  async function walk(prefix: string) {
    const { data, error } = await supabase.storage.from("carousel-images").list(prefix, { limit: 1000 });
    if (error) { console.warn(`  ! list ${prefix}: ${error.message}`); return; }
    if (!data) return;
    for (const item of data) {
      const key = prefix ? `${prefix}/${item.name}` : item.name;
      if (item.id === null && !item.metadata) {
        await walk(key);
        continue;
      }
      const { data: blob, error: dlErr } = await supabase.storage.from("carousel-images").download(key);
      if (dlErr || !blob) { console.warn(`  ! download ${key}: ${dlErr?.message}`); continue; }
      const outPath = path.join(OUT_STORAGE, key);
      mkdirSync(path.dirname(outPath), { recursive: true });
      writeFileSync(outPath, Buffer.from(await blob.arrayBuffer()));
      console.log(`  -> ${key} (${Math.round((await blob.arrayBuffer()).byteLength / 1024)}kb)`);
    }
  }
  await walk("");
}

async function main() {
  console.log("Exporting tables from", URL_);
  await dumpTables();
  console.log("\nExporting storage: carousel-images");
  await dumpStorage();
  console.log(`\nDone. Backup at ./${OUT}/`);
}

main().catch((e) => { console.error(e); process.exit(1); });
