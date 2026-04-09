import type { PlatformConnector } from "@/lib/platform-connectors/types";

const SEARCH_PATTERN = /youtube\.com\/results\?search_query=/i;
const WATCH_ID_PATTERN = /[?&]v=([^&]+)/i;

export const youtubeConnector: PlatformConnector = {
  platform: "YouTube",
  canonicalizeUrl(url) {
    const trimmed = url.trim();
    const match = trimmed.match(WATCH_ID_PATTERN);

    if (!match) {
      return trimmed.replace(/\/+$/, "");
    }

    return `https://www.youtube.com/watch?v=${match[1]}`;
  },
  inferRightsStatus(url) {
    return SEARCH_PATTERN.test(url) ? "search_link" : "direct_source";
  }
};
