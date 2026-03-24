export type CreatorRegion = "domestic" | "overseas";

export type Creator = {
  id: string;
  name: string;
  region: CreatorRegion;
  platforms: string[];
  levels: string[];
  specialties: string[];
  styleTags: string[];
  bio: string;
  suitableFor: string[];
  featuredContentIds: string[];
  recommendedCount?: number;
  profileUrl?: string;
  avatar?: string;
};