"use client";

import { Suspense, useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useStudy } from "@/components/study/StudyProvider";
import { getSessionStartClientPayload, logEvent } from "@/lib/eventLogger";
import { useI18n } from "@/lib/i18n/config";
import enDictionary from "@/lib/i18n/dictionaries/en";
import zhDictionary from "@/lib/i18n/dictionaries/zh";
import { readLastStudyPath } from "@/lib/study/localData";
import { persistStudyArtifact } from "@/lib/study/client";
import { StudyBackgroundProfile, StudyLanguage } from "@/types/study";

type Option = { value: string; label: string };
type DictionaryKey = keyof typeof zhDictionary;

function applyReplacements(value: string, replacements?: Record<string, string | number>) {
  if (!replacements) {
    return value;
  }

  return Object.entries(replacements).reduce((current, [key, replacement]) => {
    return current.replace(new RegExp(`\\{${key}\\}`, "g"), String(replacement));
  }, value);
}

const backgroundCopy = {
  zh: {
    title: "研究背景信息",
    subtitle: "这部分只记录匿名区间信息，用于后续研究分析。",
    ageBand: "年龄区间",
    yearsPlayingBand: "打球年限",
    playFrequency: "每周打球频率",
    coachHistory: "你有没有请过教练？",
    selfReportedLevel: "自我判断水平",
    watchesTrainingVideos: "平时会看教学视频吗？",
    hasUploadedPracticeVideoBefore: "以前上传过练习视频给别人看吗？",
    yes: "是",
    no: "否"
  },
  en: {
    title: "Background for this study",
    subtitle: "We only record coarse anonymous ranges here for research analysis.",
    ageBand: "Age band",
    yearsPlayingBand: "Years playing",
    playFrequency: "Weekly play frequency",
    coachHistory: "Have you ever taken lessons with a coach?",
    selfReportedLevel: "Self-reported level",
    watchesTrainingVideos: "Do you usually watch training videos?",
    hasUploadedPracticeVideoBefore: "Have you uploaded a practice video before?",
    yes: "Yes",
    no: "No"
  }
} as const;

const ageBandOptions: Record<StudyLanguage, Option[]> = {
  zh: [
    { value: "under_18", label: "18 岁以下" },
    { value: "18_24", label: "18-24 岁" },
    { value: "25_34", label: "25-34 岁" },
    { value: "35_44", label: "35-44 岁" },
    { value: "45_plus", label: "45 岁及以上" }
  ],
  en: [
    { value: "under_18", label: "Under 18" },
    { value: "18_24", label: "18-24" },
    { value: "25_34", label: "25-34" },
    { value: "35_44", label: "35-44" },
    { value: "45_plus", label: "45 and above" }
  ]
};

const yearsPlayingOptions: Record<StudyLanguage, Option[]> = {
  zh: [
    { value: "under_1", label: "不到 1 年" },
    { value: "1_3", label: "1-3 年" },
    { value: "3_5", label: "3-5 年" },
    { value: "5_10", label: "5-10 年" },
    { value: "10_plus", label: "10 年以上" }
  ],
  en: [
    { value: "under_1", label: "Under 1 year" },
    { value: "1_3", label: "1-3 years" },
    { value: "3_5", label: "3-5 years" },
    { value: "5_10", label: "5-10 years" },
    { value: "10_plus", label: "10+ years" }
  ]
};

const playFrequencyOptions: Record<StudyLanguage, Option[]> = {
  zh: [
    { value: "less_than_weekly", label: "不到每周 1 次" },
    { value: "1_2", label: "每周 1-2 次" },
    { value: "3_4", label: "每周 3-4 次" },
    { value: "5_plus", label: "每周 5 次以上" }
  ],
  en: [
    { value: "less_than_weekly", label: "Less than once a week" },
    { value: "1_2", label: "1-2 times a week" },
    { value: "3_4", label: "3-4 times a week" },
    { value: "5_plus", label: "5+ times a week" }
  ]
};

const coachHistoryOptions: Record<StudyLanguage, Option[]> = {
  zh: [
    { value: "none", label: "没有" },
    { value: "occasional", label: "偶尔请" },
    { value: "regular", label: "固定在上课" }
  ],
  en: [
    { value: "none", label: "No" },
    { value: "occasional", label: "Occasionally" },
    { value: "regular", label: "Taking regular lessons" }
  ]
};

const levelOptions: Record<StudyLanguage, Option[]> = {
  zh: [
    { value: "2.5_or_below", label: "2.5 或以下" },
    { value: "3.0", label: "3.0" },
    { value: "3.5", label: "3.5" },
    { value: "4.0_or_above", label: "4.0 或以上" },
    { value: "unsure", label: "不确定" }
  ],
  en: [
    { value: "2.5_or_below", label: "2.5 or below" },
    { value: "3.0", label: "3.0" },
    { value: "3.5", label: "3.5" },
    { value: "4.0_or_above", label: "4.0 or above" },
    { value: "unsure", label: "Not sure" }
  ]
};

function SelectField({
  label,
  value,
  options,
  onChange
}: {
  label: string;
  value: string;
  options: Option[];
  onChange: (nextValue: string) => void;
}) {
  return (
    <label className="space-y-2">
      <span className="text-sm font-semibold text-slate-900">{label}</span>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="min-h-11 w-full rounded-xl border border-[var(--line)] bg-white px-4 py-2 text-sm text-slate-700 outline-none transition focus:border-brand-300"
      >
        <option value="" disabled>--</option>
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </label>
  );
}

function BooleanField({
  label,
  value,
  language,
  onChange
}: {
  label: string;
  value: boolean | null;
  language: StudyLanguage;
  onChange: (nextValue: boolean) => void;
}) {
  const copy = backgroundCopy[language];

  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-slate-900">{label}</p>
      <div className="flex flex-wrap gap-2">
        {[true, false].map((option) => (
          <button
            key={String(option)}
            type="button"
            onClick={() => onChange(option)}
            className={value === option
              ? "min-h-11 rounded-xl border border-brand-500 bg-brand-50 px-4 text-sm font-semibold text-brand-700"
              : "min-h-11 rounded-xl border border-[var(--line)] bg-white px-4 text-sm font-semibold text-slate-700"}
          >
            {option ? copy.yes : copy.no}
          </button>
        ))}
      </div>
    </div>
  );
}

function StudyStartPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { session, startStudySession, language: appLanguage } = useStudy();
  const { setLanguage: setSiteLanguage, canChangeLanguage } = useI18n();

  const defaultParticipantId = searchParams.get("participantId") ?? session?.participantId ?? "";
  const langParam = searchParams.get("lang");
  const defaultLanguage = ((langParam === "en" || langParam === "zh") ? langParam : appLanguage) as StudyLanguage;

  const [participantId, setParticipantId] = useState(defaultParticipantId);
  const [language, setLanguage] = useState<StudyLanguage>(session?.language ?? defaultLanguage);
  const [consented, setConsented] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState("");
  const [background, setBackground] = useState<StudyBackgroundProfile>({
    ageBand: "",
    yearsPlayingBand: "",
    playFrequency: "",
    coachHistory: "",
    selfReportedLevel: "",
    watchesTrainingVideos: false,
    hasUploadedPracticeVideoBefore: false
  });
  const [backgroundBooleanReady, setBackgroundBooleanReady] = useState({
    watchesTrainingVideos: false,
    hasUploadedPracticeVideoBefore: false
  });

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
  const localizedCopy = backgroundCopy[language];
  const pageT = (key: DictionaryKey, replacements?: Record<string, string | number>) => {
    const dictionary = language === "en" ? enDictionary : zhDictionary;
    const translated = dictionary[key] ?? zhDictionary[key] ?? key;
    return applyReplacements(String(translated), replacements);
  };
  const canSubmitBackground = Boolean(
      background.ageBand &&
      background.yearsPlayingBand &&
      background.playFrequency &&
      background.coachHistory &&
      background.selfReportedLevel &&
      backgroundBooleanReady.watchesTrainingVideos &&
      backgroundBooleanReady.hasUploadedPracticeVideoBefore
  );

  const handleLanguagePreviewChange = (nextLanguage: StudyLanguage) => {
    setLanguage(nextLanguage);

    if (canChangeLanguage && !session) {
      setSiteLanguage(nextLanguage);
    }
  };

  const handleStart = async () => {
    if (!participantId.trim() || !consented || submitting || !canSubmitBackground) {
      return;
    }

    setSubmitting(true);
    setMessage("");
    const consentedAt = new Date().toISOString();
    const result = await startStudySession({
      participantId: participantId.trim(),
      language,
      background,
      consentedAt
    });

    if (result.error || !result.session) {
      setSubmitting(false);
      setMessage(result.error ?? "Unable to start study session.");
      return;
    }

    logEvent("study.started", {
      consented: true
    }, { page: "/study/start" });
    logEvent("study.background_submitted", {
      ageBand: background.ageBand,
      yearsPlayingBand: background.yearsPlayingBand,
      playFrequency: background.playFrequency,
      coachHistory: background.coachHistory,
      selfReportedLevel: background.selfReportedLevel,
      watchesTrainingVideos: background.watchesTrainingVideos,
      hasUploadedPracticeVideoBefore: background.hasUploadedPracticeVideoBefore
    }, { page: "/study/start" });
    logEvent("session.started", {
      ...getSessionStartClientPayload("/"),
      participantId: result.session.participantId,
      sessionId: result.session.sessionId
    }, { page: "/" });
    void persistStudyArtifact(result.session, "study_background", background);
    router.replace("/");
  };

  return (
    <PageContainer>
      <div className="mx-auto max-w-3xl space-y-5">
        <Card className="space-y-3">
          <p className="text-sm font-semibold text-brand-700">{pageT("study.start.badge")}</p>
          <h1 className="text-3xl font-black text-slate-900">{pageT("study.start.title")}</h1>
          <p className="text-sm leading-6 text-slate-600">{pageT("study.start.subtitle")}</p>
        </Card>

        <Card className="space-y-4">
          <label className="space-y-2">
            <span className="text-sm font-semibold text-slate-900">{pageT("study.start.participantLabel")}</span>
            <Input
              value={participantId}
              onChange={(event) => setParticipantId(event.target.value)}
              placeholder={pageT("study.start.participantPlaceholder")}
            />
          </label>

          <div className="space-y-2">
            <p className="text-sm font-semibold text-slate-900">{pageT("study.start.languageLabel")}</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleLanguagePreviewChange("zh")}
                className={language === "zh"
                  ? "min-h-11 rounded-xl border border-brand-500 bg-brand-50 px-4 text-sm font-semibold text-brand-700"
                  : "min-h-11 rounded-xl border border-[var(--line)] bg-white px-4 text-sm font-semibold text-slate-700"}
              >
                {pageT("study.start.languageZh")}
              </button>
              <button
                type="button"
                onClick={() => handleLanguagePreviewChange("en")}
                className={language === "en"
                  ? "min-h-11 rounded-xl border border-brand-500 bg-brand-50 px-4 text-sm font-semibold text-brand-700"
                  : "min-h-11 rounded-xl border border-[var(--line)] bg-white px-4 text-sm font-semibold text-slate-700"}
              >
                {pageT("study.start.languageEn")}
              </button>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--line)] bg-slate-50/80 px-4 py-4">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-slate-900">{localizedCopy.title}</p>
              <p className="text-sm text-slate-600">{localizedCopy.subtitle}</p>
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <SelectField
                label={localizedCopy.ageBand}
                value={background.ageBand}
                options={ageBandOptions[language]}
                onChange={(value) => setBackground((prev) => ({ ...prev, ageBand: value }))}
              />
              <SelectField
                label={localizedCopy.yearsPlayingBand}
                value={background.yearsPlayingBand}
                options={yearsPlayingOptions[language]}
                onChange={(value) => setBackground((prev) => ({ ...prev, yearsPlayingBand: value }))}
              />
              <SelectField
                label={localizedCopy.playFrequency}
                value={background.playFrequency}
                options={playFrequencyOptions[language]}
                onChange={(value) => setBackground((prev) => ({ ...prev, playFrequency: value }))}
              />
              <SelectField
                label={localizedCopy.coachHistory}
                value={background.coachHistory}
                options={coachHistoryOptions[language]}
                onChange={(value) => setBackground((prev) => ({ ...prev, coachHistory: value }))}
              />
              <SelectField
                label={localizedCopy.selfReportedLevel}
                value={background.selfReportedLevel}
                options={levelOptions[language]}
                onChange={(value) => setBackground((prev) => ({ ...prev, selfReportedLevel: value }))}
              />
            </div>
            <div className="mt-4 grid gap-4 md:grid-cols-2">
              <BooleanField
                label={localizedCopy.watchesTrainingVideos}
                value={backgroundBooleanReady.watchesTrainingVideos ? background.watchesTrainingVideos : null}
                language={language}
                onChange={(value) => {
                  setBackground((prev) => ({ ...prev, watchesTrainingVideos: value }));
                  setBackgroundBooleanReady((prev) => ({ ...prev, watchesTrainingVideos: true }));
                }}
              />
              <BooleanField
                label={localizedCopy.hasUploadedPracticeVideoBefore}
                value={backgroundBooleanReady.hasUploadedPracticeVideoBefore ? background.hasUploadedPracticeVideoBefore : null}
                language={language}
                onChange={(value) => {
                  setBackground((prev) => ({ ...prev, hasUploadedPracticeVideoBefore: value }));
                  setBackgroundBooleanReady((prev) => ({ ...prev, hasUploadedPracticeVideoBefore: true }));
                }}
              />
            </div>
          </div>

          <div className="rounded-2xl bg-slate-50 px-4 py-4 text-sm leading-6 text-slate-700">
            <p className="font-semibold text-slate-900">{pageT("study.start.noticeTitle")}</p>
            <ul className="mt-2 list-disc space-y-1 pl-5">
              <li>{pageT("study.start.noticePrivacy")}</li>
              <li>{pageT("study.start.noticeLock")}</li>
              <li>{pageT("study.start.noticeExport")}</li>
            </ul>
          </div>

          <label className="flex items-start gap-3 rounded-xl border border-[var(--line)] px-4 py-3">
            <input
              type="checkbox"
              className="mt-1"
              checked={consented}
              onChange={(event) => setConsented(event.target.checked)}
            />
            <span className="text-sm text-slate-700">{pageT("study.start.consent")}</span>
          </label>

          <div className="flex flex-wrap gap-3">
            <Button onClick={() => void handleStart()} disabled={!consented || !participantId.trim() || !canSubmitBackground || submitting}>
              {submitting ? "..." : pageT("study.start.button")}
            </Button>
            {session ? (
              <Button variant="secondary" onClick={() => router.push(resumePath)}>
                {pageT("study.start.resume")}
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
