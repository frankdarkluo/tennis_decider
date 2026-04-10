import { NextRequest, NextResponse } from "next/server";
import { searchProviders } from "@/lib/platform-search/providers";
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

export async function POST(request: NextRequest) {
  try {
    const body = await request.json() as Partial<SearchVideosRequest>;
    const platform = body.platform;
    const query = typeof body.query === "string" ? normalizeQuery(body.query) : "";
    const maxResults = clampMaxResults(body.maxResults);

    if (!platform || !Object.prototype.hasOwnProperty.call(searchProviders, platform)) {
      return badRequest("platform is not supported");
    }

    if (!query) {
      return badRequest("query is required");
    }

    const provider = searchProviders[platform as SearchPlatform];
    const cachedResult = getFromCache(platform, query);
    if (cachedResult) {
      const payload: SearchVideosResponse = {
        platform,
        query,
        results: cachedResult,
        cached: true,
        availability: "supported"
      };
      return NextResponse.json(payload);
    }

    const providerResult = await provider.search(query, maxResults);
    if (providerResult.availability === "supported") {
      setCache(platform, query, providerResult.results);
    }

    const payload: SearchVideosResponse = {
      platform,
      query,
      results: providerResult.results,
      cached: false,
      availability: providerResult.availability
    };

    return NextResponse.json(payload);
  } catch (error) {
    console.error("[search-videos] search failed", error);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
