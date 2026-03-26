import { NextRequest, NextResponse } from "next/server";
import { SearchPlatform, SearchVideoResult, SearchVideosRequest, SearchVideosResponse } from "@/types/platformSearch";

export const runtime = "nodejs";

const CACHE_TTL_MS = 24 * 60 * 60 * 1000;
const MAX_CACHE_ITEMS = 200;
const DEFAULT_MAX_RESULTS = 5;

const cache = new Map<string, { data: SearchVideoResult[]; timestamp: number }>();

function badRequest(message: string) {
  return NextResponse.json({ error: message }, { status: 400 });
}

function clampMaxResults(value: unknown) {
  if (typeof value !== "number" || !Number.isFinite(value)) {
    return DEFAULT_MAX_RESULTS;
  }

  return Math.max(1, Math.min(8, Math.floor(value)));
}

function normalizeQuery(query: string) {
  return query.trim();
}

function getCacheKey(platform: SearchPlatform, query: string) {
  return `${platform}:${query.toLowerCase()}`;
}

function getFromCache(platform: SearchPlatform, query: string) {
  const key = getCacheKey(platform, query);
  const hit = cache.get(key);

  if (!hit) {
    return null;
  }

  if (Date.now() - hit.timestamp >= CACHE_TTL_MS) {
    cache.delete(key);
    return null;
  }

  return hit.data;
}

function setCache(platform: SearchPlatform, query: string, data: SearchVideoResult[]) {
  const key = getCacheKey(platform, query);
  cache.set(key, { data, timestamp: Date.now() });

  if (cache.size > MAX_CACHE_ITEMS) {
    const oldestKey = cache.keys().next().value;
    if (oldestKey) {
      cache.delete(oldestKey);
    }
  }
}

function stripTags(value: unknown) {
  if (typeof value !== "string") {
    return "";
  }

  return value
    .replace(/<[^>]+>/g, "")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&amp;/g, "&")
    .trim();
}

function parseBilibiliViewCount(value: unknown) {
  if (typeof value === "number" && Number.isFinite(value)) {
    return value;
  }

  if (typeof value !== "string") {
    return null;
  }

  const normalized = value.replace(/,/g, "").trim();
  if (!normalized) {
    return null;
  }

  if (normalized.endsWith("万")) {
    const base = Number.parseFloat(normalized.slice(0, -1));
    return Number.isFinite(base) ? Math.round(base * 10000) : null;
  }

  const parsed = Number.parseInt(normalized, 10);
  return Number.isFinite(parsed) ? parsed : null;
}

async function searchYouTube(query: string, maxResults: number): Promise<SearchVideoResult[]> {
  const apiKey = process.env.YOUTUBE_API_KEY;

  if (!apiKey) {
    console.warn("[search-videos] YOUTUBE_API_KEY is not configured");
    return [];
  }

  const params = new URLSearchParams({
    key: apiKey,
    type: "video",
    part: "snippet",
    q: query,
    maxResults: String(maxResults),
    relevanceLanguage: /[\u4e00-\u9fff]/.test(query) ? "zh" : "en"
  });

  const response = await fetch(`https://www.googleapis.com/youtube/v3/search?${params.toString()}`, {
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`YouTube search failed with status ${response.status}`);
  }

  const data = await response.json();
  if (!Array.isArray(data?.items)) {
    return [];
  }

  return data.items
    .map((item: any) => {
      const videoId = typeof item?.id?.videoId === "string" ? item.id.videoId : "";
      if (!videoId) {
        return null;
      }

      return {
        platform: "youtube" as const,
        videoId,
        title: stripTags(item?.snippet?.title),
        author: typeof item?.snippet?.channelTitle === "string" ? item.snippet.channelTitle : "",
        thumbnail: item?.snippet?.thumbnails?.medium?.url ?? item?.snippet?.thumbnails?.default?.url ?? "",
        url: `https://www.youtube.com/watch?v=${videoId}`,
        viewCount: null,
        duration: null,
        publishedAt: typeof item?.snippet?.publishedAt === "string" ? item.snippet.publishedAt : null
      } satisfies SearchVideoResult;
    })
    .filter((item: SearchVideoResult | null): item is SearchVideoResult => Boolean(item));
}

async function searchBilibili(query: string, maxResults: number): Promise<SearchVideoResult[]> {
  const params = new URLSearchParams({
    search_type: "video",
    keyword: query,
    page: "1",
    pagesize: String(maxResults),
    order: "totalrank"
  });

  const headers: HeadersInit = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    Referer: "https://www.bilibili.com"
  };

  if (process.env.BILIBILI_COOKIE) {
    headers.Cookie = process.env.BILIBILI_COOKIE;
  }

  const response = await fetch(`https://api.bilibili.com/x/web-interface/search/type?${params.toString()}`, {
    headers,
    cache: "no-store"
  });

  if (!response.ok) {
    throw new Error(`Bilibili search failed with status ${response.status}`);
  }

  const data = await response.json();
  if (!Array.isArray(data?.data?.result)) {
    return [];
  }

  return data.data.result
    .slice(0, maxResults)
    .map((item: any) => {
      const bvid = typeof item?.bvid === "string" ? item.bvid : "";
      const fallbackId = item?.aid != null ? String(item.aid) : "";
      const videoId = bvid || fallbackId;

      if (!videoId) {
        return null;
      }

      const pic = typeof item?.pic === "string" ? item.pic : "";
      const thumbnail = pic.startsWith("//") ? `https:${pic}` : pic;
      const publishedAt = item?.pubdate ? new Date(Number(item.pubdate) * 1000).toISOString() : null;

      return {
        platform: "bilibili" as const,
        videoId,
        title: stripTags(item?.title),
        author: typeof item?.author === "string" ? item.author : "",
        thumbnail,
        url: bvid ? `https://www.bilibili.com/video/${bvid}` : `https://www.bilibili.com/video/av${fallbackId}`,
        viewCount: parseBilibiliViewCount(item?.play),
        duration: typeof item?.duration === "string" ? item.duration : null,
        publishedAt
      } satisfies SearchVideoResult;
    })
    .filter((item: SearchVideoResult | null): item is SearchVideoResult => Boolean(item));
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Partial<SearchVideosRequest>;
    const platform = body.platform;
    const query = typeof body.query === "string" ? normalizeQuery(body.query) : "";
    const maxResults = clampMaxResults(body.maxResults);

    if (!platform || (platform !== "bilibili" && platform !== "youtube")) {
      return badRequest("platform must be bilibili or youtube");
    }

    if (!query) {
      return badRequest("query is required");
    }

    const cachedResult = getFromCache(platform, query);
    if (cachedResult) {
      const payload: SearchVideosResponse = {
        platform,
        query,
        results: cachedResult,
        cached: true
      };
      return NextResponse.json(payload);
    }

    const results = platform === "youtube"
      ? await searchYouTube(query, maxResults)
      : await searchBilibili(query, maxResults);

    setCache(platform, query, results);

    const payload: SearchVideosResponse = {
      platform,
      query,
      results,
      cached: false
    };

    return NextResponse.json(payload);
  } catch (error) {
    console.error("[search-videos] search failed", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
