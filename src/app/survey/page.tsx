"use client";

import { FormEvent, useMemo, useState } from "react";
import { surveyQuestions, susLikertLabels } from "@/data/surveyQuestions";
import { getEventSessionId, logEvent } from "@/lib/eventLogger";
import { saveSurveyResponse } from "@/lib/researchData";
import { calculateSUS } from "@/lib/survey";
import { PageContainer } from "@/components/layout/PageContainer";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { useAuth } from "@/components/auth/AuthProvider";

const partMeta = {
  basic: {
    title: "Part 1：基本信息",
    description: "先用 5 个问题了解你的打球背景。"
  },
  sus: {
    title: "Part 2：SUS 系统可用性量表",
    description: "请按 1-5 分作答，1=非常不同意，5=非常同意。"
  },
  product: {
    title: "Part 3：产品专项评价",
    description: "继续按 1-5 分作答，看看哪些环节最打动你。"
  },
  open: {
    title: "Part 4：开放式问题",
    description: "最后请尽量用自己的话说说真实感受。"
  }
} as const;

export default function SurveyPage() {
  const { user } = useAuth();
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

    const saveResult = await saveSurveyResponse({
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

    logEvent("cta_click", { ctaLabel: "提交问卷", ctaLocation: "survey", targetPage: "/survey" });
    setStatus("submitted");
    setMessage("感谢你的反馈！你的意见会帮助我们把产品做得更好。");
  }

  const renderQuestion = (question: (typeof surveyQuestions)[number], index: number) => {
    const displayIndex = surveyQuestions.findIndex((item) => item.id === question.id) + 1;

    if (question.type === "text") {
      return (
        <div key={question.id} className="space-y-2">
          <p className="font-semibold text-slate-900">Q{displayIndex}. {question.prompt}</p>
          <Textarea
            rows={5}
            value={typeof responses[question.id] === "string" ? (responses[question.id] as string) : ""}
            onChange={(event) => setResponses((prev) => ({ ...prev, [question.id]: event.target.value }))}
            placeholder="请尽量具体描述你的想法"
          />
        </div>
      );
    }

    if (question.type === "likert") {
      return (
        <div key={question.id} className="space-y-3">
          <p className="font-semibold text-slate-900">Q{displayIndex}. {question.prompt}</p>
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
        <p className="font-semibold text-slate-900">Q{displayIndex}. {question.prompt}</p>
        <div className="space-y-2">
          {question.options?.map((option) => {
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
          <p className="text-sm font-semibold text-brand-700">问卷已提交</p>
          <h1 className="text-3xl font-black text-slate-900">感谢你的反馈！</h1>
          <p className="text-sm leading-6 text-slate-600">{message}</p>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-6">
        <Card className="space-y-3">
          <p className="text-sm font-semibold text-brand-700">研究问卷</p>
          <h1 className="text-3xl font-black text-slate-900">TennisLevel 使用体验问卷</h1>
          <p className="text-sm leading-6 text-slate-600">
            这是一份匿名研究问卷，用于了解你对 TennisLevel 的使用体验。大约需要 5 分钟。
          </p>
        </Card>

        <form className="space-y-6" onSubmit={handleSubmit}>
          {(["basic", "sus", "product", "open"] as const).map((partKey) => (
            <Card key={partKey} className="space-y-5">
              <div>
                <h2 className="text-xl font-bold text-slate-900">{partMeta[partKey].title}</h2>
                <p className="mt-1 text-sm text-slate-600">{partMeta[partKey].description}</p>
              </div>
              <div className="space-y-5">
                {groupedQuestions[partKey].map((question, index) => renderQuestion(question, index))}
              </div>
            </Card>
          ))}

          <div className="flex flex-wrap items-center gap-3">
            <Button type="submit" disabled={!allAnswered || status === "submitting"}>
              {status === "submitting" ? "提交中..." : "提交问卷"}
            </Button>
            {!allAnswered ? <p className="text-sm text-slate-500">请先完成全部 25 题。</p> : null}
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
