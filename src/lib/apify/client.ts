const APIFY_BASE = "https://api.apify.com/v2";

function getToken() {
  const token = process.env.APIFY_API_TOKEN;
  if (!token) throw new Error("APIFY_API_TOKEN is not set");
  return token;
}

type ScrapeResult = {
  platform: string;
  title: string;
  content: string;
  engagement: Record<string, number | string>;
  url: string;
  postedAt: string;
};

const ACTOR_IDS: Record<string, string> = {
  instagram: "apify~instagram-post-scraper",
  youtube: "streamers~youtube-scraper",
  twitter: "apidojo~tweet-scraper",
  linkedin: "curious_coder~linkedin-post-search-scraper",
};

export async function scrapeAccount(
  platform: string,
  handle: string
): Promise<ScrapeResult[]> {
  const actorId = ACTOR_IDS[platform];
  if (!actorId) throw new Error(`No scraper for platform: ${platform}`);

  const token = getToken();
  const input = buildInput(platform, handle);

  // Start actor run and wait for it to finish
  const runResponse = await fetch(
    `${APIFY_BASE}/acts/${actorId}/runs?token=${token}&waitForFinish=45`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    }
  );

  if (!runResponse.ok) {
    const text = await runResponse.text();
    throw new Error(`Apify actor run failed (${runResponse.status}): ${text}`);
  }

  const runData = await runResponse.json();
  const datasetId = runData.data?.defaultDatasetId;

  if (!datasetId) {
    throw new Error("No dataset ID returned from Apify run");
  }

  // Fetch results from dataset
  const datasetResponse = await fetch(
    `${APIFY_BASE}/datasets/${datasetId}/items?token=${token}&format=json`
  );

  if (!datasetResponse.ok) {
    throw new Error(`Failed to fetch dataset: ${datasetResponse.status}`);
  }

  const items: Record<string, unknown>[] = await datasetResponse.json();

  return items.map((item) => normalizeResult(platform, item));
}

// From a recent batch of Instagram results, keep only the top performers:
// the 5 best reels (by views, fallback likes+comments) and the 3 best
// carousels (by likes+comments). Single images and long videos are dropped.
export function selectTopInstagram(results: ScrapeResult[]): ScrapeResult[] {
  const num = (v: unknown) => Number(v) || 0;
  const views = (r: ScrapeResult) => num(r.engagement.views);
  const social = (r: ScrapeResult) => num(r.engagement.likes) + num(r.engagement.comments);

  const reels = results
    .filter((r) => r.engagement.postType === "reel")
    .sort((a, b) => (views(b) || social(b)) - (views(a) || social(a)))
    .slice(0, 5);

  const carousels = results
    .filter((r) => r.engagement.postType === "carousel")
    .sort((a, b) => social(b) - social(a))
    .slice(0, 3);

  return [...reels, ...carousels];
}

function buildInput(platform: string, handle: string): Record<string, unknown> {
  switch (platform) {
    case "instagram":
      // Pull a larger recent batch so selectTopInstagram can pick genuine
      // top performers (the actor returns recent order, not by popularity).
      return { username: [handle.replace("@", "")], resultsLimit: 50 };
    case "youtube":
      // Pull each channel's top long-form videos by views (the /videos tab
      // excludes Shorts), so ideas come from what actually performed.
      return {
        startUrls: [{ url: `https://www.youtube.com/@${handle.replace("@", "")}/videos` }],
        maxResults: 25,
        sortVideosBy: "POPULAR",
      };
    case "twitter":
      return { handle: handle.replace("@", ""), tweetsDesired: 10 };
    case "linkedin":
      return { searchUrl: `https://www.linkedin.com/in/${handle}/recent-activity/all/`, maxPosts: 10 };
    default:
      return {};
  }
}

// Parse a YouTube duration string ("12:34" / "1:02:33") to seconds.
// Returns 0 when the format is unrecognised (treated downstream as "unknown").
function parseDurationSeconds(raw: string): number {
  if (!raw) return 0;
  const parts = raw.split(":").map((p) => parseInt(p, 10));
  if (parts.some((n) => Number.isNaN(n))) return 0;
  return parts.reduce((acc, n) => acc * 60 + n, 0);
}

function normalizeResult(platform: string, item: Record<string, unknown>): ScrapeResult {
  switch (platform) {
    case "youtube": {
      const durationRaw = (item.duration as string) || "";
      return {
        platform,
        title: (item.title as string) || "",
        content: (item.text as string) || (item.description as string) || "",
        engagement: {
          likes: (item.likes as number) || 0,
          comments: (item.commentsCount as number) || 0,
          shares: 0,
          views: (item.viewCount as number) || 0,
          duration: durationRaw,
          durationSeconds: parseDurationSeconds(durationRaw),
        },
        url: (item.url as string) || "",
        postedAt: (item.date as string) || new Date().toISOString(),
      };
    }
    case "instagram": {
      // Derive post type from Apify fields: "Sidecar"=carousel, "Video"+productType="clips"=reel, "Image"=post
      let postType: "carousel" | "reel" | "video" | "post" = "post";
      const rawType = item.type as string | undefined;
      const productType = item.productType as string | undefined;
      if (rawType === "Sidecar") postType = "carousel";
      else if (rawType === "Video") postType = productType === "clips" ? "reel" : "video";
      else if (rawType === "Image") postType = "post";

      return {
        platform,
        title: ((item.caption as string) || "").slice(0, 100),
        content: (item.caption as string) || "",
        engagement: {
          likes: (item.likesCount as number) || 0,
          comments: (item.commentsCount as number) || 0,
          shares: 0,
          views: (item.videoPlayCount as number) || (item.videoViewCount as number) || (item.viewCount as number) || 0,
          postType,
        } as Record<string, number | string>,
        url: (item.url as string) || "",
        postedAt: (item.timestamp as string) || new Date().toISOString(),
      };
    }
    case "twitter":
      return {
        platform,
        title: ((item.text as string) || "").slice(0, 100),
        content: (item.text as string) || (item.full_text as string) || "",
        engagement: {
          likes: (item.likeCount as number) || (item.favorite_count as number) || 0,
          comments: (item.replyCount as number) || 0,
          shares: (item.retweetCount as number) || (item.retweet_count as number) || 0,
          views: (item.viewCount as number) || 0,
        },
        url: (item.url as string) || (item.tweetUrl as string) || "",
        postedAt: (item.createdAt as string) || (item.created_at as string) || new Date().toISOString(),
      };
    case "linkedin":
      return {
        platform,
        title: ((item.text as string) || "").slice(0, 100),
        content: (item.text as string) || "",
        engagement: {
          likes: (item.numLikes as number) || (item.likesCount as number) || 0,
          comments: (item.numComments as number) || (item.commentsCount as number) || 0,
          shares: (item.numShares as number) || 0,
          views: (item.numViews as number) || 0,
        },
        url: (item.url as string) || (item.postUrl as string) || "",
        postedAt: (item.postedAt as string) || (item.publishedAt as string) || new Date().toISOString(),
      };
    default:
      return {
        platform,
        title: (item.title as string) || (item.text as string) || "",
        content: (item.text as string) || (item.description as string) || "",
        engagement: { likes: 0, comments: 0, shares: 0, views: 0 },
        url: (item.url as string) || "",
        postedAt: new Date().toISOString(),
      };
  }
}
