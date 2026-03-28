"use client";

import { FormEvent, useMemo, useState } from "react";
import { surveyQuestions, susLikertLabels } from "@/data/surveyQuestions";
import { getEventSessionId, logEvent } from "@/lib/eventLogger";
import { useI18n } from "@/lib/i18n/config";
import { saveSurveyResponse } from "@/lib/researchData";
import { persistStudyArtifact } from "@/lib/study/client";
import { sanitizeSurveyArtifact } from "@/lib/study/privacy";
import { calculateSUS } from "@/lib/survey";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { useAuth } from "@/components/auth/AuthProvider";
import { useStudy } from "@/components/study/StudyProvider";

const partTranslationKeys = {
  basic: { title: "survey.part.basic.title", body: "survey.part.basic.body" },
  sus: { title: "survey.part.sus.title", body: "survey.part.sus.body" },
  product: { title: "survey.part.product.title", body: "survey.part.product.body" },
  open: { title: "survey.part.open.title", body: "survey.part.open.body" }
} as const;

export default function SurveyPage() {
  const { user } = useAuth();
  const { studyMode, session } = useStudy();
  const { language, t } = useI18n();
  const [responses, setResponses] = useState<Record<string, string | number>>({});
  const [status, setStatus] = useState<"idle" | "submitting" | "submitted" | "error">("idle");
  const [message, setMessage] = useState("");

  const groupedQuestions = useMemo(() => {
    return {
      basic: surveyQuestions.filter((question) => question.part === "basic"),
      sus: surveyQuestions.filter((question) => question.part === "sus"),
      product: surveyQuestions.filter((question) => question.part === "product"),
      open: surveyQuestions.filter((question) => question.part === "open")
    };
  }, []);

  const allAnswered = surveyQuestions.every((question) => {
    const value = responses[question.id];

    if (question.type === "text") {
      return typeof value === "string" && value.trim().length > 0;
    }

    return value !== undefined;
  });

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!allAnswered || status === "submitting") {
      return;
    }

    const susAnswers = Array.from({ length: 10 }, (_, index) => Number(responses[`q${index + 6}`]));
    const susScore = calculateSUS(susAnswers);

    setStatus("submitting");
    setMessage("");

    const saveResult = studyMode && session
      ? await persistStudyArtifact(session, "survey", {
        responses: sanitizeSurveyArtifact(responses),
        susScore
      })
      : await saveSurveyResponse({
        sessionId: getEventSessionId(),
        userId: user?.id ?? null,
        responses,
        susScore
      });

    if (saveResult.error) {
      setStatus("error");
      setMessage(saveResult.error);
      return;
    }

    logEvent("cta_click", { ctaLabel: t("cta.submitSurvey"), ctaLocation: "survey", targetPage: "/survey" });
    if (studyMode) {
      logEvent("study_artifact_save", { artifactType: "survey" });
    }
    setStatus("submitted");
    setMessage(t("survey.thanks.body"));
  }

  const renderQuestion = (question: (typeof surveyQuestions)[number], index: number) => {
    const displayIndex = surveyQuestions.findIndex((item) => item.id === question.id) + 1;

    if (question.type === "text") {
      return (
        <div key={question.id} className="space-y-2">
          <p className="font-semibold text-slate-900">Q{displayIndex}. {language === "en" && question.prompt_en ? question.prompt_en : question.prompt}</p>
          <Textarea
            rows={5}
            value={typeof responses[question.id] === "string" ? (responses[question.id] as string) : ""}
            onChange={(event) => setResponses((prev) => ({ ...prev, [question.id]: event.target.value }))}
            placeholder={t("survey.placeholder")}
          />
        </div>
      );
    }

    if (question.type === "likert") {
      return (
        <div key={question.id} className="space-y-3">
          <p className="font-semibold text-slate-900">Q{displayIndex}. {language === "en" && question.prompt_en ? question.prompt_en : question.prompt}</p>
          <div className="grid gap-2 sm:grid-cols-5">
            {susLikertLabels.map((label, optionIndex) => {
              const score = optionIndex + 1;
              const active = responses[question.id] === score;

              return (
                <button
                  key={label}
                  type="button"
                  className={[
                    "min-h-11 rounded-xl border px-3 py-2 text-sm font-medium transition",
                    active
                      ? "border-brand-500 bg-brand-50 text-brand-700"
                      : "border-[var(--line)] bg-white text-slate-600 hover:border-brand-300"
                  ].join(" ")}
                  onClick={() => setResponses((prev) => ({ ...prev, [question.id]: score }))}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      );
    }

    return (
      <div key={question.id} className="space-y-3">
        <p className="font-semibold text-slate-900">Q{displayIndex}. {language === "en" && question.prompt_en ? question.prompt_en : question.prompt}</p>
        <div className="space-y-2">
          {(language === "en" && question.options_en ? question.options_en : question.options)?.map((option) => {
            const active = responses[question.id] === option;

            return (
              <button
                key={option}
                type="button"
                className={[
                  "min-h-11 w-full rounded-xl border px-4 py-3 text-left text-sm transition",
                  active
                    ? "border-brand-500 bg-brand-50 text-brand-700"
                    : "border-[var(--line)] bg-white text-slate-700 hover:border-brand-300"
                ].join(" ")}
                onClick={() => setResponses((prev) => ({ ...prev, [question.id]: option }))}
              >
                {option}
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  if (status === "submitted") {
    return (
      <PageContainer>
        <Card className="mx-auto max-w-3xl space-y-4 text-center">
          <p className="text-sm font-semibold text-brand-700">{t("survey.completedBadge")}</p>
          <p className="text-sm font-semibold text-brand-700">{t("survey.thanks.badge")}</p>
          <h1 className="text-3xl font-black text-slate-900">{t("survey.thanks.title")}</h1>
          <p className="text-sm leading-6 text-slate-600">{message}</p>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        <Card className="space-y-3">
          <p className="text-sm font-semibold text-brand-700">{t("survey.badge")}</p>
          <h1 className="text-3xl font-black text-slate-900">{t("survey.title")}</h1>
          <p className="text-sm leading-6 text-slate-600">
            {t("survey.subtitle")}
          </p>
        </Card>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {(["basic", "sus", "product", "open"] as const).map((partKey) => (
            <Card key={partKey} className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{t(partTranslationKeys[partKey].title)}</h2>
                <p className="mt-1 text-sm text-slate-600">{t(partTranslationKeys[partKey].body)}</p>
              </div>
              <div className="space-y-5">
                {groupedQuestions[partKey].map((question, index) => renderQuestion(question, index))}
              </div>
            </Card>
          ))}

          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={!allAnswered || status === "submitting"}>
              {status === "submitting" ? t("survey.submitting") : t("survey.submit")}
            </Button>
            {!allAnswered ? <p className="text-sm text-slate-500">{t("survey.answerAll")}</p> : null}
          </div>
        </form>

        {message ? (
          <div className={status === "error"
            ? "rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
            : "rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-700"}
          >
            {message}
          </div>
        ) : null}
      </div>
    </PageContainer>
  );
}
