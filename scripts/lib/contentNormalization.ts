import type { ContentItem } from "../../src/types/content";

export const CONTENT_PROBLEM_TAG_ALIASES: Record<string, string[]> = {
  "second-serve-confidence": ["second-serve-reliability"],
  "serve-toss-inconsistent": ["serve-toss-consistency"],
  "slice-too-high": ["backhand-slice-floating"],
  "trouble-with-slice": ["incoming-slice-trouble"],
  "slow-preparation": ["late-contact"],
  "volley-errors": ["volley-floating", "volley-into-net"],
  "doubles-net-fear": ["net-confidence"]
};

const NON_DIRECT_VIDEO_URL_PATTERNS = [
  /search\.bilibili\.com\/all\?keyword=/i,
  /youtube\.com\/results\?search_query=/i
];

export function uniqueStrings(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

export function normalizeProblemTags(problemTags: string[]): string[] {
  const canonicalTags = problemTags.flatMap((tag) => CONTENT_PROBLEM_TAG_ALIASES[tag] ?? []);
  return uniqueStrings([...problemTags, ...canonicalTags]);
}

export function getMissingCanonicalTagPairs(problemTags: string[]): Array<{ legacyTag: string; canonicalTag: string }> {
  const tagSet = new Set(problemTags);
  const missingPairs: Array<{ legacyTag: string; canonicalTag: string }> = [];

  for (const [legacyTag, canonicalTags] of Object.entries(CONTENT_PROBLEM_TAG_ALIASES)) {
    if (!tagSet.has(legacyTag)) {
      continue;
    }

    for (const canonicalTag of canonicalTags) {
      if (!tagSet.has(canonicalTag)) {
        missingPairs.push({ legacyTag, canonicalTag });
      }
    }
  }

  return missingPairs;
}

export function getNormalizedProblemTagSignature(problemTags: string[]): string {
  return normalizeProblemTags(problemTags)
    .slice()
    .sort()
    .join("|");
}

export function isDirectLibraryVideo(item: ContentItem): boolean {
  if (item.type !== "video") {
    return false;
  }

  return !NON_DIRECT_VIDEO_URL_PATTERNS.some((pattern) => pattern.test(item.url));
}
