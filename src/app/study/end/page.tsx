"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { PageContainer } from "@/components/layout/PageContainer";
import { useStudy } from "@/components/study/StudyProvider";
import { useI18n } from "@/lib/i18n/config";
import {
  clearPendingSurveyStudySession,
  readPendingSurveyStudySession,
  writePendingSurveyStudySession
} from "@/lib/study/localData";
import { createStudySession } from "@/lib/study/session";
import { StudySession } from "@/types/study";

export default function StudyEndPage() {
  const { session, language } = useStudy();
  const { t, language: siteLanguage } = useI18n();
  const [participantId, setParticipantId] = useState(session?.participantId ?? "");
  const [confirmedSession, setConfirmedSession] = useState<StudySession | null>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const pendingSession = readPendingSurveyStudySession();
    if (!pendingSession) {
      return;
    }

    setParticipantId(pendingSession.participantId);
    setConfirmedSession(pendingSession);
  }, []);

  useEffect(() => {
    if (session?.participantId && !participantId) {
      setParticipantId(session.participantId);
    }
  }, [participantId, session]);

  const handleConfirmParticipant = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const normalizedParticipantId = participantId.trim();
    if (!normalizedParticipantId) {
      setMessage(t("study.end.participantRequired"));
      return;
    }

    const surveySession = session && session.participantId === normalizedParticipantId
      ? session
      : createStudySession({
        participantId: normalizedParticipantId,
        language: session?.language ?? language ?? siteLanguage
      });

    writePendingSurveyStudySession(surveySession);
    setConfirmedSession(surveySession);
    setMessage(t("study.end.participantConfirmed", { participantId: surveySession.participantId }));
  };

  return (
    <PageContainer>
      <div className="mx-auto max-w-3xl space-y-5">
        <Card className="space-y-3">
          <p className="text-sm font-semibold text-brand-700">{t("study.end.badge")}</p>
          <h1 className="text-3xl font-black text-slate-900">{t("study.end.title")}</h1>
          <p className="text-sm leading-6 text-slate-600">{t("study.end.subtitle")}</p>
        </Card>

        <Card className="space-y-4">
          <p className="text-sm leading-6 text-slate-700">{t("study.end.summary")}</p>
          <form className="space-y-3" onSubmit={handleConfirmParticipant}>
            <label className="space-y-2">
              <span className="text-sm font-semibold text-slate-900">{t("study.end.participantLabel")}</span>
              <Input
                value={participantId}
                onChange={(event) => {
                  setParticipantId(event.target.value);
                  if (confirmedSession && event.target.value.trim() !== confirmedSession.participantId) {
                    setConfirmedSession(null);
                    clearPendingSurveyStudySession();
                  }
                }}
                placeholder={t("study.end.participantPlaceholder")}
              />
            </label>
            <Button type="submit" disabled={!participantId.trim()}>
              {t("study.end.confirmParticipant")}
            </Button>
          </form>
          {message ? (
            <div className="rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-700">
              {message}
            </div>
          ) : null}
          <div className="flex flex-wrap gap-3">
            {confirmedSession ? (
              <Link href="/survey">
                <Button>{t("study.end.survey")}</Button>
              </Link>
            ) : null}
            <Link href="/">
              <Button>{t("study.end.home")}</Button>
            </Link>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}
