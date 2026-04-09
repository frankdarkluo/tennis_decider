import React from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { I18nProvider } from "@/lib/i18n/config";
import { DayPlanCard } from "@/components/plan/DayPlanCard";
import en from "@/lib/i18n/dictionaries/en";
import zh from "@/lib/i18n/dictionaries/zh";
import { getPlanFromAssessment, getPlanFromDiagnosis } from "@/lib/plans";

const mockStudyState = vi.hoisted(() => ({
  language: "zh" as "zh" | "en",
  studyMode: false,
  canChangeLanguage: true,
  setLanguage: vi.fn()
}));

vi.mock("@/components/study/StudyProvider", () => ({
  useStudy: () => mockStudyState
}));

vi.mock("@/lib/eventLogger", () => ({
  logEvent: vi.fn()
}));

function renderWithI18n(ui: React.ReactElement) {
  return render(<I18nProvider>{ui}</I18nProvider>);
}

describe("7-step plan semantics", () => {
  it("keeps supported English and Chinese plan copy step-based instead of week-based", () => {
    expect(en["plan.title"]).toBe("Your 7-step practice plan");
    expect(en["plan.day.label"]).toBe("Step {day}");
    expect(en["plan.subtitle"]).not.toMatch(/\btoday\b|\bweek\b/i);
    expect(en["plan.summary.badge"]).not.toMatch(/\bweek\b/i);
    expect(en["plan.summary.diagnosis"]).not.toMatch(/seven days|week/i);
    expect(en["plan.fallback.target"]).not.toMatch(/\bweek\b/i);

    expect(zh["plan.title"]).toBe("你的 7 步训练计划");
    expect(zh["plan.day.label"]).toBe("第 {day} 步");
    expect(zh["plan.subtitle"]).not.toMatch(/今天|本周|一周/);
    expect(zh["plan.summary.badge"]).not.toMatch(/本周|一周/);
    expect(zh["plan.fallback.target"]).not.toMatch(/本周|一周/);
  });

  it("renders step labels on plan cards in both locales", () => {
    const zhPlan = getPlanFromDiagnosis({
      problemTag: "backhand-into-net",
      fixes: ["先把拍面立起来，再把击球点放到身体前面。"],
      locale: "zh"
    });

    mockStudyState.language = "zh";
    const { rerender } = renderWithI18n(<DayPlanCard day={zhPlan.days[0]} isToday />);

    expect(screen.getByText(/第 1 步/)).toBeInTheDocument();
    expect(screen.queryByText(/第 1 天/)).not.toBeInTheDocument();

    const enPlan = getPlanFromDiagnosis({
      problemTag: "backhand-into-net",
      fixes: ["Set the strings earlier and meet the ball farther in front."],
      locale: "en"
    });

    mockStudyState.language = "en";
    rerender(
      <I18nProvider>
        <DayPlanCard day={enPlan.days[1]} />
      </I18nProvider>
    );

    expect(screen.getByText("Step 2")).toBeInTheDocument();
    expect(screen.queryByText("Day 2")).not.toBeInTheDocument();
  });

  it("keeps diagnosis-origin plan summaries step-based while preserving a 7-step structure", () => {
    const plan = getPlanFromDiagnosis({
      title: "Serve diagnosis",
      problemTag: "second-serve-reliability",
      fixes: ["Slow the toss and rebuild the second-serve shape."],
      locale: "en"
    });

    expect(plan.title).toContain("7-step");
    expect(plan.target).toContain("7-step");
    expect(plan.target).not.toMatch(/\bweek\b/i);
    expect(plan.summary).not.toMatch(/\bweek\b/i);
    expect(plan.days).toHaveLength(7);
  });

  it("keeps assessment-origin plans compatible without falling back to weekly framing", () => {
    const plan = getPlanFromAssessment({
      weaknesses: ["发球"],
      observationNeeded: ["比赛意识"],
      locale: "zh"
    });

    expect(plan.days).toHaveLength(7);
    expect(plan.summary).toContain("发球");
    expect(plan.summary).toContain("比赛意识");
    expect(plan.summary).not.toMatch(/本周|一周/);
  });
});
