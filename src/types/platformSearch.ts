export type SearchPlatform = "bilibili" | "youtube";

export type SearchVideoResult = {
  platform: SearchPlatform;
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
};
