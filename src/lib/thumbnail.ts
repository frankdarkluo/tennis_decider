import { CONTENT_THUMBNAIL_OVERRIDES } from "@/data/contentThumbnailOverrides";

const YOUTUBE_PATTERNS = [
  /(?:v=)([a-zA-Z0-9_-]{11})/,
  /(?:youtu\.be\/)([a-zA-Z0-9_-]{11})/,
  /(?:embed\/)([a-zA-Z0-9_-]{11})/
];

export function extractYouTubeVideoId(url: string): string | null {
  for (const pattern of YOUTUBE_PATTERNS) {
    const match = url.match(pattern);
    if (match) {
      return match[1];
    }
  }

  return null;
}

export function getYouTubeThumbnailUrl(url: string): string | null {
  const videoId = extractYouTubeVideoId(url);

  if (!videoId) {
    return null;
  }

  return `https://img.youtube.com/vi/${videoId}/mqdefault.jpg`;
}

export function extractBilibiliBvid(url: string): string | null {
  const match = url.match(/BV[a-zA-Z0-9]+/);
  return match?.[0] ?? null;
}

export function isBilibiliDirectVideo(url: string): boolean {
  return Boolean(extractBilibiliBvid(url));
}

export function formatSecondsAsDuration(totalSeconds: number): string {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function parseIsoDuration(iso: string): string {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);

  if (!match) {
    return "";
  }

  const hours = match[1] ? Number.parseInt(match[1], 10) : 0;
  const minutes = match[2] ? Number.parseInt(match[2], 10) : 0;
  const seconds = match[3] ? Number.parseInt(match[3], 10) : 0;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

export function getThumbnail(item: {
  id?: string;
  platform: string;
  url: string;
  thumbnail?: string | null;
}): string | null {
  const explicitThumbnail = item.thumbnail?.trim();

  if (explicitThumbnail) {
    return explicitThumbnail;
  }

  if (item.id && CONTENT_THUMBNAIL_OVERRIDES[item.id]) {
    return CONTENT_THUMBNAIL_OVERRIDES[item.id];
  }

  if (item.platform === "YouTube") {
    return getYouTubeThumbnailUrl(item.url);
  }

  return null;
}

export function getVideoInitial(title: string): string {
  const first = title.trim().charAt(0);
  return first || "片";
}
