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
  engagement: Record<string, number>;
  url: string;
  postedAt: string;
};

const ACTOR_IDS: Record<string, string> = {
  instagram: "apify~instagram-scraper",
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
    `${APIFY_BASE}/acts/${actorId}/runs?token=${token}&waitForFinish=120`,
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

function buildInput(platform: string, handle: string): Record<string, unknown> {
  switch (platform) {
    case "instagram":
      return { usernames: [handle.replace("@", "")], resultsLimit: 10 };
    case "youtube":
      return {
        startUrls: [{ url: `https://www.youtube.com/@${handle.replace("@", "")}/videos` }],
        maxResults: 5,
      };
    case "twitter":
      return { handle: handle.replace("@", ""), tweetsDesired: 10 };
    case "linkedin":
      return { searchUrl: `https://www.linkedin.com/in/${handle}/recent-activity/all/`, maxPosts: 10 };
    default:
      return {};
  }
}

function normalizeResult(platform: string, item: Record<string, unknown>): ScrapeResult {
  switch (platform) {
    case "youtube":
      return {
        platform,
        title: (item.title as string) || "",
        content: (item.text as string) || (item.description as string) || "",
        engagement: {
          likes: (item.likes as number) || 0,
          comments: (item.commentsCount as number) || 0,
          shares: 0,
          views: (item.viewCount as number) || 0,
        },
        url: (item.url as string) || "",
        postedAt: (item.date as string) || new Date().toISOString(),
      };
    case "instagram":
      return {
        platform,
        title: ((item.caption as string) || "").slice(0, 100),
        content: (item.caption as string) || "",
        engagement: {
          likes: (item.likesCount as number) || 0,
          comments: (item.commentsCount as number) || 0,
          shares: 0,
          views: (item.videoViewCount as number) || (item.viewCount as number) || 0,
        },
        url: (item.url as string) || "",
        postedAt: (item.timestamp as string) || new Date().toISOString(),
      };
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
