import {
  SearchAvailability,
  SearchPlatform,
  SearchVideoResult,
  SupportedSearchPlatform
} from "@/types/platformSearch";

type SearchProviderResult = {
  availability: SearchAvailability;
  results: SearchVideoResult[];
};

type SearchProvider = {
  platform: SearchPlatform;
  search(query: string, maxResults: number): Promise<SearchProviderResult>;
};

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

function unsupportedProvider(platform: SearchPlatform): SearchProvider {
  return {
    platform,
    async search() {
      return {
        availability: "unsupported",
        results: []
      };
    }
  };
}

const youtubeProvider: SearchProvider = {
  platform: "youtube",
  async search(query, maxResults) {
    const apiKey = process.env.YOUTUBE_API_KEY;

    if (!apiKey) {
      console.warn("[search-videos] YOUTUBE_API_KEY is not configured");
      return {
        availability: "not_configured",
        results: []
      };
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
      return {
        availability: "supported",
        results: []
      };
    }

    return {
      availability: "supported",
      results: data.items
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
        .filter((item: SearchVideoResult | null): item is SearchVideoResult => Boolean(item))
    };
  }
};

const bilibiliProvider: SearchProvider = {
  platform: "bilibili",
  async search(query, maxResults) {
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
      return {
        availability: "supported",
        results: []
      };
    }

    return {
      availability: "supported",
      results: data.data.result
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
        .filter((item: SearchVideoResult | null): item is SearchVideoResult => Boolean(item))
    };
  }
};

export const SUPPORTED_SEARCH_PLATFORMS: SupportedSearchPlatform[] = ["bilibili", "youtube"];

export const searchProviders: Record<SearchPlatform, SearchProvider> = {
  bilibili: bilibiliProvider,
  youtube: youtubeProvider,
  instagram: unsupportedProvider("instagram"),
  tiktok: unsupportedProvider("tiktok"),
  douyin: unsupportedProvider("douyin"),
  xiaohongshu: unsupportedProvider("xiaohongshu")
};
