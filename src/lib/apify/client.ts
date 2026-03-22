import { ApifyClient } from "apify-client";

function getApify() {
  return new ApifyClient({
    token: process.env.APIFY_API_TOKEN,
  });
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
  instagram: "apify/instagram-scraper",
  youtube: "bernardo/youtube-scraper",
  twitter: "apidojo/tweet-scraper",
  linkedin: "curious_coder/linkedin-post-scraper",
};

export async function scrapeAccount(
  platform: string,
  handle: string
): Promise<ScrapeResult[]> {
  const actorId = ACTOR_IDS[platform];
  if (!actorId) throw new Error(`No scraper for platform: ${platform}`);

  const input = buildInput(platform, handle);
  const apify = getApify();
  const run = await apify.actor(actorId).call(input);
  const { items } = await apify.dataset(run.defaultDatasetId).listItems();

  return items.map((item: Record<string, unknown>) => normalizeResult(platform, item));
}

function buildInput(platform: string, handle: string): Record<string, unknown> {
  switch (platform) {
    case "instagram":
      return { usernames: [handle.replace("@", "")], resultsLimit: 10 };
    case "youtube":
      return { channelUrls: [`https://youtube.com/@${handle.replace("@", "")}`], maxResults: 5 };
    case "twitter":
      return { handle: handle.replace("@", ""), tweetsDesired: 10 };
    case "linkedin":
      return { profileUrl: handle, maxPosts: 10 };
    default:
      return {};
  }
}

function normalizeResult(platform: string, item: Record<string, unknown>): ScrapeResult {
  return {
    platform,
    title: (item.title as string) || (item.text as string) || "",
    content: (item.caption as string) || (item.text as string) || (item.description as string) || "",
    engagement: {
      likes: (item.likesCount as number) || (item.likes as number) || 0,
      comments: (item.commentsCount as number) || (item.comments as number) || 0,
      shares: (item.sharesCount as number) || (item.shares as number) || 0,
      views: (item.viewsCount as number) || (item.views as number) || 0,
    },
    url: (item.url as string) || (item.postUrl as string) || "",
    postedAt: (item.timestamp as string) || (item.publishedAt as string) || new Date().toISOString(),
  };
}
