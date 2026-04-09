import { describe, expect, it } from "vitest";
import {
  buildDiagnosisPlanContext,
  buildPlanHref,
  getPlanTemplate,
  normalizePlanDraftSnapshot
} from "@/lib/plans";
import type { EnrichedDiagnosisContext } from "@/types/enrichedDiagnosis";

const volleyDeepContext: EnrichedDiagnosisContext = {
  mode: "deep",
  sourceInput: "我上网后第一板截击总是漂，而且一有人压上来我就更犹豫。",
  sceneSummaryZh: "上网后的第一板截击容易漂，对手压上来时会犹豫。",
  sceneSummaryEn: "My first volley floats after I come in, especially when the opponent presses forward.",
  skillCategory: "net",
  skillCategoryConfidence: "high",
  problemTag: "net-confidence",
  level: "3.5",
  strokeFamily: "volley",
  sessionType: "match",
  pressureContext: "general_match_pressure",
  movement: "moving",
  outcome: "float",
  incomingBallDepth: "medium",
  subjectiveFeeling: "hesitant",
  unresolvedRequiredSlots: [],
  stoppedByCap: false,
  isDeepModeReady: true
};

const sliceDeepContext: EnrichedDiagnosisContext = {
  mode: "deep",
  sourceInput: "对手切过来以后我的反手处理总是晚，球不是飘就是直接挂网。",
  sceneSummaryZh: "面对下旋来球时反手处理偏晚，不是冒高就是挂网。",
  sceneSummaryEn: "Against incoming slice my backhand is late and either floats or drops into the net.",
  skillCategory: "backhand",
  skillCategoryConfidence: "high",
  problemTag: "incoming-slice-trouble",
  level: "3.5",
  strokeFamily: "slice",
  sessionType: "match",
  pressureContext: "general_match_pressure",
  movement: "moving",
  outcome: "float",
  incomingBallDepth: "deep",
  subjectiveFeeling: "late",
  unresolvedRequiredSlots: [],
  stoppedByCap: false,
  isDeepModeReady: true
};

describe("PR4 scene specificity", () => {
  it("keeps on-move backhand plans scene-specific through later days", () => {
    const primaryNextStep = "先把跑动中的击球点放到身体前面。";
    const plan = getPlanTemplate("running-backhand", "3.5", "zh", [], {
      primaryNextStep,
      planContext: buildDiagnosisPlanContext({
        problemTag: "running-backhand",
        diagnosisInput: "比赛里我跑动中的反手老下网，尤其对手球比较深的时候更明显。",
        primaryNextStep
      })
    });

    expect(plan.days[2]?.goal).toContain("跑动");
    expect(plan.days[4]?.pressureBlock.items.join(" ")).toContain("深");
    expect(plan.days[6]).toHaveProperty("transferCue");
    expect(String((plan.days[6] as unknown as Record<string, string>).transferCue)).toContain("反手");
  });

  it("keeps volley later days anchored to the first-volley scene", () => {
    const plan = getPlanTemplate("net-confidence", "3.5", "zh", [], {
      primaryNextStep: "先把第一板截击压低到中路。",
      planContext: buildDiagnosisPlanContext({
        problemTag: "net-confidence",
        diagnosisInput: "我上网后第一板截击总是漂，而且一有人压上来我就更犹豫。",
        primaryNextStep: "先把第一板截击压低到中路。"
      }),
      deepContext: volleyDeepContext
    });

    expect(plan.days[4]?.goal).toContain("网前");
    expect(plan.days[5]?.mainBlock.items.join(" ")).toContain("截击");
    expect(plan.days[6]).toHaveProperty("failureCue");
    expect(String((plan.days[6] as unknown as Record<string, string>).failureCue)).toContain("漂");
  });

  it("keeps slice plans anchored to incoming-slice handling instead of generic backhand work", () => {
    const plan = getPlanTemplate("incoming-slice-trouble", "3.5", "zh", [], {
      primaryNextStep: "先把拍头放低，再把来球往前送出去。",
      planContext: buildDiagnosisPlanContext({
        problemTag: "incoming-slice-trouble",
        diagnosisInput: "对手切过来以后我的反手处理总是晚，球不是飘就是直接挂网。",
        primaryNextStep: "先把拍头放低，再把来球往前送出去。"
      }),
      deepContext: sliceDeepContext
    });

    expect(plan.days[3]?.goal).toContain("下旋");
    expect(plan.days[5]?.mainBlock.items.join(" ")).toContain("切球");
    expect(plan.days[6]).toHaveProperty("progressionNote");
    expect(String((plan.days[6] as unknown as Record<string, string>).progressionNote)).toContain("低");
  });

  it("keeps diagnosis-origin handoff compatible while preserving deep scene overlays into /plan", () => {
    const primaryNextStep = "先稳住分腿垫步，再把第一拍封挡回中路。";
    const planContext = buildDiagnosisPlanContext({
      problemTag: "return-under-pressure",
      diagnosisInput: "关键分接发时我总是发紧，第一拍只能挡回去而且很浅。",
      primaryNextStep
    });
    const href = buildPlanHref({
      problemTag: "return-under-pressure",
      level: "4.0",
      sourceType: "diagnosis",
      primaryNextStep,
      planContext,
      deepContext: {
        mode: "deep",
        sourceInput: "关键分接发时我总是发紧，第一拍只能挡回去而且很浅。",
        sceneSummaryZh: "关键分接发时我会发紧，第一拍只能浅挡回中路。",
        sceneSummaryEn: "On key points I get tight on the return and only block the first ball back short.",
        skillCategory: "return",
        skillCategoryConfidence: "high",
        problemTag: "return-under-pressure",
        level: "4.0",
        strokeFamily: "return",
        sessionType: "match",
        pressureContext: "key_points",
        movement: "stationary",
        outcome: "short",
        incomingBallDepth: "deep",
        subjectiveFeeling: "tight",
        unresolvedRequiredSlots: [],
        stoppedByCap: false,
        isDeepModeReady: true
      }
    });
    const draft = normalizePlanDraftSnapshot({
      problemTag: "return-under-pressure",
      level: "4.0",
      sourceType: "diagnosis",
      primaryNextStep,
      planContext,
      deepContext: {
        mode: "deep",
        sourceInput: "关键分接发时我总是发紧，第一拍只能挡回去而且很浅。",
        sceneSummaryZh: "关键分接发时我会发紧，第一拍只能浅挡回中路。",
        sceneSummaryEn: "On key points I get tight on the return and only block the first ball back short.",
        skillCategory: "return",
        skillCategoryConfidence: "high",
        problemTag: "return-under-pressure",
        level: "4.0",
        strokeFamily: "return",
        sessionType: "match",
        pressureContext: "key_points",
        movement: "stationary",
        outcome: "short",
        incomingBallDepth: "deep",
        subjectiveFeeling: "tight",
        unresolvedRequiredSlots: [],
        stoppedByCap: false,
        isDeepModeReady: true
      }
    });
    const plan = getPlanTemplate("return-under-pressure", "4.0", "zh", [], {
      primaryNextStep,
      planContext,
      deepContext: draft?.deepContext
    });

    expect(href).toContain("/plan?");
    expect(draft?.planContext).toMatchObject({
      pressureContext: "high",
      movementContext: "stationary"
    });
    expect(draft?.deepContext?.strokeFamily).toBe("return");
    expect(plan.summary).toContain("关键分场景");
    expect(plan.days[5]?.mainBlock.items.join(" ")).toContain("接发");
  });
});
