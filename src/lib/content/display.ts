import {
  CONTENT_ENGLISH_OVERRIDES,
  CREATOR_ENGLISH_OVERRIDES,
  CREATOR_TAG_LABELS_EN
} from "@/lib/content/localization";
import { ContentItem, ContentSubtitleAvailability } from "@/types/content";
import { Creator, CreatorFeaturedVideo } from "@/types/creator";

type Locale = "zh" | "en";

export function hasCJK(value?: string | null) {
  return Boolean(value && /[\u3400-\u9fff]/.test(value));
}

function normalizeText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeChineseSentence(value: string) {
  return normalizeText(value)
    .replace(/^适合作为/, "")
    .replace(/^适合/, "")
    .replace(/^针对[:：]\s*/, "")
    .replace(/。/g, "")
    .trim();
}

function normalizeEnglishSentence(value: string) {
  return normalizeText(value)
    .replace(/^Focus:\s*/i, "")
    .replace(/\.$/, "")
    .trim();
}

function getContentEnglishOverride(id?: string) {
  return id ? CONTENT_ENGLISH_OVERRIDES[id] : undefined;
}

function getCreatorEnglishOverride(creatorId?: string) {
  return creatorId ? CREATOR_ENGLISH_OVERRIDES[creatorId] : undefined;
}

function getCreatorFeaturedVideoEnglishOverride(creatorId?: string, videoId?: string) {
  if (!creatorId || !videoId) {
    return undefined;
  }

  return CREATOR_ENGLISH_OVERRIDES[creatorId]?.featuredVideos?.[videoId];
}

export function normalizeBilibiliTitle(value: string) {
  return value
    .replace(/[|｜]\s*LeonTV(?:网球频道|频道)?\s*[|｜]?/gi, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function stripHashtagTail(value: string) {
  return value.replace(/[＃#].*$/, "").trim();
}

function stripLeadingHashtag(value: string) {
  return value
    .replace(/^[＃#][^\s＃#]+\s*/, "")
    .replace(/[＃#].*$/, "")
    .trim();
}

export function getOriginalContentTitle(
  item: Pick<ContentItem, "title" | "sourceTitle" | "originalTitle" | "platform" | "language">
) {
  const baseTitle = item.originalTitle ?? item.sourceTitle ?? item.title;
  const rawTitle = (item.platform === "Bilibili" && item.language === "zh"
    ? normalizeBilibiliTitle(baseTitle)
    : baseTitle)
    .replace(/\s+/g, " ")
    .trim();

  const stripped = stripHashtagTail(rawTitle);
  if (stripped.length > 1) {
    return stripped;
  }

  const afterTag = stripLeadingHashtag(rawTitle);
  if (afterTag.length > 1) {
    return afterTag;
  }

  return rawTitle;
}

function englishSkillLabel(skill?: string) {
  const map: Record<string, string> = {
    forehand: "Forehand",
    backhand: "Backhand",
    serve: "Serve",
    movement: "Footwork",
    footwork: "Footwork",
    net: "Net play",
    doubles: "Doubles",
    return: "Return",
    topspin: "Topspin",
    slice: "Slice",
    grip: "Grip",
    training: "Practice structure",
    mental: "Mental game",
    matchplay: "Match play",
    consistency: "Consistency",
    defense: "Defense",
    basics: "Basics"
  };

  return skill ? map[skill] ?? "Tennis skills" : "Tennis skills";
}

function defaultEnglishFocusLabel(skills?: string[]) {
  return `${englishSkillLabel(skills?.[0])} work`;
}

function chineseSkillLabel(skill?: string) {
  const map: Record<string, string> = {
    forehand: "正手技术",
    backhand: "反手技术",
    serve: "发球技术",
    movement: "步法训练",
    footwork: "步法训练",
    net: "网前技术",
    doubles: "双打战术",
    return: "接发球",
    topspin: "上旋技术",
    slice: "切球技术",
    grip: "握拍方式",
    training: "训练方法",
    mental: "比赛心态",
    matchplay: "比赛策略",
    consistency: "稳定性训练",
    defense: "防守技术",
    basics: "基础技术"
  };

  return skill ? map[skill] ?? "网球教学" : "网球教学";
}

function getContentDisplayTitleEn(
  item: Pick<ContentItem, "id" | "displayTitleEn" | "skills" | "useCases" | "reason">
) {
  return item.displayTitleEn?.trim() || getContentEnglishOverride(item.id)?.displayTitleEn?.trim();
}

function getContentFocusLineEn(
  item: Pick<ContentItem, "id" | "focusLineEn" | "skills" | "useCases" | "reason" | "summary">
) {
  const explicit = item.focusLineEn?.trim() || getContentEnglishOverride(item.id)?.focusLineEn?.trim();
  if (explicit) {
    return explicit;
  }

  const useCase = item.useCases[0]?.trim();
  if (useCase && !hasCJK(useCase)) {
    return normalizeEnglishSentence(useCase);
  }

  if (item.reason?.trim() && !hasCJK(item.reason)) {
    return normalizeEnglishSentence(item.reason);
  }

  if (item.summary?.trim() && !hasCJK(item.summary)) {
    return normalizeEnglishSentence(item.summary);
  }

  return defaultEnglishFocusLabel(item.skills);
}

export function getContentLanguageTag(item: Pick<ContentItem, "contentLanguage" | "language">) {
  return item.contentLanguage ?? item.language;
}

export function getSubtitleAvailability(
  item: Pick<ContentItem, "subtitleAvailability" | "language" | "platform">
): ContentSubtitleAvailability {
  if (item.subtitleAvailability) {
    return item.subtitleAvailability;
  }

  if (item.language === "en") {
    return "not_needed";
  }

  if (item.platform === "Bilibili") {
    return "none";
  }

  return "unknown";
}

export function getEnglishGloss(
  item: Pick<ContentItem, "id" | "displayTitleEn" | "skills" | "useCases" | "reason">
) {
  const explicit = getContentDisplayTitleEn(item);
  if (explicit) {
    return explicit;
  }

  const skill = englishSkillLabel(item.skills[0]);
  const target = item.useCases[0]?.trim() || item.reason.trim();

  if (!target || hasCJK(target)) {
    return `${skill} lesson`;
  }

  return `${skill}: ${normalizeEnglishSentence(target)}`;
}

export function getChineseDisplayTitle(
  item: Pick<ContentItem, "title" | "sourceTitle" | "originalTitle" | "displayTitleZh" | "platform" | "language">
) {
  if (item.displayTitleZh?.trim()) {
    return item.displayTitleZh.trim();
  }

  return getOriginalContentTitle(item);
}

export function getContentPrimaryTitle(
  item: Pick<
    ContentItem,
    | "id"
    | "title"
    | "sourceTitle"
    | "originalTitle"
    | "displayTitleZh"
    | "displayTitleEn"
    | "platform"
    | "language"
    | "contentLanguage"
    | "skills"
    | "useCases"
    | "reason"
  >,
  locale: Locale
) {
  if (locale === "en") {
    const explicit = getContentDisplayTitleEn(item);
    if (explicit) {
      return explicit;
    }

    const original = getOriginalContentTitle(item);
    if (!hasCJK(original)) {
      return original;
    }

    return getEnglishGloss(item);
  }

  return getChineseDisplayTitle(item);
}

export function getContentSecondaryTitle(
  item: Pick<
    ContentItem,
    | "id"
    | "title"
    | "sourceTitle"
    | "originalTitle"
    | "displayTitleZh"
    | "displayTitleEn"
    | "platform"
    | "language"
    | "contentLanguage"
    | "skills"
  >,
  locale: Locale
) {
  const original = getOriginalContentTitle(item);
  const zhTitle = item.displayTitleZh?.trim() || original;
  const enTitle = getContentDisplayTitleEn({
    id: item.id,
    displayTitleEn: item.displayTitleEn,
    skills: [],
    useCases: [""],
    reason: ""
  });

  if (locale === "en" && getContentLanguageTag(item) === "zh") {
    return zhTitle !== enTitle ? zhTitle : null;
  }

  if (locale === "zh" && getContentLanguageTag(item) === "en") {
    if (item.displayTitleZh?.trim()) {
      return item.displayTitleZh.trim();
    }

    return chineseSkillLabel(item.skills?.[0]);
  }

  return null;
}

export function getContentFocusLine(
  item: Pick<ContentItem, "id" | "focusLineEn" | "skills" | "useCases" | "reason" | "summary">,
  locale: Locale
) {
  if (locale === "en") {
    return getContentFocusLineEn(item);
  }

  const useCase = item.useCases[0]?.trim();
  if (useCase) {
    return normalizeChineseSentence(useCase);
  }

  if (item.reason?.trim()) {
    return normalizeChineseSentence(item.reason);
  }

  return normalizeChineseSentence(item.summary);
}

export function getContentCoachNote(
  item: Pick<ContentItem, "coachReason">,
  locale: Locale
) {
  const note = item.coachReason?.trim();
  if (!note) {
    return null;
  }

  if (locale === "en" && hasCJK(note)) {
    return null;
  }

  return note;
}

export function formatCompactViewCount(value: number | undefined, locale: Locale = "zh") {
  if (!value || value <= 0) {
    return null;
  }

  if (locale === "en") {
    return new Intl.NumberFormat("en-US", {
      notation: "compact",
      maximumFractionDigits: 1
    }).format(value);
  }

  if (value < 10000) {
    return String(Math.round(value));
  }

  const wan = Math.round((value / 10000) * 10) / 10;
  return `${wan.toFixed(1)}万`;
}

export function getCreatorSecondaryName(creator: Creator, locale: Locale): string | null {
  const override = getCreatorEnglishOverride(creator.id);
  if (locale === "en") {
    const nameEn = creator.nameEn?.trim() || override?.nameEn;
    if (nameEn && nameEn !== creator.name) {
      return creator.name;
    }
    return null;
  }

  const nameZh = creator.nameZh?.trim() || override?.nameZh;
  return nameZh && nameZh !== creator.name ? nameZh : null;
}

export function getCreatorPrimaryName(creator: Creator, locale: Locale): string {
  const override = getCreatorEnglishOverride(creator.id);
  if (locale === "en") {
    return creator.nameEn?.trim() || override?.nameEn || creator.name;
  }

  return creator.name;
}

export function getCreatorShortDescription(creator: Creator, locale: Locale) {
  const override = getCreatorEnglishOverride(creator.id);
  if (locale === "en") {
    return creator.shortDescriptionEn?.trim() || override?.shortDescriptionEn || creator.shortDescription;
  }

  return creator.shortDescription;
}

export function getCreatorBio(creator: Creator, locale: Locale) {
  const override = getCreatorEnglishOverride(creator.id);
  if (locale === "en") {
    return creator.bioEn?.trim() || override?.bioEn || creator.bio;
  }

  return creator.bio;
}

export function getCreatorSuitableFor(creator: Creator, locale: Locale) {
  const override = getCreatorEnglishOverride(creator.id);
  if (locale === "en") {
    return creator.suitableForEn?.length ? creator.suitableForEn : override?.suitableForEn ?? creator.suitableFor;
  }

  return creator.suitableFor;
}

export function getCreatorTagLabel(tag: string, locale: Locale) {
  if (locale === "en") {
    return CREATOR_TAG_LABELS_EN[tag] ?? tag;
  }

  return tag;
}

export function getCreatorTags(tags: string[], locale: Locale) {
  return tags.map((tag) => getCreatorTagLabel(tag, locale));
}

function getFeaturedVideoExplicitTitle(
  item: Pick<CreatorFeaturedVideo, "id" | "displayTitleEn" | "title">,
  creator?: Pick<Creator, "id">
) {
  return item.displayTitleEn?.trim() || getCreatorFeaturedVideoEnglishOverride(creator?.id, item.id)?.displayTitleEn?.trim();
}

function getFeaturedVideoExplicitTarget(
  item: Pick<CreatorFeaturedVideo, "id" | "target" | "targetEn">,
  creator?: Pick<Creator, "id">
) {
  return item.targetEn?.trim() || getCreatorFeaturedVideoEnglishOverride(creator?.id, item.id)?.targetEn?.trim();
}

function getFeaturedVideoFallbackTarget(creator?: Pick<Creator, "specialties">) {
  return defaultEnglishFocusLabel(creator?.specialties);
}

export function getFeaturedVideoPrimaryTitle(
  item: Pick<
    CreatorFeaturedVideo,
    "id" | "title" | "sourceTitle" | "originalTitle" | "displayTitleEn" | "displayTitleZh" | "target" | "targetEn" | "contentLanguage"
  >,
  locale: Locale,
  creator?: Pick<Creator, "id" | "specialties">
) {
  if (locale === "en") {
    const explicit = getFeaturedVideoExplicitTitle(item, creator);
    if (explicit) {
      return explicit;
    }

    if (!hasCJK(item.title) || item.contentLanguage === "en") {
      return item.title;
    }

    return getFeaturedVideoExplicitTarget(item, creator) || getFeaturedVideoFallbackTarget(creator);
  }

  return item.displayTitleZh?.trim() || item.originalTitle?.trim() || item.sourceTitle?.trim() || item.title;
}

export function getFeaturedVideoSecondaryTitle(
  item: Pick<
    CreatorFeaturedVideo,
    "id" | "title" | "sourceTitle" | "originalTitle" | "displayTitleEn" | "displayTitleZh" | "contentLanguage"
  >,
  locale: Locale,
  creator?: Pick<Creator, "id">
) {
  const original = item.originalTitle?.trim() || item.sourceTitle?.trim() || item.title;
  const enTitle = getFeaturedVideoExplicitTitle({
    id: item.id,
    displayTitleEn: item.displayTitleEn,
    title: item.title
  }, creator);

  if (locale === "en" && hasCJK(original)) {
    return original !== enTitle ? original : null;
  }

  if (locale === "zh" && enTitle && !hasCJK(item.title)) {
    return enTitle !== original ? enTitle : null;
  }

  return null;
}

export function getFeaturedVideoTarget(
  item: Pick<CreatorFeaturedVideo, "id" | "target" | "targetEn">,
  locale: Locale,
  creator?: Pick<Creator, "id" | "specialties">
) {
  if (locale === "en") {
    return getFeaturedVideoExplicitTarget(item, creator) || getFeaturedVideoFallbackTarget(creator);
  }

  return item.target;
}
