import { describe, expect, it } from "vitest";
import { getPlanTemplate } from "@/lib/plans";

describe("plan long-tail coverage", () => {
  it("builds distinct long-tail plans instead of renamed baseline templates", () => {
    const halfVolleyPlan = getPlanTemplate("half-volley-late-contact", "3.5", "zh");
    const doublesPlan = getPlanTemplate("doubles-poach-hesitation", "3.5", "zh");
    const tacticsPlan = getPlanTemplate("passive-point-construction", "3.5", "zh");
    const pressurePlan = getPlanTemplate("safe-short-collapse", "3.5", "zh");
    const onTheRunPlan = getPlanTemplate("on-the-run-late-contact", "3.5", "zh");

    expect(halfVolleyPlan.title).toContain("半截击");
    expect(halfVolleyPlan.days[0]?.drill ?? "").toMatch(/半截击|低球|捡球/);
    expect(halfVolleyPlan.days[0]?.executionFocus ?? "").toMatch(/低球|前点|拍面/);

    expect(doublesPlan.title).toContain("双打");
    expect(doublesPlan.days[0]?.goal ?? "").toMatch(/双打|抢网|封网/);
    expect(doublesPlan.days[5]?.goal ?? "").toMatch(/双打|抢网|搭档/);

    expect(tacticsPlan.title).toContain("分点");
    expect(tacticsPlan.days[0]?.drill ?? "").toMatch(/分点|模式|组织/);
    expect(tacticsPlan.days[5]?.goal ?? "").toMatch(/分点|模式|组织/);

    expect(pressurePlan.title).toContain("关键分");
    expect(pressurePlan.days[0]?.executionFocus ?? "").toMatch(/关键分|安全|节奏/);
    expect(pressurePlan.days[5]?.successCriteria.join(" ") ?? "").toMatch(/压力|关键分|短球/);

    expect(onTheRunPlan.title).toContain("跑动");
    expect(onTheRunPlan.days[0]?.goal ?? "").toMatch(/跑动|晚点|到位/);
    expect(onTheRunPlan.days[5]?.transferCue ?? "").toMatch(/跑动|回位|还原/);

    expect(halfVolleyPlan.days[0]?.drill).not.toBe(tacticsPlan.days[0]?.drill);
    expect(doublesPlan.days[0]?.executionFocus).not.toBe(pressurePlan.days[0]?.executionFocus);
  });
});
