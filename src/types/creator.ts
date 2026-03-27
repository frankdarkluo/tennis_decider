export type CreatorRegion = "domestic" | "overseas";
export type CreatorPlatformName = "Bilibili" | "YouTube" | "Xiaohongshu" | "Zhihu" | "Instagram";

export type CreatorRankingSignals = {
  subscriberScore: number;
  averageViewsScore: number;
  activityScore: number;
  catalogScore: number;
  authorityScore: number;
  curatorBoost: number;
};

export type CreatorFeaturedVideo = {
  id: string;
  title: string;
  target: string;
  levels: string[];
  url: string;
  platform: Extract<CreatorPlatformName, "Bilibili" | "YouTube">;
};

export type Creator = {
  id: string;
  name: string;
  shortDescription: string;
  tags: string[];
  region: CreatorRegion;
  platforms: CreatorPlatformName[];
  levels: string[];
  specialties: string[];
  styleTags: string[];
  bio: string;
  suitableFor: string[];
  featuredContentIds: string[];
  featuredVideos?: CreatorFeaturedVideo[];
  recommendedCount?: number;
  profileUrl?: string;
  platformLinks?: Partial<Record<CreatorPlatformName, string>>;
  avatar?: string;
  rankingEligible?: boolean;
  discoveryEligible?: boolean;
  rankingSignals?: CreatorRankingSignals;
};
