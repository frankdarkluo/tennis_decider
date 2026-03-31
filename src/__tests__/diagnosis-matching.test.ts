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

  it("routes support-only inputs through a support-aware fallback without changing the public result shape", () => {
    const result = diagnoseProblem("练了很久没进步，不知道自己该练什么");

    expect(result.matchedRuleId).toBeNull();
    expect(result.problemTag).toBe("general-improvement");
    expect(result.fallbackUsed).toBe(true);
    expect(result.title).not.toBe("先给你一组通用提升方向");
    expect(result.recommendedContents.some((item) => item.problemTags.includes("cant-self-practice"))).toBe(true);
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
    expect(result.title).toBe("反手稳定性不足");
    expect(result.summary).not.toContain("关键分");
    expect(result.fixes[0]).toBe("更早转肩，提前准备");
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
