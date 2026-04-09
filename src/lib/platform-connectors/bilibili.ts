import type { PlatformConnector } from "@/lib/platform-connectors/types";

const SEARCH_PATTERN = /search\.bilibili\.com\/all\?keyword=/i;
const VIDEO_ID_PATTERN = /(BV[0-9A-Za-z]+)/i;

export const bilibiliConnector: PlatformConnector = {
  platform: "Bilibili",
  canonicalizeUrl(url) {
    const trimmed = url.trim();
    const match = trimmed.match(VIDEO_ID_PATTERN);

    if (!match) {
      return trimmed.replace(/\/+$/, "");
    }

    return `https://www.bilibili.com/video/${match[1]}`;
  },
  inferRightsStatus(url) {
    return SEARCH_PATTERN.test(url) ? "search_link" : "direct_source";
  }
};
