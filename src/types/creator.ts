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

export type Creator = {
  id: string;
  name: string;
  region: CreatorRegion;
  platforms: CreatorPlatformName[];
  levels: string[];
  specialties: string[];
  styleTags: string[];
  bio: string;
  suitableFor: string[];
  featuredContentIds: string[];
  recommendedCount?: number;
  profileUrl?: string;
  platformLinks?: Partial<Record<CreatorPlatformName, string>>;
  avatar?: string;
  rankingEligible?: boolean;
  discoveryEligible?: boolean;
  rankingSignals?: CreatorRankingSignals;
};
