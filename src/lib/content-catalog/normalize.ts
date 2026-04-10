import { contents as defaultCuratedContents } from "@/data/contents";
import { expandedContents as defaultExpandedContents } from "@/data/expandedContents";
import { inferContentSourceQuality, inferContentTeachingIntent } from "@/lib/content/recommendationSignals";
import type { ContentItem, ContentPlatform } from "@/types/content";
import type { CatalogContentItem, CatalogIngestionMethod } from "@/lib/content-catalog/schema";
import type { PlatformConnector } from "@/lib/platform-connectors/types";
import { bilibiliConnector } from "@/lib/platform-connectors/bilibili";
import { youtubeConnector } from "@/lib/platform-connectors/youtube";

const connectorByPlatform: Partial<Record<ContentPlatform, PlatformConnector>> = {
  Bilibili: bilibiliConnector,
  YouTube: youtubeConnector
};

function fallbackCanonicalizeUrl(url: string): string {
  return url.trim().replace(/\/+$/, "");
}

function fallbackRightsStatus(url: string): CatalogContentItem["rightsStatus"] {
  if (inferContentSourceQuality(url) === "search_link") {
    return "search_link";
  }

  return inferContentSourceQuality(url);
}

function applyGlobalRightsFallback(
  url: string,
  current: CatalogContentItem["rightsStatus"]
): CatalogContentItem["rightsStatus"] {
  if (current === "search_link") {
    return current;
  }

  return fallbackRightsStatus(url);
}

function getConnector(platform: ContentPlatform): PlatformConnector | null {
  return connectorByPlatform[platform] ?? null;
}

function inferCreatorHandle(creatorId: string): string | null {
  const normalized = creatorId.replace(/^creator_/, "").trim();
  return normalized.length > 0 ? normalized : null;
}

function buildQualityScore(input: {
  ingestionMethod: CatalogIngestionMethod;
  rightsStatus: CatalogContentItem["rightsStatus"];
}): number {
  const base = input.ingestionMethod === "curated" ? 90 : 72;
  const rightsAdjustment = input.rightsStatus === "direct_source"
    ? 10
    : input.rightsStatus === "search_link"
      ? -16
      : -24;

  return base + rightsAdjustment;
}

function normalizeContentItem(item: ContentItem, ingestionMethod: CatalogIngestionMethod): CatalogContentItem {
  const connector = getConnector(item.platform);
  const canonicalUrl = connector?.canonicalizeUrl(item.url) ?? fallbackCanonicalizeUrl(item.url);
  const rightsStatus = applyGlobalRightsFallback(
    item.url,
    connector?.inferRightsStatus(item.url) ?? fallbackRightsStatus(item.url)
  );

  return {
    id: item.id,
    sourcePlatform: item.platform,
    canonicalUrl,
    creatorId: item.creatorId,
    creatorHandle: inferCreatorHandle(item.creatorId),
    language: item.language,
    contentLanguage: item.contentLanguage,
    subtitleAvailability: item.subtitleAvailability,
    teachingIntent: inferContentTeachingIntent({
      title: item.title,
      sourceTitle: item.sourceTitle,
      originalTitle: item.originalTitle,
      summary: item.summary,
      reason: item.reason,
      coachReason: item.coachReason,
      useCases: item.useCases
    }),
    skillCategories: [...item.skills],
    problemTags: [...item.problemTags],
    levelRange: [...item.levels],
    mediaType: item.type,
    rightsStatus,
    qualityScore: buildQualityScore({ ingestionMethod, rightsStatus }),
    ingestionMethod,
    environment: item.environment,
    display: {
      title: item.title,
      sourceTitle: item.sourceTitle,
      originalTitle: item.originalTitle,
      summary: item.summary,
      reason: item.reason,
      coachReason: item.coachReason,
      useCases: [...item.useCases],
      thumbnail: item.thumbnail,
      duration: item.duration
    },
    sourceItem: item
  };
}

export function buildCatalogCorpus(input?: {
  curatedContents?: ContentItem[];
  expandedContents?: ContentItem[];
}): CatalogContentItem[] {
  const combinedInput = input?.curatedContents;
  const explicitExpanded = input?.expandedContents;
  const defaultExpandedIdSet = new Set(defaultExpandedContents.map((item) => item.id));
  const curated = explicitExpanded
    ? (combinedInput ?? defaultCuratedContents)
    : combinedInput
      ? combinedInput.filter((item) => !defaultExpandedIdSet.has(item.id))
      : defaultCuratedContents;
  const expanded = explicitExpanded
    ? explicitExpanded
    : combinedInput
      ? combinedInput.filter((item) => defaultExpandedIdSet.has(item.id))
      : defaultExpandedContents;

  return [
    ...curated.map((item) => normalizeContentItem(item, "curated")),
    ...expanded.map((item) => normalizeContentItem(item, "expanded"))
  ];
}
