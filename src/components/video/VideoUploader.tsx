"use client";

import { useEffect, useId, useState } from "react";
import { Button } from "@/components/ui/Button";

type VideoUploaderProps = {
  file: File | null;
  error?: string;
  disabled?: boolean;
  meta?: {
    durationSeconds?: number;
    sizeMb?: number;
    width?: number;
    height?: number;
  } | null;
  onFileChange: (file: File | null) => void;
};

function formatDuration(seconds?: number) {
  if (!seconds) {
    return null;
  }

  const rounded = Math.round(seconds);
  const mins = Math.floor(rounded / 60);
  const secs = rounded % 60;
  return `${mins}:${secs.toString().padStart(2, "0")}`;
}

export function VideoUploader({ file, error, disabled, meta, onFileChange }: VideoUploaderProps) {
  const inputId = useId();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    if (!file) {
      setPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  return (
    <div className="space-y-3">
      <input
        id={inputId}
        type="file"
        accept="video/mp4,video/quicktime,video/webm,video/x-m4v"
        className="hidden"
        disabled={disabled}
        onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
      />

      <label
        htmlFor={inputId}
        className="flex min-h-[180px] cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-[var(--line)] bg-slate-50 px-6 py-8 text-center transition hover:border-brand-300 hover:bg-brand-50/30"
      >
        <p className="text-sm font-semibold text-slate-900">拖进来或点击上传 1 分钟以内的视频</p>
        <p className="mt-2 max-w-md text-sm leading-6 text-slate-600">
          推荐拍法：横屏、侧后方机位、让击球点和全身步伐尽量都进画面。
        </p>
        <span className="mt-4 inline-flex rounded-full border border-[var(--line)] bg-white px-3 py-1 text-xs text-slate-500">
          支持 mp4 / mov / webm，建议 50MB 以内
        </span>
      </label>

      {file ? (
        <div className="rounded-2xl border border-[var(--line)] bg-white p-4">
          {previewUrl ? (
            <video
              src={previewUrl}
              controls
              className="aspect-video w-full rounded-xl border border-[var(--line)] bg-slate-950/95"
            />
          ) : null}

          <div className="mt-4 flex flex-wrap items-center gap-2 text-xs text-slate-500">
            <span>文件：{file.name}</span>
            {typeof meta?.sizeMb === "number" ? <span>大小：{meta.sizeMb}MB</span> : null}
            {typeof meta?.durationSeconds === "number" ? <span>时长：{formatDuration(meta.durationSeconds)}</span> : null}
            {meta?.width && meta?.height ? <span>分辨率：{meta.width} × {meta.height}</span> : null}
          </div>

          <div className="mt-4">
            <Button type="button" variant="secondary" onClick={() => onFileChange(null)} disabled={disabled}>
              重新选择
            </Button>
          </div>
        </div>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      ) : null}
    </div>
  );
}

