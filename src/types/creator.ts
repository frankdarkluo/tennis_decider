import { EnvironmentValue } from "@/types/environment";

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
  sourceTitle?: string;
  originalTitle?: string;
  displayTitleZh?: string;
  displayTitleEn?: string;
  targetEn?: string;
  contentLanguage?: "zh" | "en";
  subtitleAvailability?: "english" | "none" | "unknown" | "not_needed";
  target: string;
  levels: string[];
  thumbnail?: string;
  duration?: string;
  viewCount?: number;
  url: string;
  platform: Extract<CreatorPlatformName, "Bilibili" | "YouTube">;
};

export type Creator = {
  id: string;
  name: string;
  nameEn?: string;
  nameZh?: string;
  shortDescription: string;
  shortDescriptionEn?: string;
  tags: string[];
  region: CreatorRegion;
  platforms: CreatorPlatformName[];
  levels: string[];
  specialties: string[];
  styleTags: string[];
  bio: string;
  bioEn?: string;
  suitableFor: string[];
  suitableForEn?: string[];
  featuredContentIds: string[];
  featuredVideos?: CreatorFeaturedVideo[];
  recommendedCount?: number;
  profileUrl?: string;
  platformLinks?: Partial<Record<CreatorPlatformName, string>>;
  avatar?: string;
  rankingEligible?: boolean;
  discoveryEligible?: boolean;
  rankingSignals?: CreatorRankingSignals;
  environment?: EnvironmentValue;
};
