import { promises as fs } from "fs";
import path from "path";
import { contents } from "../src/data/contents";
import { creators } from "../src/data/creators";
import {
  extractBilibiliBvid,
  extractYouTubeVideoId,
  formatSecondsAsDuration,
  getYouTubeThumbnailUrl,
  isBilibiliDirectVideo,
  parseIsoDuration
} from "../src/lib/thumbnail";
import type { ContentItem } from "../src/types/content";

type ResultSource =
  | "youtube_auto"
  | "youtube_api"
  | "bilibili_api"
  | "search_entry_no_thumbnail"
  | "failed";

type ThumbnailResult = {
  scope: "content" | "creator_video";
  id: string;
  platform: string;
  title: string;
  thumbnail: string | null;
  duration: string | null;
  source: ResultSource;
};

type TargetItem = {
  scope: "content" | "creator_video";
  id: string;
  title: string;
  platform: "Bilibili" | "YouTube";
  url: string;
};

function isSupportedPlatform(platform: string): platform is "Bilibili" | "YouTube" {
  return platform === "Bilibili" || platform === "YouTube";
}

function isSupportedContentItem(item: ContentItem): item is ContentItem & { platform: "Bilibili" | "YouTube" } {
  return isSupportedPlatform(item.platform);
}

const OUTPUT_PATH = path.join(process.cwd(), "scripts", "thumbnail-results.json");
const ENV_PATH = path.join(process.cwd(), ".env.local");

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function loadLocalEnv() {
  try {
    const raw = await fs.readFile(ENV_PATH, "utf-8");

    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }

      const separatorIndex = trimmed.indexOf("=");
      if (separatorIndex <= 0) {
        continue;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      let value = trimmed.slice(separatorIndex + 1).trim();

      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      if (!(key in process.env)) {
        process.env[key] = value;
      }
    }
  } catch {
    // Ignore missing local env file.
  }
}

async function getYouTubeDuration(videoId: string): Promise<string | null> {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    return null;
  }

  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=contentDetails&key=${apiKey}`
  );

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  const isoDuration = data?.items?.[0]?.contentDetails?.duration;

  if (!isoDuration || typeof isoDuration !== "string") {
    return null;
  }

  return parseIsoDuration(isoDuration);
}

async function getBilibiliInfo(url: string): Promise<{ thumbnail: string | null; duration: string | null } | null> {
  const bvid = extractBilibiliBvid(url);
  if (!bvid) {
    return null;
  }

  const response = await fetch(`https://api.bilibili.com/x/web-interface/view?bvid=${bvid}`, {
    headers: {
      "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/123.0.0.0 Safari/537.36",
      Referer: "https://www.bilibili.com"
    }
  });

  if (!response.ok) {
    return null;
  }

  const data = await response.json();
  if (data?.code !== 0 || !data?.data) {
    return null;
  }

  let thumbnail = typeof data.data.pic === "string" ? data.data.pic : null;
  if (thumbnail?.startsWith("//")) {
    thumbnail = `https:${thumbnail}`;
  }

  const duration = typeof data.data.duration === "number"
    ? formatSecondsAsDuration(data.data.duration)
    : null;

  return { thumbnail, duration };
}

function collectTargets(): TargetItem[] {
  const contentTargets: TargetItem[] = contents
    .filter(isSupportedContentItem)
    .map((item) => ({
      scope: "content",
      id: item.id,
      title: item.title,
      platform: item.platform,
      url: item.url
    }));

  const creatorTargets: TargetItem[] = creators.flatMap((creator) =>
    (creator.featuredVideos ?? [])
      .filter((video) => video.platform === "Bilibili" || video.platform === "YouTube")
      .map((video) => ({
        scope: "creator_video" as const,
        id: video.id,
        title: video.title,
        platform: video.platform,
        url: video.url
      }))
  );

  return [...contentTargets, ...creatorTargets];
}

async function main() {
  await loadLocalEnv();

  const results: ThumbnailResult[] = [];
  const biliCache = new Map<string, { thumbnail: string | null; duration: string | null } | null>();
  const youtubeDurationCache = new Map<string, string | null>();

  for (const target of collectTargets()) {
    console.log(`Processing: [${target.scope}] ${target.id} (${target.platform})`);

    let thumbnail: string | null = null;
    let duration: string | null = null;
    let source: ResultSource = "failed";

    if (target.platform === "YouTube") {
      const videoId = extractYouTubeVideoId(target.url);
      const thumbnailUrl = getYouTubeThumbnailUrl(target.url);

      if (videoId && thumbnailUrl) {
        thumbnail = thumbnailUrl;
        source = "youtube_auto";

        if (youtubeDurationCache.has(videoId)) {
          duration = youtubeDurationCache.get(videoId) ?? null;
        } else {
          const youtubeDuration = await getYouTubeDuration(videoId);
          youtubeDurationCache.set(videoId, youtubeDuration);
          duration = youtubeDuration;
        }

        if (duration) {
          source = "youtube_api";
        }
      }
    }

    if (target.platform === "Bilibili") {
      if (!isBilibiliDirectVideo(target.url)) {
        source = "search_entry_no_thumbnail";
      } else {
        const bvid = extractBilibiliBvid(target.url)!;
        let biliInfo = biliCache.get(bvid);

        if (typeof biliInfo === "undefined") {
          biliInfo = await getBilibiliInfo(target.url);
          biliCache.set(bvid, biliInfo);
          await sleep(350);
        }

        if (biliInfo) {
          thumbnail = biliInfo.thumbnail;
          duration = biliInfo.duration;
          source = "bilibili_api";
        }
      }
    }

    results.push({
      scope: target.scope,
      id: target.id,
      platform: target.platform,
      title: target.title,
      thumbnail,
      duration,
      source
    });
  }

  await fs.writeFile(OUTPUT_PATH, JSON.stringify(results, null, 2), "utf-8");

  const stats = {
    total: results.length,
    youtube_auto: results.filter((item) => item.source === "youtube_auto").length,
    youtube_api: results.filter((item) => item.source === "youtube_api").length,
    bilibili_api: results.filter((item) => item.source === "bilibili_api").length,
    search_no_thumb: results.filter((item) => item.source === "search_entry_no_thumbnail").length,
    failed: results.filter((item) => item.source === "failed").length
  };

  console.log("\n=== 抓取摘要 ===");
  console.log(`总数: ${stats.total}`);
  console.log(`YouTube 自动拼接: ${stats.youtube_auto}`);
  console.log(`YouTube API 获取: ${stats.youtube_api}`);
  console.log(`Bilibili API 获取: ${stats.bilibili_api}`);
  console.log(`搜索型内容（无法抓取）: ${stats.search_no_thumb}`);
  console.log(`失败: ${stats.failed}`);
  console.log(`\n结果已写入: ${OUTPUT_PATH}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
