"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { getLatestAssessmentResult, getVideoDiagnosisHistory, getVideoUsage, incrementVideoUsage, saveVideoDiagnosisHistory } from "@/lib/userData";
import { readAssessmentResultFromStorage, writeAssessmentResultToStorage } from "@/lib/assessmentStorage";
import { useI18n } from "@/lib/i18n/config";
import { persistStudyArtifact } from "@/lib/study/client";
import { updateLocalStudyProgress } from "@/lib/study/localData";
import { sanitizeVideoDiagnosisArtifact } from "@/lib/study/privacy";
import { formatLocalizedDateTime } from "@/lib/i18n/format";
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
import { useStudy } from "@/components/study/StudyProvider";

type UsageState = {
  successCount: number;
  failedCount: number;
  isPro: boolean;
  maxFree: number;
};

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
  const { studyMode, session } = useStudy();
  const { t, language } = useI18n();
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
  const strokeOptions: Array<{ label: string; value: VideoStrokeType }> = [
    { label: t("video.option.unknown"), value: "other" },
    { label: t("video.option.forehand"), value: "forehand" },
    { label: t("video.option.backhand"), value: "backhand" },
    { label: t("video.option.serve"), value: "serve" },
    { label: t("video.option.volley"), value: "volley" }
  ];
  const sceneOptions: Array<{ label: string; value: VideoSceneType }> = [
    { label: t("video.option.scene_unknown"), value: "unknown" },
    { label: t("video.option.drill"), value: "drill" },
    { label: t("video.option.rally"), value: "rally" },
    { label: t("video.option.serve_practice"), value: "serve_practice" },
    { label: t("video.option.match"), value: "match" }
  ];

  useEffect(() => {
    if (loading) {
      return;
    }

    let active = true;

    async function hydrateContext() {
      setHistoryHint("");
      const localResult = readAssessmentResultFromStorage();
      if (localResult && active) {
        setCurrentLevel(localResult.level);
      }

      if (!studyMode && user?.id && configured) {
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
          setHistoryHint(t("video.history.latest", {
            value: formatLocalizedDateTime(remoteHistory.data[0].created_at, language)
          }));
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
  }, [configured, language, loading, studyMode, t, user?.id]);

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
    const validation = await validateVideoFile(nextFile, language);

    if (!validation.ok) {
      logEvent("video_validation_fail", {
        fileName: nextFile.name,
        reason: validation.error ?? "unknown"
      });
      setFile(null);
      setMeta(null);
      setFileError(validation.error ?? t("video.error.validate"));
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
    if (!studyMode && user?.id && configured) {
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
      setFileError(t("video.error.noFile"));
      return;
    }

    if (!usage.isPro && remainingTrials !== Number.POSITIVE_INFINITY && remainingTrials <= 0) {
      logEvent("video_limit_reached", { source: user?.id ? "authenticated" : "guest" });
      setSubmitError(t("video.error.limitReached"));
      return;
    }

    try {
      setProcessingStep("extracting");
      const frames = await extractFramesInBrowser(file, { frameCount: limits.defaultFrameCount, locale: language });

      if (frames.length === 0) {
        throw new Error(t("video.error.frameExtract"));
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
        throw new Error(typeof data?.message === "string" ? data.message : t("video.error.failed"));
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

      if (studyMode && session) {
        await persistStudyArtifact(session, "video_diagnosis", sanitizeVideoDiagnosisArtifact({
          description,
          selectedStroke,
          selectedScene,
          result: nextResult
        }));
        logEvent("study_artifact_save", { artifactType: "video_diagnosis" });
        updateLocalStudyProgress({ lastVisitedPath: "/video-diagnose" });
      } else if (user?.id && configured) {
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

      setStatusMessage(nextResult.chargeable ? t("video.status.counted") : t("video.status.retryNoCount"));
    } catch (error) {
      const message = error instanceof Error ? error.message : t("video.error.failed");
      setSubmitError(message);
      logEvent("video_analysis_fail", { message });
    } finally {
      setProcessingStep(null);
    }
  };

  return (
    <PageContainer>
      <div className="space-y-5">
        <PageBreadcrumbs items={[{ href: "/", label: t("video.backHome") }]} />

        <Card className="space-y-4">
          <div className="space-y-2">
            <p className="text-sm font-semibold text-brand-700">{t("video.badge")}</p>
            <h1 className="text-3xl font-black text-slate-900">{t("video.title")}</h1>
            <p className="max-w-3xl text-sm leading-6 text-slate-600">{t("video.subtitle")}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-sm font-semibold text-slate-900">{t("video.tip.shootTitle")}</p>
              <p className="mt-1 text-sm text-slate-600">{t("video.tip.shootBody")}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-sm font-semibold text-slate-900">{t("video.tip.sceneTitle")}</p>
              <p className="mt-1 text-sm text-slate-600">{t("video.tip.sceneBody")}</p>
            </div>
            <div className="rounded-2xl bg-slate-50 px-4 py-3">
              <p className="text-sm font-semibold text-slate-900">{t("video.tip.resultTitle")}</p>
              <p className="mt-1 text-sm text-slate-600">{t("video.tip.resultBody")}</p>
            </div>
          </div>
        </Card>

        <UsageMeter successCount={usage.successCount} maxFree={usage.maxFree} isPro={usage.isPro} />

        <div className="grid gap-5 xl:grid-cols-[0.95fr_1.05fr]">
          <Card className="space-y-5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">{t("video.upload.title")}</h2>
              <p className="mt-1 text-sm text-slate-600">
                {t("video.upload.subtitle", { duration: limits.maxVideoDurationSeconds, size: limits.maxVideoSizeMb })}
              </p>
            </div>

            <VideoUploader file={file} error={fileError} meta={meta} disabled={Boolean(processingStep)} onFileChange={(nextFile) => void handleFileChange(nextFile)} />

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="space-y-2">
                <span className="text-sm font-semibold text-slate-900">{t("video.stroke")}</span>
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
                <span className="text-sm font-semibold text-slate-900">{t("video.scene")}</span>
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
              <span className="text-sm font-semibold text-slate-900">{t("video.description")}</span>
              <Input
                placeholder={t("video.descriptionPlaceholder")}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                disabled={Boolean(processingStep)}
              />
            </label>

            <div className="rounded-2xl border border-brand-100 bg-brand-50/70 px-4 py-4 text-sm leading-6 text-slate-700">
              <p>{t("video.assessment.title")}</p>
              <p className="mt-1">
                {t("video.assessment.level", { value: currentLevel ?? t("video.notAssessed") })}
                {!currentLevel ? ` ${t("video.assessment.morePrecise")}` : ""}
              </p>
              {!currentLevel ? (
                <div className="mt-3">
                  <Link href="/assessment"><Button variant="secondary">{t("video.assessment.cta")}</Button></Link>
                </div>
              ) : null}
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <Button type="button" onClick={() => void handleAnalyze()} disabled={!file || Boolean(processingStep)}>
                {processingStep ? t("video.button.running") : t("video.button.start")}
              </Button>
              {!studyMode && !user ? (
                <button
                  type="button"
                  className="text-sm font-medium text-slate-500 transition hover:text-brand-700"
                  onClick={() => openLoginModal(t("video.loginPrompt"), "profile")}
                >
                  {t("video.loginHint")}
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
              <p className="text-sm font-semibold text-brand-700">{t("video.empty.badge")}</p>
              <h2 className="text-xl font-bold text-slate-900">{t("video.empty.title")}</h2>
              <div className="space-y-3 text-sm leading-6 text-slate-600">
                <p>{t("video.empty.bullets")}</p>
                <ul className="list-disc space-y-1 pl-5">
                  <li>{t("video.empty.item1")}</li>
                  <li>{t("video.empty.item2")}</li>
                  <li>{t("video.empty.item3")}</li>
                  <li>{t("video.empty.item4")}</li>
                </ul>
              </div>
            </Card>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
