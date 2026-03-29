"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { logEvent } from "@/lib/eventLogger";
import { useI18n } from "@/lib/i18n/config";
import { getProblemPreviewTags } from "@/lib/diagnosis";
import { useStudy } from "@/components/study/StudyProvider";

export function HeroSection() {
  const { language, t } = useI18n();
  const { studyMode } = useStudy();
  const [question, setQuestion] = useState("");
  const startedTypingRef = useRef(false);
  const diagnoseHref = `/diagnose?q=${encodeURIComponent(question)}`;
  const quickTags = getProblemPreviewTags(language);
  const trimmedQuestion = question.trim();
  const inputMethod = quickTags.includes(trimmedQuestion) ? "quick_tag" : "typing";

  return (
    <section className="rounded-3xl border border-[var(--line)] bg-white p-8 shadow-soft md:p-10">
      <p className="mb-4 inline-flex rounded-full bg-brand-50 px-3 py-1 text-xs font-semibold text-brand-700">
        {t("home.hero.badge")}
      </p>
      <h1 className="max-w-4xl text-3xl font-black leading-tight text-slate-900 md:text-[2.7rem]">
        {t("home.hero.title")}
      </h1>
      <p className="mt-4 max-w-3xl text-slate-600 md:text-lg">{t("home.hero.subtitle")}</p>
      <div className="mt-6 space-y-3">
        <Textarea
          rows={3}
          value={question}
          onChange={(e) => {
            const nextValue = e.target.value;
            setQuestion(nextValue);
            if (!startedTypingRef.current && nextValue.trim()) {
              startedTypingRef.current = true;
              logEvent("home.problem_started", { inputMethod: "typing" }, { page: "/" });
            }
          }}
          placeholder={t("home.hero.placeholder")}
        />
        <p className="text-sm text-slate-500">{t("home.hero.quickTags")}</p>
        <div className="flex flex-wrap gap-2">
          {quickTags.map((tag) => (
            <button
              type="button"
              key={tag}
              className="min-h-11 rounded-full border border-[var(--line)] px-4 py-2 text-sm text-slate-700 transition hover:border-brand-300 hover:text-brand-700"
              onClick={() => {
                setQuestion(tag);
                logEvent("home.problem_started", { inputMethod: "quick_tag" }, { page: "/" });
                logEvent("home.quick_tag_clicked", { problemTag: tag }, { page: "/" });
              }}
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
      <div className="mt-6 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
        <Link
          href={diagnoseHref}
          onClick={() => {
            logEvent("home.entry_selected", { entryMode: "symptom" }, { page: "/" });
            logEvent("home.problem_submitted", {
              inputMethod,
              queryLength: trimmedQuestion.length,
              problemTagGuess: inputMethod === "quick_tag" ? trimmedQuestion : null,
              destination: "/diagnose"
            }, { page: "/" });
          }}
        >
          <Button className="h-11 px-6">{t("home.hero.diagnose")}</Button>
        </Link>
        <Link
          href="/assessment"
          className="text-sm font-medium text-slate-500 transition hover:text-brand-700"
          onClick={() => {
            logEvent("home.entry_selected", { entryMode: "assessment" }, { page: "/" });
            logEvent("home.assessment_cta_clicked", { ctaPosition: "hero" }, { page: "/" });
          }}
        >
          {t("home.hero.assessment")}
        </Link>
      </div>
      {!studyMode ? (
        <div className="mt-4">
          <Link
            href="/video-diagnose"
            className="text-sm font-medium text-slate-500 transition hover:text-brand-700"
            onClick={() => logEvent("cta_click", { ctaLabel: t("cta.heroVideo"), ctaLocation: "home_hero_video", targetPage: "/video-diagnose" })}
          >
            {t("home.hero.video")}
          </Link>
        </div>
      ) : null}
    </section>
  );
}
