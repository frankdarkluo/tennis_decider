"use client";

import Link from "next/link";
import { Suspense, useEffect, useMemo, useState } from "react";
import { useSearchParams } from "next/navigation";
import { logEvent } from "@/lib/eventLogger";
import { getPlanTemplate } from "@/lib/plans";
import { saveGeneratedPlan } from "@/lib/userData";
import { toChineseLevel } from "@/lib/utils";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageBreadcrumbs } from "@/components/layout/PageBreadcrumbs";
import { useAuth } from "@/components/auth/AuthProvider";
import { useAuthModal } from "@/components/auth/AuthModalProvider";
import { PlanSummary } from "@/components/plan/PlanSummary";
import { DayPlanCard } from "@/components/plan/DayPlanCard";
import { Button } from "@/components/ui/Button";
import { SavedPlanSource } from "@/types/userData";
import { PlanLevel } from "@/types/plan";

function normalizeLevelParam(level: string | null): PlanLevel {
  if (level === "2.5" || level === "3.0" || level === "3.5" || level === "4.0" || level === "4.0+") {
    return level;
  }

  return "3.0";
}

function PlanPageContent() {
  const params = useSearchParams();
  const { user, configured } = useAuth();
  const { openLoginModal } = useAuthModal();
  const defaultProblemTag = params.get("problemTag") ?? "no-plan";
  const defaultLevel = normalizeLevelParam(params.get("level"));

  const [problemTag, setProblemTag] = useState(defaultProblemTag);
  const [level, setLevel] = useState<PlanLevel>(defaultLevel);
  const [saveStatus, setSaveStatus] = useState<"idle" | "saving" | "saved" | "error">("idle");
  const [saveMessage, setSaveMessage] = useState("");

  const plan = useMemo(() => getPlanTemplate(problemTag, level), [problemTag, level]);
  const todayPlan = plan.days[0];
  const laterPlans = plan.days.slice(1);
  const sourceType: SavedPlanSource = params.get("problemTag")
    ? "diagnosis"
    : params.get("level")
      ? "assessment"
      : "default";
  const sourceLabel = params.get("problemTag") ?? params.get("level") ?? `${problemTag}:${level}`;

  const regenerate = () => {
    setLevel((prev) => (prev === "2.5" ? "3.0" : prev === "3.0" ? "3.5" : prev === "3.5" ? "4.0" : prev === "4.0" ? "4.0+" : "2.5"));
  };

  const hasSource = Boolean(params.get("problemTag") || params.get("level"));

  useEffect(() => {
    setSaveStatus("idle");
    setSaveMessage("");
  }, [level, problemTag]);

  useEffect(() => {
    if (!hasSource) {
      return;
    }

    logEvent("plan_generate", {
      sourceType,
      sourceLabel,
      level: plan.level
    });
  }, [hasSource, plan.level, sourceLabel, sourceType]);

  const handleSavePlan = async () => {
    if (!user?.id || !configured) {
      openLoginModal("登录后可保存训练计划", "save_plan");
      return;
    }

    setSaveStatus("saving");
    setSaveMessage("");

    const saveResult = await saveGeneratedPlan(user.id, plan, sourceType, sourceLabel);

    if (saveResult.error) {
      setSaveStatus("error");
      setSaveMessage(saveResult.error);
      return;
    }

    setSaveStatus("saved");
      setSaveMessage("已保存到你的账号。");
    logEvent("plan_save", { planId: `${plan.problemTag}:${plan.level}` });
  };

  if (!hasSource && problemTag === "no-plan") {
    return (
      <PageContainer>
        <div className="space-y-5">
          <PageBreadcrumbs items={[
            { href: "/diagnose", label: "← 回到诊断" },
            { href: "/", label: "回到首页" }
          ]} />
          <div className="rounded-2xl border border-dashed border-[var(--line)] bg-white p-8 text-center">
            <p className="text-slate-700">先做评估或诊断，再生成计划。</p>
            <div className="mt-4 flex justify-center gap-2">
              <Link href="/assessment"><Button>去水平评估</Button></Link>
              <Link href="/diagnose"><Button variant="secondary">去问题诊断</Button></Link>
            </div>
          </div>
        </div>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-5">
        <PageBreadcrumbs items={[
          { href: "/diagnose", label: "← 回到诊断" },
          { href: "/", label: "回到首页" }
        ]} />
        <div>
          <h1 className="text-3xl font-black text-slate-900">你的 7 天提升计划</h1>
          <p className="mt-2 text-slate-600">先练今天，再往后推。</p>
        </div>

        <PlanSummary
          headline={plan.summary ?? plan.target}
          supportingText={`当前等级参考：${toChineseLevel(plan.level)}`}
        />

        {todayPlan ? (
          <DayPlanCard
            day={todayPlan}
            isToday
            onViewDetails={(dayNumber) => logEvent("plan_view_day", { dayNumber })}
          />
        ) : null}

        {laterPlans.length > 0 ? (
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-900">后续安排</p>
            <div className="space-y-3">
              {laterPlans.map((day) => (
                <DayPlanCard
                  key={day.day}
                  day={day}
                  onViewDetails={(dayNumber) => logEvent("plan_view_day", { dayNumber })}
                />
              ))}
            </div>
          </div>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button onClick={() => void handleSavePlan()} disabled={saveStatus === "saving" || saveStatus === "saved"}>
            {saveStatus === "saving" ? "保存中..." : saveStatus === "saved" ? "已保存 ✓" : "保存这份计划"}
          </Button>
          <Button variant="secondary" onClick={regenerate}>重新生成</Button>
        </div>
        {saveMessage ? (
          <div className={saveStatus === "error"
            ? "rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
            : "rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-700"}
          >
            {saveMessage}
          </div>
        ) : null}
      </div>
    </PageContainer>
  );
}

export default function PlanPage() {
  return (
    <Suspense fallback={<PageContainer><p className="text-slate-600">正在加载训练计划...</p></PageContainer>}>
      <PlanPageContent />
    </Suspense>
  );
}
