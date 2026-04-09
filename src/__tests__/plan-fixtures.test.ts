import { describe, expect, it } from "vitest";
import { buildDiagnosisPlanContext, getPlanTemplate } from "@/lib/plans";
import { planFewShotFixtures } from "@/data/planFewShotFixtures";

describe("plan few-shot fixtures", () => {
  it("locks the deeper-plan shape for scenario-rich diagnosis cases", () => {
    for (const fixture of planFewShotFixtures) {
      const planContext = fixture.deepContext
        ? undefined
        : buildDiagnosisPlanContext({
            problemTag: fixture.problemTag,
            diagnosisInput: fixture.diagnosisInput,
            primaryNextStep: fixture.primaryNextStep
          });

      const plan = getPlanTemplate(fixture.problemTag, fixture.level, fixture.locale, [], {
        primaryNextStep: fixture.primaryNextStep,
        planContext,
        deepContext: fixture.deepContext
      });

      expect(plan.source).toBe("template");

      if (fixture.summaryIncludes) {
        expect(plan.summary ?? "").toContain(fixture.summaryIncludes);
      }

      for (const expectation of fixture.dayExpectations) {
        const day = plan.days[expectation.day - 1];
        expect(day).toBeTruthy();
        if (!day) {
          throw new Error(`Missing day ${expectation.day} for fixture ${fixture.id}`);
        }

        expect(day.goal).toContain(expectation.goalIncludes);
        if (expectation.focusIncludes) {
          expect(day.focus).toContain(expectation.focusIncludes);
        }
        if (expectation.mainIncludes) {
          expect(day.mainBlock.items.join(" ")).toContain(expectation.mainIncludes);
        }
        if (expectation.pressureIncludes) {
          expect(day.pressureBlock.items.join(" ")).toContain(expectation.pressureIncludes);
        }
        if (expectation.successIncludes) {
          expect(day.successCriteria.join(" ")).toContain(expectation.successIncludes);
        }
        if (expectation.failureCueIncludes) {
          expect(String((day as unknown as Record<string, string>).failureCue)).toContain(expectation.failureCueIncludes);
        }
        if (expectation.transferCueIncludes) {
          expect(String((day as unknown as Record<string, string>).transferCue)).toContain(expectation.transferCueIncludes);
        }
        if (expectation.goalExcludes) {
          expect(day.goal).not.toContain(expectation.goalExcludes);
        }
        if (expectation.mainExcludes) {
          expect(day.mainBlock.items.join(" ")).not.toContain(expectation.mainExcludes);
        }
        if (expectation.pressureExcludes) {
          expect(day.pressureBlock.items.join(" ")).not.toContain(expectation.pressureExcludes);
        }
        if (expectation.successExcludes) {
          expect(day.successCriteria.join(" ")).not.toContain(expectation.successExcludes);
        }
      }
    }
  });

  it("does not collapse a deep serve week back to generic late-week template language when deepContext exists", () => {
    const serveFixture = planFewShotFixtures.find((fixture) => fixture.id === "serve_second_pressure_tight");
    expect(serveFixture?.deepContext).toBeTruthy();
    if (!serveFixture?.deepContext) {
      throw new Error("Missing deep serve fixture");
    }

    const plan = getPlanTemplate(serveFixture.problemTag, serveFixture.level, serveFixture.locale, [], {
      primaryNextStep: serveFixture.primaryNextStep,
      deepContext: serveFixture.deepContext
    });

    expect(plan.source).toBe("template");

    const day4Text = `${plan.days[3]?.goal} ${plan.days[3]?.mainBlock.items.join(" ")} ${plan.days[3]?.pressureBlock.items.join(" ")} ${plan.days[3]?.successCriteria.join(" ")}`;
    const day5Text = `${plan.days[4]?.goal} ${plan.days[4]?.mainBlock.items.join(" ")} ${plan.days[4]?.pressureBlock.items.join(" ")} ${plan.days[4]?.successCriteria.join(" ")}`;
    const day6Text = `${plan.days[5]?.goal} ${plan.days[5]?.mainBlock.items.join(" ")} ${plan.days[5]?.pressureBlock.items.join(" ")} ${plan.days[5]?.successCriteria.join(" ")}`;
    const day7Text = `${plan.days[6]?.goal} ${plan.days[6]?.mainBlock.items.join(" ")} ${plan.days[6]?.pressureBlock.items.join(" ")} ${plan.days[6]?.successCriteria.join(" ")}`;

    expect(day4Text).toContain("发紧");
    expect(day4Text).not.toContain("录像");

    expect(day5Text).toContain("关键分");
    expect(day5Text).not.toContain("中性重复");

    expect(day6Text).toContain("下一拍");
    expect(day6Text).not.toContain("完整训练");

    expect(day7Text).toContain("规则");
    expect(day7Text).not.toContain("关键分式的比赛化收口");
  });
});
