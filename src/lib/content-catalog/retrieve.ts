import { filterByEnvironment } from "@/lib/environment";
import { buildCatalogCorpus } from "@/lib/content-catalog/normalize";
import { rankCatalogContent } from "@/lib/content-catalog/rank";
import type { CatalogContentItem, CatalogRecommendationIntent, CatalogRightsStatus } from "@/lib/content-catalog/schema";
import type { ContentItem } from "@/types/content";

const DEFAULT_ALLOWED_RIGHTS: CatalogRightsStatus[] = ["direct_source"];

function buildCatalog(input: Pick<CatalogRecommendationIntent, "contentPool" | "expandedContentPool">): CatalogContentItem[] {
  return buildCatalogCorpus({
    curatedContents: input.contentPool,
    expandedContents: input.expandedContentPool
  });
}

function filterAllowedRights(
  items: CatalogContentItem[],
  allowedRights: CatalogRightsStatus[]
): CatalogContentItem[] {
  return items.filter((item) => allowedRights.includes(item.rightsStatus));
}

function enforceDiversity(items: CatalogContentItem[], maxResults: number): CatalogContentItem[] {
  const selected: CatalogContentItem[] = [];
  const creatorUsage = new Map<string, number>();

  for (const item of items) {
    if (selected.length >= maxResults) {
      break;
    }

    const repeats = creatorUsage.get(item.creatorId) ?? 0;
    if (repeats >= 2) {
      continue;
    }

    selected.push(item);
    creatorUsage.set(item.creatorId, repeats + 1);
  }

  return selected;
}

export function retrieveCatalogRecommendations(intent: CatalogRecommendationIntent): ContentItem[] {
  const allowedRights = intent.allowedRights ?? DEFAULT_ALLOWED_RIGHTS;
  const catalog = buildCatalog(intent);
  const environmentFiltered = intent.environment ? filterByEnvironment(catalog, intent.environment) : catalog;
  const rightsFiltered = filterAllowedRights(environmentFiltered, allowedRights)
    .filter((item) => item.mediaType === "video");
  const ranked = rankCatalogContent(rightsFiltered, intent);
  const selected = enforceDiversity(ranked.map(({ item }) => item), intent.maxResults);

  return selected.map((item) => item.sourceItem);
}

export function retrieveCatalogContentsByIds(input: {
  ids: string[];
  contentPool?: ContentItem[];
  expandedContentPool?: ContentItem[];
  maxResults?: number;
  level?: string;
  environment?: "testing" | "production";
  allowedRights?: CatalogRightsStatus[];
}): ContentItem[] {
  const allowedRights = input.allowedRights ?? DEFAULT_ALLOWED_RIGHTS;
  const catalog = buildCatalog({
    contentPool: input.contentPool,
    expandedContentPool: input.expandedContentPool
  });
  const environmentFiltered = input.environment ? filterByEnvironment(catalog, input.environment) : catalog;
  const rightsFiltered = filterAllowedRights(environmentFiltered, allowedRights)
    .filter((item) => item.mediaType === "video");
  const byId = new Map(rightsFiltered.map((item) => [item.id, item]));
  const level = input.level;
  const ordered = input.ids
    .map((id) => byId.get(id))
    .filter((item): item is CatalogContentItem => Boolean(item))
    .map((item, index) => ({
      item,
      index,
      score: level && item.levelRange.includes(level)
        ? 2
        : level && item.levelRange.some((candidate) => candidate === level)
          ? 1
          : 0
    }))
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      return left.index - right.index;
    })
    .slice(0, input.maxResults ?? 3);

  return ordered.map(({ item }) => item.sourceItem);
}
