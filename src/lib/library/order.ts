import { contents } from "@/data/contents";
import { expandedContents } from "@/data/expandedContents";
import { creators } from "@/data/creators";
import { getFeaturedVideoPrimaryTitle } from "@/lib/content/display";
import type { ContentItem } from "@/types/content";

function normalizeUrl(url: string) {
  return url.replace(/\/+$/, "");
}

function hashString(value: string) {
  let hash = 2166136261;
  for (let index = 0; index < value.length; index += 1) {
    hash ^= value.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }

  return (hash >>> 0) / 4294967295;
}

function mergeLibraryItem(existing: ContentItem, candidate: ContentItem): ContentItem {
  return {
    ...existing,
    originalTitle: existing.originalTitle ?? candidate.originalTitle,
    sourceTitle: existing.sourceTitle ?? candidate.sourceTitle,
    displayTitleZh: existing.displayTitleZh ?? candidate.displayTitleZh,
    displayTitleEn: existing.displayTitleEn ?? candidate.displayTitleEn,
    focusLineEn: existing.focusLineEn ?? candidate.focusLineEn,
    contentLanguage: existing.contentLanguage ?? candidate.contentLanguage,
    subtitleAvailability: existing.subtitleAvailability ?? candidate.subtitleAvailability,
    useCases: existing.useCases.length > 0 ? existing.useCases : candidate.useCases,
    coachReason: existing.coachReason || candidate.coachReason,
    thumbnail: candidate.thumbnail ?? existing.thumbnail,
    duration: candidate.duration ?? existing.duration,
    viewCount: candidate.viewCount ?? existing.viewCount
  };
}

function getFeaturedLibraryItems(): ContentItem[] {
  return creators.flatMap((creator) => {
    return (creator.featuredVideos ?? []).map((video, index) => ({
      id: `content_featured_${creator.id}_${index + 1}`,
      title: video.title,
      sourceTitle: video.sourceTitle ?? video.title,
      originalTitle: video.originalTitle ?? video.sourceTitle ?? video.title,
      displayTitleZh: video.displayTitleZh ?? (creator.region === "domestic" ? (video.sourceTitle ?? video.title) : undefined),
      displayTitleEn: creator.region === "domestic"
        ? getFeaturedVideoPrimaryTitle(video, "en", creator)
        : video.displayTitleEn ?? video.title,
      creatorId: creator.id,
      platform: video.platform,
      type: "video",
      levels: video.levels,
      skills: creator.specialties,
      problemTags: [],
      language: creator.region === "domestic" ? "zh" : "en",
      contentLanguage: video.contentLanguage ?? (creator.region === "domestic" ? "zh" : "en"),
      subtitleAvailability: video.subtitleAvailability ?? (creator.region === "overseas" ? "not_needed" : video.platform === "Bilibili" ? "none" : "unknown"),
      summary: creator.shortDescription,
      reason: video.target,
      useCases: [video.target],
      coachReason: creator.bio,
      thumbnail: video.thumbnail,
      duration: video.duration,
      viewCount: video.viewCount,
      url: video.url
    }));
  });
}

export function buildLibraryItems() {
  const itemsByUrl = new Map<string, ContentItem>();

  const upsert = (item: ContentItem) => {
    const normalizedUrl = normalizeUrl(item.url);
    const existing = itemsByUrl.get(normalizedUrl);
    itemsByUrl.set(normalizedUrl, existing ? mergeLibraryItem(existing, item) : item);
  };

  contents.forEach(upsert);
  expandedContents.forEach(upsert);
  getFeaturedLibraryItems().forEach(upsert);

  return Array.from(itemsByUrl.values());
}

export function sortLibraryItems(items: ContentItem[], seed: string) {
  if (items.length <= 1) {
    return items;
  }

  const maxLogViews = items.reduce((currentMax, item) => {
    const nextValue = item.viewCount ? Math.log10(item.viewCount + 10) : 0;
    return Math.max(currentMax, nextValue);
  }, 0);

  return [...items].sort((left, right) => {
    const leftViewScore = left.viewCount ? Math.log10(left.viewCount + 10) / (maxLogViews || 1) : 0;
    const rightViewScore = right.viewCount ? Math.log10(right.viewCount + 10) / (maxLogViews || 1) : 0;
    const leftRandom = hashString(`${seed}:${left.id}`);
    const rightRandom = hashString(`${seed}:${right.id}`);
    const leftScore = leftRandom * 0.65 + leftViewScore * 0.35;
    const rightScore = rightRandom * 0.65 + rightViewScore * 0.35;

    if (rightScore !== leftScore) {
      return rightScore - leftScore;
    }

    return left.title.localeCompare(right.title, "zh-Hans-CN");
  });
}
