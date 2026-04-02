import { describe, expect, it } from "vitest";
import { diagnoseProblem, findBestDiagnosisRule, getMatchableInput, extractDiagnosisSignalBundle } from "@/lib/diagnosis";
import type { DiagnosisRule } from "@/types/diagnosis";
import type { ContentItem } from "@/types/content";

describe("diagnosis alias normalization", () => {
  it("segments a mixed input into clause-sized signal units", () => {
    const bundle = extractDiagnosisSignalBundle("正手在关键分的时候，如果对手在网前，我容易紧张，一发力就出界");

    expect(bundle.clauses.map((clause) => clause.text)).toEqual([
      "正手",
      "关键分的时候",
      "对手在网前",
      "我容易紧张",
      "一发力就出界"
    ]);
  });

  it("classifies mixed-input signals into primary, modifiers, and triggers", () => {
    const bundle = extractDiagnosisSignalBundle("正手在关键分的时候，如果对手在网前，我容易紧张，一发力就出界");

    expect(bundle.layeredSignals.primaryCandidates).toEqual(expect.arrayContaining(["forehand-out"]));
    expect(bundle.layeredSignals.modifiers).toEqual(expect.arrayContaining(["key_point", "tight"]));
    expect(bundle.layeredSignals.triggers).toEqual(expect.arrayContaining(["opponent_at_net", "overhit"]));
  });

  it("keeps support signals out of the layered diagnosis lanes", () => {
    const bundle = extractDiagnosisSignalBundle("练了很久没进步，不知道自己该练什么，但反手总下网");

    expect(bundle.supportSignals).toEqual(expect.arrayContaining(["plateau_no_progress", "cant_self_practice"]));
    expect(bundle.layeredSignals.primaryCandidates).toContain("backhand-into-net");
  });

  it("keeps alias and modifier provenance separate for pressure phrasing", () => {
    const bundle = extractDiagnosisSignalBundle("关键分二发总双误");

    expect(bundle.aliases).toHaveLength(2);
    expect(bundle.aliases).toEqual(expect.arrayContaining(["key_point", "second_serve"]));
    expect(bundle.modifiers).toEqual(expect.arrayContaining(["tight"]));
    expect(bundle.aliases).not.toContain("tight");
    expect(bundle.supportSignals).toEqual([]);
    expect(bundle.internalSignals).toEqual(expect.arrayContaining([
      "slot_stroke_serve",
      "slot_outcome_double_fault",
      "slot_context_pressure"
    ]));
    const matchableInput = getMatchableInput("关键分二发总双误");

    expect(matchableInput).toMatchObject({
      normalizedInput: "关键分二发总双误",
      rawInput: "关键分二发总双误"
    });
    expect(matchableInput.segments[0]).toEqual({ source: "raw", value: "关键分二发总双误" });
    expect(matchableInput.segments).toEqual(expect.arrayContaining([
      { source: "alias", value: "key_point" },
      { source: "alias", value: "second_serve" },
      { source: "modifier", value: "tight" }
    ]));
  });

  it("keeps age only on the modifier channel while extracting mobility as a canonical alias", () => {
    const bundle = extractDiagnosisSignalBundle("年纪大了，左右追球跟不上");

    expect(bundle.modifiers).toContain("age");
    expect(bundle.aliases).toContain("mobility_limit");
    expect(bundle.modifiers).not.toContain("mobility_limit");
    expect(bundle.aliases).not.toContain("age");
    expect(bundle.supportSignals).toEqual([]);
    expect(bundle.internalSignals).toEqual(expect.arrayContaining([
      "slot_condition_mobility_limit"
    ]));
  });

  it("threads aliases into keyword matching", () => {
    const rules: DiagnosisRule[] = [
      {
        id: "rule_second_serve_alias_probe",
        keywords: ["second_serve"],
        category: ["serve"],
        problemTag: "second-serve-reliability",
        causes: ["probe"],
        fixes: ["probe"],
        recommendedContentIds: [],
        drills: [],
        searchQueries: { bilibili: [], youtube: [] }
      }
    ];

    const result = findBestDiagnosisRule("关键分二发总双误", rules);

    expect(result.rule?.id).toBe("rule_second_serve_alias_probe");
    expect(result.score).toBeGreaterThan(0);
  });

  it("extracts internal slot signals for stroke, outcome, context, and condition cues", () => {
    const pressureForehand = extractDiagnosisSignalBundle("关键分正手老飞");
    const mobility = extractDiagnosisSignalBundle("年纪大了跑不太动");

    expect(pressureForehand.internalSignals).toEqual(expect.arrayContaining([
      "slot_stroke_forehand",
      "slot_outcome_out",
      "slot_context_pressure"
    ]));
    expect(mobility.internalSignals).toEqual(expect.arrayContaining([
      "slot_condition_mobility_limit"
    ]));
  });

  it("routes first-serve complaints to the curated first-serve tag", () => {
    const result = findBestDiagnosisRule("一发总发不进");

    expect(result.rule?.problemTag).toBe("first-serve-in");
  });

  it("uses the renamed canonical tags for second-serve, toss, and slice families", () => {
    expect(findBestDiagnosisRule("关键分二发总双误").rule?.problemTag).toBe("second-serve-reliability");
    expect(findBestDiagnosisRule("My serve toss is all over the place").rule?.problemTag).toBe("serve-toss-consistency");
    expect(findBestDiagnosisRule("反手切削总浮").rule?.problemTag).toBe("backhand-slice-floating");
    expect(findBestDiagnosisRule("对方切过来就失误").rule?.problemTag).toBe("incoming-slice-trouble");
  });

  it("keeps self-slice complaints out of the incoming-slice lane", () => {
    const selfSlice = extractDiagnosisSignalBundle("反手切削总浮");
    const incomingSlice = extractDiagnosisSignalBundle("对方切过来就失误");

    expect(selfSlice.internalSignals).toEqual(expect.arrayContaining([
      "slot_stroke_backhand",
      "slot_outcome_float"
    ]));
    expect(selfSlice.internalSignals).not.toContain("slot_context_incoming_slice");
    expect(findBestDiagnosisRule("slice floats").rule?.problemTag).toBe("backhand-slice-floating");
    expect(findBestDiagnosisRule("my backhand slice sits up").rule?.problemTag).toBe("backhand-slice-floating");
    expect(findBestDiagnosisRule("反手切削总浮").rule?.problemTag).toBe("backhand-slice-floating");
    expect(incomingSlice.internalSignals).toContain("slot_context_incoming_slice");
    expect(findBestDiagnosisRule("对方切过来就失误").rule?.problemTag).toBe("incoming-slice-trouble");
  });

  it("routes explicit movement-limit phrasing to mobility-limit", () => {
    const result = findBestDiagnosisRule("年纪大了跑不太动");

    expect(result.rule?.problemTag).toBe("mobility-limit");
    expect(result.rule?.problemTag).not.toBe("movement-slow");
  });

  it("recognizes more colloquial movement-slow and overhead-timing phrasing", () => {
    expect(findBestDiagnosisRule("脚步老慢一拍").rule?.problemTag).toBe("movement-slow");
    expect(findBestDiagnosisRule("高压球对不准球").rule?.problemTag).toBe("overhead-timing");
    expect(findBestDiagnosisRule("高压老打框").rule?.problemTag).toBe("overhead-timing");
    expect(findBestDiagnosisRule("高压球下来总找不准点").rule?.problemTag).toBe("overhead-timing");
  });

  it("recognizes more colloquial serve-toss phrasing", () => {
    expect(findBestDiagnosisRule("发球老是扔不准球").rule?.problemTag).toBe("serve-toss-consistency");
  });

  it("recognizes more colloquial forehand-power phrasing", () => {
    expect(findBestDiagnosisRule("正手怎么抡都不走球").rule?.problemTag).toBe("forehand-no-power");
  });

  it("recognizes more colloquial return-pressure phrasing", () => {
    expect(findBestDiagnosisRule("接发一上来就被顶回去").rule?.problemTag).toBe("return-under-pressure");
  });

  it("prefers stroke-plus-outcome over pressure fallback when a stronger technical signal exists", () => {
    const result = findBestDiagnosisRule("关键分正手老飞");

    expect(result.rule?.problemTag).toBe("forehand-out");
    expect(result.rule?.problemTag).not.toBe("pressure-tightness");
  });

  it("keeps pressure-tightness as the mental fallback when no stronger stroke signal exists", () => {
    const result = findBestDiagnosisRule("比赛一紧张就手紧");

    expect(result.rule?.problemTag).toBe("pressure-tightness");
  });

  it("does not let bare match context collapse technical complaints into mental fallback tags", () => {
    expect(["movement-slow", "late-contact"]).toContain(findBestDiagnosisRule("比赛总慢半拍").rule?.problemTag);
    expect(findBestDiagnosisRule("比赛来不及准备").rule?.problemTag).toBe("late-contact");
    expect(findBestDiagnosisRule("比赛接发总被压制").rule?.problemTag).toBe("return-under-pressure");
    expect(findBestDiagnosisRule("比赛里切球总飘起来").rule?.problemTag).toBe("backhand-slice-floating");
    expect(findBestDiagnosisRule("比赛一紧张就手紧").rule?.problemTag).toBe("pressure-tightness");
  });

  it("extracts plateau and self-practice phrasing as support signals instead of a winning diagnosis", () => {
    const bundle = extractDiagnosisSignalBundle("练了很久没进步，不知道自己该练什么");
    const result = findBestDiagnosisRule("练了很久没进步，不知道自己该练什么");

    expect(bundle.supportSignals).toEqual(expect.arrayContaining(["plateau_no_progress", "cant_self_practice"]));
    expect(result.rule).toBeNull();
  });

  it("routes support-only inputs through a narrowing gate before any recommendation", () => {
    const result = diagnoseProblem("练了很久没进步，不知道自己该练什么");

    expect(result.matchedRuleId).toBeNull();
    expect(result.problemTag).toBe("general-improvement");
    expect(result.fallbackUsed).toBe(true);
    expect(result.evidenceLevel).toBe("low");
    expect(result.needsNarrowing).toBe(true);
    expect(result.narrowingPrompts.length).toBeGreaterThan(0);
    expect(result.narrowingSuggestions.length).toBeGreaterThan(0);
    expect(result.narrowingSuggestions[0]?.severity).toBe("high");
    expect(result.narrowingSuggestions[0]?.reason.length).toBeGreaterThan(0);
    expect(result.primaryNextStep).toBe(result.narrowingSuggestions[0]?.nextAction);
    expect(result.narrowingPrompts).toEqual(result.narrowingSuggestions.slice(0, 2).map((item) => item.nextAction));
    expect(result.missingEvidenceSlots).toEqual(expect.arrayContaining(["stroke", "outcome", "context"]));
    expect(result.refusalReasonCodes).toEqual(expect.arrayContaining(["missing_stroke", "missing_outcome", "missing_context", "low_match_score"]));
    expect(result.title).not.toBe("先给你一组通用提升方向");
    expect(result.recommendedContents).toHaveLength(0);
  });

  it("does not let support phrasing beat a stronger stroke diagnosis", () => {
    const bundle = extractDiagnosisSignalBundle("练了很久没进步，不知道自己该练什么，但反手总下网");
    const result = findBestDiagnosisRule("练了很久没进步，不知道自己该练什么，但反手总下网");

    expect(bundle.supportSignals).toEqual(expect.arrayContaining(["plateau_no_progress", "cant_self_practice"]));
    expect(result.rule?.problemTag).toBe("backhand-into-net");
  });

  it("keeps moonball discomfort in the technical diagnosis lane", () => {
    const bundle = extractDiagnosisSignalBundle("月亮球一来我反手就很别扭");
    const result = findBestDiagnosisRule("月亮球一来我反手就很别扭");

    expect(bundle.aliases).toContain("moonball");
    expect(result.rule?.problemTag).toBe("moonball-trouble");
  });

  it("keeps a stroke-outcome diagnosis primary when pressure and trigger signals coexist", () => {
    const result = findBestDiagnosisRule("正手在关键分的时候，如果对手在网前，我容易紧张，一发力就出界");

    expect(result.rule?.problemTag).toBe("forehand-out");
  });

  it("keeps pressure fallback out of the winner slot when a stronger layered primary exists", () => {
    const result = findBestDiagnosisRule("关键分正手老飞，对手一上网我就慌");

    expect(result.rule?.problemTag).toBe("forehand-out");
    expect(result.rule?.problemTag).not.toBe("pressure-tightness");
  });

  it("still lets the mental fallback win when no technical primary candidate exists", () => {
    const result = findBestDiagnosisRule("比赛一紧张就手紧");

    expect(result.rule?.problemTag).toBe("pressure-tightness");
  });

  it("filters diagnosis rules by environment before selecting the winning rule", () => {
    const productionRule: DiagnosisRule = {
      id: "rule_environment_production",
      keywords: ["testprobe"],
      category: ["serve"],
      problemTag: "first-serve-in",
      causes: ["prod"],
      fixes: ["prod"],
      recommendedContentIds: [],
      drills: [],
      environment: "production",
      searchQueries: { bilibili: [], youtube: [] }
    };
    const testingRule: DiagnosisRule = {
      id: "rule_environment_testing",
      keywords: ["testprobe"],
      category: ["serve"],
      problemTag: "second-serve-reliability",
      causes: ["test"],
      fixes: ["test"],
      recommendedContentIds: [],
      drills: [],
      environment: "testing",
      searchQueries: { bilibili: [], youtube: [] }
    };
    const result = diagnoseProblem("testprobe", {
      rules: [productionRule, testingRule],
      contentPool: [],
      environment: "testing"
    });

    expect(result.problemTag).toBe("second-serve-reliability");
    expect(result.matchedRuleId).toBe("rule_environment_testing");
  });

  it("renders a more scene-aware title, summary, and first fix for mixed pressure forehand input", () => {
    const result = diagnoseProblem("正手在关键分的时候，如果对手在网前，我容易紧张，一发力就出界");

    expect(result.problemTag).toBe("forehand-out");
    expect(result.title).toContain("关键分");
    expect(result.summary).toContain("关键分");
    expect(result.summary).toContain("网前");
    expect(result.fixes[0]).toContain("网前");
    expect(result.fixes[0]).toContain("不要先追求");
  });

  it("keeps clean inputs readable without forcing scene-aware phrasing", () => {
    const result = diagnoseProblem("反手总下网");

    expect(result.problemTag).toBe("backhand-into-net");
    expect(result.needsNarrowing).toBe(false);
    expect(result.narrowingSuggestions).toEqual([]);
    expect(result.title).toBe("反手稳定性不足");
    expect(result.summary).not.toContain("关键分");
    expect(result.fixes[0]).toBe("更早转肩，提前准备");
    expect(result.primaryNextStep).toBe(result.fixes[0]);
  });

  it("renders a pressure-aware second-serve diagnosis when the score matters", () => {
    const result = diagnoseProblem("关键分二发总双误");

    expect(result.problemTag).toBe("second-serve-reliability");
    expect(result.title).toContain("关键分");
    expect(result.summary).toContain("关键分");
    expect(result.fixes[0]).toContain("二发");
    expect(result.fixes[0]).toContain("先求进区");
  });

  it("renders an age-aware mobility diagnosis without changing the primary tag", () => {
    const result = diagnoseProblem("年纪大了跑不太动，左右追球跟不上");

    expect(result.problemTag).toBe("mobility-limit");
    expect(result.title).toContain("移动");
    expect(result.summary).toContain("年纪");
    expect(result.summary).toContain("左右追球");
    expect(result.fixes[0]).toContain("缩小");
  });

  it("renders a moonball-specific explanation when high looping balls disrupt timing", () => {
    const result = diagnoseProblem("月亮球一来我反手就很别扭");

    expect(result.problemTag).toBe("moonball-trouble");
    expect(result.title).toContain("月亮球");
    expect(result.summary).toContain("月亮球");
    expect(result.fixes[0]).toContain("落点");
  });

  it("enriches forehand pressure scenes with scenario-specific causes, drills, and support content", () => {
    const result = diagnoseProblem("正手在关键分的时候，如果对手在网前，我容易紧张，一发力就出界");

    expect(result.problemTag).toBe("forehand-out");
    expect(result.causes[0]).toContain("别失误");
    expect(result.drills[0]).toContain("关键分+对手上网模拟");
    expect(result.recommendedContents[0]?.id).toBe("content_cn_d_01");
    expect(result.recommendedContents.map((item) => item.id)).toEqual(expect.arrayContaining(["content_rb_03"]));
  });

  it("adds pressure-routine support for second-serve complaints on key points", () => {
    const result = diagnoseProblem("关键分二发总双误");

    expect(result.problemTag).toBe("second-serve-reliability");
    expect(result.causes[0]).toContain("关键分怕双误");
    expect(result.drills[0]).toContain("关键分二发 12 组");
    expect(result.recommendedContents.length).toBeGreaterThan(0);
    expect(result.recommendedContents.every((item) => !item.url.includes("search.bilibili.com/all?keyword="))).toBe(true);
  });

  it("keeps medium/high-evidence recommendations on direct sources only", () => {
    const result = diagnoseProblem("关键分二发总双误");

    expect(result.evidenceLevel).not.toBe("low");
    expect(result.recommendedContents.length).toBeGreaterThan(0);
    expect(result.recommendedContents.every((item) => !item.url.includes("search.bilibili.com/all?keyword="))).toBe(true);
    expect(result.recommendedContents.every((item) => !item.url.includes("youtube.com/results?search_query="))).toBe(true);
  });

  it("keeps problemTag stable across effort modes while changing explanation depth", () => {
    const quick = diagnoseProblem("关键分二发总双误", { effortMode: "quick" });
    const standard = diagnoseProblem("关键分二发总双误", { effortMode: "standard" });
    const deep = diagnoseProblem("关键分二发总双误", { effortMode: "deep" });

    expect(quick.problemTag).toBe(standard.problemTag);
    expect(standard.problemTag).toBe(deep.problemTag);
    expect(quick.effortMode).toBe("quick");
    expect(standard.effortMode).toBe("standard");
    expect(deep.effortMode).toBe("deep");
    expect(quick.causes.length).toBe(1);
    expect(quick.fixes.length).toBe(1);
    expect(standard.causes.length).toBeGreaterThanOrEqual(2);
    expect(deep.causes.length).toBeGreaterThanOrEqual(standard.causes.length);
    expect(quick.primaryNextStep).toBe(standard.primaryNextStep);
    expect(standard.primaryNextStep).toBe(deep.primaryNextStep);
  });

  it("keeps narrowing primary step stable across effort modes under low evidence", () => {
    const input = "练了很久没进步，不知道自己该练什么";
    const quick = diagnoseProblem(input, { effortMode: "quick" });
    const standard = diagnoseProblem(input, { effortMode: "standard" });
    const deep = diagnoseProblem(input, { effortMode: "deep" });

    expect(quick.needsNarrowing).toBe(true);
    expect(standard.needsNarrowing).toBe(true);
    expect(deep.needsNarrowing).toBe(true);
    expect(quick.primaryNextStep).toBe(standard.primaryNextStep);
    expect(standard.primaryNextStep).toBe(deep.primaryNextStep);
    expect(quick.refusalReasonCodes).toEqual(expect.arrayContaining(["low_match_score"]));
    expect(deep.refusalReasonCodes).toEqual(expect.arrayContaining(["low_match_score"]));
  });

  it("keeps deep mode conservative when evidence is low", () => {
    const result = diagnoseProblem("我最近总打不好", { effortMode: "deep" });

    expect(result.effortMode).toBe("deep");
    expect(result.evidenceLevel).toBe("low");
    expect(result.needsNarrowing).toBe(true);
    expect(result.confidence).toBe("较低");
    expect(result.title).toBe("先补一条关键线索，再锁定诊断");
    expect(result.summary).toContain("证据仍偏弱");
    expect(result.missingEvidenceSlots?.length).toBeGreaterThan(0);
    expect(result.refusalReasonCodes).toEqual(expect.arrayContaining(["low_match_score"]));
    expect(result.recommendedContents).toHaveLength(0);
  });

  it("keeps summary focused on action, while evidence wording moves to the evidence card", () => {
    const result = diagnoseProblem("关键分二发总双误", { effortMode: "standard" });

    expect(["medium", "high"]).toContain(result.evidenceLevel);
    expect(result.summary).not.toContain("当前证据较高");
    expect(result.summary).not.toContain("当前证据中等");
    expect(result.summary.length).toBeGreaterThan(0);
  });

  it("applies summary budget and moves long narrative into detailedSummary", () => {
    const longRule: DiagnosisRule = {
      id: "rule_summary_budget_probe",
      keywords: ["alpha", "beta", "gamma"],
      synonyms: [],
      category: ["basics"],
      problemTag: "late-contact",
      causes: ["这个原因描述故意写得很长，用于验证默认层文案预算是否生效并触发摘要折叠机制"],
      fixes: ["把准备动作提前半拍并把击球点稳定在身体前侧，再逐步加速而不是一次发力到顶"],
      recommendedContentIds: ["content_summary_budget_probe_01"],
      drills: ["test drill"],
      searchQueries: { bilibili: [], youtube: [] }
    };

    const directContent: ContentItem = {
      id: "content_summary_budget_probe_01",
      title: "Summary budget probe",
      creatorId: "creator_furao",
      platform: "Bilibili",
      type: "video",
      levels: ["3.0"],
      skills: ["basics"],
      problemTags: ["late-contact"],
      language: "zh",
      summary: "",
      reason: "",
      useCases: [],
      coachReason: "",
      url: "https://www.bilibili.com/video/BV1SummaryBudgetProbe"
    };

    const result = diagnoseProblem("alpha beta gamma", {
      rules: [longRule],
      contentPool: [directContent],
      effortMode: "standard"
    });

    expect(result.summary).toContain("先做主动作：");
    expect(result.detailedSummary).toBeTruthy();
    expect(result.detailedSummary).toContain("文案预算");
    expect(Array.from(result.summary).length).toBeLessThanOrEqual(86);
  });

  it("uses a high-confidence actionable tone when evidence is strong", () => {
    const highConfidenceRule: DiagnosisRule = {
      id: "rule_high_confidence_probe",
      keywords: ["alpha", "beta", "gamma"],
      synonyms: [],
      category: ["basics"],
      problemTag: "late-contact",
      causes: ["test cause"],
      fixes: ["test fix"],
      recommendedContentIds: ["content_high_confidence_probe_01"],
      drills: ["test drill"],
      searchQueries: { bilibili: [], youtube: [] }
    };

    const highConfidenceContent: ContentItem = {
      id: "content_high_confidence_probe_01",
      title: "High-confidence probe",
      creatorId: "creator_furao",
      platform: "Bilibili",
      type: "video",
      levels: ["3.0"],
      skills: ["basics"],
      problemTags: ["late-contact"],
      language: "zh",
      summary: "",
      reason: "",
      useCases: [],
      coachReason: "",
      url: "https://www.bilibili.com/video/BV1HighConfidenceProbe"
    };

    const result = diagnoseProblem("alpha beta gamma", {
      rules: [highConfidenceRule],
      contentPool: [highConfidenceContent],
      effortMode: "standard"
    });

    expect(result.evidenceLevel).toBe("high");
    expect(result.confidence).toBe("较高");
    expect(result.summary).not.toContain("当前证据较高");
    expect(result.needsNarrowing).toBe(false);
  });

  it("keeps moonball analysis tied to spacing decisions and adds a defensive support resource", () => {
    const result = diagnoseProblem("月亮球一来我反手就很别扭");

    expect(result.problemTag).toBe("moonball-trouble");
    expect(result.causes[0]).toContain("站位选择");
    expect(result.drills[0]).toContain("上升期或下降期");
    expect(result.recommendedContents.map((item) => item.id)).toEqual(
      expect.arrayContaining(["content_fr_02"])
    );
    expect(result.recommendedContents.every((item) => !item.url.includes("search.bilibili.com/all?keyword="))).toBe(true);
  });

  it("returns no recommendations when only search-link entries are available", () => {
    const rule: DiagnosisRule = {
      id: "rule_search_only_reco",
      keywords: ["searchonly"],
      synonyms: [],
      category: ["mental"],
      problemTag: "pressure-tightness",
      causes: ["test cause"],
      fixes: ["test fix"],
      recommendedContentIds: ["content_search_only_01"],
      drills: ["test drill"],
      searchQueries: { bilibili: [], youtube: [] }
    };

    const searchOnlyContent: ContentItem = {
      id: "content_search_only_01",
      title: "Search-only placeholder",
      creatorId: "creator_search_curated",
      platform: "Bilibili",
      type: "video",
      levels: ["3.0"],
      skills: ["mental"],
      problemTags: ["pressure-tightness"],
      language: "zh",
      summary: "",
      reason: "",
      useCases: [],
      coachReason: "",
      url: "https://search.bilibili.com/all?keyword=test"
    };

    const result = diagnoseProblem("searchonly", {
      rules: [rule],
      contentPool: [searchOnlyContent]
    });

    expect(result.problemTag).toBe("general-improvement");
    expect(result.recommendedContents).toEqual([]);
    expect(result.fallbackUsed).toBe(true);
  });

  it("treats legacy slice tags as canonical equivalents when ranking recommendations", () => {
    const rule: DiagnosisRule = {
      id: "rule_slice_canonicalization_probe",
      keywords: ["slice"],
      synonyms: [],
      category: ["mental"],
      problemTag: "backhand-slice-floating",
      causes: ["test cause"],
      fixes: ["test fix"],
      recommendedContentIds: [],
      drills: ["test drill"],
      searchQueries: { bilibili: [], youtube: [] }
    };

    const legacyTaggedDirectContent: ContentItem = {
      id: "content_legacy_slice_only_01",
      title: "Legacy slice tag resource",
      creatorId: "creator_furao",
      platform: "Bilibili",
      type: "video",
      levels: ["3.0"],
      skills: ["mental"],
      problemTags: ["slice-too-high"],
      language: "zh",
      summary: "",
      reason: "",
      useCases: [],
      coachReason: "",
      url: "https://www.bilibili.com/video/BV1legacySliceProbe"
    };

    const result = diagnoseProblem("slice", {
      rules: [rule],
      contentPool: [legacyTaggedDirectContent]
    });

    expect(result.problemTag).toBe("backhand-slice-floating");
    expect(result.recommendedContents.map((item) => item.id)).toContain("content_legacy_slice_only_01");
  });

  it("understands English break-point plus poaching phrasing as a key-point forehand pressure scene", () => {
    const bundle = extractDiagnosisSignalBundle("At break point my forehand goes long when they poach at net");
    const result = diagnoseProblem("At break point my forehand goes long when they poach at net", { locale: "en" });

    expect(bundle.aliases).toContain("key_point");
    expect(bundle.modifiers).toContain("tight");
    expect(bundle.layeredSignals.triggers).toContain("opponent_at_net");
    expect(result.problemTag).toBe("forehand-out");
    expect(result.summary).toContain("opponent is at net");
  });

  it("maps scoreline pressure phrasing to second-serve pressure-aware output", () => {
    const result = diagnoseProblem("At 30-40 my second serve keeps double faulting", { locale: "en" });

    expect(result.problemTag).toBe("second-serve-reliability");
    expect(result.title).toContain("key points");
    expect(result.fixes[0]).toContain("key points");
  });

  it("supports shorthand score pressure and compact doublefault spelling", () => {
    const bundle = extractDiagnosisSignalBundle("At BP my second serve doublefaults");
    const result = diagnoseProblem("At BP my second serve doublefaults", { locale: "en" });

    expect(bundle.aliases).toContain("key_point");
    expect(bundle.internalSignals).toEqual(expect.arrayContaining([
      "slot_stroke_serve",
      "slot_outcome_double_fault",
      "slot_context_pressure"
    ]));
    expect(result.problemTag).toBe("second-serve-reliability");
    expect(result.title).toContain("key points");
  });

  it("normalizes common English score and double-fault misspellings", () => {
    const bundle = extractDiagnosisSignalBundle("At duece my second serve doublefualts");
    const result = diagnoseProblem("At duece my second serve doublefualts", { locale: "en" });

    expect(bundle.aliases).toContain("key_point");
    expect(bundle.internalSignals).toEqual(expect.arrayContaining([
      "slot_stroke_serve",
      "slot_outcome_double_fault",
      "slot_context_pressure"
    ]));
    expect(result.problemTag).toBe("second-serve-reliability");
  });

  it("normalizes tiebrake typo and keeps pressure-lane parsing", () => {
    const bundle = extractDiagnosisSignalBundle("In tiebrake I tense up and my second serve doublefualting starts");

    expect(bundle.aliases).toContain("key_point");
    expect(bundle.modifiers).toContain("tight");
    expect(bundle.internalSignals).toContain("slot_context_pressure");
  });

  it.each([
    {
      input: "At duese my second seve doublefaults",
      expectedTag: "second-serve-reliability",
      expectedSignals: ["slot_stroke_serve", "slot_outcome_double_fault", "slot_context_pressure"],
      expectKeyPoint: true
    },
    {
      input: "At brek point my secnd serve doublefaulting starts",
      expectedTag: "second-serve-reliability",
      expectedSignals: ["slot_stroke_serve", "slot_outcome_double_fault", "slot_context_pressure"],
      expectKeyPoint: true
    },
    {
      input: "At brekpoint my second serve doulbe faults",
      expectedTag: "second-serve-reliability",
      expectedSignals: ["slot_stroke_serve", "slot_outcome_double_fault", "slot_context_pressure"],
      expectKeyPoint: true
    },
    {
      input: "At gamepiont my seond serve doublefauts",
      expectedTag: "second-serve-reliability",
      expectedSignals: ["slot_stroke_serve", "slot_outcome_double_fault", "slot_context_pressure"],
      expectKeyPoint: true
    },
    {
      input: "At matchpiont my second serve doble faults",
      expectedTag: "second-serve-reliability",
      expectedSignals: ["slot_stroke_serve", "slot_outcome_double_fault", "slot_context_pressure"],
      expectKeyPoint: true
    },
    {
      input: "Under pressue they are poching at net and my forehnad goes long",
      expectedTag: "forehand-out",
      expectedSignals: ["slot_stroke_forehand", "slot_outcome_out", "slot_context_pressure"],
      expectKeyPoint: false
    },
    {
      input: "In tiebrkae my forehnad goes long",
      expectedTag: "forehand-out",
      expectedSignals: ["slot_stroke_forehand", "slot_outcome_out", "slot_context_pressure"],
      expectKeyPoint: true
    },
    {
      input: "At breakpiont I get nervious and my forehnad goes long",
      expectedTag: "forehand-out",
      expectedSignals: ["slot_stroke_forehand", "slot_outcome_out", "slot_context_pressure"],
      expectKeyPoint: true
    }
  ])("normalizes typo-heavy input: $input", ({ input, expectedTag, expectedSignals, expectKeyPoint }) => {
    const bundle = extractDiagnosisSignalBundle(input);
    const result = diagnoseProblem(input, { locale: "en" });

    if (expectKeyPoint) {
      expect(bundle.aliases).toContain("key_point");
    }
    expect(bundle.internalSignals).toEqual(expect.arrayContaining(expectedSignals));
    expect(result.problemTag).toBe(expectedTag);
  });

  it("pulls in net-pressure support content when forehand errors happen against poaching", () => {
    const result = diagnoseProblem("My forehand goes long in doubles when they poach at net", { locale: "en" });

    expect(result.problemTag).toBe("forehand-out");
    expect(result.recommendedContents.map((item) => item.id).some((id) => ["content_rb_03", "content_rb_01"].includes(id))).toBe(true);
  });

  it("pulls in movement-support content when backhand net errors happen while moving wide", () => {
    const result = diagnoseProblem("My backhand goes into the net when I move wide", { locale: "en" });

    expect(result.problemTag).toBe("backhand-into-net");
    expect(result.recommendedContents.map((item) => item.id)).toEqual(
      expect.arrayContaining(["content_fr_02"])
    );
  });

  it("keeps mixed pressure-net recommendation lists diversified by creator", () => {
    const result = diagnoseProblem("关键分正手老飞，对手一上网我就慌");
    const creatorCount = new Set(result.recommendedContents.map((item) => item.creatorId)).size;

    expect(result.problemTag).toBe("forehand-out");
    expect(creatorCount).toBeGreaterThanOrEqual(Math.min(2, result.recommendedContents.length));
  });

  it("prefers direct pressure-support resources for key-point second-serve failures", () => {
    const result = diagnoseProblem("关键分二发总双误");
    const ids = result.recommendedContents.map((item) => item.id);

    expect(result.problemTag).toBe("second-serve-reliability");
    expect(ids).toEqual(expect.arrayContaining(["content_rb_03"]));
    expect(ids).not.toContain("content_cn_f_01");
  });
});
