import type { PlanMicrocycleRole } from "@/data/planBlueprints";
import type { EnrichedDiagnosisContext } from "@/types/enrichedDiagnosis";
import type {
  DayPlan,
  PlanContext,
  PlanIntensity,
  PlanTempo
} from "@/types/plan";
import type { PlanLocale } from "@/lib/plan-core/baseSkeleton";

type OverlayCategory =
  | "groundstroke_set_play"
  | "groundstroke_on_move"
  | "return"
  | "volley"
  | "slice";

export type SceneOverlayInput = {
  problemTag: string;
  locale: PlanLocale;
  role: PlanMicrocycleRole;
  day: DayPlan;
  planContext: PlanContext | null;
  deepContext?: EnrichedDiagnosisContext | null;
  primaryNextStep?: string;
};

export type SceneDayOverlay = {
  focus: string;
  goal: string;
  warmup: string[];
  main: string[];
  pressure: string[];
  success: string[];
  failureCue: string;
  progressionNote: string;
  transferCue: string;
  intensity: PlanIntensity;
  tempo: PlanTempo;
};

function normalizeProblemTag(problemTag: string): string {
  return problemTag.trim().toLowerCase();
}

function resolveOverlayCategory(problemTag: string, planContext: PlanContext | null, deepContext?: EnrichedDiagnosisContext | null): OverlayCategory | null {
  if (!planContext && !deepContext) {
    return null;
  }

  if (planContext?.source === "assessment") {
    return null;
  }

  const normalized = normalizeProblemTag(problemTag);
  const strokeFamily = deepContext?.strokeFamily;

  if (strokeFamily === "return" || normalized === "return-under-pressure") {
    return "return";
  }

  if (strokeFamily === "volley" || normalized === "net-confidence" || normalized === "volley-floating" || normalized === "volley-into-net") {
    return "volley";
  }

  if (strokeFamily === "slice" || normalized === "incoming-slice-trouble" || normalized === "backhand-slice-floating") {
    return "slice";
  }

  if (
    normalized === "running-forehand" ||
    normalized === "running-backhand" ||
    (planContext?.movementContext === "moving" && /(forehand|backhand|late-contact)/.test(normalized))
  ) {
    return "groundstroke_on_move";
  }

  if (/(forehand|backhand|rally|balls-too-short|forehand-no-power|backhand-into-net)/.test(normalized)) {
    return "groundstroke_set_play";
  }

  return null;
}

function roleIntensity(role: PlanMicrocycleRole): PlanIntensity {
  if (role === "stabilize" || role === "repeatable_mechanics") {
    return "low";
  }

  if (role === "controlled_variability" || role === "review_reset") {
    return "medium";
  }

  return "medium_high";
}

function roleTempo(role: PlanMicrocycleRole): PlanTempo {
  if (role === "stabilize") {
    return "slow";
  }

  if (role === "repeatable_mechanics" || role === "controlled_variability" || role === "review_reset") {
    return "controlled";
  }

  return "match_70";
}

function isKeyPoint(planContext: PlanContext | null, deepContext?: EnrichedDiagnosisContext | null): boolean {
  return deepContext?.pressureContext === "key_points" || planContext?.pressureContext === "high";
}

function isMoving(planContext: PlanContext | null, deepContext?: EnrichedDiagnosisContext | null): boolean {
  return deepContext?.movement === "moving" || planContext?.movementContext === "moving";
}

function isDeepBall(planContext: PlanContext | null, deepContext?: EnrichedDiagnosisContext | null): boolean {
  return deepContext?.incomingBallDepth === "deep" || planContext?.incomingBallDepth === "deep";
}

function buildReturnOverlay(input: SceneOverlayInput): SceneDayOverlay {
  const { locale, role, primaryNextStep, planContext, deepContext } = input;
  const keyPoint = isKeyPoint(planContext, deepContext);
  const deepBall = isDeepBall(planContext, deepContext);
  const sceneLabel = locale === "en"
    ? `${keyPoint ? "key-point " : ""}return`
    : `${keyPoint ? "关键分" : ""}接发`;
  const depthLabel = locale === "en"
    ? deepBall ? "against deeper serves" : "against a live serve"
    : deepBall ? "面对更深的发球" : "面对真实发球";
  const compactCue = primaryNextStep?.trim() || (locale === "en"
    ? "Set the split step first, then block the first ball back through the middle."
    : "先稳住分腿垫步，再把第一拍封挡回中路。");

  if (locale === "en") {
    switch (role) {
      case "stabilize":
        return {
          focus: compactCue,
          goal: `Stabilize the ${sceneLabel} setup so the first ball stops floating short.`,
          warmup: [`12 ${sceneLabel} split-step reps`, "10 compact preparation reps without swinging"],
          main: [`12 blocked returns back through the middle ${depthLabel}`, "Track only whether contact stays out in front"],
          pressure: [keyPoint ? "Every fourth rep starts with a key-point scoreboard cue" : "Finish each set with two slightly faster serves", "Count only the reps with a stable split step and first move"],
          success: ["The first move no longer feels late", "The first ball stops landing as a soft short block"],
          failureCue: "When you tighten up, the swing grows and the first ball turns into a short block again.",
          progressionNote: "Next day, add more serve-speed and location variation without losing the same setup.",
          transferCue: "Carry this return setup into the first playable ball after contact.",
          intensity: roleIntensity(role),
          tempo: roleTempo(role)
        };
      case "repeatable_mechanics":
        return {
          focus: `${sceneLabel} compact first ball`,
          goal: `Make the ${sceneLabel} compact swing repeatable from the same ready position.`,
          warmup: ["10 compact take-back reps", "10 front-contact pause reps"],
          main: [`16 compact returns ${depthLabel}`, "Alternate deuce-side and ad-side reps without changing the same first-ball window"],
          pressure: ["Reset any rep where the racket path grows too big", keyPoint ? "Say the scoreboard before the return" : "Call the serve direction before the split step"],
          success: ["Compact swing survives side changes", "Contact stays in front instead of getting jammed"],
          failureCue: "The old leak returns when the racket goes back too far and the ball jams the body.",
          progressionNote: "Tomorrow, put this same compact pattern under small feed and timing changes.",
          transferCue: "Use the same short preparation when the serve pulls you slightly off balance.",
          intensity: roleIntensity(role),
          tempo: roleTempo(role)
        };
      case "controlled_variability":
        return {
          focus: `${sceneLabel} reads the serve variation`,
          goal: `Read wider and deeper serve variation without losing the same ${sceneLabel} first-ball shape.`,
          warmup: ["8 split-step plus first-step reps to both sides", "8 deeper-serve visual reads"],
          main: ["Alternate body serve, wide serve, and deeper serve return feeds", "Keep the first ball through the middle before opening the angle later"],
          pressure: ["Only count sequences where the first two steps stay organized", keyPoint ? "Insert one key-point rep every 3 balls" : "Insert one faster serve every 3 balls"],
          success: ["Variation changes the feet but not the first-ball shape", "Deeper serves no longer force a panic block"],
          failureCue: "The scene breaks when serve variation makes you abandon the split step or rush the contact.",
          progressionNote: "Step 4 should review which serve pattern still makes the first ball shrink.",
          transferCue: "Carry the same first-ball window into serves that arrive wider or deeper.",
          intensity: roleIntensity(role),
          tempo: roleTempo(role)
        };
      case "review_reset":
        return {
          focus: `Review the ${sceneLabel} pattern`,
          goal: `Review the ${sceneLabel} clips and reset the exact cue that keeps the first ball from floating short.`,
          warmup: ["6 relaxed split steps", "6 shadow returns with the cleanest cue from video or notes"],
          main: ["Review the 6 best and 3 worst return reps from the week", "Write one sentence for what kept the first ball usable"],
          pressure: [keyPoint ? "Finish with 4 key-point return reps using the same cue" : "Finish with 4 live return reps using the same cue", "Keep the feed deep enough to match the original scene"],
          success: ["One clean return cue is now explicit", "The reset cue still works against deeper serves"],
          failureCue: "If the review clips stay vague, the old short first ball will return under pressure.",
          progressionNote: "Tomorrow, take only the winning cue back into score pressure.",
          transferCue: "Carry the one reset cue into the next scoreboard-based return block.",
          intensity: roleIntensity(role),
          tempo: roleTempo(role)
        };
      case "pressure_repetition":
        return {
          focus: `${keyPoint ? "Key-point " : ""}return under pressure`,
          goal: `Put the ${sceneLabel} back into ${keyPoint ? "key-point" : "scoreboard"} pressure without losing the first-ball lane.`,
          warmup: ["6 scoreboard breaths", "6 return shadows starting from the same ready position"],
          main: [`Play 8 ${sceneLabel} points that begin with the first ball through the middle`, "Judge only whether the first ball still starts a playable rally"],
          pressure: ["Restart the score sequence after 2 rushed first balls", "Name the first-ball cue before every serve"],
          success: ["Score pressure no longer collapses the first return", "At least 6 of 8 points start with a usable first ball"],
          failureCue: "Under pressure, the leak returns as a rushed block that never starts the rally.",
          progressionNote: "Step 6 should add the next shot so the return survives beyond first contact.",
          transferCue: "Carry the same key-point return shape into return-plus-one sequences.",
          intensity: roleIntensity(role),
          tempo: roleTempo(role)
        };
      case "transfer":
        return {
        focus: `${sceneLabel} into return-plus-one`,
        goal: `Transfer the rebuilt ${sceneLabel} into a return-plus-one sequence instead of treating the return as a single isolated touch.`,
        warmup: ["4 return-plus-one shadow patterns", "4 calm recoveries after the first ball"],
        main: ["Return through the middle, recover, then play one controlled return-plus-one rally ball", "Repeat on both sides while keeping the same compact first-ball shape"],
          pressure: ["Only count sequences where the first ball still leaves a playable next shot", "Reset if the first ball turns into a defensive block before ball two"],
          success: ["The first return now hands off cleanly to the next ball", "Return quality survives into the second contact"],
          failureCue: "The transfer still fails when the first ball becomes so passive that the next shot never has shape.",
          progressionNote: "Step 7 should decide the one cue that keeps the return-plus-one sequence stable.",
          transferCue: "Take this same return-plus-one shape into real games and start every return point with it.",
          intensity: roleIntensity(role),
          tempo: roleTempo(role)
        };
      case "consolidation":
      default:
        return {
          focus: `Consolidate the ${sceneLabel}`,
          goal: `Consolidate the rebuilt ${sceneLabel}, score it, and keep one carry-forward rule for the next training block.`,
          warmup: ["6 calm shadow returns", "6 ready-position checks on both sides"],
          main: ["10 scored returns to the middle target", keyPoint ? "10 scored key-point returns with the same first-ball cue" : "10 scored live returns with the same first-ball cue"],
          pressure: ["Write one note after every 5-ball block", "Finish with one best-of-3 return pressure block"],
          success: ["You can explain one carry-forward return rule clearly", "The final block still starts with a playable first ball"],
          failureCue: "The scene is not yet stable if the first return still floats or stalls as soon as the score matters.",
          progressionNote: "Next week, start from the same first-ball rule and only then widen targets or pace.",
          transferCue: "Carry this return rule into the first games of the next match set.",
          intensity: roleIntensity(role),
          tempo: roleTempo(role)
        };
    }
  }

  switch (role) {
    case "stabilize":
      return {
        focus: compactCue,
        goal: `稳定建立日：先把${sceneLabel}的准备位和第一拍封挡稳定下来，别再只挡出浅球。`,
        warmup: [`${sceneLabel}前分腿垫步 12 次`, "固定准备位后只做启动 10 次"],
        main: [`${depthLabel}做 12 球封挡回中路`, "每球只看触球是否还在身体前侧"],
        pressure: [keyPoint ? "每 4 球插入 1 个关键分比分口令" : "每组最后 2 球提高一点发球速度", "只有分腿垫步和第一步都到位才计数"],
        success: ["接发前不再慢半拍", "第一拍不再只会浅挡一下"],
        failureCue: "一发紧就只剩挡一下的浅球，根本接不上下一拍。",
        progressionNote: "下一天把发球速度和落点变化加回来，但保留同一套准备位。",
        transferCue: "把这套接发准备带进第一拍和下一拍之间的衔接。",
        intensity: roleIntensity(role),
        tempo: roleTempo(role)
      };
    case "repeatable_mechanics":
      return {
        focus: `${sceneLabel}短引拍`,
        goal: `可重复动作日：把${sceneLabel}的短引拍和前点触球做成可重复动作。`,
        warmup: ["短引拍空挥 10 次", "前点停住检查 10 次"],
        main: [`${depthLabel}接发 16 球`, "平分区和占先区交替，但都只保留同一个第一拍窗口"],
        pressure: ["任何一次引拍变大都立刻重置", keyPoint ? "每组前先报一次关键分比分" : "每组前先报一次发球方向"],
        success: ["换边后仍能保留同样短引拍", "触球点不再被来球顶住"],
        failureCue: "只要引拍一放大，接发就又会被球顶住，第一拍重新变软。",
        progressionNote: "下一步把同样的短引拍放进更宽和更深的发球变化里。",
        transferCue: "面对偏离身体的发球时也继续用同一个短准备。",
        intensity: roleIntensity(role),
        tempo: roleTempo(role)
      };
    case "controlled_variability":
      return {
        focus: `${sceneLabel}读发球变化`,
        goal: `受控变化日：把${sceneLabel}放进更宽、更深的发球变化里，但别丢掉同一个第一拍形状。`,
        warmup: ["两侧启动 8 次", "更深发球的视觉读球 8 次"],
        main: ["交替喂身体发球、外角发球和更深发球", "第一拍仍然先封挡回中路，再决定后续方向"],
        pressure: ["只有前两步都到位的球才计数", keyPoint ? "每 3 球插入 1 个关键分接发" : "每 3 球插入 1 个更快发球"],
        success: ["发球变化改变的是脚步，不是第一拍形状", "更深发球不再把你逼成慌乱浅挡"],
        failureCue: "一碰到发球变化就放弃分腿垫步，场景又会退回被动挡球。",
        progressionNote: "第 4 天要复盘哪一种发球变化最容易把第一拍缩回去。",
        transferCue: "把同一个第一拍窗口带进更宽或更深的发球变化里。",
        intensity: roleIntensity(role),
        tempo: roleTempo(role)
      };
    case "review_reset":
      return {
        focus: `复盘${sceneLabel}`,
        goal: `复盘日：回看${sceneLabel}时最稳和最乱的片段，找出哪条提示能让第一拍不再变成浅挡。`,
        warmup: ["轻松分腿垫步 6 次", "带最稳提示的影子接发 6 次"],
        main: ["回看这套计划里最好的 6 组和最差的 3 组接发", "写下一句最能保住第一拍质量的提示"],
        pressure: [keyPoint ? "最后用同一条提示再做 4 个关键分接发" : "最后用同一条提示再做 4 个真实接发", "喂球仍要保持足够深，别把原场景练丢"],
        success: ["已经明确一条最有效的接发提示", "这条重置提示对深发球也仍然有效"],
        failureCue: "如果复盘只剩模糊印象，关键分里还是会回到浅挡第一拍。",
        progressionNote: "下一步只带着这一条有效提示回到比分压力里。",
        transferCue: "把这条重置提示带进下一组关键分接发。",
        intensity: roleIntensity(role),
        tempo: roleTempo(role)
      };
    case "pressure_repetition":
      return {
        focus: `${keyPoint ? "关键分" : "比分"}${sceneLabel}抗压`,
        goal: `压力日：把${sceneLabel}重新放回${keyPoint ? "关键分" : "比分"}压力里，但第一拍仍要先把回合立起来。`,
        warmup: ["比分呼吸 6 次", "同一准备位起始的影子接发 6 次"],
        main: [`打 8 个${sceneLabel}分，第一拍都先封挡回中路`, "只看第一拍是否还能把回合接起来"],
        pressure: ["连续 2 个第一拍着急就整组重来", "每一分前先说出第一拍提示"],
        success: ["比分压力不再直接压垮第一拍", "8 分里至少 6 分能先用可打的接发开分"],
        failureCue: "一到比分压力，第一拍又只剩慌张浅挡，回合根本起不来。",
        progressionNote: "第 6 天把下一拍加进来，检验接发能不能真正交给后续球。",
        transferCue: "把同一个关键分接发形状带进接发加一拍的片段里。",
        intensity: roleIntensity(role),
        tempo: roleTempo(role)
      };
    case "transfer":
      return {
        focus: `${sceneLabel}带进接发后一二拍`,
        goal: `转移日：不要把${sceneLabel}当成单独一拍，而是带进接发后一二拍的完整片段。`,
        warmup: ["接发加一拍影子流程 4 次", "第一拍后的冷静回位 4 次"],
        main: ["接发第一拍先封挡回中路，再接一拍可控的下一板", "平分区和占先区都重复，但都保留同样的第一拍形状"],
        pressure: ["只有第一拍还能留出下一拍空间的片段才计数", "如果第一拍又变成纯防守浅挡就立刻重来"],
        success: ["接发已经能顺利交给下一拍", "第二拍不再建立在勉强救回的第一拍上"],
        failureCue: "如果第一拍过于被动，后面那一拍根本接不上，整段衔接还是断的。",
        progressionNote: "第 7 天要收敛成一条最稳的接发加一拍规则。",
        transferCue: "把这套接发加一拍的结构带进真实接发分里。",
        intensity: roleIntensity(role),
        tempo: roleTempo(role)
      };
    case "consolidation":
    default:
      return {
        focus: `${sceneLabel}巩固收口`,
        goal: `巩固日：把重建后的${sceneLabel}做一次计分评估，并留下一条下一轮训练继续沿用的规则。`,
        warmup: ["平静影子接发 6 次", "两侧准备位检查 6 次"],
        main: ["10 次对中路目标的计分接发", keyPoint ? "10 次带关键分提示的计分接发" : "10 次真实发球下的计分接发"],
        pressure: ["每 5 球写下一条观察", "最后做一组 best-of-3 接发压力块"],
        success: ["已经能清楚说出一条下一轮训练沿用的接发规则", "最后一组里第一拍仍然能先把回合立起来"],
        failureCue: "如果比分一紧第一拍还是只会浅挡，这个场景就还没有真正稳住。",
        progressionNote: "下一轮训练继续先守住第一拍规则，再去扩大目标或加快节奏。",
        transferCue: "把这条接发规则带进下一轮训练的第一局接发分里。",
        intensity: roleIntensity(role),
        tempo: roleTempo(role)
      };
  }
}

function buildGroundstrokeOnMoveOverlay(input: SceneOverlayInput): SceneDayOverlay {
  const { locale, role, problemTag, primaryNextStep, planContext, deepContext } = input;
  const strokeLabel = normalizeProblemTag(problemTag).includes("backhand")
    ? (locale === "en" ? "backhand" : "反手")
    : (locale === "en" ? "forehand" : "正手");
  const deepBall = isDeepBall(planContext, deepContext);
  const sceneLabel = locale === "en"
    ? `${strokeLabel} on the run`
    : `跑动中的${strokeLabel}`;
  const targetBall = locale === "en"
    ? deepBall ? "deeper incoming ball" : "outside ball"
    : deepBall ? "深球" : "外侧球";
  const carry = primaryNextStep?.trim() || (locale === "en"
    ? `Get the contact for the ${sceneLabel} back out in front.`
    : `先把${sceneLabel}的击球点放到身体前面。`);

  if (locale === "en") {
    return {
      focus: role === "stabilize" ? carry : `${sceneLabel} against the ${targetBall}`,
      goal: role === "controlled_variability"
        ? `Put the ${sceneLabel} back into moving reads against the ${targetBall} without rushing contact.`
        : role === "pressure_repetition"
          ? `Put the ${sceneLabel} under score pressure while keeping the read on the ${targetBall}.`
          : role === "transfer"
            ? `Transfer the rebuilt ${sceneLabel} into a live point fragment after chasing the ${targetBall}.`
            : role === "consolidation"
              ? `Consolidate the ${sceneLabel} and keep one carry rule for chasing the ${targetBall} in the next training block.`
              : `Build the ${sceneLabel} so the feet arrive before the swing against the ${targetBall}.`,
      warmup: [`10 arrival-before-swing reps for the ${sceneLabel}`, `8 first-step reads toward the ${targetBall}`],
      main: [
        `Chase the ${targetBall}, arrive, then send ${strokeLabel} back through the safer lane`,
        "Track only whether contact stays out in front after movement"
      ],
      pressure: [
        deepBall ? "Keep the feed deeper so the movement scene stays honest" : "Keep the feed wide enough that the last two steps still matter",
        role === "pressure_repetition" ? "Count only the reps where the feet arrive before the score-pressure swing" : "Reset any rep where the swing starts before the feet settle"
      ],
      success: ["Movement no longer forces a rushed contact", `The ${strokeLabel} keeps a usable ball shape after running`],
      failureCue: `The old leak returns when the swing starts before the feet finish arriving on the ${targetBall}.`,
      progressionNote: role === "consolidation"
        ? `Next week, keep the same ${sceneLabel} arrival rule before adding more pace or angle.`
        : `Tomorrow, keep the same arrival rule while adding more variability to the ${targetBall}.`,
      transferCue: `Carry this ${sceneLabel} arrival rule into the first live rally ball after the chase.`,
      intensity: roleIntensity(role),
      tempo: roleTempo(role)
    };
  }

  return {
    focus: role === "stabilize" ? carry : `${sceneLabel}处理${targetBall}`,
    goal: role === "controlled_variability"
      ? `受控变化日：把${sceneLabel}放回追${targetBall}的节奏里，但别再边跑边急着出手。`
      : role === "pressure_repetition"
        ? `压力日：让${sceneLabel}在比分压力下也继续先到位，再处理${targetBall}。`
        : role === "transfer"
          ? `转移日：把重建后的${sceneLabel}带进追${targetBall}后的真实得分片段。`
          : role === "consolidation"
            ? `巩固日：给${sceneLabel}留下一条下一轮训练继续追${targetBall}时也要守住的规则。`
            : `稳定建立日：先让${sceneLabel}面对${targetBall}时做到脚到位再挥拍。`,
    warmup: [`${sceneLabel}先到位再挥拍 10 次`, `朝${targetBall}启动第一步 8 次`],
    main: [`追${targetBall}后先到位，再把${strokeLabel}打回更安全的线路`, "每球只看触球是否还能保持在身体前侧"],
    pressure: [
      deepBall ? "喂球继续保持更深，别把原场景练浅了" : "喂球要足够宽，保留最后两步的调整压力",
      role === "pressure_repetition" ? "只有比分压力下仍能先到位的球才计数" : "任何一次脚还没停稳就出手都立刻重置"
    ],
    success: ["跑动不再直接把触球变成着急抢点", `${strokeLabel}在跑动后仍能打出可用球质`],
    failureCue: `老问题会在脚还没到位就急着挥拍时回来，${strokeLabel}又会边跑边散。`,
    progressionNote: role === "consolidation"
      ? `下一轮训练继续先守住${sceneLabel}的到位规则，再加速度或角度。`
      : `下一步继续带着同一条到位规则去处理更有变化的${targetBall}。`,
    transferCue: `把这条${sceneLabel}的到位规则带进追球后的第一拍。`,
    intensity: roleIntensity(role),
    tempo: roleTempo(role)
  };
}

function buildGroundstrokeSetPlayOverlay(input: SceneOverlayInput): SceneDayOverlay {
  const { locale, role, problemTag, primaryNextStep } = input;
  const strokeLabel = /(backhand)/.test(normalizeProblemTag(problemTag))
    ? (locale === "en" ? "backhand" : "反手")
    : (locale === "en" ? "forehand" : "正手");
  const carry = primaryNextStep?.trim() || (locale === "en"
    ? `Keep the ${strokeLabel} scene simple and repeatable first.`
    : `先把${strokeLabel}场景练简单、练稳定。`);

  if (locale === "en") {
    return {
      focus: role === "stabilize" ? carry : `${strokeLabel} set-play pattern`,
      goal: `Keep the ${strokeLabel} scene specific through ${role === "transfer" ? "a live transfer" : "a repeatable set-play pattern"} instead of drifting generic.`,
      warmup: [`10 calm ${strokeLabel} shadow reps`, "8 ready-position resets"],
      main: [`Build the ${strokeLabel} on one clear lane before adding direction changes`, "Track the same contact and finish window every rep"],
      pressure: ["Only count reps that keep the same ball shape", role === "pressure_repetition" ? "Layer score pressure back in without changing the same ball pattern" : "Reset any rep that adds pace before control"],
      success: [`The ${strokeLabel} scene stays recognizable across the session`, "Later days still match the same original leak"],
      failureCue: `The plan loses honesty when the ${strokeLabel} day turns into generic rallying without the original scene.`,
      progressionNote: "Tomorrow, keep the same scene and only add one new variable.",
      transferCue: `Carry this ${strokeLabel} pattern into the first realistic rally fragment.`,
      intensity: roleIntensity(role),
      tempo: roleTempo(role)
    };
  }

  return {
    focus: role === "stabilize" ? carry : `${strokeLabel}定场景模板`,
    goal: `让${strokeLabel}这一类问题始终围绕同一个场景推进，不要越练越变成泛泛相持。`,
    warmup: [`${strokeLabel}平静空挥 10 次`, "准备位重置 8 次"],
    main: [`先只围绕一条清晰线路练${strokeLabel}`, "每球都看同一个触球和收拍窗口是否还在"],
    pressure: ["只有保留同一球形的球才计数", role === "pressure_repetition" ? "把比分压力加回来，但不要改掉同一个球形模板" : "任何一次为了发力而破坏控制都立刻重置"],
    success: [`整节里都还能看出是同一个${strokeLabel}漏点`, "到后面几天也没有变成泛泛练球"],
    failureCue: `只要${strokeLabel}练习变成泛泛相持，这个计划就失去原来的场景诚实度。`,
    progressionNote: "下一步继续守住同一个场景，只增加一个新的变量。",
    transferCue: `把这套${strokeLabel}模板带进第一组更真实的回合片段。`,
    intensity: roleIntensity(role),
    tempo: roleTempo(role)
  };
}

function buildVolleyOverlay(input: SceneOverlayInput): SceneDayOverlay {
  const { locale, role, primaryNextStep, planContext, deepContext } = input;
  const keyPoint = isKeyPoint(planContext, deepContext);
  const carry = primaryNextStep?.trim() || (locale === "en"
    ? "Set the first volley lower through the middle before trying to finish the point."
    : "先把第一板截击压低到中路。");

  if (locale === "en") {
    return {
      focus: role === "stabilize" ? carry : "first-volley scene",
      goal: role === "pressure_repetition"
        ? `Put the first-volley scene back under net-front pressure and keep the first volley from floating.`
        : role === "transfer"
          ? "Transfer the rebuilt first-volley scene into a close-the-net point fragment."
          : role === "consolidation"
            ? "Consolidate the first-volley scene and keep one carry cue for the next training block."
            : "Rebuild the first-volley scene so the first volley stays low enough to keep control at net.",
      warmup: ["10 split-step and close-in reps", "10 compact first-volley setup reps"],
      main: ["Volley the first ball through the middle before choosing a finishing angle", role === "transfer" ? "Play first volley, recover forward, then finish the next volley with control" : "Track only whether the first volley stays low instead of floating"],
      pressure: [keyPoint ? "Insert one score-pressure rep every 3 balls at net" : "Insert one rushed-approach rep every 3 balls", role === "pressure_repetition" ? "Count only the reps where the first volley stays low under pressure" : "Reset any rep where hesitation makes the volley float"],
      success: ["The first volley no longer floats up into trouble", "Net-front pressure does not erase the compact volley shape"],
      failureCue: "The leak returns as soon as hesitation makes the first volley float again.",
      progressionNote: role === "consolidation"
        ? "Next week, keep the same first-volley floor before adding harder finishing patterns."
        : "Tomorrow, keep the same first-volley shape while adding one more closing decision.",
      transferCue: "Carry this first-volley rule into the next close-the-net point.",
      intensity: roleIntensity(role),
      tempo: roleTempo(role)
    };
  }

  return {
    focus: role === "stabilize" ? carry : "网前第一板场景",
    goal: role === "pressure_repetition"
      ? "压力日：把网前第一板截击重新放回上网后的压力里，但第一板仍要先压低。"
      : role === "transfer"
        ? "转移日：把重建后的第一板截击带进上网后的完整得分片段。"
        : role === "consolidation"
          ? "巩固日：给网前第一板截击留下一条下一轮训练继续沿用的规则。"
          : "稳定建立日：先把网前第一板截击压低到中路，不要再漂起来。",
    warmup: ["分腿垫步加上前 10 次", "第一板截击准备 10 次"],
    main: ["第一板截击先压中路，再决定后续封网方向", role === "transfer" ? "先做第一板截击，再跟一板可控封网截击" : "每球只看第一板是否还压得住、不再漂"],
    pressure: [keyPoint ? "每 3 球插入 1 个比分压力的网前场景" : "每 3 球插入 1 个更仓促的上网场景", role === "pressure_repetition" ? "只有压力下第一板还能压低的球才计数" : "任何一次犹豫把球截漂都立刻重置"],
    success: ["第一板截击不再漂高送机会", "网前压力下仍能保留紧凑截击形状"],
    failureCue: "只要一犹豫，第一板截击就会重新漂起来，把上网优势送回去。",
    progressionNote: role === "consolidation"
      ? "下一轮训练继续先守住第一板截击的高度，再加更难的终结线路。"
      : "下一步在保留同一板形状的前提下，再增加一个封网决策。",
    transferCue: "把这条第一板截击规则带进下一组上网得分片段。",
    intensity: roleIntensity(role),
    tempo: roleTempo(role)
  };
}

function buildSliceOverlay(input: SceneOverlayInput): SceneDayOverlay {
  const { locale, role, primaryNextStep, planContext, deepContext } = input;
  const deepBall = isDeepBall(planContext, deepContext);
  const carry = primaryNextStep?.trim() || (locale === "en"
    ? "Get the racket head lower before sending the incoming slice forward."
    : "先把拍头放低，再把来球往前送出去。");

  if (locale === "en") {
    return {
      focus: role === "stabilize" ? carry : "incoming-slice handling",
      goal: role === "review_reset"
        ? "Review the incoming-slice scene and reset whether the racket head stays low enough through contact."
        : role === "transfer"
          ? "Transfer the rebuilt incoming-slice handling into a live ball sequence with one extra slice exchange."
          : role === "consolidation"
            ? "Consolidate the incoming-slice handling and keep one low-racket carry rule for the next training block."
            : "Rebuild the incoming-slice handling so the contact stops floating or dropping into the net.",
      warmup: ["10 low-racket shadow reps", deepBall ? "8 deeper-skid read reps" : "8 skid-read reps"],
      main: ["Handle the incoming slice with the racket head set lower before extending forward", role === "transfer" ? "After handling the first slice, play one extra controlled slice exchange" : "Track only whether the ball stays low and usable instead of floating"],
      pressure: [deepBall ? "Keep the feed deep and skidding so the original slice scene stays intact" : "Keep the ball low enough that the slice scene stays honest", role === "pressure_repetition" ? "Count only the reps where the low racket head survives score pressure" : "Reset any rep where the racket lifts and the ball floats"],
      success: ["Incoming slice no longer forces a late, floating response", "The racket head stays lower through contact"],
      failureCue: "The leak returns when the racket head rises and the ball floats or dies into the net again.",
      progressionNote: role === "consolidation"
        ? "Next week, keep the racket head lower first, then add pace or wider targets."
        : "Tomorrow, keep the same low-racket rule while adding one more slice-specific variable.",
      transferCue: "Carry this low-racket rule into the next live ball that starts with incoming slice.",
      intensity: roleIntensity(role),
      tempo: roleTempo(role)
    };
  }

  return {
    focus: role === "stabilize" ? carry : "来球下旋处理",
    goal: role === "review_reset"
      ? "复盘日：回看面对下旋来球时拍头是否还能保持足够低，不要又抬起来。"
      : role === "transfer"
        ? "转移日：把重建后的下旋处理带进真实来球后再接一板切球的片段。"
        : role === "consolidation"
          ? "巩固日：给面对下旋来球的处理留下一条下一轮训练继续沿用的低拍头规则。"
          : "稳定建立日：面对下旋来球时先把拍头放低，再把球往前送，不要再冒高或挂网。",
    warmup: ["低拍头影子挥拍 10 次", deepBall ? "更深更滑的来球读球 8 次" : "低弹道读球 8 次"],
    main: ["面对下旋来球先把拍头放低，再向前把球送出去", role === "transfer" ? "先处理第一拍下旋来球，再接一拍可控切球交换" : "每球只看球是否还保持低平、没有重新冒高"],
    pressure: [deepBall ? "喂球继续保持更深更滑，别把原来球况练没了" : "喂球必须够低，保留下旋来球的真实压力", role === "pressure_repetition" ? "只有比分压力下还能守住低拍头的球才计数" : "任何一次拍头抬高让球冒高都立刻重置"],
    success: ["下旋来球不再逼出偏晚又冒高的处理", "拍头在触球 through 过程中能保持更低"],
    failureCue: "只要拍头一抬，面对下旋来球时球就会重新冒高，或者直接挂网。",
    progressionNote: role === "consolidation"
      ? "下一轮训练继续先守住更低的拍头，再去加速度或更刁的线路。"
      : "下一步继续带着低拍头规则，但再增加一个下旋来球变量。",
    transferCue: "把这条低拍头规则带进下一次真实下旋来球的第一拍。",
    intensity: roleIntensity(role),
    tempo: roleTempo(role)
  };
}

export function buildSceneDayOverlay(input: SceneOverlayInput): SceneDayOverlay | null {
  const category = resolveOverlayCategory(input.problemTag, input.planContext, input.deepContext);
  if (!category) {
    return null;
  }

  switch (category) {
    case "return":
      return buildReturnOverlay(input);
    case "volley":
      return buildVolleyOverlay(input);
    case "slice":
      return buildSliceOverlay(input);
    case "groundstroke_on_move":
      return buildGroundstrokeOnMoveOverlay(input);
    case "groundstroke_set_play":
      return buildGroundstrokeSetPlayOverlay(input);
    default:
      return null;
  }
}
