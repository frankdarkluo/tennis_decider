"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getLatestAssessmentResult, getVideoDiagnosisHistory, getVideoUsage, incrementVideoUsage, saveVideoDiagnosisHistory } from "@/lib/userData";
import { readAssessmentResultFromStorage, writeAssessmentResultToStorage } from "@/lib/assessmentStorage";
import { extractFramesInBrowser, getVideoLimits, validateVideoFile } from "@/lib/videoFrames";
import { getFreeVideoLimit, getRemainingVideoTrials, incrementLocalVideoUsage, readLocalVideoUsage } from "@/lib/videoUsage";
import { logEvent } from "@/lib/eventLogger";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageBreadcrumbs } from "@/components/layout/PageBreadcrumbs";
import { useAuth } from "@/components/auth/AuthProvider";
import { useAuthModal } from "@/components/auth/AuthModalProvider";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { VideoUploader } from "@/components/video/VideoUploader";
import { VideoProcessingStatus } from "@/components/video/VideoProcessingStatus";
import { VideoAnalysisResult } from "@/components/video/VideoAnalysisResult";
import { UsageMeter } from "@/components/video/UsageMeter";
import { VideoDiagnosisResult, VideoSceneType, VideoStrokeType } from "@/types/videoDiagnosis";

type UsageState = {
  successCount: number;
  failedCount: number;
  isPro: boolean;
  maxFree: number;
};

const strokeOptions: Array<{ label: string; value: VideoStrokeType }> = [
  { label: "不确定", value: "other" },
  { label: "正手", value: "forehand" },
  { label: "反手", value: "backhand" },
  { label: "发球", value: "serve" },
  { label: "网前 / 截击", value: "volley" }
];

const sceneOptions: Array<{ label: string; value: VideoSceneType }> = [
  { label: "不确定", value: "unknown" },
  { label: "喂球训练", value: "drill" },
  { label: "对拉 / 相持", value: "rally" },
  { label: "发球练习", value: "serve_practice" },
  { label: "比赛片段", value: "match" }
];

function initialUsageState(): UsageState {
  return {
    successCount: 0,
    failedCount: 0,
    isPro: false,
    maxFree: getFreeVideoLimit()
  };
}

export default function VideoDiagnosePage() {
  const { user, configured, loading } = useAuth();
  const { openLoginModal } = useAuthModal();
  const [file, setFile] = useState<File | null>(null);
  const [description, setDescription] = useState("");
  const [selectedStroke, setSelectedStroke] = useState<VideoStrokeType>("other");
  const [selectedScene, setSelectedScene] = useState<VideoSceneType>("unknown");
  const [currentLevel, setCurrentLevel] = useState<string | undefined>(undefined);
  const [usage, setUsage] = useState<UsageState>(initialUsageState());
  const [fileError, setFileError] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [processingStep, setProcessingStep] = useState<"extracting" | "analyzing" | "matching" | null>(null);
  const [meta, setMeta] = useState<{ durationSeconds?: number; sizeMb?: number; width?: number; height?: number } | null>(null);
  const [result, setResult] = useState<VideoDiagnosisResult | null>(null);
  const [historyHint, setHistoryHint] = useState("");

  const remainingTrials = useMemo(() => getRemainingVideoTrials(usage), [usage]);
  const limits = getVideoLimits();

  useEffect(() => {
    if (loading) {
      return;
    }

    let active = true;

    async function hydrateContext() {
      const localResult = readAssessmentResultFromStorage();
      if (localResult && active) {
        setCurrentLevel(localResult.level);
      }

      if (user?.id && configured) {
        const [remoteAssessment, remoteUsage, remoteHistory] = await Promise.all([
          getLatestAssessmentResult(user.id),
          getVideoUsage(user.id),
          getVideoDiagnosisHistory(user.id, 1)
        ]);

        if (!active) {
          return;
        }

        if (remoteAssessment.data) {
          setCurrentLevel(remoteAssessment.data.level);
          writeAssessmentResultToStorage(remoteAssessment.data);
        }

        if (remoteUsage.data) {
          setUsage(remoteUsage.data);
        }

        if (remoteHistory.data.length > 0) {
          setHistoryHint(`你最近一次视频诊断是在 ${new Date(remoteHistory.data[0].created_at).toLocaleString("zh-CN")} 完成的。`);
        }

        return;
      }

      if (active) {
        setUsage(readLocalVideoUsage());
      }
    }

    void hydrateContext();

    return () => {
      active = false;
    };
  }, [configured, loading, user?.id]);

  const handleFileChange = async (nextFile: File | null) => {
    setFile(nextFile);
    setResult(null);
    setSubmitError("");
    setStatusMessage("");

    if (!nextFile) {
      setFileError("");
      setMeta(null);
      return;
    }

    logEvent("video_upload_start", { fileName: nextFile.name, fileSizeBytes: nextFile.size });
    const validation = await validateVideoFile(nextFile);

    if (!validation.ok) {
      logEvent("video_validation_fail", {
        fileName: nextFile.name,
        reason: validation.error ?? "unknown"
      });
      setFile(null);
      setMeta(null);
      setFileError(validation.error ?? "视频校验失败。");
      return;
    }

    setFileError("");
    setMeta({
      durationSeconds: validation.durationSeconds,
      sizeMb: validation.sizeMb,
      width: validation.width,
      height: validation.height
    });
    logEvent("video_upload_success", {
      fileName: nextFile.name,
      durationSeconds: validation.durationSeconds ?? null,
      sizeMb: validation.sizeMb
    });
  };

  const refreshUsage = async (type: "success" | "fail") => {
    if (user?.id && configured) {
      const updateResult = await incrementVideoUsage(user.id, type);
      if (updateResult.error) {
        console.error("[video-diagnose] failed to update usage", updateResult.error);
      }

      const latestUsage = await getVideoUsage(user.id);
      if (!latestUsage.error) {
        setUsage(latestUsage.data);
      }

      return;
    }

    setUsage(incrementLocalVideoUsage(type));
  };

  const handleAnalyze = async () => {
    setSubmitError("");
    setStatusMessage("");
    setResult(null);

    if (!file) {
      setFileError("请先上传一段视频。");
      return;
    }

    if (!usage.isPro && remainingTrials !== Number.POSITIVE_INFINITY && remainingTrials <= 0) {
      logEvent("video_limit_reached", { source: user?.id ? "authenticated" : "guest" });
      setSubmitError("你已用完 3 次免费视频诊断。后续可以升级 Pro，或先继续使用免费的文字诊断。");
      return;
    }

    try {
      setProcessingStep("extracting");
      const frames = await extractFramesInBrowser(file, { frameCount: limits.defaultFrameCount });

      if (frames.length === 0) {
        throw new Error("视频抽帧失败，请换一段更清晰的视频后重试。");
      }

      setProcessingStep("analyzing");
      logEvent("video_analysis_start", {
        frameCount: frames.length,
        selectedStroke,
        selectedScene,
        hasDescription: Boolean(description.trim())
      });

      const response = await fetch("/api/video-diagnose", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          frames,
          userDescription: description.trim(),
          userLevel: currentLevel,
          selectedStroke,
          selectedScene,
          durationSeconds: meta?.durationSeconds,
          fileName: file.name
        })
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(typeof data?.message === "string" ? data.message : "视频诊断失败，请稍后重试。");
      }

      setProcessingStep("matching");
      const nextResult = data as VideoDiagnosisResult;
      setResult(nextResult);

      if (nextResult.chargeable) {
        await refreshUsage("success");
      } else {
        await refreshUsage("fail");
        logEvent("video_retry_recommended", { confidence: nextResult.confidence, reason: nextResult.fallbackReason ?? null });
      }

      if (user?.id && configured) {
        const saveResult = await saveVideoDiagnosisHistory(user.id, {
          userDescription: description.trim(),
          selectedStroke,
          selectedScene,
          observation: nextResult.observation,
          result: nextResult
        });

        if (saveResult.error) {
          console.error("[video-diagnose] failed to save history", saveResult.error);
        } else {
          logEvent("video_result_save", { confidence: nextResult.confidence, problemTag: nextResult.diagnosis.problemTag });
        }
      }

      logEvent("video_analysis_success", {
        confidence: nextResult.confidence,
        confidenceBand: nextResult.confidenceBand,
        problemTag: nextResult.diagnosis.problemTag
      });

      setStatusMessage(nextResult.chargeable
        ? "诊断完成，已计入次数。"
        : "建议重拍，这次不扣次数。");
    } catch (error) {
      const message = error instanceof Error ? error.message : "视频诊断失败，请稍后再试。";
      setSubmitError(message);
      logEvent("video_analysis_fail", { message });
    } finally {
      setProcessingStep(null);
    }
  };

  return (
    <PageContainer>
      <div className="space-y-5">
        <PageBreadcrumbs items={[{ href: "/", label: "← 回到首页" }]} />

        <Card className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-brand-700">AI 视频诊断</p>
            <h1 className="text-3xl font-black text-slate-900">上传视频，我来帮你看问题</h1>
            <p className="max-w-3xl text-sm leading-6 text-slate-600">1 分钟内的片段都可以。</p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-sm font-semibold text-slate-900">怎么拍更准</p>
              <p className="mt-1 text-sm text-slate-600">横屏、侧后方、连续 3-5 拍。</p>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-sm font-semibold text-slate-900">拍什么都行</p>
              <p className="mt-1 text-sm text-slate-600">喂球、对拉、发球、比赛都行。</p>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-sm font-semibold text-slate-900">这次能看什么</p>
              <p className="mt-1 text-sm text-slate-600">重点看动作问题和下一步。</p>
            </div>
          </div>
        </Card>

        <UsageMeter successCount={usage.successCount} maxFree={usage.maxFree} isPro={usage.isPro} />

        <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
          <Card className="space-y-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">上传视频</h2>
              <p className="mt-1 text-sm text-slate-600">
                建议 {limits.maxVideoDurationSeconds} 秒内、{limits.maxVideoSizeMb}MB 内。
              </p>
            </div>

            <VideoUploader file={file} error={fileError} meta={meta} disabled={Boolean(processingStep)} onFileChange={(nextFile) => void handleFileChange(nextFile)} />

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-900">想看哪一拍？</span>
                <select
                  className="min-h-11 w-full rounded-xl border border-[var(--line)] bg-white px-4 py-2 text-sm"
                  value={selectedStroke}
                  onChange={(event) => setSelectedStroke(event.target.value as VideoStrokeType)}
                >
                  {strokeOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>

              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-900">这是什么场景？</span>
                <select
                  className="min-h-11 w-full rounded-xl border border-[var(--line)] bg-white px-4 py-2 text-sm"
                  value={selectedScene}
                  onChange={(event) => setSelectedScene(event.target.value as VideoSceneType)}
                >
                  {sceneOptions.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </label>
            </div>

            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-900">可选：补一句感觉</span>
              <Input
                placeholder="例如：正手总晚点，越发力越容易飞"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                disabled={Boolean(processingStep)}
              />
            </label>

            <div className="rounded-2xl border border-brand-100 bg-brand-50/70 px-4 py-4 text-sm leading-6 text-slate-700">
              <p>会参考你的评估结果。</p>
              <p className="mt-1">
                当前等级：{currentLevel ?? "尚未评估"}。
                {currentLevel ? "" : "先做 1 分钟评估会更准。"}
              </p>
              {!currentLevel ? (
                <div className="mt-3">
                  <Link href="/assessment"><Button variant="secondary">先做评估</Button></Link>
                </div>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button type="button" onClick={() => void handleAnalyze()} disabled={!file || Boolean(processingStep)}>
                {processingStep ? "诊断中..." : "开始视频诊断"}
              </Button>
              {!user ? (
                <button
                  type="button"
                  className="text-sm font-medium text-slate-500 transition hover:text-brand-700"
                  onClick={() => openLoginModal("登录后可同步保存视频诊断记录", "profile")}
                >
                  登录后自动保存记录
                </button>
              ) : null}
            </div>

            {statusMessage ? (
              <div className="rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-700">
                {statusMessage}
              </div>
            ) : null}

            {submitError ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {submitError}
              </div>
            ) : null}

            {historyHint ? (
              <p className="text-xs text-slate-500">{historyHint}</p>
            ) : null}
          </Card>

          {processingStep ? (
            <VideoProcessingStatus step={processingStep} />
          ) : result ? (
            <VideoAnalysisResult result={result} />
          ) : (
            <Card className="space-y-4">
              <p className="text-sm font-semibold text-brand-700">结果会在这里</p>
              <h2 className="text-xl font-bold text-slate-900">先上传视频，我会给你问题、内容和计划</h2>
              <div className="space-y-3 text-sm leading-6 text-slate-600">
                <p>这次会先回答：</p>
                <ul className="list-disc space-y-1 pl-5">
                  <li>最先要改什么</li>
                  <li>更像击球点、准备、脚步还是节奏</li>
                  <li>先看什么、先跟谁学</li>
                  <li>接下来怎么练</li>
                </ul>
              </div>
            </Card>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
