"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { PageContainer } from "@/components/layout/PageContainer";
import { useStudy } from "@/components/study/StudyProvider";
import { useI18n } from "@/lib/i18n/config";
import { logEvent } from "@/lib/eventLogger";

export default function StudyEndPage() {
  const { session, endStudySession, clearStudyData } = useStudy();
  const { t } = useI18n();
  const [ended, setEnded] = useState(false);

  useEffect(() => {
    if (!session || ended) {
      return;
    }

    void (async () => {
      await endStudySession();
      logEvent("study_session_end", {
        participantId: session.participantId,
        sessionId: session.sessionId,
        snapshotId: session.snapshotId
      });
      setEnded(true);
    })();
  }, [endStudySession, ended, session]);

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
          <div className="flex flex-wrap gap-3">
            <Button
              variant="secondary"
              onClick={() => {
                clearStudyData();
                logEvent("study_data_clear", {});
              }}
            >
              {t("study.end.clear")}
            </Button>
            <Link href="/">
              <Button>{t("study.end.home")}</Button>
            </Link>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}
