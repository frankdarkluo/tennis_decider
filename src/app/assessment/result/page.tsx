"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { AssessmentResult } from "@/types/assessment";
import { getDefaultAssessmentResult } from "@/lib/assessment";
import {
  readAssessmentResultFromStorage,
  writeAssessmentResultToStorage
} from "@/lib/assessmentStorage";
import { logEvent } from "@/lib/eventLogger";
import { getLatestAssessmentResult, saveAssessmentResult } from "@/lib/userData";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageBreadcrumbs } from "@/components/layout/PageBreadcrumbs";
import { ResultSummary } from "@/components/assessment/ResultSummary";
import { SkillBreakdown } from "@/components/assessment/SkillBreakdown";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useAuth } from "@/components/auth/AuthProvider";
import { useAuthModal } from "@/components/auth/AuthModalProvider";

type AssessmentResultSource = "loading" | "remote" | "synced" | "local";

export default function AssessmentResultPage() {
  const { user, configured, loading } = useAuth();
  const { openLoginModal } = useAuthModal();
  const [result, setResult] = useState<AssessmentResult>(getDefaultAssessmentResult());
  const [source, setSource] = useState<AssessmentResultSource>("loading");

  useEffect(() => {
    if (loading) {
      return;
    }

    let active = true;

    async function loadResult() {
      const localResult = readAssessmentResultFromStorage();
      const fallbackResult = localResult ?? getDefaultAssessmentResult();

      if (user?.id && configured) {
        const remoteResult = await getLatestAssessmentResult(user.id);

        if (!active) {
          return;
        }

        if (remoteResult.data) {
          setResult(remoteResult.data);
          writeAssessmentResultToStorage(remoteResult.data);
          setSource("remote");
          return;
        }

        if (localResult && localResult.answeredCount > 0) {
          const syncResult = await saveAssessmentResult(user.id, localResult);

          if (!active) {
            return;
          }

          setResult(localResult);
          setSource(syncResult.error ? "local" : "synced");
          return;
        }
      }

      setResult(fallbackResult);
      setSource("local");
    }

    void loadResult();

    return () => {
      active = false;
    };
  }, [configured, loading, user?.id]);

  useEffect(() => {
    if (source === "loading" || result.answeredCount === 0) {
      return;
    }

    logEvent("assessment_complete", {
      level: result.level,
      strengths: result.strengths,
      weaknesses: result.weaknesses,
      uncertainItems: result.observationNeeded
    });
  }, [result, source]);

  return (
    <PageContainer>
      <div className="space-y-5">
        <PageBreadcrumbs items={[
          { href: "/assessment", label: "← 重新评估" },
          { href: "/", label: "回到首页" }
        ]} />
        {source === "loading" ? (
          <Card className="text-sm text-slate-600">正在同步你的评估记录...</Card>
        ) : null}
        {user && source === "remote" ? (
          <div className="rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-700">
            已从你的账号中读取最近一次评估记录。
          </div>
        ) : null}
        {user && source === "synced" ? (
          <div className="rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-700">
            已把这台设备上的评估结果同步到你的账号。
          </div>
        ) : null}
        <ResultSummary result={result} />
        <SkillBreakdown result={result} />
        <Card className="space-y-2">
          <h2 className="text-xl font-bold text-slate-900">评估总结</h2>
          <p className="text-sm text-slate-700">{result.summary}</p>
          {result.observationNeeded.length > 0 ? (
            <div className="rounded-xl bg-amber-50 p-3 text-sm text-amber-800">
              <p className="font-semibold">待观察维度：{result.observationNeeded.join(" / ")}</p>
              <p className="mt-1">建议先看推荐内容并训练 1-2 周，再回来更新判断。</p>
            </div>
          ) : null}
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-slate-900">相对强项</p>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-700">
                {result.strengths.length > 0 ? (
                  result.strengths.map((item) => <li key={item}>{item}</li>)
                ) : (
                  <li>暂无</li>
                )}
              </ul>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">优先补强</p>
              <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-700">
                {result.weaknesses.length > 0 ? (
                  result.weaknesses.map((item) => <li key={item}>{item}</li>)
                ) : (
                  <li>暂无</li>
                )}
              </ul>
            </div>
          </div>
        </Card>
        <div className="flex flex-wrap gap-2">
          <Link href="/diagnose" onClick={() => logEvent("cta_click", { ctaLabel: "去做问题诊断", ctaLocation: "assessment_result", targetPage: "/diagnose" })}>
            <Button>去做问题诊断</Button>
          </Link>
          <Link href={`/library?level=${result.level}`} onClick={() => logEvent("cta_click", { ctaLabel: "去看推荐内容", ctaLocation: "assessment_result", targetPage: "/library" })}>
            <Button variant="secondary">去看推荐内容</Button>
          </Link>
          <Link href="/assessment" onClick={() => logEvent("cta_click", { ctaLabel: "重新测试", ctaLocation: "assessment_result", targetPage: "/assessment" })}>
            <Button variant="ghost">重新测试</Button>
          </Link>
        </div>
        {user ? (
          <Card className="flex flex-col items-start gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">你的评估结果已保存</h2>
              <p className="mt-1 text-sm text-slate-600">随时可以在「我的记录」里回看最近一次评估结果、短板和推荐方向。</p>
            </div>
            <Link href="/profile">
              <Button variant="secondary">查看我的记录</Button>
            </Link>
          </Card>
        ) : (
          <Card className="flex flex-col items-start gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">登录后可以保存评估记录</h2>
              <p className="mt-1 text-sm text-slate-600">这样你下次回来时，可以直接在「我的记录」里继续查看最近结果。</p>
            </div>
            <Button variant="secondary" onClick={() => openLoginModal("登录后可以保存评估记录", "generic")}>
              登录后保存
            </Button>
          </Card>
        )}
      </div>
    </PageContainer>
  );
}
