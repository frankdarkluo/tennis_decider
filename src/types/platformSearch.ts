export type SupportedSearchPlatform = "bilibili" | "youtube";
export type PlannedSearchPlatform = "instagram" | "tiktok" | "douyin" | "xiaohongshu";
export type SearchPlatform = SupportedSearchPlatform | PlannedSearchPlatform;
export type SearchAvailability = "supported" | "unsupported" | "not_configured";

export type SearchVideoResult = {
  platform: SupportedSearchPlatform;
  videoId: string;
  title: string;
  author: string;
  thumbnail: string;
  url: string;
  viewCount: number | null;
  duration: string | null;
  publishedAt: string | null;
};

export type SearchVideosRequest = {
  platform: SearchPlatform;
  query: string;
  maxResults?: number;
};

export type SearchVideosResponse = {
  platform: SearchPlatform;
  query: string;
  results: SearchVideoResult[];
  cached: boolean;
  availability: SearchAvailability;
};
