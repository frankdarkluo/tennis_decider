"use client";

const MAX_VIDEO_SIZE_MB = 50;
const MAX_VIDEO_DURATION_SECONDS = 60;
const DEFAULT_FRAME_COUNT = 8;
const DEFAULT_MAX_WIDTH = 640;
const DEFAULT_QUALITY = 0.72;

export type VideoValidationResult = {
  ok: boolean;
  error?: string;
  durationSeconds?: number;
  width?: number;
  height?: number;
  sizeMb: number;
};

function loadVideoMetadata(file: File): Promise<{ duration: number; width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const objectUrl = URL.createObjectURL(file);

    video.preload = "metadata";
    video.muted = true;
    video.src = objectUrl;

    video.onloadedmetadata = () => {
      const metadata = {
        duration: Number.isFinite(video.duration) ? video.duration : 0,
        width: video.videoWidth,
        height: video.videoHeight
      };
      URL.revokeObjectURL(objectUrl);
      resolve(metadata);
    };

    video.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("无法读取视频元信息，请尝试 mp4 / mov / webm 格式。"));
    };
  });
}

export async function validateVideoFile(file: File): Promise<VideoValidationResult> {
  const sizeMb = Number((file.size / 1024 / 1024).toFixed(1));

  if (sizeMb > MAX_VIDEO_SIZE_MB) {
    return {
      ok: false,
      error: `视频不能超过 ${MAX_VIDEO_SIZE_MB}MB，当前约 ${sizeMb}MB。`,
      sizeMb
    };
  }

  const extension = file.name.split(".").pop()?.toLowerCase();
  if (!extension || !["mp4", "mov", "webm", "m4v"].includes(extension)) {
    return {
      ok: false,
      error: "目前仅支持 mp4 / mov / webm 格式的视频。",
      sizeMb
    };
  }

  try {
    const metadata = await loadVideoMetadata(file);

    if (metadata.duration <= 0) {
      return {
        ok: false,
        error: "这段视频暂时无法读取时长，请换一段更标准的录制文件。",
        sizeMb
      };
    }

    if (metadata.duration > MAX_VIDEO_DURATION_SECONDS) {
      return {
        ok: false,
        error: `视频时长不能超过 ${MAX_VIDEO_DURATION_SECONDS} 秒，当前约 ${Math.ceil(metadata.duration)} 秒。`,
        durationSeconds: metadata.duration,
        width: metadata.width,
        height: metadata.height,
        sizeMb
      };
    }

    return {
      ok: true,
      durationSeconds: metadata.duration,
      width: metadata.width,
      height: metadata.height,
      sizeMb
    };
  } catch (error) {
    return {
      ok: false,
      error: error instanceof Error ? error.message : "视频校验失败，请更换一段视频后重试。",
      sizeMb
    };
  }
}

function buildTimestamps(duration: number, frameCount: number) {
  if (frameCount <= 1 || duration <= 0.5) {
    return [Math.min(0.05, Math.max(duration / 2, 0))];
  }

  const safeEnd = Math.max(duration - 0.15, 0);
  const step = safeEnd / Math.max(frameCount - 1, 1);
  return Array.from({ length: frameCount }, (_, index) => {
    const raw = Number((index * step).toFixed(2));
    if (index === 0) {
      return Math.min(0.05, Math.max(raw, 0));
    }
    return raw;
  });
}

export async function extractFramesInBrowser(
  file: File,
  options?: { frameCount?: number; maxWidth?: number; quality?: number }
): Promise<string[]> {
  const frameCount = options?.frameCount ?? DEFAULT_FRAME_COUNT;
  const maxWidth = options?.maxWidth ?? DEFAULT_MAX_WIDTH;
  const quality = options?.quality ?? DEFAULT_QUALITY;

  return new Promise((resolve, reject) => {
    const video = document.createElement("video");
    const canvas = document.createElement("canvas");
    const context = canvas.getContext("2d");
    const objectUrl = URL.createObjectURL(file);

    if (!context) {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("当前浏览器无法完成视频抽帧。"));
      return;
    }

    video.preload = "auto";
    video.muted = true;
    video.playsInline = true;
    video.src = objectUrl;

    video.onloadedmetadata = () => {
      const ratio = video.videoWidth && video.videoHeight ? video.videoHeight / video.videoWidth : 9 / 16;
      canvas.width = maxWidth;
      canvas.height = Math.max(1, Math.round(maxWidth * ratio));

      const timestamps = buildTimestamps(video.duration || 0, frameCount);
      const frames: string[] = [];
      let index = 0;

      video.onseeked = () => {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const image = canvas.toDataURL("image/jpeg", quality).split(",")[1];
        frames.push(image);
        index += 1;

        if (index >= timestamps.length) {
          URL.revokeObjectURL(objectUrl);
          resolve(frames);
          return;
        }

        video.currentTime = timestamps[index] ?? timestamps[timestamps.length - 1];
      };

      video.currentTime = timestamps[0] ?? 0;
    };

    video.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      reject(new Error("视频抽帧失败，请换一个更清晰或更标准的文件后重试。"));
    };
  });
}

export function getVideoLimits() {
  return {
    maxVideoSizeMb: MAX_VIDEO_SIZE_MB,
    maxVideoDurationSeconds: MAX_VIDEO_DURATION_SECONDS,
    defaultFrameCount: DEFAULT_FRAME_COUNT
  };
}
