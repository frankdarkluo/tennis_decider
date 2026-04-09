import { describe, expect, it } from "vitest";
import { decideDiagnoseFlow, CONSUMER_VISIBLE_FOLLOWUP_CAP } from "@/lib/intake/decideDiagnoseFlow";
import { createEmptyScenario, recalculateScenarioState } from "@/lib/scenarioReconstruction/runtime";
import { inferSkillCategory } from "@/lib/scenarioReconstruction/inferSkillCategory";
import { getSkillCategoryPolicy } from "@/lib/scenarioReconstruction/skillPolicy";

function createAnalyzableBackhandScenario() {
  const scenario = createEmptyScenario("比赛里我反手老下网，深球时更明显");
  scenario.stroke = "backhand";
  scenario.context.session_type = "match";
  scenario.context.movement = "moving";
  scenario.outcome.primary_error = "net";
  scenario.incoming_ball.depth = "deep";
  scenario.subjective_feeling.rushed = true;
  return recalculateScenarioState(scenario);
}

function createIncompleteBackhandScenario() {
  const scenario = createEmptyScenario("比赛里我反手老下网");
  scenario.stroke = "backhand";
  scenario.context.session_type = "match";
  scenario.outcome.primary_error = "net";
  return recalculateScenarioState(scenario);
}

describe("PR3 diagnose flow decision", () => {
  it("prefers a direct result when the structured scenario is already minimally analyzable", () => {
    const scenario = createAnalyzableBackhandScenario();
    const decision = decideDiagnoseFlow({
      scenario,
      locale: "zh",
      followupCount: 0
    });

    expect(decision.type).toBe("direct_result");
    expect(decision.diagnosisInput).toContain("反手");
  });

  it("chooses inline follow-up when the structured scenario is incomplete but a valid question exists", () => {
    const scenario = createIncompleteBackhandScenario();
    const decision = decideDiagnoseFlow({
      scenario,
      locale: "zh",
      followupCount: 0
    });

    expect(decision.type).toBe("needs_followup");
    expect(decision.selectedQuestion?.id).toBeTruthy();
  });

  it("keeps follow-up families inside the current skill policy", () => {
    const scenario = createIncompleteBackhandScenario();
    const decision = decideDiagnoseFlow({
      scenario,
      locale: "zh",
      followupCount: 0
    });
    const allowedFamilies = getSkillCategoryPolicy(inferSkillCategory(scenario).category).allowedQuestionFamilies;

    expect(decision.type).toBe("needs_followup");
    expect(allowedFamilies).toContain(decision.selectedQuestion?.family);
  });

  it("enforces the consumer-visible follow-up cap at 3 and then diagnoses from the best available structured state", () => {
    const scenario = createIncompleteBackhandScenario();
    const decision = decideDiagnoseFlow({
      scenario,
      locale: "zh",
      followupCount: CONSUMER_VISIBLE_FOLLOWUP_CAP
    });

    expect(CONSUMER_VISIBLE_FOLLOWUP_CAP).toBe(3);
    expect(decision.type).toBe("direct_result");
    expect(decision.selectedQuestion).toBeNull();
    expect(decision.diagnosisInput).toContain("反手");
  });
});
