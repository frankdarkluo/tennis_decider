import type { DayPlan, DayPlanBlock, PlanBlueprintRole, PlanIntent, PlanIntensity, PlanTempo } from "@/types/plan";

type LocalizedCopy = {
  zh: string;
  en: string;
};

type FamilyCopy = {
  label: LocalizedCopy;
  drillNoun: LocalizedCopy;
  baselineCue: LocalizedCopy;
  transferCue: LocalizedCopy;
  mistakeCue: LocalizedCopy;
};

type BlueprintDaySpec = Omit<DayPlan, "contentIds" | "linkedContentReason"> & {
  contentIds: string[];
  linkedContentReason?: string | null;
};

const FAMILY_COPY: Record<PlanIntent["skillFamily"], FamilyCopy> = {
  serve: {
    label: { zh: "发球", en: "serve" },
    drillNoun: { zh: "发球重复", en: "serve reps" },
    baselineCue: { zh: "安全窗口和抛球节奏", en: "safe window and toss rhythm" },
    transferCue: { zh: "发球加一拍片段", en: "serve-plus-one pattern" },
    mistakeCue: { zh: "只顾发力，形状先散", en: "chasing pace before shape holds" }
  },
  return: {
    label: { zh: "接发", en: "return" },
    drillNoun: { zh: "接发启动", en: "return starts" },
    baselineCue: { zh: "先分腿，再稳住封挡线路", en: "split early and stabilize the first block" },
    transferCue: { zh: "接发后的第一拍处理", en: "return plus first-ball pattern" },
    mistakeCue: { zh: "一紧就只剩挡球，出手更晚", en: "tightness turns the return into a late block" }
  },
  forehand: {
    label: { zh: "正手", en: "forehand" },
    drillNoun: { zh: "正手主练", en: "forehand reps" },
    baselineCue: { zh: "击球点和挥拍链条", en: "contact point and swing chain" },
    transferCue: { zh: "移动中的正手片段", en: "moving-forehand pattern" },
    mistakeCue: { zh: "一急就抢拍或只剩手臂", en: "rushing turns it into an arm-only swing" }
  },
  backhand: {
    label: { zh: "反手", en: "backhand" },
    drillNoun: { zh: "反手主练", en: "backhand reps" },
    baselineCue: { zh: "更早准备和更前击球点", en: "earlier prep and a more forward contact point" },
    transferCue: { zh: "反手相持片段", en: "backhand rally pattern" },
    mistakeCue: { zh: "一着急就又缩在身后击球", en: "rushing pulls contact back behind the body" }
  },
  net: {
    label: { zh: "网前", en: "net play" },
    drillNoun: { zh: "截击主练", en: "volley reps" },
    baselineCue: { zh: "拍面稳定和上步节奏", en: "stable racket face and forward step timing" },
    transferCue: { zh: "上网封网片段", en: "approach-and-net pattern" },
    mistakeCue: { zh: "一着急就拍面散、球漂起来", en: "rushing opens the face and floats the ball" }
  },
  overhead: {
    label: { zh: "高压", en: "overhead" },
    drillNoun: { zh: "高压主练", en: "overhead reps" },
    baselineCue: { zh: "转身找球和触球点", en: "turn, find the ball, and own the contact point" },
    transferCue: { zh: "高球处理片段", en: "high-ball finishing pattern" },
    mistakeCue: { zh: "脚下乱了，触球点就丢", en: "footwork breaks down and the contact point disappears" }
  },
  movement: {
    label: { zh: "脚步", en: "movement" },
    drillNoun: { zh: "脚步主练", en: "movement reps" },
    baselineCue: { zh: "先到位，再出手", en: "arrive before you swing" },
    transferCue: { zh: "跑动后的还原片段", en: "recover-after-movement pattern" },
    mistakeCue: { zh: "脚没到位就先急着打", en: "swinging before the feet are set" }
  },
  mental: {
    label: { zh: "抗压", en: "pressure control" },
    drillNoun: { zh: "压力流程", en: "pressure routines" },
    baselineCue: { zh: "先把呼吸和流程固定住", en: "stabilize the breath and routine first" },
    transferCue: { zh: "关键分例行流程", en: "key-point routine" },
    mistakeCue: { zh: "一紧张就流程断掉", en: "tightness breaks the routine" }
  },
  tactics: {
    label: { zh: "战术", en: "tactics" },
    drillNoun: { zh: "战术片段", en: "tactical patterns" },
    baselineCue: { zh: "先看场景，再定选择", en: "read the scene before choosing the pattern" },
    transferCue: { zh: "比赛处理片段", en: "match-decision pattern" },
    mistakeCue: { zh: "太早抢选择，结构先散", en: "forcing the decision before the structure is stable" }
  },
  general: {
    label: { zh: "基础动作", en: "base pattern" },
    drillNoun: { zh: "基础重复", en: "base reps" },
    baselineCue: { zh: "先把稳定节奏做出来", en: "build a stable rhythm first" },
    transferCue: { zh: "基础得分片段", en: "basic point pattern" },
    mistakeCue: { zh: "练到后面又回到旧节奏", en: "sliding back into the old rhythm late in the session" }
  }
};

function copyFor(intent: PlanIntent, value: keyof FamilyCopy) {
  return FAMILY_COPY[intent.skillFamily][value][intent.locale];
}

function isEnglish(intent: PlanIntent) {
  return intent.locale === "en";
}

function getSpecificLabel(intent: PlanIntent): string | null {
  const labels: Record<string, LocalizedCopy> = {
    "second-serve-reliability": { zh: "二发", en: "second serve" },
    "serve-toss-consistency": { zh: "抛球", en: "serve toss" },
    "first-serve-in": { zh: "一发", en: "first serve" },
    "serve-timing": { zh: "发球时机", en: "serve timing" },
    "return-under-pressure": { zh: "接发", en: "return" },
    "forehand-no-power": { zh: "正手", en: "forehand" },
    "forehand-out": { zh: "正手", en: "forehand" },
    "balls-too-short": { zh: "正手", en: "forehand" },
    "backhand-into-net": { zh: "反手", en: "backhand" },
    "cant-hit-lob": { zh: "高压", en: "overhead" },
    "moonball-trouble": { zh: "高压", en: "overhead" },
    "backhand-slice-floating": { zh: "削球", en: "slice" },
    "incoming-slice-trouble": { zh: "削球", en: "incoming slice" },
    "volley-floating": { zh: "截击", en: "floating volley" },
    "volley-into-net": { zh: "截击", en: "volley" },
    "net-confidence": { zh: "网前", en: "net play" },
    "overhead-timing": { zh: "高压", en: "overhead" },
    "movement-slow": { zh: "脚步", en: "movement" },
    "stamina-drop": { zh: "脚步", en: "movement" },
    "late-contact": { zh: "提前准备", en: "early preparation" },
    "running-forehand": { zh: "跑动正手", en: "running forehand" },
    "running-backhand": { zh: "跑动反手", en: "running backhand" },
    "mobility-limit": { zh: "移动", en: "mobility" },
    "pressure-tightness": { zh: "抗压", en: "pressure control" },
    "match-anxiety": { zh: "比赛处理", en: "match calm" },
    "doubles-positioning": { zh: "双打站位", en: "doubles positioning" },
    "general-improvement": { zh: "通用", en: "general" },
    "rally-consistency": { zh: "基础动作", en: "base pattern" }
  };

  return labels[intent.primaryProblemTag]?.[intent.locale] ?? null;
}

function getTitleLabel(intent: PlanIntent): string {
  return getSpecificLabel(intent) ?? copyFor(intent, "label");
}

function buildTitle(intent: PlanIntent): string {
  if (intent.templateSeed && !getSpecificLabel(intent) && intent.primaryProblemTag !== "unknown-problem") {
    return isEnglish(intent) ? intent.templateSeed.titleEn : intent.templateSeed.title;
  }

  const label = getTitleLabel(intent);
  return isEnglish(intent)
    ? `7-Step ${label[0].toUpperCase()}${label.slice(1)} Blueprint Plan`
    : `${label}蓝图式 7 步训练计划`;
}

function buildTarget(intent: PlanIntent): string {
  if (intent.templateSeed && !getSpecificLabel(intent) && intent.primaryProblemTag !== "unknown-problem") {
    return isEnglish(intent) ? intent.templateSeed.targetEn : intent.templateSeed.target;
  }

  const baselineCue = copyFor(intent, "baselineCue");
  const contextSuffix = intent.playContext === "doubles_primary"
    ? isEnglish(intent) ? "inside doubles points" : "并带进双打片段"
    : intent.playContext === "singles_limited_mobility"
      ? isEnglish(intent) ? "with lower movement cost" : "同时控制脚步负担"
      : "";

  return isEnglish(intent)
    ? `Use a seven-step blueprint to stabilize ${baselineCue}${contextSuffix ? ` ${contextSuffix}` : ""}.`
    : `用一套 7 步蓝图把${baselineCue}先练稳${contextSuffix ? `，${contextSuffix}` : ""}。`;
}

function buildSummary(intent: PlanIntent): string {
  const primary = intent.primaryWeakness;
  const secondary = intent.secondaryWeakness;
  const primaryText = primary
    ? (isEnglish(intent) ? `Primary weakness: ${primary}.` : `主短板：${primary}。`)
    : isEnglish(intent) ? "Start from the clearest current leak." : "先从当前最明显的漏点开始。";
  const secondaryText = secondary
    ? isEnglish(intent)
      ? `Keep ${secondary} in the plan as a secondary constraint.`
      : `同时把${secondary}作为次级约束带进计划。`
    : isEnglish(intent)
      ? "Keep the plan focused on one main training lane."
      : "这份计划会保持单主线推进。";

  return `${primaryText} ${secondaryText}`.trim();
}

function cloneBlock(block: DayPlanBlock | undefined, fallbackTitle: string, fallbackItems: string[]): DayPlanBlock {
  const source = block ?? { title: fallbackTitle, items: fallbackItems };
  return {
    title: source.title,
    items: [...source.items]
  };
}

function localizeTemplateValue(intent: PlanIntent, zhValue: string | undefined, enValue: string | undefined, fallback: string): string {
  if (isEnglish(intent)) {
    return enValue ?? zhValue ?? fallback;
  }

  return zhValue ?? enValue ?? fallback;
}

function localizeTemplateBlock(
  intent: PlanIntent,
  zhBlock: DayPlanBlock | undefined,
  enBlock: DayPlanBlock | undefined,
  fallbackTitle: string,
  fallbackItems: string[]
): DayPlanBlock {
  const block = isEnglish(intent) ? enBlock ?? zhBlock : zhBlock ?? enBlock;
  return cloneBlock(block, fallbackTitle, fallbackItems);
}

function buildLoad(intent: PlanIntent, role: PlanBlueprintRole): string {
  const lowMap: Record<PlanBlueprintRole, string> = {
    stabilize: isEnglish(intent) ? "3 sets x 6 reps" : "3 组 x 6 次",
    repeatable_mechanics: isEnglish(intent) ? "3 sets x 8 reps" : "3 组 x 8 次",
    controlled_variability: isEnglish(intent) ? "4 sets x 6 reps" : "4 组 x 6 次",
    review_reset: isEnglish(intent) ? "2 review blocks" : "2 组复盘块",
    pressure_repetition: isEnglish(intent) ? "4 short pressure sets" : "4 组短压力片段",
    transfer: isEnglish(intent) ? "4 transfer sets" : "4 组转移片段",
    consolidation: isEnglish(intent) ? "2 scored blocks + 1 carry-forward note" : "2 组计分块 + 1 条延续规则"
  };
  const highMap: Record<PlanBlueprintRole, string> = {
    stabilize: isEnglish(intent) ? "4 sets x 8 reps" : "4 组 x 8 次",
    repeatable_mechanics: isEnglish(intent) ? "4 sets x 10 reps" : "4 组 x 10 次",
    controlled_variability: isEnglish(intent) ? "5 sets x 8 reps" : "5 组 x 8 次",
    review_reset: isEnglish(intent) ? "3 review blocks" : "3 组复盘块",
    pressure_repetition: isEnglish(intent) ? "5 pressure sets" : "5 组压力片段",
    transfer: isEnglish(intent) ? "5 transfer sets" : "5 组转移片段",
    consolidation: isEnglish(intent) ? "3 scored blocks + 1 next-step rule" : "3 组计分块 + 1 条下一步规则"
  };

  return intent.levelBand === "4.0" || intent.levelBand === "4.0+" ? highMap[role] : lowMap[role];
}

function buildDuration(intent: PlanIntent, role: PlanBlueprintRole): string {
  const isHigh = intent.levelBand === "4.0" || intent.levelBand === "4.0+";
  const english = {
    stabilize: isHigh ? "25 min" : "20 min",
    repeatable_mechanics: isHigh ? "30 min" : "22 min",
    controlled_variability: isHigh ? "30 min" : "25 min",
    review_reset: "15 min",
    pressure_repetition: isHigh ? "30 min" : "25 min",
    transfer: isHigh ? "30 min" : "25 min",
    consolidation: "18 min"
  };
  const chinese = {
    stabilize: isHigh ? "25 分钟" : "20 分钟",
    repeatable_mechanics: isHigh ? "30 分钟" : "22 分钟",
    controlled_variability: isHigh ? "30 分钟" : "25 分钟",
    review_reset: "15 分钟",
    pressure_repetition: isHigh ? "30 分钟" : "25 分钟",
    transfer: isHigh ? "30 分钟" : "25 分钟",
    consolidation: "18 分钟"
  };

  return isEnglish(intent) ? english[role] : chinese[role];
}

function buildExecutionFocus(intent: PlanIntent, role: PlanBlueprintRole): string {
  const baselineCue = copyFor(intent, "baselineCue");
  const styleCue = intent.playStyle === "net_pressure"
    ? isEnglish(intent) ? "Let the pattern finish forward instead of staying neutral." : "让动作最后能自然往前压，不要一直停在中性节奏。"
    : intent.playStyle === "defensive"
      ? isEnglish(intent) ? "Prefer margin and repeatability over early pace." : "优先保证安全裕度和可重复，不要太早抢速度。"
      : isEnglish(intent)
        ? "Keep the motion compact enough to repeat under live-ball conditions."
        : "把动作收在可重复的范围内，能带进真实来球。";

  if (role === "review_reset") {
    return isEnglish(intent)
      ? `Review which cue makes ${baselineCue} easiest to repeat.`
      : `复盘时先确认，哪条提示最能让${baselineCue}稳定重复。`;
  }

  return isEnglish(intent)
    ? `${styleCue} Keep the session anchored to ${baselineCue}.`
    : `${styleCue} 整堂训练都围绕${baselineCue}来执行。`;
}

function buildIntensity(role: PlanBlueprintRole): PlanIntensity {
  if (role === "pressure_repetition" || role === "transfer") return "medium_high";
  if (role === "controlled_variability") return "medium";
  return "low";
}

function buildTempo(role: PlanBlueprintRole): PlanTempo {
  if (role === "pressure_repetition" || role === "transfer" || role === "consolidation") return "match_70";
  if (role === "repeatable_mechanics" || role === "controlled_variability") return "controlled";
  return "slow";
}

function buildGoal(intent: PlanIntent, role: PlanBlueprintRole): string {
  const label = copyFor(intent, "label");
  const secondary = intent.secondaryWeakness;
  const primaryNextStep = intent.primaryNextStep;

  if (role === "stabilize" && primaryNextStep) {
    return primaryNextStep;
  }

  if (isEnglish(intent)) {
    if (role === "review_reset") {
      return secondary
        ? `Review the ${label} pattern and make sure the secondary weakness (${secondary}) does not quietly break it.`
        : `Review the ${label} pattern and keep only the cue that still works under low pressure.`;
    }
    if (role === "transfer") {
      return intent.playContext === "doubles_primary"
        ? `Transfer the ${label} blueprint into a doubles point fragment instead of a neutral feed.`
        : `Transfer the ${label} blueprint into a live-ball point fragment.`;
    }
    if (role === "consolidation") {
      return secondary
        ? `Consolidate the ${label} lane and define one carry-forward rule that also protects ${secondary}.`
        : `Consolidate the ${label} lane and define one carry-forward rule for the next block.`;
    }

    return {
      stabilize: `Build a stable ${label} baseline before adding pressure.`,
      repeatable_mechanics: `Repeat the ${label} pattern enough times that the shape becomes predictable.`,
      controlled_variability: `Keep the ${label} pattern stable while one variable changes slightly.`,
      pressure_repetition: `Hold the ${label} blueprint together once pressure is layered back in.`
    }[role];
  }

  if (role === "review_reset") {
    return secondary
      ? `复盘这条${label}主线，同时确认${secondary}不会偷偷把动作拉回旧问题。`
      : `复盘这条${label}主线，只保留最能稳住动作的一条提示。`;
  }
  if (role === "transfer") {
    return intent.playContext === "doubles_primary"
      ? `把这条${label}蓝图带进双打片段，而不是只在中性喂球里成立。`
      : `把这条${label}蓝图带进真实来球片段，而不是只在静态重复里成立。`;
  }
  if (role === "consolidation") {
    return secondary
      ? `巩固这条${label}主线，同时写下一条也能保护${secondary}的延续规则。`
      : `巩固这条${label}主线，并写下一条下轮训练继续沿用的规则。`;
  }

  return {
    stabilize: `先把${label}的基线动作做稳，再往后加要求。`,
    repeatable_mechanics: `把${label}动作重复到足够稳定，不要每一组都换做法。`,
    controlled_variability: `在只改变一个变量时，仍然维持住${label}主线。`,
    pressure_repetition: `把压力重新叠回来后，${label}主线也不能散。`
  }[role];
}

function buildDrill(intent: PlanIntent, role: PlanBlueprintRole): string {
  const drillNoun = copyFor(intent, "drillNoun");
  const transferCue = copyFor(intent, "transferCue");

  if (isEnglish(intent)) {
    return {
      stabilize: `Shadow + fed ${drillNoun} with one fixed cue.`,
      repeatable_mechanics: `${drillNoun} under one repeatable target and start shape.`,
      controlled_variability: `${drillNoun} with one variable shifted but the same finish.`,
      review_reset: `Review 2 clips, then replay the cleanest ${drillNoun} at low speed.`,
      pressure_repetition: `${drillNoun} starting from a score or consequence condition.`,
      transfer: `${transferCue} with one controlled decision after the first shot.`,
      consolidation: `Scored ${drillNoun} plus one carry-forward note.`
    }[role];
  }

  return {
    stabilize: `影子 + 喂球的${drillNoun}，只守住一条固定提示。`,
    repeatable_mechanics: `同一目标、同一起手条件下重复${drillNoun}。`,
    controlled_variability: `只改一个变量，但收拍和节奏不变的${drillNoun}。`,
    review_reset: `先回看 2 段，再用低速重打最稳的一组${drillNoun}。`,
    pressure_repetition: `带比分或惩罚条件的${drillNoun}。`,
    transfer: `把${transferCue}接进一拍真实选择的片段。`,
    consolidation: `计分${drillNoun} + 一条延续规则。`
  }[role];
}

function buildSuccessCriteria(intent: PlanIntent, role: PlanBlueprintRole): string[] {
  const baselineCue = copyFor(intent, "baselineCue");
  const secondary = intent.secondaryWeakness;

  if (isEnglish(intent)) {
    const secondaryLine = secondary ? `Secondary weakness ${secondary} does not take over the session.` : null;
    return [
      `The session still looks anchored to ${baselineCue}.`,
      ...(role === "transfer" ? ["The shape still holds once the drill feels closer to a point."] : []),
      ...(role === "pressure_repetition" ? ["Pressure changes the score, not the motion shape."] : []),
      ...(secondaryLine ? [secondaryLine] : [])
    ];
  }

  const secondaryLine = secondary ? `次级短板 ${secondary} 没有把整堂训练重新带偏。` : null;
  return [
    `整堂训练看起来仍然围绕${baselineCue}在推进。`,
    ...(role === "transfer" ? ["转到更像回合的片段里，动作主线也还在。"] : []),
    ...(role === "pressure_repetition" ? ["压力改变的是比分，不是动作形状。"] : []),
    ...(secondaryLine ? [secondaryLine] : [])
  ];
}

function buildSeededDay(intent: PlanIntent, role: PlanBlueprintRole, index: number): BlueprintDaySpec | null {
  const seedDay = intent.templateSeed?.days[index];
  if (!seedDay) {
    return null;
  }

  const defaultDrill = buildDrill(intent, role);
  const defaultLoad = buildLoad(intent, role);
  const defaultExecutionFocus = buildExecutionFocus(intent, role);
  const defaultGoal = buildGoal(intent, role);
  const focus = localizeTemplateValue(intent, seedDay.focus, seedDay.focusEn, defaultGoal);
  const drills = [...(isEnglish(intent) ? seedDay.drillsEn ?? seedDay.drills : seedDay.drills)];
  const duration = isEnglish(intent) ? seedDay.durationEn ?? seedDay.duration : seedDay.duration;
  const localizedGoal = localizeTemplateValue(intent, seedDay.goal, seedDay.goalEn, defaultGoal);

  return {
    day: index + 1,
    focus,
    contentIds: [...seedDay.contentIds],
    drills,
    drill: localizeTemplateValue(intent, seedDay.drill, seedDay.drillEn, drills[0] ?? defaultDrill),
    load: localizeTemplateValue(intent, seedDay.load, seedDay.loadEn, defaultLoad),
    executionFocus: localizeTemplateValue(intent, seedDay.executionFocus, seedDay.executionFocusEn, defaultExecutionFocus),
    duration,
    goal: localizedGoal,
    warmupBlock: localizeTemplateBlock(
      intent,
      seedDay.warmupBlock,
      seedDay.warmupBlockEn,
      isEnglish(intent) ? "Warm-up" : "热身",
      drills.slice(0, 1).length > 0 ? drills.slice(0, 1) : [focus]
    ),
    mainBlock: localizeTemplateBlock(
      intent,
      seedDay.mainBlock,
      seedDay.mainBlockEn,
      isEnglish(intent) ? "Main work" : "主练",
      drills
    ),
    pressureBlock: localizeTemplateBlock(
      intent,
      seedDay.pressureBlock,
      seedDay.pressureBlockEn,
      isEnglish(intent) ? "Pressure reps" : "带压力重复",
      [isEnglish(intent) ? `Execution focus: ${defaultExecutionFocus}` : `执行重点：${defaultExecutionFocus}`]
    ),
    successCriteria: [
      ...(isEnglish(intent) ? seedDay.successCriteriaEn ?? seedDay.successCriteria : seedDay.successCriteria ?? seedDay.successCriteriaEn) ?? buildSuccessCriteria(intent, role)
    ],
    failureCue: localizeTemplateValue(intent, seedDay.failureCue, seedDay.failureCueEn, copyFor(intent, "mistakeCue")),
    progressionNote: localizeTemplateValue(
      intent,
      seedDay.progressionNote,
      seedDay.progressionNoteEn,
      isEnglish(intent) ? `Carry ${focus.toLowerCase()} into the next step.` : `把${focus}带进下一步。`
    ),
    transferCue: localizeTemplateValue(intent, seedDay.transferCue, seedDay.transferCueEn, copyFor(intent, "transferCue")),
    intensity: seedDay.intensity ?? buildIntensity(role),
    tempo: seedDay.tempo ?? buildTempo(role),
    linkedContentReason: isEnglish(intent)
      ? seedDay.linkedContentReasonEn ?? seedDay.linkedContentReason ?? null
      : seedDay.linkedContentReason ?? seedDay.linkedContentReasonEn ?? null
  };
}

export function buildBlueprintDays(intent: PlanIntent): BlueprintDaySpec[] {
  return intent.microcycle.map((role, index) => {
    const seededDay = buildSeededDay(intent, role, index);
    if (seededDay) {
      return seededDay;
    }

    const day = index + 1;
    const drill = buildDrill(intent, role);
    const load = buildLoad(intent, role);
    const executionFocus = buildExecutionFocus(intent, role);
    const goal = buildGoal(intent, role);
    const warmupTitle = isEnglish(intent) ? "Warm-up" : "热身";
    const mainTitle = isEnglish(intent) ? "Main work" : "主练";
    const pressureTitle = isEnglish(intent) ? "Pressure reps" : "带压力重复";

    return {
      day,
      focus: goal,
      contentIds: [],
      drills: [drill],
      drill,
      load,
      executionFocus,
      duration: buildDuration(intent, role),
      goal,
      warmupBlock: {
        title: warmupTitle,
        items: [isEnglish(intent) ? `2 quick prep sets for ${copyFor(intent, "baselineCue")}.` : `先做 2 组${copyFor(intent, "baselineCue")}准备。`]
      },
      mainBlock: {
        title: mainTitle,
        items: [drill, isEnglish(intent) ? `Load: ${load}` : `负荷：${load}`]
      },
      pressureBlock: {
        title: pressureTitle,
        items: [isEnglish(intent) ? `Execution focus: ${executionFocus}` : `执行重点：${executionFocus}`]
      },
      successCriteria: buildSuccessCriteria(intent, role),
      failureCue: "",
      progressionNote: "",
      transferCue: role === "transfer" ? copyFor(intent, "transferCue") : "",
      intensity: buildIntensity(role),
      tempo: buildTempo(role),
      linkedContentReason: null
    };
  });
}

export function buildBlueprintPlanFrame(intent: PlanIntent) {
  return {
    title: buildTitle(intent),
    target: buildTarget(intent),
    summary: buildSummary(intent)
  };
}
