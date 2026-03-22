const AYRSHARE_BASE = "https://app.ayrshare.com/api";

async function ayrshareRequest(
  endpoint: string,
  method: string,
  body?: Record<string, unknown>,
  profileKey?: string
) {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    Authorization: `Bearer ${process.env.AYRSHARE_API_KEY}`,
  };
  if (profileKey) {
    headers["Profile-Key"] = profileKey;
  }

  const res = await fetch(`${AYRSHARE_BASE}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (!res.ok) {
    const error = await res.text();
    throw new Error(`Ayrshare API error: ${res.status} ${error}`);
  }

  return res.json();
}

export async function postToSocial({
  platforms,
  post,
  mediaUrls,
  scheduleDate,
  profileKey,
}: {
  platforms: string[];
  post: string;
  mediaUrls?: string[];
  scheduleDate?: string;
  profileKey?: string;
}) {
  return ayrshareRequest("/post", "POST", {
    platforms,
    post,
    mediaUrls,
    scheduleDate,
    shortenLinks: true,
  }, profileKey);
}

export async function getAnalytics({
  platforms,
  profileKey,
}: {
  platforms: string[];
  profileKey?: string;
}) {
  return ayrshareRequest("/analytics/social", "POST", {
    platforms,
  }, profileKey);
}

export async function deletePost(id: string, profileKey?: string) {
  return ayrshareRequest("/delete", "DELETE", { id }, profileKey);
}
