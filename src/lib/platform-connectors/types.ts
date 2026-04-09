import type { ContentPlatform } from "@/types/content";
import type { CatalogRightsStatus } from "@/lib/content-catalog/schema";

export type PlatformConnector = {
  platform: ContentPlatform;
  canonicalizeUrl(url: string): string;
  inferRightsStatus(url: string): CatalogRightsStatus;
};
