"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useStudy } from "@/components/study/StudyProvider";
import { useI18n } from "@/lib/i18n/config";
import { logEvent } from "@/lib/eventLogger";
import { readLastStudyPath } from "@/lib/study/localData";
import { StudyLanguage } from "@/types/study";

function StudyStartPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, startStudySession, language: appLanguage } = useStudy();
  const { t } = useI18n();

  const defaultParticipantId = searchParams.get("participantId") ?? session?.participantId ?? "";
  const langParam = searchParams.get("lang");
  const defaultLanguage = ((langParam === "en" || langParam === "zh") ? langParam : appLanguage) as StudyLanguage;

  const [participantId, setParticipantId] = useState(defaultParticipantId);
  const [language, setLanguage] = useState<StudyLanguage>(session?.language ?? defaultLanguage);
  const [consented, setConsented] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (defaultParticipantId && !participantId) {
      setParticipantId(defaultParticipantId);
    }
  }, [defaultParticipantId, participantId]);

  useEffect(() => {
    if (!session && !langParam) {
      setLanguage(appLanguage);
    }
  }, [appLanguage, langParam, session]);

  const resumePath = useMemo(() => readLastStudyPath() ?? "/", []);

  const handleStart = async () => {
    if (!participantId.trim() || !consented || submitting) {
      return;
    }

    setSubmitting(true);
    setMessage("");
    const result = await startStudySession({ participantId: participantId.trim(), language });

    if (result.error || !result.session) {
      setSubmitting(false);
      setMessage(result.error ?? "Unable to start study session.");
      return;
    }

    logEvent("study_consent", { participantId: result.session.participantId, language: result.session.language });
    logEvent("study_session_start", {
      participantId: result.session.participantId,
      sessionId: result.session.sessionId,
      snapshotId: result.session.snapshotId,
      buildVersion: result.session.buildVersion
    });
    router.replace("/");
  };

  return (
    <PageContainer>
      <div className="mx-auto max-w-3xl space-y-5">
        <Card className="space-y-3">
          <p className="text-sm font-semibold text-brand-700">{t("study.start.badge")}</p>
          <h1 className="text-3xl font-black text-slate-900">{t("study.start.title")}</h1>
          <p className="text-sm leading-6 text-slate-600">{t("study.start.subtitle")}</p>
        </Card>

        <Card className="space-y-4">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-900">{t("study.start.participantLabel")}</span>
            <Input
              value={participantId}
              onChange={(event) => setParticipantId(event.target.value)}
              placeholder={t("study.start.participantPlaceholder")}
            />
          </label>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-900">{t("study.start.languageLabel")}</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setLanguage("zh")}
                className={language === "zh"
                  ? "min-h-11 rounded-xl border border-brand-500 bg-brand-50 px-4 text-sm font-semibold text-brand-700"
                  : "min-h-11 rounded-xl border border-[var(--line)] bg-white px-4 text-sm font-semibold text-slate-700"}
              >
                {t("study.start.languageZh")}
              </button>
              <button
                type="button"
                onClick={() => setLanguage("en")}
                className={language === "en"
                  ? "min-h-11 rounded-xl border border-brand-500 bg-brand-50 px-4 text-sm font-semibold text-brand-700"
                  : "min-h-11 rounded-xl border border-[var(--line)] bg-white px-4 text-sm font-semibold text-slate-700"}
              >
                {t("study.start.languageEn")}
              </button>
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-700">
            <p className="font-semibold text-slate-900">{t("study.start.noticeTitle")}</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>{t("study.start.noticePrivacy")}</li>
              <li>{t("study.start.noticeLock")}</li>
              <li>{t("study.start.noticeExport")}</li>
            </ul>
          </div>

          <label className="flex items-start gap-3 rounded-xl border border-[var(--line)] px-4 py-3">
            <input
              type="checkbox"
              className="mt-1"
              checked={consented}
              onChange={(event) => setConsented(event.target.checked)}
            />
            <span className="text-sm text-slate-700">{t("study.start.consent")}</span>
          </label>

          <div className="flex flex-wrap gap-3">
            <Button onClick={() => void handleStart()} disabled={!consented || !participantId.trim() || submitting}>
              {submitting ? "..." : t("study.start.button")}
            </Button>
            {session ? (
              <Button variant="secondary" onClick={() => router.push(resumePath)}>
                {t("study.start.resume")}
              </Button>
            ) : null}
          </div>

          {message ? (
            <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
              {message}
            </div>
          ) : null}
        </Card>
      </div>
    </PageContainer>
  );
}

export default function StudyStartPage() {
  return (
    <Suspense fallback={<PageContainer><div className="mx-auto max-w-3xl text-sm text-slate-500">Loading...</div></PageContainer>}>
      <StudyStartPageContent />
    </Suspense>
  );
}
