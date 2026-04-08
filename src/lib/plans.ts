import { getDimensionLabel } from "@/lib/assessment";
import { contents } from "@/data/contents";
import { diagnosisRules } from "@/data/diagnosisRules";
import { expandedContents } from "@/data/expandedContents";
import { planTemplates } from "@/data/planTemplates";
import { PLAN_MICROCYCLE_ROLES, PlanMicrocycleRole } from "@/data/planBlueprints";
import {
  buildPlanContextFromEnrichedContext,
  encodeEnrichedDiagnosisContext,
  parseEnrichedDiagnosisContext
} from "@/lib/diagnose/enrichedContext";
import { filterByEnvironment } from "@/lib/environment";
import { AssessmentDimension, AssessmentResult, DimensionSummary } from "@/types/assessment";
import { ContentItem } from "@/types/content";
import { AppEnvironment } from "@/types/environment";
import { EnrichedDiagnosisContext } from "@/types/enrichedDiagnosis";
import {
  DayPlan,
  DayPlanBlock,
  GeneratedPlan,
  PlanLevel,
  PlanContext,
  PlanContextDepth,
  PlanContextFeeling,
  PlanContextMovement,
  PlanContextOutcome,
  PlanContextPressure,
  PlanContextSessionType,
  PlanTemplate,
  PlanTemplateDay
} from "@/types/plan";
import { SavedPlanSource } from "@/types/userData";

type PlanLocale = "zh" | "en";
type PlanPoolSource = "curated" | "expanded";

type PlanDiagnosisContextHint = {
  skills: string[];
  problemTags: string[];
  contentIds: string[];
  terms: string[];
};

type RankedPlanContentCandidate = {
  item: ContentItem;
  index: number;
  score: number;
};

const MAX_PLAN_CANDIDATES = 10;
const MIN_PLAN_CANDIDATES = 7;

const PLAN_TAG_ALIASES: Record<string, string> = {
  "second-serve-confidence": "second-serve-reliability",
  "serve-toss-inconsistent": "serve-toss-consistency",
  "slice-too-high": "backhand-slice-floating",
  "trouble-with-slice": "incoming-slice-trouble",
};

const PLAN_COMPATIBILITY_FALLBACKS: Record<string, string> = {
  "pressure-tightness": "match-anxiety",
  "stamina-drop": "movement-slow"
};

const CONTENT_PROBLEM_TAG_ALIASES: Record<string, string[]> = {
  "second-serve-confidence": ["second-serve-reliability"],
  "serve-toss-inconsistent": ["serve-toss-consistency"],
  "slice-too-high": ["backhand-slice-floating"],
  "trouble-with-slice": ["incoming-slice-trouble"],
  "slow-preparation": ["late-contact"],
  "volley-errors": ["volley-floating", "volley-into-net"],
  "doubles-net-fear": ["net-confidence"]
};

const PLAN_DAY_REVIEW_TERMS = ["review", "录像", "复盘", "休息", "track"];

const PLAN_CONTEXT_SIGNAL_PATTERNS: Array<{
  patterns: RegExp[];
  skills: string[];
  problemTags: string[];
  contentIds: string[];
  terms: string[];
}> = [
  {
    patterns: [/(?:关键分|关键球|一紧张|紧张|手紧|pressure point|big point|under pressure|nerves?)/i],
    skills: ["mental", "matchplay"],
    problemTags: ["pressure-tightness", "match-anxiety"],
    contentIds: ["content_rb_03", "content_rb_02", "content_cn_f_02"],
    terms: ["关键分", "紧张", "手紧", "pressure", "nerves", "key point"]
  },
  {
    patterns: [/(?:对手在网前|对手一上网|网前压迫|抢网|封网|opponent at net|net pressure|poach|poaching)/i],
    skills: ["net", "matchplay", "doubles"],
    problemTags: ["net-confidence", "doubles-positioning", "volley-floating", "volley-into-net"],
    contentIds: ["content_rb_01", "content_rb_03", "content_rb_02"],
    terms: ["网前", "上网", "截击", "opponent at net", "poach", "net pressure"]
  },
  {
    patterns: [/(?:左右移动|跑动中|追球|宽球|move wide|running|on the stretch)/i],
    skills: ["movement", "footwork"],
    problemTags: ["movement-slow", "late-contact", "running-forehand", "running-backhand"],
    contentIds: ["content_cn_c_02", "content_fr_02"],
    terms: ["左右移动", "跑动", "追球", "move wide", "running"]
  },
  {
    patterns: [/(?:月亮球|moonball|moon ball|高吊球|高挑球)/i],
    skills: ["matchplay", "defense", "topspin"],
    problemTags: ["moonball-trouble", "cant-hit-lob"],
    contentIds: ["content_fr_02", "content_rb_03"],
    terms: ["月亮球", "高吊球", "moonball", "lob"]
  },
  {
    patterns: [/(?:下旋来球|对方切过来|against slice|incoming slice|low skidding balls)/i],
    skills: ["backhand", "slice"],
    problemTags: ["incoming-slice-trouble", "backhand-slice-floating"],
    contentIds: ["content_fr_01", "content_fr_02"],
    terms: ["下旋", "切球", "against slice", "incoming slice", "low skidding"]
  },
  {
    patterns: [/(?:年纪大了|上年纪|跑不太动|跑不动|跟不上|cannot move well anymore|mobility)/i],
    skills: ["movement", "footwork"],
    problemTags: ["mobility-limit", "movement-slow"],
    contentIds: ["content_fr_02"],
    terms: ["年纪", "跑不动", "mobility", "cannot move"]
  }
];

type PlanDayInput = Pick<DayPlan, "day" | "focus" | "contentIds" | "drills" | "duration"> &
  Partial<Pick<
    PlanTemplateDay,
    | "focusEn"
    | "drillsEn"
    | "durationEn"
    | "goal"
    | "goalEn"
    | "warmupBlock"
    | "warmupBlockEn"
    | "mainBlock"
    | "mainBlockEn"
    | "pressureBlock"
    | "pressureBlockEn"
    | "successCriteria"
    | "successCriteriaEn"
    | "intensity"
    | "tempo"
  >>;

function createBlock(title: string, items: string[]): DayPlanBlock {
  return { title, items: [...items] };
}

function cloneBlock(block: DayPlanBlock | undefined, fallbackTitle: string, fallbackItems: string[]): DayPlanBlock {
  const source = block ?? createBlock(fallbackTitle, fallbackItems);

  return {
    title: source.title,
    items: [...source.items]
  };
}

function buildDayPlan(day: PlanDayInput, locale: PlanLocale): DayPlan {
  const isEn = locale === "en";
  const focus = isEn ? day.focusEn ?? day.focus : day.focus;
  const drills = [...(isEn ? day.drillsEn ?? day.drills : day.drills)];
  const duration = isEn ? day.durationEn ?? day.duration : day.duration;
  const warmupItems = drills.length > 0 ? [drills[0]] : [focus];
  const pressureItems = isEn
    ? [`Add one pressure rule to ${focus}`]
    : [`给${focus}增加一个压力条件`];

  return {
    day: day.day,
    focus,
    contentIds: [...day.contentIds],
    drills,
    duration,
    goal: isEn ? day.goalEn ?? `Build control in ${focus}` : day.goal ?? `围绕${focus}建立稳定执行`,
    warmupBlock: isEn
      ? cloneBlock(day.warmupBlockEn, "Warm-up", warmupItems)
      : cloneBlock(day.warmupBlock, "热身", warmupItems),
    mainBlock: isEn
      ? cloneBlock(day.mainBlockEn, "Main work", drills)
      : cloneBlock(day.mainBlock, "主练", drills),
    pressureBlock: isEn
      ? cloneBlock(day.pressureBlockEn, "Pressure reps", pressureItems)
      : cloneBlock(day.pressureBlock, "带压力重复", pressureItems),
    successCriteria: [
      ...(isEn
        ? day.successCriteriaEn ?? ["Complete the session with steady mechanics"]
        : day.successCriteria ?? ["完成当天训练并保持动作稳定"])
    ],
    intensity: day.intensity ?? (day.day <= 2 ? "low" : day.day <= 5 ? "medium" : "medium_high"),
    tempo: day.tempo ?? (day.day <= 2 ? "slow" : day.day <= 5 ? "controlled" : "match_70")
  };
}

const FALLBACK_DAY_PRESCRIPTIONS_ZH: PlanDayInput[] = [
  {
    day: 1,
    focus: "先把动作节奏和落点稳定下来",
    contentIds: [],
    drills: ["空挥 10 次", "分腿垫步 10 次"],
    duration: "20 分钟",
    goal: "先把动作节奏和落点稳定下来",
    warmupBlock: createBlock("热身", ["空挥 10 次", "分腿垫步 10 次"]),
    mainBlock: createBlock("主练", ["中等速度对打 12 球", "每球后停一下确认站位"]),
    pressureBlock: createBlock("带压力重复", ["连续 3 球都进区才加快"]),
    successCriteria: ["能连续完成 3 轮而不乱节奏"],
    intensity: "low",
    tempo: "slow"
  },
  {
    day: 2,
    focus: "每球前先做一次稳定准备",
    contentIds: [],
    drills: ["站定后再启动 8 次", "准备动作 12 次"],
    duration: "20 分钟",
    goal: "把每一拍前的准备动作固定住",
    warmupBlock: createBlock("热身", ["站姿检查 8 次", "准备动作 12 次"]),
    mainBlock: createBlock("主练", ["慢速多球 10 球", "每球前先说一次提醒词（如：先转肩）"]),
    pressureBlock: createBlock("带压力重复", ["连续 5 球都按同一准备流程"]),
    successCriteria: ["能在不抢拍的情况下完成 2 轮"],
    intensity: "low",
    tempo: "slow"
  },
  {
    day: 3,
    focus: "把中间球打深一点",
    contentIds: [],
    drills: ["深区定点击球 10 球", "回位后再出手 10 次"],
    duration: "20 分钟",
    goal: "让落点先过网再变稳",
    warmupBlock: createBlock("热身", ["对墙挥拍 10 次", "回位站姿 10 次"]),
    mainBlock: createBlock("主练", ["中路深区 12 球", "只看落点不要加力"]),
    pressureBlock: createBlock("带压力重复", ["连续 4 球深区才换边"]),
    successCriteria: ["至少 8 球落在目标深区"],
    intensity: "medium",
    tempo: "controlled"
  },
  {
    day: 4,
    focus: "把今天的节奏复述出来",
    contentIds: [],
    drills: ["录像回看 5 分钟", "写下 2 条提醒词"],
    duration: "15 分钟",
    goal: "把有效节奏用一句话说清楚",
    warmupBlock: createBlock("热身", ["慢走回位 5 次", "深呼吸 5 次"]),
    mainBlock: createBlock("主练", ["回看 8 球录像", "写下 2 个最有用的提示"]),
    pressureBlock: createBlock("带压力重复", ["只能保留 1 条明天继续用的提醒词"]),
    successCriteria: ["能说出今天最稳的一条提醒词"],
    intensity: "low",
    tempo: "slow"
  },
  {
    day: 5,
    focus: "在轻微压力下保持同样动作",
    contentIds: [],
    drills: ["计数击球 8 次", "失败后重来 3 轮"],
    duration: "20 分钟",
    goal: "在有要求时也不改动作",
    warmupBlock: createBlock("热身", ["空挥 8 次", "节奏提醒词 8 次"]),
    mainBlock: createBlock("主练", ["计数对打 12 球", "每球都先确认呼吸"]),
    pressureBlock: createBlock("带压力重复", ["连续 3 轮都要完成 5 个有效球"]),
    successCriteria: ["压力下仍能维持同一击球节奏"],
    intensity: "medium",
    tempo: "controlled"
  },
  {
    day: 6,
    focus: "把今天练过的内容串成一组",
    contentIds: [],
    drills: ["热身 5 分钟", "主练 10 分钟", "收尾 5 分钟"],
    duration: "20 分钟",
    goal: "让你知道一节完整训练该怎么排",
    warmupBlock: createBlock("热身", ["慢跑 3 分钟", "动态拉伸 5 次"]),
    mainBlock: createBlock("主练", ["前 5 球只打深区", "后 5 球只看稳定性"]),
    pressureBlock: createBlock("带压力重复", ["连续 2 组都要按同一顺序完成"]),
    successCriteria: ["能独立排出一节完整训练"],
    intensity: "medium",
    tempo: "controlled"
  },
  {
    day: 7,
    focus: "留下下一周最简单的继续练法",
    contentIds: [],
    drills: ["整理本周记录", "选 1 个下周重点"],
    duration: "20 分钟",
    goal: "把可继续执行的模板留下来",
    warmupBlock: createBlock("热身", ["回看笔记 5 分钟", "整理球感记录"]),
    mainBlock: createBlock("主练", ["回顾本周 3 次最稳的回合", "写下下周训练重点"]),
    pressureBlock: createBlock("带压力重复", ["只保留 1 个下周要继续练的规则"]),
    successCriteria: ["能说清楚下周第一堂课要练什么"],
    intensity: "low",
    tempo: "slow"
  }
];

const FALLBACK_DAY_PRESCRIPTIONS_EN: PlanDayInput[] = [
  {
    day: 1,
    focus: "Settle your rhythm and contact before adding pace",
    contentIds: [],
    drills: ["10 shadow swings", "10 split-step reps"],
    duration: "20 minutes",
    goal: "Settle your rhythm and contact before adding pace",
    goalEn: "Settle your rhythm and contact before adding pace",
    warmupBlock: createBlock("Warm-up", ["10 shadow swings", "10 split-step reps"]),
    warmupBlockEn: createBlock("Warm-up", ["10 shadow swings", "10 split-step reps"]),
    mainBlock: createBlock("Main work", ["12 medium-tempo rally feeds", "Pause after each ball to reset your stance"]),
    mainBlockEn: createBlock("Main work", ["12 medium-tempo rally feeds", "Pause after each ball to reset your stance"]),
    pressureBlock: createBlock("Pressure reps", ["Only speed up after 3 clean balls in a row"]),
    pressureBlockEn: createBlock("Pressure reps", ["Only speed up after 3 clean balls in a row"]),
    successCriteria: ["Complete 3 rounds without losing rhythm"],
    successCriteriaEn: ["Complete 3 rounds without losing rhythm"],
    intensity: "low",
    tempo: "slow"
  },
  {
    day: 2,
    focus: "Lock in a steady pre-ball routine",
    contentIds: [],
    drills: ["8 ready-position checks", "12 prep motions"],
    duration: "20 minutes",
    goal: "Make the pre-shot routine automatic",
    goalEn: "Make the pre-shot routine automatic",
    warmupBlock: createBlock("Warm-up", ["8 stance checks", "12 prep motions"]),
    warmupBlockEn: createBlock("Warm-up", ["8 stance checks", "12 prep motions"]),
    mainBlock: createBlock("Main work", ["10 slow-feeding rally balls", "Say the cue before every ball"]),
    mainBlockEn: createBlock("Main work", ["10 slow-feeding rally balls", "Say the cue before every ball"]),
    pressureBlock: createBlock("Pressure reps", ["Keep the same routine for 5 straight balls"]),
    pressureBlockEn: createBlock("Pressure reps", ["Keep the same routine for 5 straight balls"]),
    successCriteria: ["Finish 2 rounds without rushing"],
    successCriteriaEn: ["Finish 2 rounds without rushing"],
    intensity: "low",
    tempo: "slow"
  },
  {
    day: 3,
    focus: "Send the middle ball deeper",
    contentIds: [],
    drills: ["10 deep-target hits", "10 reset-and-recover reps"],
    duration: "20 minutes",
    goal: "Get depth first, then build consistency",
    goalEn: "Get depth first, then build consistency",
    warmupBlock: createBlock("Warm-up", ["10 wall swings", "10 reset steps"]),
    warmupBlockEn: createBlock("Warm-up", ["10 wall swings", "10 reset steps"]),
    mainBlock: createBlock("Main work", ["12 balls to the deep middle", "Focus on depth, not pace"]),
    mainBlockEn: createBlock("Main work", ["12 balls to the deep middle", "Focus on depth, not pace"]),
    pressureBlock: createBlock("Pressure reps", ["Only switch sides after 4 deep balls"]),
    pressureBlockEn: createBlock("Pressure reps", ["Only switch sides after 4 deep balls"]),
    successCriteria: ["Land at least 8 balls in the target depth zone"],
    successCriteriaEn: ["Land at least 8 balls in the target depth zone"],
    intensity: "medium",
    tempo: "controlled"
  },
  {
    day: 4,
    focus: "Say back the rhythm that worked today",
    contentIds: [],
    drills: ["5 minutes of video review", "Write 2 cues"],
    duration: "15 minutes",
    goal: "Turn one useful feel into a clear sentence",
    goalEn: "Turn one useful feel into a clear sentence",
    warmupBlock: createBlock("Warm-up", ["5 reset walks", "5 deep breaths"]),
    warmupBlockEn: createBlock("Warm-up", ["5 reset walks", "5 deep breaths"]),
    mainBlock: createBlock("Main work", ["Review 8 rally balls", "Write down the 2 most useful cues"]),
    mainBlockEn: createBlock("Main work", ["Review 8 rally balls", "Write down the 2 most useful cues"]),
    pressureBlock: createBlock("Pressure reps", ["Keep only 1 cue for tomorrow"]),
    pressureBlockEn: createBlock("Pressure reps", ["Keep only 1 cue for tomorrow"]),
    successCriteria: ["State the one cue that helped most today"],
    successCriteriaEn: ["State the one cue that helped most today"],
    intensity: "low",
    tempo: "slow"
  },
  {
    day: 5,
    focus: "Hold the same swing under light pressure",
    contentIds: [],
    drills: ["8 counted balls", "3 restart rounds"],
    duration: "20 minutes",
    goal: "Keep the motion unchanged when a score is attached",
    goalEn: "Keep the motion unchanged when a score is attached",
    warmupBlock: createBlock("Warm-up", ["8 shadow swings", "8 rhythm cue reps"]),
    warmupBlockEn: createBlock("Warm-up", ["8 shadow swings", "8 rhythm cue reps"]),
    mainBlock: createBlock("Main work", ["12 counted rally balls", "Check the breath before each ball"]),
    mainBlockEn: createBlock("Main work", ["12 counted rally balls", "Check the breath before each ball"]),
    pressureBlock: createBlock("Pressure reps", ["Complete 5 clean balls in 3 straight rounds"]),
    pressureBlockEn: createBlock("Pressure reps", ["Complete 5 clean balls in 3 straight rounds"]),
    successCriteria: ["Keep the same rhythm even with a rule attached"],
    successCriteriaEn: ["Keep the same rhythm even with a rule attached"],
    intensity: "medium",
    tempo: "controlled"
  },
  {
    day: 6,
    focus: "Link the pieces into one session",
    contentIds: [],
    drills: ["5-minute warm-up", "10-minute main block", "5-minute wrap-up"],
    duration: "20 minutes",
    goal: "Know how to build a complete practice session",
    goalEn: "Know how to build a complete practice session",
    warmupBlock: createBlock("Warm-up", ["3 minutes of easy movement", "5 dynamic stretches"]),
    warmupBlockEn: createBlock("Warm-up", ["3 minutes of easy movement", "5 dynamic stretches"]),
    mainBlock: createBlock("Main work", ["First 5 balls to the deep zone", "Last 5 balls for steady contact"]),
    mainBlockEn: createBlock("Main work", ["First 5 balls to the deep zone", "Last 5 balls for steady contact"]),
    pressureBlock: createBlock("Pressure reps", ["Repeat the same order for 2 rounds"]),
    pressureBlockEn: createBlock("Pressure reps", ["Repeat the same order for 2 rounds"]),
    successCriteria: ["Can build a full practice on your own"],
    successCriteriaEn: ["Can build a full practice on your own"],
    intensity: "medium",
    tempo: "controlled"
  },
  {
    day: 7,
    focus: "Keep the simplest next-week template",
    contentIds: [],
    drills: ["Review this week", "Pick 1 priority for next week"],
    duration: "20 minutes",
    goal: "Leave behind one repeatable training template",
    goalEn: "Leave behind one repeatable training template",
    warmupBlock: createBlock("Warm-up", ["Review notes for 5 minutes", "Organize your training notes"]),
    warmupBlockEn: createBlock("Warm-up", ["Review notes for 5 minutes", "Organize your training notes"]),
    mainBlock: createBlock("Main work", ["Review the 3 steadiest rallies", "Write the next week's priority"]),
    mainBlockEn: createBlock("Main work", ["Review the 3 steadiest rallies", "Write the next week's priority"]),
    pressureBlock: createBlock("Pressure reps", ["Keep only 1 rule to carry forward"]),
    pressureBlockEn: createBlock("Pressure reps", ["Keep only 1 rule to carry forward"]),
    successCriteria: ["Can explain the first session for next week"],
    successCriteriaEn: ["Can explain the first session for next week"],
    intensity: "low",
    tempo: "slow"
  }
];

function createDefaultDays(locale: PlanLocale): DayPlan[] {
  const prescriptions = locale === "en" ? FALLBACK_DAY_PRESCRIPTIONS_EN : FALLBACK_DAY_PRESCRIPTIONS_ZH;

  return prescriptions.map((day) => buildDayPlan(day, locale));
}

const allPlanContents = [...contents, ...expandedContents];
const curatedContentIds = new Set(contents.map((content) => content.id));
const planContentById = new Map(allPlanContents.map((content) => [content.id, content]));
const NON_DIRECT_PLAN_VIDEO_URL_PATTERNS = [
  /search\.bilibili\.com\/all\?keyword=/i,
  /youtube\.com\/results\?search_query=/i
];

function isDirectPlanVideo(item: ContentItem): boolean {
  if (item.type !== "video") {
    return false;
  }

  return !NON_DIRECT_PLAN_VIDEO_URL_PATTERNS.some((pattern) => pattern.test(item.url));
}

const directPlanContents = allPlanContents.filter(isDirectPlanVideo);
const directPlanContentIds = new Set(directPlanContents.map((content) => content.id));

const planDayKeywordSignals = [
  {
    matches: ["发球", "二发", "一发", "抛球", "serve", "second serve", "toss"],
    skills: ["serve"],
    problemTags: ["serve-basics", "serve-rhythm", "second-serve-reliability", "serve-toss-consistency", "serve-accuracy"]
  },
  {
    matches: ["正手", "上旋", "弧线", "forehand", "topspin", "arc", "depth"],
    skills: ["forehand", "topspin"],
    problemTags: ["forehand-out", "topspin-low", "balls-too-short", "forehand-no-power"]
  },
  {
    matches: ["反手", "切削", "backhand", "slice"],
    skills: ["backhand", "slice"],
    problemTags: ["backhand-into-net", "backhand-slice-floating", "late-contact", "incoming-slice-trouble"]
  },
  {
    matches: ["脚步", "移动", "准备", "启动", "footwork", "movement", "prepare", "split step"],
    skills: ["movement", "footwork"],
    problemTags: ["late-contact", "movement-slow", "slow-preparation"]
  },
  {
    matches: ["跑动正手", "移动中正手", "running forehand", "forehand on the run"],
    skills: ["movement", "footwork", "forehand"],
    problemTags: ["running-forehand", "movement-slow", "forehand-out"]
  },
  {
    matches: ["跑动反手", "移动中反手", "running backhand", "backhand on the run"],
    skills: ["movement", "footwork", "backhand"],
    problemTags: ["running-backhand", "movement-slow", "backhand-into-net"]
  },
  {
    matches: ["网前", "截击", "上网", "volley", "net"],
    skills: ["net"],
    problemTags: ["net-confidence", "volley-errors", "doubles-net-fear"]
  },
  {
    matches: ["冒高", "漂", "floating volley", "float the volley"],
    skills: ["net"],
    problemTags: ["volley-floating", "volley-errors", "net-confidence"]
  },
  {
    matches: ["下网", "压低", "through the volley", "volley into net"],
    skills: ["net"],
    problemTags: ["volley-into-net", "volley-errors", "net-confidence"]
  },
  {
    matches: ["高压", "smash", "overhead"],
    skills: ["net", "movement", "footwork"],
    problemTags: ["overhead-timing", "late-contact", "no-clear-technique"]
  },
  {
    matches: ["高球", "月亮球", "moonball", "lob"],
    skills: ["matchplay", "defense", "topspin"],
    problemTags: ["moonball-trouble", "cant-hit-lob", "balls-too-short"]
  },
  {
    matches: ["双打", "站位", "轮转", "搭档", "doubles", "positioning", "partner", "rotation"],
    skills: ["doubles"],
    problemTags: ["doubles-positioning", "doubles-net-fear"]
  },
  {
    matches: ["比赛", "紧张", "流程", "复盘", "match", "pressure", "routine", "review", "nerves"],
    skills: ["matchplay", "mental"],
    problemTags: ["match-anxiety", "cant-self-practice"]
  },
  {
    matches: ["手紧", "呼吸", "tightness", "breathe"],
    skills: ["mental", "matchplay"],
    problemTags: ["pressure-tightness", "match-anxiety"]
  },
  {
    matches: ["自练", "自己练", "记录", "self-practice", "solo", "track"],
    skills: ["training"],
    problemTags: ["cant-self-practice", "no-clear-technique", "plateau-no-progress"]
  },
  {
    matches: ["模版", "节奏", "basic template", "training template", "general improvement"],
    skills: ["training", "basics", "consistency"],
    problemTags: ["general-improvement", "cant-self-practice", "no-clear-technique"]
  }
] as const;

const ASSESSMENT_DIMENSION_PLAN_HINTS: Record<
  AssessmentDimension,
  { primaryProblemTag: string; relatedProblemTags: string[]; skills: string[] }
> = {
  basics: {
    primaryProblemTag: "cant-self-practice",
    relatedProblemTags: ["late-contact", "plateau-no-progress", "general-improvement"],
    skills: ["basics", "training", "forehand", "backhand"]
  },
  forehand: {
    primaryProblemTag: "forehand-out",
    relatedProblemTags: ["topspin-low", "forehand-no-power", "balls-too-short"],
    skills: ["forehand", "topspin"]
  },
  backhand: {
    primaryProblemTag: "backhand-into-net",
    relatedProblemTags: ["backhand-slice-floating", "late-contact", "incoming-slice-trouble"],
    skills: ["backhand", "slice"]
  },
  serve: {
    primaryProblemTag: "second-serve-reliability",
    relatedProblemTags: ["serve-toss-consistency", "serve-accuracy"],
    skills: ["serve"]
  },
  net: {
    primaryProblemTag: "net-confidence",
    relatedProblemTags: ["doubles-positioning"],
    skills: ["net", "doubles"]
  },
  movement: {
    primaryProblemTag: "late-contact",
    relatedProblemTags: ["movement-slow", "balls-too-short"],
    skills: ["movement", "footwork"]
  },
  matchplay: {
    primaryProblemTag: "match-anxiety",
    relatedProblemTags: ["plateau-no-progress", "cant-self-practice", "return-under-pressure"],
    skills: ["matchplay", "mental", "return"]
  },
  rally: {
    primaryProblemTag: "backhand-into-net",
    relatedProblemTags: ["forehand-out", "balls-too-short", "general-improvement"],
    skills: ["consistency", "forehand", "backhand"]
  },
  awareness: {
    primaryProblemTag: "match-anxiety",
    relatedProblemTags: ["cant-self-practice", "plateau-no-progress"],
    skills: ["matchplay", "mental", "training"]
  },
  fundamentals: {
    primaryProblemTag: "cant-self-practice",
    relatedProblemTags: ["late-contact", "general-improvement"],
    skills: ["basics", "grip", "forehand", "backhand"]
  },
  receiving: {
    primaryProblemTag: "late-contact",
    relatedProblemTags: ["return-under-pressure", "movement-slow", "backhand-into-net"],
    skills: ["return", "movement", "backhand", "footwork"]
  },
  consistency: {
    primaryProblemTag: "cant-self-practice",
    relatedProblemTags: ["plateau-no-progress", "balls-too-short", "general-improvement"],
    skills: ["consistency", "training", "basics"]
  },
  both_sides: {
    primaryProblemTag: "backhand-into-net",
    relatedProblemTags: ["forehand-out", "general-improvement"],
    skills: ["forehand", "backhand", "consistency"]
  },
  direction: {
    primaryProblemTag: "forehand-out",
    relatedProblemTags: ["balls-too-short", "general-improvement"],
    skills: ["forehand", "backhand", "training"]
  },
  rhythm: {
    primaryProblemTag: "late-contact",
    relatedProblemTags: ["movement-slow", "incoming-slice-trouble"],
    skills: ["movement", "footwork", "backhand"]
  },
  net_play: {
    primaryProblemTag: "net-confidence",
    relatedProblemTags: ["doubles-positioning"],
    skills: ["net", "doubles"]
  },
  depth_variety: {
    primaryProblemTag: "balls-too-short",
    relatedProblemTags: ["topspin-low", "forehand-no-power"],
    skills: ["forehand", "topspin", "training"]
  },
  forcing: {
    primaryProblemTag: "forehand-no-power",
    relatedProblemTags: ["forehand-out", "balls-too-short"],
    skills: ["forehand", "topspin", "matchplay"]
  },
  tactics: {
    primaryProblemTag: "match-anxiety",
    relatedProblemTags: ["doubles-positioning", "cant-self-practice"],
    skills: ["matchplay", "mental", "doubles"]
  },
  tactical_adaptability: {
    primaryProblemTag: "doubles-positioning",
    relatedProblemTags: ["match-anxiety", "cant-self-practice"],
    skills: ["matchplay", "mental", "doubles", "training"]
  },
  pressure_performance: {
    primaryProblemTag: "pressure-tightness",
    relatedProblemTags: ["match-anxiety", "return-under-pressure", "second-serve-reliability"],
    skills: ["matchplay", "mental", "serve", "return"]
  }
};

function toGenerated(template: PlanTemplate, locale: PlanLocale): GeneratedPlan {
  const isEn = locale === "en";

  return {
    source: "template",
    level: template.level,
    problemTag: template.problemTag,
    title: isEn ? template.titleEn : template.title,
    target: isEn ? template.targetEn : template.target,
    days: template.days.map<DayPlan>((day) => buildDayPlan(day, locale))
  };
}

function normalizePlanLevel(level: PlanLevel): PlanTemplate["level"] {
  if (level === "2.5") {
    return "3.0";
  }

  if (level === "4.5") {
    return "4.0";
  }

  return level;
}

function normalizePlanProblemTag(problemTag: string): string {
  return PLAN_TAG_ALIASES[problemTag] ?? problemTag;
}

function getPlanPoolSource(contentId: string): PlanPoolSource {
  return curatedContentIds.has(contentId) ? "curated" : "expanded";
}

function isDirectPlanContentId(contentId: string): boolean {
  return directPlanContentIds.has(contentId);
}

function isCuratedContent(item: ContentItem): boolean {
  return getPlanPoolSource(item.id) === "curated";
}

function uniqueStrings(values: string[]): string[] {
  return Array.from(new Set(values.filter(Boolean)));
}

function uniqueAssessmentDimensions(values: AssessmentDimension[]): AssessmentDimension[] {
  return Array.from(new Set(
    values.filter((value): value is AssessmentDimension => value in ASSESSMENT_DIMENSION_PLAN_HINTS)
  ));
}

function findAssessmentDimensionKey(label: string): AssessmentDimension | null {
  return (Object.keys(ASSESSMENT_DIMENSION_PLAN_HINTS) as AssessmentDimension[])
    .find((key) => getDimensionLabel(key, "zh") === label || getDimensionLabel(key, "en") === label) ?? null;
}

function getAssessmentDimensionsFromLabels(labels: string[]): AssessmentDimension[] {
  return uniqueAssessmentDimensions(
    labels
      .map((label) => findAssessmentDimensionKey(label))
      .filter((value): value is AssessmentDimension => Boolean(value))
  );
}

function buildDiagnosisContextHint(rawInput?: string): PlanDiagnosisContextHint {
  if (!rawInput?.trim()) {
    return { skills: [], problemTags: [], contentIds: [], terms: [] };
  }

  const normalized = rawInput.toLowerCase();
  const matchedSignals = PLAN_CONTEXT_SIGNAL_PATTERNS.filter(({ patterns }) =>
    patterns.some((pattern) => pattern.test(normalized))
  );
  const skills = uniqueStrings(
    matchedSignals.flatMap(({ skills: signalSkills }) => signalSkills)
  );
  const problemTags = uniqueStrings(
    matchedSignals.flatMap(({ problemTags: signalProblemTags }) => signalProblemTags)
  );
  const contentIds = uniqueStrings(
    matchedSignals.flatMap(({ contentIds: signalContentIds }) => signalContentIds)
  );
  const terms = uniqueStrings(
    matchedSignals.flatMap(({ terms: signalTerms }) => signalTerms)
  ).map((term) => term.toLowerCase());

  return { skills, problemTags, contentIds, terms };
}

function getPlanLookupProblemTags(problemTag: string): string[] {
  const canonicalProblemTag = normalizePlanProblemTag(problemTag);
  const compatibilityFallback = PLAN_COMPATIBILITY_FALLBACKS[canonicalProblemTag];

  return uniqueStrings([
    canonicalProblemTag,
    compatibilityFallback ?? ""
  ]);
}

function overlapCount(left: string[], right: string[]): number {
  if (left.length === 0 || right.length === 0) {
    return 0;
  }

  const rightSet = new Set(right);
  return left.reduce((count, value) => count + (rightSet.has(value) ? 1 : 0), 0);
}

function normalizeProblemTags(problemTags: string[]): string[] {
  const canonical = problemTags.flatMap((tag) => CONTENT_PROBLEM_TAG_ALIASES[tag] ?? []);
  return uniqueStrings([...problemTags, ...canonical]);
}

function getNormalizedContentProblemTags(content: ContentItem): string[] {
  return normalizeProblemTags(content.problemTags);
}

function getContentSearchText(content: ContentItem) {
  return [
    content.title,
    content.displayTitleEn,
    content.focusLineEn,
    content.summary,
    content.reason,
    ...content.useCases
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function getContextMismatchPenalty(content: ContentItem, desiredSkills: string[]) {
  const text = getContentSearchText(content);
  let penalty = 0;

  if (desiredSkills.includes("serve") && !desiredSkills.includes("return")) {
    if (content.skills.includes("return") && (text.includes("return") || text.includes("接发"))) {
      penalty += 10;
    }
  }

  if ((desiredSkills.includes("backhand") || desiredSkills.includes("forehand")) && !desiredSkills.includes("net")) {
    if (content.skills.includes("net") && (text.includes("volley") || text.includes("截击") || text.includes("网前"))) {
      penalty += 8;
    }
  }

  return penalty;
}

function compareContentPriority(
  left: RankedPlanContentCandidate,
  right: RankedPlanContentCandidate
) {
  if (right.score !== left.score) {
    return right.score - left.score;
  }

  const leftCurated = isCuratedContent(left.item);
  const rightCurated = isCuratedContent(right.item);
  if (leftCurated !== rightCurated) {
    return leftCurated ? -1 : 1;
  }

  const leftViews = left.item.viewCount ?? 0;
  const rightViews = right.item.viewCount ?? 0;
  if (rightViews !== leftViews) {
    return rightViews - leftViews;
  }

  return left.index - right.index;
}

function getLevelPreferenceScore(content: ContentItem, level: PlanLevel) {
  const normalizedLevel = normalizePlanLevel(level);
  const preferredLevels =
    level === "2.5"
      ? ["2.5", "3.0"]
      : level === "3.5"
        ? ["3.0", "3.5"]
        : level === "4.5"
          ? ["4.0", "4.5"]
          : [normalizedLevel, level];

  let score = 0;
  if (content.levels.includes(level)) {
    score += 5;
  }

  if (content.levels.includes(normalizedLevel)) {
    score += 4;
  }

  score += preferredLevels.reduce((sum, candidate) => sum + (content.levels.includes(candidate) ? 2 : 0), 0);
  return score;
}

function getRecommendedRuleContentIds(problemTag: string): string[] {
  return uniqueStrings(
    getPlanLookupProblemTags(problemTag).flatMap((lookupProblemTag) =>
      diagnosisRules
        .filter((rule) => rule.problemTag === lookupProblemTag)
        .flatMap((rule) => rule.recommendedContentIds)
    )
  );
}

function getTemplateSeedContentIds(problemTag: string, level: PlanLevel): string[] {
  const templateLevel = normalizePlanLevel(level);
  for (const lookupProblemTag of getPlanLookupProblemTags(problemTag)) {
    const template = planTemplates.find((item) => item.problemTag === lookupProblemTag && item.level === templateLevel)
      ?? planTemplates.find((item) => item.problemTag === lookupProblemTag);

    if (template) {
      return uniqueStrings(template.days.flatMap((day) => day.contentIds));
    }
  }

  return [];
}

function getDaySignals(day: DayPlan) {
  const items = day.contentIds
    .map((id) => planContentById.get(id))
    .filter((item): item is ContentItem => Boolean(item));
  const dayText = `${day.focus} ${day.drills.join(" ")}`.toLowerCase();
  const keywordSignals = planDayKeywordSignals.filter((entry) =>
    entry.matches.some((match) => dayText.includes(match.toLowerCase()))
  );
  const matchedTerms = uniqueStrings(
    keywordSignals.flatMap((entry) =>
      entry.matches
        .map((match) => match.toLowerCase())
        .filter((match) => dayText.includes(match))
    )
  );

  const seededSkills = uniqueStrings(items.flatMap((item) => item.skills));
  const seededProblemTags = uniqueStrings(items.flatMap((item) => item.problemTags));
  const keywordSkills = uniqueStrings(keywordSignals.flatMap((entry) => entry.skills));
  const keywordProblemTags = uniqueStrings(keywordSignals.flatMap((entry) => entry.problemTags));

  return {
    seededContentId: day.contentIds[0] ?? null,
    skills: seededSkills.length > 0 ? seededSkills : keywordSkills,
    problemTags: seededProblemTags.length > 0 ? seededProblemTags : keywordProblemTags,
    relatedSkills: uniqueStrings([...seededSkills, ...keywordSkills]),
    relatedProblemTags: uniqueStrings([...seededProblemTags, ...keywordProblemTags]),
    matchedTerms
  };
}

function scorePreferredContentForDay(
  content: ContentItem,
  day: DayPlan,
  problemTag: string,
  level: PlanLevel,
  reuseCount = 0
) {
  const signals = getDaySignals(day);
  const contentText = getContentSearchText(content);
  const contentProblemTags = getNormalizedContentProblemTags(content);
  const desiredSkills = uniqueStrings([...signals.skills, ...signals.relatedSkills]);
  let score = 0;

  const daySignalScore =
    overlapCount(content.skills, signals.skills) * 3 +
    overlapCount(contentProblemTags, signals.problemTags) * 4 +
    (content.id === signals.seededContentId ? 18 : 0) +
    (isCuratedContent(content) ? 1 : 0);

  score += daySignalScore;
  score += overlapCount(contentProblemTags, signals.relatedProblemTags) * 2;
  score += overlapCount(content.skills, signals.relatedSkills);
  score += overlapCount(content.skills, signals.skills) * 3;
  score += signals.matchedTerms.reduce((count, term) => count + (contentText.includes(term) ? 2 : 0), 0);

  if (contentProblemTags.includes(problemTag)) {
    score += 2;
  }

  score += getLevelPreferenceScore(content, level);
  score -= getContextMismatchPenalty(content, desiredSkills);

  const isReviewDay = signals.matchedTerms.some((term) => PLAN_DAY_REVIEW_TERMS.includes(term));
  if (reuseCount > 0) {
    score -= reuseCount * (isReviewDay ? 3 : 12);
  }

  return score;
}

function scoreContentForCandidatePool(input: {
  item: ContentItem;
  index: number;
  problemTag: string;
  level: PlanLevel;
  explicitContentIdSet: Set<string>;
  seedProblemTags: string[];
  seedSkills: string[];
  secondaryProblemTags: string[];
  secondarySkills: string[];
  contextProblemTags: string[];
  contextSkills: string[];
  contextTerms: string[];
  templateSeedContentIdSet: Set<string>;
}) {
  const {
    item,
    index,
    problemTag,
    level,
    explicitContentIdSet,
    seedProblemTags,
    seedSkills,
    secondaryProblemTags,
    secondarySkills,
    contextProblemTags,
    contextSkills,
    contextTerms,
    templateSeedContentIdSet
  } = input;

  let score = 0;
  const contentText = getContentSearchText(item);
  const contentProblemTags = getNormalizedContentProblemTags(item);

  if (explicitContentIdSet.has(item.id)) {
    score += 80;
  }

  if (templateSeedContentIdSet.has(item.id)) {
    score += 24;
  }

  if (contentProblemTags.includes(problemTag)) {
    score += 28;
  }

  score += overlapCount(contentProblemTags, seedProblemTags) * 12;
  score += overlapCount(item.skills, seedSkills) * 9;
  score += overlapCount(contentProblemTags, secondaryProblemTags) * 6;
  score += overlapCount(item.skills, secondarySkills) * 4;
  score += overlapCount(contentProblemTags, contextProblemTags) * 5;
  score += overlapCount(item.skills, contextSkills) * 3;
  score += contextTerms.reduce((sum, term) => sum + (contentText.includes(term) ? 2 : 0), 0);
  score += getLevelPreferenceScore(item, level);
  score -= getContextMismatchPenalty(item, seedSkills);

  return {
    item,
    index,
    score
  };
}

function getPlanCandidateTagSignature(content: ContentItem): string {
  return getNormalizedContentProblemTags(content)
    .slice()
    .sort()
    .join("|");
}

function selectPlanCandidatesWithDiversity(
  rankedCandidates: RankedPlanContentCandidate[],
  maxCandidates: number
): string[] {
  if (maxCandidates <= 0 || rankedCandidates.length === 0) {
    return [];
  }

  const selected: RankedPlanContentCandidate[] = [];
  const creatorUsage = new Map<string, number>();
  const tagSignatureUsage = new Map<string, number>();
  const remaining = [...rankedCandidates];

  while (selected.length < maxCandidates && remaining.length > 0) {
    let bestIndex = 0;
    let bestAdjustedScore = Number.NEGATIVE_INFINITY;

    for (let index = 0; index < remaining.length; index += 1) {
      const candidate = remaining[index];
      const creatorCount = creatorUsage.get(candidate.item.creatorId) ?? 0;
      const tagSignature = getPlanCandidateTagSignature(candidate.item);
      const signatureCount = tagSignatureUsage.get(tagSignature) ?? 0;
      const creatorPenalty = creatorCount * (isCuratedContent(candidate.item) ? 6 : 11);
      const signaturePenalty = signatureCount * 7;
      const adjustedScore = candidate.score - creatorPenalty - signaturePenalty;
      const bestCandidate = remaining[bestIndex];

      if (
        adjustedScore > bestAdjustedScore ||
        (adjustedScore === bestAdjustedScore && candidate.score > bestCandidate.score) ||
        (adjustedScore === bestAdjustedScore && candidate.score === bestCandidate.score && compareContentPriority(candidate, bestCandidate) < 0)
      ) {
        bestAdjustedScore = adjustedScore;
        bestIndex = index;
      }
    }

    const [picked] = remaining.splice(bestIndex, 1);
    selected.push(picked);

    creatorUsage.set(
      picked.item.creatorId,
      (creatorUsage.get(picked.item.creatorId) ?? 0) + 1
    );

    const pickedSignature = getPlanCandidateTagSignature(picked.item);
    tagSignatureUsage.set(
      pickedSignature,
      (tagSignatureUsage.get(pickedSignature) ?? 0) + 1
    );
  }

  return selected.map((entry) => entry.item.id);
}

function fillCandidatePoolIfNeeded(
  candidateIds: string[],
  level: PlanLevel,
  seedSkills: string[],
  seedProblemTags: string[]
) {
  if (candidateIds.length >= MIN_PLAN_CANDIDATES) {
    return candidateIds.slice(0, MAX_PLAN_CANDIDATES);
  }

  const existingIds = new Set(candidateIds);
  const backfill = directPlanContents
    .map((item, index): RankedPlanContentCandidate & { problemTagOverlap: number; skillOverlap: number } => {
      const normalizedProblemTags = getNormalizedContentProblemTags(item);
      const problemTagOverlap = overlapCount(normalizedProblemTags, seedProblemTags);
      const skillOverlap = overlapCount(item.skills, seedSkills);
      let score = 0;
      score += problemTagOverlap * 6;
      score += skillOverlap * 5;
      score += getLevelPreferenceScore(item, level);

      return { item, index, score, problemTagOverlap, skillOverlap };
    })
    .filter(({ item, score, problemTagOverlap, skillOverlap }) =>
      !existingIds.has(item.id) &&
      (
        problemTagOverlap > 0 ||
        (skillOverlap > 0 && score >= 10)
      )
    )
    .sort(compareContentPriority);

  const diversifiedBackfill = selectPlanCandidatesWithDiversity(backfill, MAX_PLAN_CANDIDATES);

  return uniqueStrings([...candidateIds, ...diversifiedBackfill]).slice(0, MAX_PLAN_CANDIDATES);
}

function getAssessmentDimensionKeySet(result: AssessmentResult): AssessmentDimension[] {
  const directKeys = result.dimensions.map((dimension) => dimension.key);
  const labelKeys = getAssessmentDimensionsFromLabels(result.observationNeeded);

  return uniqueStrings([...directKeys, ...labelKeys]) as AssessmentDimension[];
}

function getWeakestAssessmentDimension(result: AssessmentResult): DimensionSummary | null {
  const scored = result.dimensions.filter((dimension) => dimension.answeredCount > 0);

  if (scored.length === 0) {
    return null;
  }

  return [...scored].sort((left, right) => left.average - right.average || left.label.localeCompare(right.label))[0] ?? null;
}

function getAssessmentWeakDimensions(
  result: AssessmentResult,
  weakestKey: AssessmentDimension
): AssessmentDimension[] {
  const weaknessKeys = getAssessmentDimensionsFromLabels(result.weaknesses);

  return uniqueAssessmentDimensions([weakestKey, ...weaknessKeys]).slice(0, 2);
}

function getAssessmentObservationDimensions(
  result: AssessmentResult,
  weakDimensions: AssessmentDimension[]
): AssessmentDimension[] {
  const weakDimensionSet = new Set(weakDimensions);

  return getAssessmentDimensionsFromLabels(result.observationNeeded)
    .filter((dimension) => !weakDimensionSet.has(dimension))
    .slice(0, 2);
}

function encodeAssessmentPlanRationale(
  weakDimensions: AssessmentDimension[],
  observationDimensions: AssessmentDimension[]
): string | undefined {
  const parts = [
    weakDimensions.length > 0 ? `focus:${weakDimensions.join(",")}` : null,
    observationDimensions.length > 0 ? `observe:${observationDimensions.join(",")}` : null
  ].filter((value): value is string => Boolean(value));

  return parts.length > 0 ? parts.join(";") : undefined;
}

function joinAssessmentDimensionLabels(dimensions: AssessmentDimension[], locale: PlanLocale): string | null {
  if (dimensions.length === 0) {
    return null;
  }

  const labels = dimensions.map((dimension) => getDimensionLabel(dimension, locale));

  return locale === "en" ? labels.join(", ") : labels.join("、");
}

export function getAssessmentPlanFocusLine(
  planContext: PlanContext | null | undefined,
  locale: PlanLocale
): string | null {
  if (!planContext || planContext.source !== "assessment") {
    return null;
  }

  const weakLabels = joinAssessmentDimensionLabels(planContext.weakDimensions ?? [], locale);
  const observationLabels = joinAssessmentDimensionLabels(planContext.observationDimensions ?? [], locale);

  if (weakLabels && observationLabels) {
    return locale === "en"
      ? `Focus first: ${weakLabels}. Keep watching: ${observationLabels}.`
      : `优先补强：${weakLabels}。继续观察：${observationLabels}。`;
  }

  if (weakLabels) {
    return locale === "en" ? `Focus first: ${weakLabels}.` : `优先补强：${weakLabels}。`;
  }

  if (observationLabels) {
    return locale === "en" ? `Keep watching: ${observationLabels}.` : `继续观察：${observationLabels}。`;
  }

  return null;
}

export function getAssessmentPlanRationale(
  planContext: PlanContext | null | undefined,
  locale: PlanLocale
): string | null {
  if (!planContext || planContext.source !== "assessment") {
    return null;
  }

  const weakLabels = joinAssessmentDimensionLabels(planContext.weakDimensions ?? [], locale);
  const observationLabels = joinAssessmentDimensionLabels(planContext.observationDimensions ?? [], locale);

  if (weakLabels && observationLabels) {
    return locale === "en"
      ? `Assessment surfaced ${weakLabels} as the clearest weak point, while ${observationLabels} still needs observation, so this plan starts there.`
      : `评估里最明显的短板是${weakLabels}，而且${observationLabels}还需要继续观察，所以这周先从这里开始。`;
  }

  if (weakLabels) {
    return locale === "en"
      ? `Assessment surfaced ${weakLabels} as the clearest weak point, so this plan starts there.`
      : `评估里最明显的短板是${weakLabels}，所以这周先从这里开始。`;
  }

  if (observationLabels) {
    return locale === "en"
      ? `Assessment still needs more observation around ${observationLabels}, so the plan stays conservative.`
      : `${observationLabels}还需要继续观察，所以这周计划会先保持保守可执行。`;
  }

  return planContext.rationale?.trim() || null;
}

function buildDiagnosisOutcomePhrase(
  outcomePattern: PlanContextOutcome,
  locale: PlanLocale
): string | null {
  if (locale === "en") {
    if (outcomePattern === "net") return "the miss tends to go into the net";
    if (outcomePattern === "long") return "the miss tends to fly long";
    if (outcomePattern === "no_control") return "the ball tends to break down completely";
    if (outcomePattern === "weak") return "the reply tends to sit up short and weak";
    return null;
  }

  if (outcomePattern === "net") return "容易下网";
  if (outcomePattern === "long") return "容易出界";
  if (outcomePattern === "no_control") return "容易失控";
  if (outcomePattern === "weak") return "回球容易偏软偏浅";
  return null;
}

function buildDiagnosisFeelingPhrase(
  feelingModifiers: PlanContextFeeling[],
  locale: PlanLocale
): string | null {
  const primaryFeeling = feelingModifiers[0];

  if (locale === "en") {
    if (primaryFeeling === "tight") return "it feels tight";
    if (primaryFeeling === "nervous") return "it feels nervous";
    if (primaryFeeling === "rushed") return "it feels rushed";
    return null;
  }

  if (primaryFeeling === "tight") return "会发紧";
  if (primaryFeeling === "nervous") return "会紧张";
  if (primaryFeeling === "rushed") return "会着急";
  return null;
}

function buildDiagnosisScenePhrase(
  planContext: PlanContext,
  locale: PlanLocale
): string | null {
  if (locale === "en") {
    const parts: string[] = [];

    if (planContext.sessionType === "match" && planContext.pressureContext === "high") {
      parts.push("on key points in matches");
    } else if (planContext.sessionType === "match") {
      parts.push("in matches");
    } else if (planContext.sessionType === "practice") {
      parts.push("in practice");
    } else if (planContext.pressureContext === "high") {
      parts.push("under pressure");
    }

    if (planContext.movementContext === "moving") {
      parts.push("while moving");
    } else if (planContext.movementContext === "stationary") {
      parts.push("from a set position");
    }

    if (planContext.incomingBallDepth === "deep") {
      parts.push("against deeper incoming balls");
    }

    return parts.length > 0 ? parts.join(" ") : null;
  }

  const parts: string[] = [];

  if (planContext.sessionType === "match" && planContext.pressureContext === "high") {
    parts.push("关键分比赛里");
  } else if (planContext.sessionType === "match") {
    parts.push("比赛里");
  } else if (planContext.sessionType === "practice") {
    parts.push("练习里");
  } else if (planContext.pressureContext === "high") {
    parts.push("压力下");
  }

  if (planContext.movementContext === "moving") {
    parts.push("跑动中");
  } else if (planContext.movementContext === "stationary") {
    parts.push("原地执行时");
  }

  if (planContext.incomingBallDepth === "deep") {
    parts.push("面对更深来球时");
  }

  return parts.length > 0 ? parts.join("") : null;
}

function buildDiagnosisContextSnippet(
  planContext: PlanContext,
  locale: PlanLocale
): string | null {
  const scene = buildDiagnosisScenePhrase(planContext, locale);
  const outcome = buildDiagnosisOutcomePhrase(planContext.outcomePattern, locale);
  const feeling = buildDiagnosisFeelingPhrase(planContext.feelingModifiers, locale);

  if (locale === "en") {
    const detail = [outcome, feeling].filter((value): value is string => Boolean(value)).join(" and ");
    if (scene && detail) {
      return `${scene}, ${detail}`;
    }

    return scene ?? detail ?? null;
  }

  const detail = [outcome, feeling].filter((value): value is string => Boolean(value)).join("，");
  if (scene && detail) {
    return `${scene}${detail}`;
  }

  return scene ?? detail ?? null;
}

function buildDiagnosisPlanRationale(
  planContext: PlanContext | null | undefined,
  locale: PlanLocale,
  primaryNextStep?: string,
  deepContext?: EnrichedDiagnosisContext | null
): string | null {
  if (!planContext || planContext.source !== "diagnosis") {
    return null;
  }

  const normalizedPrimaryNextStep = normalizePrimaryNextStep(primaryNextStep);

  if (deepContext?.isDeepModeReady) {
    const sceneSummary = locale === "en" ? deepContext.sceneSummaryEn : deepContext.sceneSummaryZh;
    const sceneLabel = locale === "en"
      ? deepContext.pressureContext === "key_points" ? "Key-point scene" : "Deep diagnosis scene"
      : deepContext.pressureContext === "key_points" ? "关键分场景" : "深入诊断场景";

    if (normalizedPrimaryNextStep) {
      return locale === "en"
        ? `${sceneLabel}: ${sceneSummary} Start this week by stabilizing ${normalizedPrimaryNextStep}.`
        : `${sceneLabel}：${sceneSummary} 这周先把${normalizedPrimaryNextStep}练稳。`;
    }

    return locale === "en"
      ? `${sceneLabel}: ${sceneSummary}`
      : `${sceneLabel}：${sceneSummary}`;
  }

  const contextSnippet = buildDiagnosisContextSnippet(planContext, locale);

  if (contextSnippet && normalizedPrimaryNextStep) {
    return locale === "en"
      ? `Diagnosis points to the main leak ${contextSnippet}, so this week starts with ${normalizedPrimaryNextStep}.`
      : `诊断显示主要漏点出在${contextSnippet}，所以这周先把${normalizedPrimaryNextStep}练稳。`;
  }

  if (contextSnippet) {
    return locale === "en"
      ? `Diagnosis points to the main leak ${contextSnippet}, so the plan stays anchored to that scene.`
      : `诊断显示主要漏点出在${contextSnippet}，所以这周就按这个场景去练。`;
  }

  if (normalizedPrimaryNextStep) {
    return locale === "en"
      ? `Diagnosis has narrowed the week to one clear next step: ${normalizedPrimaryNextStep}.`
      : `诊断已经把本周收敛到一个明确主动作：${normalizedPrimaryNextStep}。`;
  }

  return null;
}

export function buildDiagnosisPlanCandidateIds(input: {
  problemTag: string;
  level: PlanLevel;
  recommendedContentIds?: string[];
  diagnosisInput?: string;
  maxCandidates?: number;
}): string[] {
  const normalizedProblemTag = normalizePlanProblemTag(input.problemTag);
  const lookupProblemTags = getPlanLookupProblemTags(input.problemTag);
  const contextHint = buildDiagnosisContextHint(input.diagnosisInput);
  const explicitContentIds = uniqueStrings([
    ...(input.recommendedContentIds ?? []),
    ...getRecommendedRuleContentIds(input.problemTag),
    ...contextHint.contentIds
  ]).filter(isDirectPlanContentId);
  const explicitItems = explicitContentIds
    .map((id) => planContentById.get(id))
    .filter((item): item is ContentItem => Boolean(item));
  const templateSeedContentIds = getTemplateSeedContentIds(input.problemTag, input.level);
  const templateSeedItems = templateSeedContentIds
    .map((id) => planContentById.get(id))
    .filter((item): item is ContentItem => Boolean(item));
  const seedProblemTags = uniqueStrings([
    normalizedProblemTag,
    ...lookupProblemTags,
    ...explicitItems.flatMap((item) => item.problemTags),
    ...templateSeedItems.flatMap((item) => item.problemTags),
    ...contextHint.problemTags
  ]);
  const seedSkills = uniqueStrings([
    ...explicitItems.flatMap((item) => item.skills),
    ...templateSeedItems.flatMap((item) => item.skills),
    ...contextHint.skills
  ]);
  const explicitContentIdSet = new Set(explicitContentIds);
  const templateSeedContentIdSet = new Set(templateSeedContentIds);

  const rankedCandidateIds = directPlanContents
    .map((item, index): RankedPlanContentCandidate =>
      scoreContentForCandidatePool({
        item,
        index,
        problemTag: normalizedProblemTag,
        level: input.level,
        explicitContentIdSet,
        seedProblemTags,
        seedSkills,
        secondaryProblemTags: [],
        secondarySkills: [],
        contextProblemTags: contextHint.problemTags,
        contextSkills: contextHint.skills,
        contextTerms: contextHint.terms,
        templateSeedContentIdSet
      })
    )
    .filter(({ item, score }) => score > 0 || explicitContentIdSet.has(item.id))
    .sort(compareContentPriority);

  const diversifiedRankedCandidateIds = selectPlanCandidatesWithDiversity(
    rankedCandidateIds,
    input.maxCandidates ?? MAX_PLAN_CANDIDATES
  );

  const orderedIds = uniqueStrings([
    ...explicitContentIds.filter((id) => isDirectPlanContentId(id)),
    ...templateSeedContentIds.filter((id) => isDirectPlanContentId(id)),
    ...diversifiedRankedCandidateIds
  ]);

  return fillCandidatePoolIfNeeded(
    orderedIds,
    input.level,
    seedSkills,
    seedProblemTags
  ).slice(0, input.maxCandidates ?? MAX_PLAN_CANDIDATES);
}

export function buildAssessmentPlanContext(result: AssessmentResult): {
  problemTag: string;
  candidateIds: string[];
  planContext: PlanContext;
} {
  const weakestDimension = getWeakestAssessmentDimension(result);
  const weakestKey = weakestDimension?.key ?? "basics";
  const primaryHint = ASSESSMENT_DIMENSION_PLAN_HINTS[weakestKey];
  const allDimensionKeys = getAssessmentDimensionKeySet(result);
  const secondaryKeys = allDimensionKeys.filter((key) => key !== weakestKey);
  const secondaryHints = secondaryKeys.map((key) => ASSESSMENT_DIMENSION_PLAN_HINTS[key]);
  const explicitContentIds = getRecommendedRuleContentIds(primaryHint.primaryProblemTag);
  const directExplicitContentIds = explicitContentIds.filter(isDirectPlanContentId);
  const templateSeedContentIds = getTemplateSeedContentIds(primaryHint.primaryProblemTag, result.level);
  const directTemplateSeedContentIds = templateSeedContentIds.filter(isDirectPlanContentId);
  const explicitItems = directExplicitContentIds
    .map((id) => planContentById.get(id))
    .filter((item): item is ContentItem => Boolean(item));
  const templateSeedItems = directTemplateSeedContentIds
    .map((id) => planContentById.get(id))
    .filter((item): item is ContentItem => Boolean(item));
  const secondaryProblemTags = uniqueStrings(
    secondaryHints.flatMap((hint) => [hint.primaryProblemTag, ...hint.relatedProblemTags])
  );
  const secondarySkills = uniqueStrings(secondaryHints.flatMap((hint) => hint.skills));
  const seedProblemTags = uniqueStrings([
    primaryHint.primaryProblemTag,
    ...primaryHint.relatedProblemTags,
    ...explicitItems.flatMap((item) => item.problemTags),
    ...templateSeedItems.flatMap((item) => item.problemTags),
    ...secondaryProblemTags
  ]);
  const seedSkills = uniqueStrings([
    ...primaryHint.skills,
    ...explicitItems.flatMap((item) => item.skills),
    ...templateSeedItems.flatMap((item) => item.skills),
    ...secondarySkills
  ]);
  const explicitContentIdSet = new Set(directExplicitContentIds);
  const templateSeedContentIdSet = new Set(directTemplateSeedContentIds);

  const rankedCandidateIds = directPlanContents
    .map((item, index): RankedPlanContentCandidate =>
      scoreContentForCandidatePool({
        item,
        index,
        problemTag: primaryHint.primaryProblemTag,
        level: result.level,
        explicitContentIdSet,
        seedProblemTags,
        seedSkills,
        secondaryProblemTags,
        secondarySkills,
        contextProblemTags: [],
        contextSkills: [],
        contextTerms: [],
        templateSeedContentIdSet
      })
    )
    .filter(({ item, score }) => score > 0 || explicitContentIdSet.has(item.id))
    .sort(compareContentPriority);

  const diversifiedRankedCandidateIds = selectPlanCandidatesWithDiversity(
    rankedCandidateIds,
    MAX_PLAN_CANDIDATES
  );

  const orderedIds = uniqueStrings([
    ...directExplicitContentIds,
    ...directTemplateSeedContentIds,
    ...diversifiedRankedCandidateIds
  ]);
  const weakDimensions = getAssessmentWeakDimensions(result, weakestKey);
  const observationDimensions = getAssessmentObservationDimensions(result, weakDimensions);

  return {
    problemTag: primaryHint.primaryProblemTag,
    candidateIds: fillCandidatePoolIfNeeded(
      orderedIds,
      result.level,
      seedSkills,
      seedProblemTags
    ),
    planContext: {
      source: "assessment",
      primaryProblemTag: primaryHint.primaryProblemTag,
      sessionType: "unknown",
      pressureContext: "unknown",
      movementContext: "unknown",
      incomingBallDepth: "unknown",
      outcomePattern: "unknown",
      feelingModifiers: [],
      weakDimensions,
      observationDimensions,
      rationale: encodeAssessmentPlanRationale(weakDimensions, observationDimensions)
    }
  };
}

function applyPreferredContentIds(
  plan: GeneratedPlan,
  level: PlanLevel,
  preferredContentIds: string[]
): GeneratedPlan {
  const preferredItems = uniqueStrings(preferredContentIds)
    .map((id) => planContentById.get(id))
    .filter((item): item is ContentItem => Boolean(item && isDirectPlanVideo(item)));

  if (preferredItems.length === 0) {
    return plan;
  }

  const usageCounts = new Map<string, number>();

  return {
    ...plan,
    days: plan.days.map((day) => {
      const daySignals = getDaySignals(day);
      const hasSpecificDayIntent =
        day.contentIds.length > 0 ||
        daySignals.problemTags.length > 0 ||
        daySignals.skills.length > 0 ||
        daySignals.matchedTerms.length > 0;
      const isReviewLikeDay = daySignals.matchedTerms.some((term) => PLAN_DAY_REVIEW_TERMS.includes(term));
      const rankedCandidates = preferredItems
        .map((item, index) => ({
          item,
          index,
          score: scorePreferredContentForDay(
            item,
            day,
            plan.problemTag,
            level,
            usageCounts.get(item.id) ?? 0
          )
        }))
        .filter((entry) => entry.score > 0)
        .sort(compareContentPriority);
      const rankedUnusedCandidates = rankedCandidates.filter((entry) => (usageCounts.get(entry.item.id) ?? 0) === 0);
      const bestOverallCandidate = rankedCandidates[0] ?? null;
      const bestUnusedCandidate = rankedUnusedCandidates[0] ?? null;
      const bestOverallReuseCount = bestOverallCandidate ? (usageCounts.get(bestOverallCandidate.item.id) ?? 0) : 0;
      const bestOverallMatchesSeed = bestOverallCandidate ? day.contentIds.includes(bestOverallCandidate.item.id) : false;
      const bestUnusedMatchesSeed = bestUnusedCandidate ? day.contentIds.includes(bestUnusedCandidate.item.id) : false;

      const assignedEntry = !bestOverallCandidate
        ? bestUnusedCandidate
        : !bestUnusedCandidate || bestOverallReuseCount === 0
          ? bestOverallCandidate
          : bestOverallMatchesSeed && !bestUnusedMatchesSeed
            ? bestOverallCandidate
          : (() => {
              const scoreGap = bestOverallCandidate.score - bestUnusedCandidate.score;
              const acceptableGap = !hasSpecificDayIntent ? 2 : isReviewLikeDay ? 3 : 3;
              const minimumUnusedScore = !hasSpecificDayIntent ? 12 : isReviewLikeDay ? 8 : 10;
              const shouldUseUnused =
                bestUnusedCandidate.score >= minimumUnusedScore &&
                scoreGap <= acceptableGap;

              return shouldUseUnused ? bestUnusedCandidate : bestOverallCandidate;
            })();
      const assignedContent = assignedEntry?.item ?? null;

      if (assignedContent) {
        usageCounts.set(assignedContent.id, (usageCounts.get(assignedContent.id) ?? 0) + 1);
      }

      const existingPreferredIds = preferredItems
        .filter((item) => day.contentIds.includes(item.id) && item.id !== assignedContent?.id)
        .map((item) => item.id);

      return {
        ...day,
        contentIds: uniqueStrings([
          ...(assignedContent ? [assignedContent.id] : []),
          ...existingPreferredIds,
          ...day.contentIds
        ])
      };
    })
  };
}

function sanitizePlanDayContentIds(plan: GeneratedPlan): GeneratedPlan {
  return {
    ...plan,
    days: plan.days.map((day) => ({
      ...day,
      contentIds: day.contentIds.filter(isDirectPlanContentId)
    }))
  };
}

function normalizePrimaryNextStep(primaryNextStep?: string | null): string | undefined {
  const normalized = primaryNextStep?.trim();
  return normalized && normalized.length > 0 ? normalized : undefined;
}

function buildPrimaryNextStepSuccessCriteria(primaryNextStep: string, locale: PlanLocale): string {
  return locale === "en"
    ? `Complete 2 steady rounds of this primary step: ${primaryNextStep}`
    : `能连续 2 轮稳定完成这条主动作：${primaryNextStep}`;
}

function applyPrimaryNextStepContext(
  plan: GeneratedPlan,
  locale: PlanLocale,
  primaryNextStep?: string
): GeneratedPlan {
  const normalizedPrimaryNextStep = normalizePrimaryNextStep(primaryNextStep);
  if (!normalizedPrimaryNextStep || plan.days.length === 0) {
    return plan;
  }

  const firstDay = plan.days[0];
  if (!firstDay) {
    return plan;
  }

  const firstDayWithPrimaryStep: DayPlan = {
    ...firstDay,
    focus: normalizedPrimaryNextStep,
    goal: normalizedPrimaryNextStep,
    successCriteria: uniqueStrings([
      buildPrimaryNextStepSuccessCriteria(normalizedPrimaryNextStep, locale),
      ...firstDay.successCriteria
    ])
  };

  return {
    ...plan,
    summary: locale === "en"
      ? `Primary focus this week: ${normalizedPrimaryNextStep}`
      : `本周先围绕这一个主动作推进：${normalizedPrimaryNextStep}`,
    days: [firstDayWithPrimaryStep, ...plan.days.slice(1)]
  };
}

function buildPlanContextSummary(planContext: PlanContext, locale: PlanLocale): string | null {
  const parts: string[] = [];

  if (locale === "en") {
    if (planContext.sessionType === "match" && planContext.pressureContext === "high") {
      parts.push("match-pressure context");
    } else if (planContext.sessionType === "match") {
      parts.push("match context");
    } else if (planContext.sessionType === "practice") {
      parts.push("practice context");
    }

    if (planContext.movementContext === "moving") {
      parts.push("while moving");
    } else if (planContext.movementContext === "stationary") {
      parts.push("from a set position");
    }

    if (planContext.incomingBallDepth === "deep") {
      parts.push("against deeper incoming balls");
    }
  } else {
    if (planContext.sessionType === "match" && planContext.pressureContext === "high") {
      parts.push("关键分比赛场景");
    } else if (planContext.sessionType === "match") {
      parts.push("比赛场景");
    } else if (planContext.sessionType === "practice") {
      parts.push("练习场景");
    }

    if (planContext.movementContext === "moving") {
      parts.push("跑动中");
    } else if (planContext.movementContext === "stationary") {
      parts.push("原地");
    }

    if (planContext.incomingBallDepth === "deep") {
      parts.push("深球条件下");
    }
  }

  return parts.length > 0 ? parts.join(locale === "en" ? ", " : "、") : null;
}

function buildPlanContextPressureItem(planContext: PlanContext, locale: PlanLocale): string | null {
  if (planContext.pressureContext === "high") {
    return locale === "en"
      ? "Put the final reps into a key-point routine instead of a neutral repetition."
      : "把最后一组放进关键分流程里做，不要只按中性重复来练。";
  }

  if (planContext.movementContext === "moving") {
    return locale === "en"
      ? "Start each rep from a moving base so the footwork demand stays real."
      : "每组都从移动中启动，保留真实的脚步压力。";
  }

  if (planContext.incomingBallDepth === "deep") {
    return locale === "en"
      ? "Keep the feed deeper so the practice matches the original scene."
      : "把喂球保持得更深，别把原来的场景条件练丢了。";
  }

  return null;
}

function applyPlanContext(
  plan: GeneratedPlan,
  locale: PlanLocale,
  planContext?: PlanContext | null,
  options: {
    primaryNextStep?: string;
    deepContext?: EnrichedDiagnosisContext | null;
  } = {}
): GeneratedPlan {
  const normalizedPlanContext = normalizePlanContext(planContext);
  if (!normalizedPlanContext || plan.days.length === 0) {
    return plan;
  }

  const summaryContext = buildPlanContextSummary(normalizedPlanContext, locale);
  const assessmentRationale = getAssessmentPlanRationale(normalizedPlanContext, locale);
  const diagnosisRationale = buildDiagnosisPlanRationale(
    normalizedPlanContext,
    locale,
    options.primaryNextStep,
    options.deepContext
  );
  const pressureItem = buildPlanContextPressureItem(normalizedPlanContext, locale);
  const firstDay = plan.days[0];
  const summary = assessmentRationale
    ? summaryContext
      ? locale === "en"
        ? `${assessmentRationale} Context: ${summaryContext}.`
        : `${assessmentRationale} 当前场景：${summaryContext}。`
      : assessmentRationale
    : diagnosisRationale
      ? diagnosisRationale
    : summaryContext
      ? locale === "en"
        ? `${plan.summary ?? "This week's plan follows one main focus."} Context: ${summaryContext}.`
        : `${plan.summary ?? "本周计划围绕一个主动作推进。"} 当前场景：${summaryContext}。`
      : plan.summary;

  return {
    ...plan,
    summary,
    target: summaryContext
      ? locale === "en"
        ? `${plan.target} Keep the work anchored to ${summaryContext}.`
        : `${plan.target} 训练时始终按${summaryContext}来执行。`
      : plan.target,
    days: firstDay ? [{
      ...firstDay,
      pressureBlock: pressureItem
        ? {
            ...firstDay.pressureBlock,
            items: uniqueStrings([pressureItem, ...firstDay.pressureBlock.items])
          }
        : firstDay.pressureBlock
    }, ...plan.days.slice(1)] : plan.days
  };
}

function getPlanMicrocycleRole(day: number): PlanMicrocycleRole | null {
  return PLAN_MICROCYCLE_ROLES.find((entry) => entry.day === day)?.role ?? null;
}

function buildRoleDrivenGoal(
  role: PlanMicrocycleRole,
  locale: PlanLocale,
  dayGoal: string,
  planContext: PlanContext | null
): string {
  if (locale === "en") {
    if (role === "review_reset") return `Use today as a review and reset day: ${dayGoal}`;
    if (role === "pressure_repetition") return `Put the motion under pressure repetition today: ${dayGoal}`;
    if (role === "transfer") {
      return planContext?.sessionType === "match"
        ? `Transfer the motion into a match-like scene today: ${dayGoal}`
        : `Transfer the motion into a more realistic scene today: ${dayGoal}`;
    }
    if (role === "consolidation") return `Use today to consolidate the week's main pattern: ${dayGoal}`;
    return dayGoal;
  }

  if (role === "review_reset") return `今天做复盘重置：${dayGoal}`;
  if (role === "pressure_repetition") return `今天把动作放进压力重复里：${dayGoal}`;
  if (role === "transfer") {
    return planContext?.sessionType === "match"
      ? `今天把动作转移到更接近比赛的场景里：${dayGoal}`
      : `今天把动作转移到更真实的场景里：${dayGoal}`;
  }
  if (role === "consolidation") return `今天做整周巩固收口：${dayGoal}`;
  return dayGoal;
}

function buildRoleDrivenPressureItems(
  role: PlanMicrocycleRole,
  locale: PlanLocale,
  planContext: PlanContext | null
): string[] {
  if (locale === "en") {
    if (role === "pressure_repetition" && planContext?.pressureContext === "high") {
      return ["Turn this block into a key-point routine instead of a neutral repetition."];
    }
    if (role === "transfer" && planContext?.incomingBallDepth === "deep") {
      return ["Keep the feed deeper so the transfer block still matches the original scene."];
    }
    if (role === "consolidation" && planContext?.pressureContext === "high") {
      return ["Finish with one match-like key-point sequence before ending the session."];
    }
    return [];
  }

  if (role === "pressure_repetition" && planContext?.pressureContext === "high") {
    return ["把这一组改成关键分流程，不要只做中性重复。"];
  }
  if (role === "transfer" && planContext?.incomingBallDepth === "deep") {
    return ["转移练习时把喂球保持得更深，不要把原场景练丢。"];
  }
  if (role === "consolidation" && planContext?.pressureContext === "high") {
    return ["结束前做一组关键分式的比赛化收口。"];
  }
  return [];
}

function buildRoleDrivenSuccessCriteria(
  role: PlanMicrocycleRole,
  locale: PlanLocale,
  planContext: PlanContext | null
): string[] {
  if (locale === "en") {
    if (role === "consolidation" && planContext?.pressureContext === "high") {
      return ["Keep the same routine even on key-point reps at the end of the week."];
    }
    if (role === "transfer" && planContext?.sessionType === "match") {
      return ["The motion should still hold once the drill feels closer to match play."];
    }
    return [];
  }

  if (role === "consolidation" && planContext?.pressureContext === "high") {
    return ["到本周最后，关键分里也要维持同一套动作流程。"];
  }
  if (role === "transfer" && planContext?.sessionType === "match") {
    return ["转到更接近比赛的练习里，动作也不能散。"];
  }
  return [];
}

function applyPlanMicrocycle(
  plan: GeneratedPlan,
  locale: PlanLocale,
  planContext?: PlanContext | null
): GeneratedPlan {
  const normalizedPlanContext = normalizePlanContext(planContext);

  return {
    ...plan,
    days: plan.days.map((day) => {
      const role = getPlanMicrocycleRole(day.day);
      if (!role) {
        return day;
      }

      const extraPressureItems = buildRoleDrivenPressureItems(role, locale, normalizedPlanContext);
      const extraSuccessCriteria = buildRoleDrivenSuccessCriteria(role, locale, normalizedPlanContext);

      return {
        ...day,
        goal: buildRoleDrivenGoal(role, locale, day.goal, normalizedPlanContext),
        pressureBlock: extraPressureItems.length > 0
          ? {
              ...day.pressureBlock,
              items: uniqueStrings([...extraPressureItems, ...day.pressureBlock.items])
            }
          : day.pressureBlock,
        successCriteria: extraSuccessCriteria.length > 0
          ? uniqueStrings([...extraSuccessCriteria, ...day.successCriteria])
          : day.successCriteria
      };
    })
  };
}

export function encodePlanContentIds(contentIds: string[]): string | null {
  const normalized = uniqueStrings(contentIds.map((value) => value.trim()));
  return normalized.length > 0 ? normalized.join(",") : null;
}

export function parsePlanContentIds(raw: string | null | undefined): string[] {
  if (!raw) {
    return [];
  }

  return uniqueStrings(raw.split(",").map((value) => value.trim()));
}

export type PlanDraftSnapshot = {
  problemTag: string;
  level: PlanLevel;
  preferredContentIds: string[];
  sourceType: SavedPlanSource;
  primaryNextStep?: string;
  planContext?: PlanContext;
  deepContext?: EnrichedDiagnosisContext;
  updatedAt: string;
};

function uniquePlanContextFeelings(values: PlanContextFeeling[]): PlanContextFeeling[] {
  return Array.from(new Set(values));
}

function normalizePlanContextSessionType(value?: string | null): PlanContextSessionType {
  return value === "match" || value === "practice" ? value : "unknown";
}

function normalizePlanContextPressure(value?: string | null): PlanContextPressure {
  return value === "high" || value === "some" ? value : "unknown";
}

function normalizePlanContextMovement(value?: string | null): PlanContextMovement {
  return value === "moving" || value === "stationary" ? value : "unknown";
}

function normalizePlanContextDepth(value?: string | null): PlanContextDepth {
  return value === "deep" ? value : "unknown";
}

function normalizePlanContextOutcome(value?: string | null): PlanContextOutcome {
  return value === "net" || value === "long" || value === "no_control" || value === "weak" ? value : "unknown";
}

function normalizePlanContextFeeling(value: string): PlanContextFeeling | null {
  if (value === "tight" || value === "nervous" || value === "rushed") {
    return value;
  }

  return null;
}

export function normalizePlanContext(context: Partial<PlanContext> | null | undefined): PlanContext | null {
  if (!context) {
    return null;
  }

  const primaryProblemTag = context.primaryProblemTag?.trim();
  if (!primaryProblemTag) {
    return null;
  }

  const normalizedWeakDimensions = uniqueAssessmentDimensions(context.weakDimensions ?? []);
  const normalizedObservationDimensions = uniqueAssessmentDimensions(context.observationDimensions ?? []);
  const isAssessmentContext = context.source === "assessment";
  const hasExplicitWeakDimensions = Array.isArray(context.weakDimensions);
  const hasExplicitObservationDimensions = Array.isArray(context.observationDimensions);

  return {
    source: isAssessmentContext ? "assessment" : "diagnosis",
    primaryProblemTag,
    sessionType: normalizePlanContextSessionType(context.sessionType),
    pressureContext: normalizePlanContextPressure(context.pressureContext),
    movementContext: normalizePlanContextMovement(context.movementContext),
    incomingBallDepth: normalizePlanContextDepth(context.incomingBallDepth),
    outcomePattern: normalizePlanContextOutcome(context.outcomePattern),
    feelingModifiers: uniquePlanContextFeelings(
      (context.feelingModifiers ?? [])
        .map((value) => normalizePlanContextFeeling(String(value)))
        .filter((value): value is PlanContextFeeling => Boolean(value))
    ),
    ...((isAssessmentContext || hasExplicitWeakDimensions)
      ? { weakDimensions: normalizedWeakDimensions }
      : {}),
    ...((isAssessmentContext || hasExplicitObservationDimensions)
      ? { observationDimensions: normalizedObservationDimensions }
      : {}),
    ...(typeof context.rationale === "string" && context.rationale.trim().length > 0
      ? { rationale: context.rationale.trim() }
      : {})
  };
}

export function parsePlanContext(raw: string | null | undefined): PlanContext | null {
  if (!raw) {
    return null;
  }

  try {
    return normalizePlanContext(JSON.parse(raw) as Partial<PlanContext>);
  } catch {
    return null;
  }
}

function encodePlanContext(planContext?: PlanContext | null): string | null {
  const normalized = normalizePlanContext(planContext);
  return normalized ? JSON.stringify(normalized) : null;
}

export function buildDiagnosisPlanContext(input: {
  problemTag: string;
  diagnosisInput?: string;
  primaryNextStep?: string;
}): PlanContext {
  const normalized = `${input.diagnosisInput ?? ""} ${input.primaryNextStep ?? ""}`.toLowerCase();
  const feelingModifiers = uniquePlanContextFeelings([
    /(?:发紧|手紧|tight)/i.test(normalized) ? "tight" : null,
    /(?:紧张|nervous)/i.test(normalized) ? "nervous" : null,
    /(?:着急|rushed)/i.test(normalized) ? "rushed" : null
  ].filter((value): value is PlanContextFeeling => Boolean(value)));

  return {
    source: "diagnosis",
    primaryProblemTag: normalizePlanProblemTag(input.problemTag),
    sessionType: /(?:比赛|关键分|match|matches|key point|key points|under pressure)/i.test(normalized) ? "match" : /(?:练习|practice)/i.test(normalized) ? "practice" : "unknown",
    pressureContext: /(?:关键分|关键球|pressure|big point|key point|key points)/i.test(normalized) ? "high" : feelingModifiers.length > 0 ? "some" : "unknown",
    movementContext: /(?:跑动中|移动中|running|on the run|while moving)/i.test(normalized) ? "moving" : /(?:原地|stationary|when set|set position)/i.test(normalized) ? "stationary" : "unknown",
    incomingBallDepth: /(?:深球|球比较深|deeper balls|deep balls|incoming ball is deeper)/i.test(normalized) ? "deep" : "unknown",
    outcomePattern: /(?:下网|into the net)/i.test(normalized) ? "net" : /(?:出界|flying long|goes long)/i.test(normalized) ? "long" : /(?:双误|double fault|double-fault)/i.test(normalized) ? "no_control" : /(?:冒高|float|偏软|weak)/i.test(normalized) ? "weak" : "unknown",
    feelingModifiers
  };
}

function normalizePlanDraftSourceType(sourceType?: string | null): SavedPlanSource {
  if (sourceType === "diagnosis" || sourceType === "assessment" || sourceType === "default") {
    return sourceType;
  }

  return "default";
}

function normalizePlanDraftLevel(level?: string | null): PlanLevel {
  if (level === "2.5" || level === "3.0" || level === "3.5" || level === "4.0" || level === "4.5") {
    return level;
  }

  return "3.0";
}

export function normalizePlanDraftSnapshot(
  draft: Partial<PlanDraftSnapshot> | null | undefined
): PlanDraftSnapshot | null {
  if (!draft) {
    return null;
  }

  const problemTag = draft.problemTag?.trim();
  if (!problemTag || problemTag === "no-plan") {
    return null;
  }

  const preferredContentIds = uniqueStrings((draft.preferredContentIds ?? []).map((value) => value.trim()));
  const primaryNextStep = normalizePrimaryNextStep(draft.primaryNextStep);
  const normalizedDeepContext = draft.deepContext
    ? parseEnrichedDiagnosisContext(encodeEnrichedDiagnosisContext(draft.deepContext)) ?? undefined
    : undefined;
  const normalizedPlanContext = normalizedDeepContext
    ? buildPlanContextFromEnrichedContext(normalizedDeepContext) ?? normalizePlanContext(draft.planContext) ?? undefined
    : normalizePlanContext(draft.planContext) ?? undefined;

  return {
    problemTag,
    level: normalizePlanDraftLevel(draft.level),
    preferredContentIds,
    sourceType: normalizePlanDraftSourceType(draft.sourceType),
    ...(primaryNextStep ? { primaryNextStep } : {}),
    ...(normalizedPlanContext ? { planContext: normalizedPlanContext } : {}),
    ...(normalizedDeepContext ? { deepContext: normalizedDeepContext } : {}),
    updatedAt: typeof draft.updatedAt === "string" && draft.updatedAt.trim().length > 0
      ? draft.updatedAt
      : new Date().toISOString()
  };
}

export function buildPlanHref(input: {
  problemTag?: string;
  level?: PlanLevel;
  preferredContentIds?: string[];
  sourceType?: SavedPlanSource;
  primaryNextStep?: string;
  planContext?: PlanContext;
  deepContext?: EnrichedDiagnosisContext;
}): string {
  const params = new URLSearchParams();
  const resolvedPlanContext = input.deepContext
    ? buildPlanContextFromEnrichedContext(input.deepContext) ?? input.planContext
    : input.planContext;

  if (input.problemTag) {
    params.set("problemTag", input.problemTag);
  }

  if (input.level) {
    params.set("level", input.level);
  }

  if (input.sourceType) {
    params.set("source", input.sourceType);
  }

  const contentIds = encodePlanContentIds(input.preferredContentIds ?? []);
  if (contentIds) {
    params.set("contentIds", contentIds);
  }

  const primaryNextStep = normalizePrimaryNextStep(input.primaryNextStep);
  if (primaryNextStep) {
    params.set("primaryNextStep", primaryNextStep);
  }

  const planContext = encodePlanContext(resolvedPlanContext);
  if (planContext) {
    params.set("planContext", planContext);
  }

  const deepContext = encodeEnrichedDiagnosisContext(input.deepContext);
  if (deepContext) {
    params.set("deepContext", deepContext);
  }

  const query = params.toString();
  return query ? `/plan?${query}` : "/plan";
}

function buildDeepServeDayOverlay(
  locale: PlanLocale,
  day: DayPlan,
  context: EnrichedDiagnosisContext,
  role: "baseline" | "stabilize" | "variable" | "timing" | "pressure" | "transfer" | "consolidate"
): DayPlan {
  const serveLabel = context.serveSubtype === "second_serve"
    ? (locale === "en" ? "second serve" : "二发")
    : (locale === "en" ? "serve" : "发球");
  const pressureLead = context.pressureContext === "key_points"
    ? (locale === "en" ? "under key-point pressure" : "关键分压力下")
    : (locale === "en" ? "in match situations" : "比赛场景里");
  const pressureCue = context.pressureContext === "key_points"
    ? (locale === "en" ? "key-point scoreboard pressure" : "关键分比分压力")
    : (locale === "en" ? "match pressure" : "比赛压力");
  const outcomeLabel = context.outcome === "net"
    ? (locale === "en" ? "into the net" : "下网")
    : context.outcome === "long"
      ? (locale === "en" ? "long" : "出界")
      : context.outcome === "double_fault"
        ? (locale === "en" ? "double fault" : "双误")
        : (locale === "en" ? "break down" : "失误");
  const outcomeRecovery = context.outcome === "net"
    ? (locale === "en" ? "higher net-clearance margin" : "更高的过网裕度")
    : context.outcome === "long"
      ? (locale === "en" ? "safer length control" : "更稳的长度控制")
      : context.outcome === "double_fault"
        ? (locale === "en" ? "playable second-serve window" : "可用的二发安全窗口")
        : (locale === "en" ? "safer contact window" : "更安全的击球窗口");
  const feelingLabel = context.subjectiveFeeling === "tight"
    ? (locale === "en" ? "tight" : "发紧")
    : context.subjectiveFeeling === "rushed"
      ? (locale === "en" ? "rushed" : "着急")
      : context.subjectiveFeeling === "low_confidence"
        ? (locale === "en" ? "low confidence" : "没把握")
        : (locale === "en" ? "calm" : "稳定");
  const transferLabel = locale === "en"
    ? `${serveLabel} into the next ball`
    : `${serveLabel}带到下一拍`;
  const blueprints = locale === "en"
    ? {
      baseline: {
        focus: `Baseline shape for the ${serveLabel}`,
        goal: `Build the baseline ${serveLabel} pattern before adding pressure.`,
        warmup: ["6 calm exhales before each shadow serve", "10 slow shadow serves with full finish"],
        main: ["12 serves with visible net clearance", "Track toss height and finish on every rep"],
        pressure: ["Restart the set if 2 balls miss the safe window", `Say "shape first" before each ${serveLabel}`],
        success: ["8 of 10 reps clear the net safely", "Tempo stays calm from start to finish"],
        intensity: "low" as const,
        tempo: "slow" as const
      },
      stabilize: {
        focus: `Stabilize the ${serveLabel} under clearer constraints`,
        goal: `Stabilize the ${serveLabel} with one repeatable toss and tempo rule.`,
        warmup: ["5 toss-and-freeze reps", "5 shadow serves matching the same rhythm"],
        main: ["10 serve reps to one body target", "10 serve reps to one backhand target"],
        pressure: ["Only count reps that keep the same rhythm", "Reset after any rushed toss"],
        success: ["Two consecutive 5-ball sets stay on tempo", "Contact point stays consistent"],
        intensity: "low" as const,
        tempo: "controlled" as const
      },
      variable: {
        focus: `Add the key scene variable back into the ${serveLabel}`,
        goal: `Reintroduce the original scene variable without losing the safer ${serveLabel} pattern.`,
        warmup: ["3 reset breaths", "6 shadow serves with the scene cue"],
        main: [`8 reps with the original scene cue: ${pressureLead}`, "8 reps to the same safe target after the cue"],
        pressure: ["Alternate calm rep / cue rep", "Stop if contact shape breaks twice in a row"],
        success: ["Scene cue no longer changes the basic serve shape", "Safe window stays visible"],
        intensity: "medium" as const,
        tempo: "controlled" as const
      },
      timing: {
        focus: `Add timing and variability to the ${serveLabel}`,
        goal: `Keep the ${serveLabel} stable while timing changes slightly from rep to rep.`,
        warmup: ["5 toss rhythm switches", "5 serve-prep pauses with the same finish"],
        main: ["Short pause / normal pause alternating reps", "Serve after one bounce, then after two bounces"],
        pressure: ["Call the timing pattern before each rep", "Repeat any rep that feels rushed"],
        success: ["Timing changes do not push the ball into the net", "Serve finish still looks the same"],
        intensity: "medium" as const,
        tempo: "controlled" as const
      },
      pressure: {
        focus: `Pressure-proof the ${serveLabel}`,
        goal: `Hold the ${serveLabel} shape when score pressure is layered back in.`,
        warmup: ["5 scoreboard breaths", "5 shadow serves starting from 30-40"],
        main: ["Play 8 service points starting from 30-40", "Use only the safer serve target"],
        pressure: ["Two-miss penalty restarts the score sequence", "Say the carry cue before each point"],
        success: ["Score pressure does not speed up the motion", "At least 6 of 8 points start with a playable serve"],
        intensity: "medium_high" as const,
        tempo: "match_70" as const
      },
      transfer: {
        focus: `Transfer the ${serveLabel} into a realistic point fragment`,
        goal: `Use the rebuilt ${serveLabel} inside a short serve-plus-one sequence.`,
        warmup: ["4 serve + first ball shadow patterns", "4 calm restarts after the first shot"],
        main: ["Serve, recover, then play one controlled next ball", "Repeat from deuce and ad sides"],
        pressure: ["Only count sequences that begin with the same safe serve window", "Reset if the first serve changes shape"],
        success: ["Serve quality holds into the next-ball sequence", "Recovery does not break the serve cue"],
        intensity: "medium_high" as const,
        tempo: "match_70" as const
      },
      consolidate: {
        focus: `Consolidate and evaluate the ${serveLabel}`,
        goal: `Consolidate the rebuilt ${serveLabel}, evaluate it, and define one carry-forward rule for next week.`,
        warmup: ["5 calm shadow serves", "5 serves with the carry-forward cue"],
        main: ["10 scored serves to the safe target", "10 scored serves under the original pressure cue"],
        pressure: ["Write one cue after every 5-ball block", "Finish with one best-of-3 pressure block"],
        success: ["You can state one carry-forward rule clearly", "The final pressure block still keeps the safer serve shape"],
        intensity: "medium" as const,
        tempo: "match_70" as const
      }
    }
    : {
      baseline: {
        focus: `${serveLabel}基线动作`,
        goal: `基线日：先把${serveLabel}的基线动作做干净，再往后加压力。`,
        warmup: ["每次影子发球前先做 6 次缓慢呼气", "10 次完整收拍的慢节奏影子发球"],
        main: [`12 次带${outcomeRecovery}的${serveLabel}`, "每一拍都记录抛球高度和收拍是否完整"],
        pressure: ["连续 2 球再出现同样失误就整组重来", `每次${serveLabel}前先说一遍“先形状，再别${outcomeLabel}”`],
        success: [`10 球里至少 8 球不再直接${outcomeLabel}`, "整组节奏从头到尾保持平稳"],
        intensity: "low" as const,
        tempo: "slow" as const
      },
      stabilize: {
        focus: `${serveLabel}稳定化`,
        goal: `稳定日：用一个固定抛球和节奏规则把${serveLabel}稳定下来。`,
        warmup: ["5 次抛球后停住观察", "5 次同节奏影子发球"],
        main: [`10 次只发一个安全目标的${serveLabel}`, `10 次只看${serveLabel}节奏是否一致`],
        pressure: ["只有连续节奏一致的球才算数", `任何一次明显${feelingLabel}都立刻重置`],
        success: ["连续两组 5 球都保持同一节奏", "击球点位置保持稳定"],
        intensity: "low" as const,
        tempo: "controlled" as const
      },
      variable: {
        focus: `${serveLabel}加入关键场景变量`,
        goal: `关键场景变量日：把原始场景变量加回来，但不丢掉更安全的${serveLabel}形状。`,
        warmup: ["3 次重置呼吸", "6 次带场景提示的影子发球"],
        main: [`8 次带原始场景提示的发球：${pressureLead}`, `8 次把${pressureCue}重新叠回${serveLabel}`],
        pressure: ["一球普通节奏、一球关键分节奏交替", "连续两次形状走掉就停下重来"],
        success: ["关键场景变量不再破坏发球基本形状", "安全窗口仍然看得见"],
        intensity: "medium" as const,
        tempo: "controlled" as const
      },
      timing: {
        focus: `${serveLabel}加入节奏与变化`,
        goal: `节奏变化日：在轻微节奏变化下，仍然保持${serveLabel}的稳定。`,
        warmup: ["5 次不同抛球节奏切换", "5 次不同停顿长度但同样收拍的准备动作"],
        main: ["一拍短停顿、一拍正常停顿交替发球", `任何一次开始${feelingLabel}时都回到同一个发球节奏`],
        pressure: ["每次发球前先报出本拍节奏", `任何一次明显${feelingLabel}都要重做`],
        success: [`节奏变化不再直接把球打成${outcomeLabel}`, "收拍和身体平衡保持一致"],
        intensity: "medium" as const,
        tempo: "controlled" as const
      },
      pressure: {
        focus: `${serveLabel}抗压`,
        goal: `压力日：把比分压力重新叠回来后，仍然守住${serveLabel}形状。`,
        warmup: ["5 次带比分提示的呼吸", "5 次从 30-40 开始的影子发球"],
        main: [`从 30-40 开始打 8 个发球分，把${pressureCue}叠回${serveLabel}`, "只允许使用同一个安全目标"],
        pressure: ["两次失去安全窗口就整组重来", `每一分前先说出带入提示，把${pressureCue}叫出来`],
        success: ["比分压力不再明显加快动作", "8 分里至少 6 分能先用可打的发球开分"],
        intensity: "medium_high" as const,
        tempo: "match_70" as const
      },
      transfer: {
        focus: `${serveLabel}带入真实片段`,
        goal: `得分片段日：把重建后的${serveLabel}带进短的发球加一拍片段里。`,
        warmup: ["4 次发球加一拍的影子流程", "4 次第一拍后的冷静重置"],
        main: [`发球、回位，再打一拍可控的下一板，让${transferLabel}完整出现`, "平分区和占先区都各自重复"],
        pressure: [`只有能把${serveLabel}稳稳带进下一拍的片段才计数`, "一旦第一拍动作走样就立刻重来"],
        success: [`${serveLabel}质量能带进下一拍片段`, "回位不会破坏发球提示"],
        intensity: "medium_high" as const,
        tempo: "match_70" as const
      },
      consolidate: {
        focus: `${serveLabel}巩固与评估`,
        goal: `带入下一周：把重建后的${serveLabel}巩固下来，做一次评估，并写出下周继续沿用的一条规则。`,
        warmup: ["5 次平静影子发球", "5 次带延续规则的影子发球"],
        main: ["10 次对安全目标的计分发球", `10 次带原始压力提示的计分${serveLabel}`],
        pressure: ["每 5 球写下一条观察", "最后做一组 best-of-3 压力块"],
        success: ["你能明确说出一条下周延续规则", "最后一组压力发球仍然守住更安全的发球形状"],
        intensity: "medium" as const,
        tempo: "match_70" as const
      }
    };

  const blueprint = blueprints[role];
  return {
    ...day,
    focus: blueprint.focus,
    goal: blueprint.goal,
    warmupBlock: { ...day.warmupBlock, items: blueprint.warmup },
    mainBlock: { ...day.mainBlock, items: blueprint.main },
    pressureBlock: { ...day.pressureBlock, items: blueprint.pressure },
    successCriteria: blueprint.success,
    intensity: blueprint.intensity,
    tempo: blueprint.tempo
  };
}

function applyDeepModeOverlay(
  plan: GeneratedPlan,
  locale: PlanLocale,
  deepContext?: EnrichedDiagnosisContext | null
): GeneratedPlan {
  if (!deepContext?.isDeepModeReady || deepContext.mode !== "deep" || deepContext.strokeFamily !== "serve") {
    return plan;
  }

  const roles = ["baseline", "stabilize", "variable", "timing", "pressure", "transfer", "consolidate"] as const;
  const summary = locale === "en"
    ? `${deepContext.pressureContext === "key_points" ? "Key-point scene: " : "Deep mode scene: "}${deepContext.sceneSummaryEn}`
    : `${deepContext.pressureContext === "key_points" ? "关键分场景：" : "深入版场景："}${deepContext.sceneSummaryZh}`;

  return {
    ...plan,
    summary: plan.summary ?? summary,
    days: plan.days.map((day, index) => buildDeepServeDayOverlay(locale, day, deepContext, roles[index] ?? "consolidate"))
  };
}

export function getPlanTemplate(
  problemTag: string,
  level: PlanLevel,
  locale: PlanLocale = "zh",
  preferredContentIds: string[] = [],
  options: {
    primaryNextStep?: string;
    planContext?: PlanContext | null;
    deepContext?: EnrichedDiagnosisContext | null;
    environment?: AppEnvironment;
  } = {}
): GeneratedPlan {
  const effectivePlanContext = options.deepContext
    ? buildPlanContextFromEnrichedContext(options.deepContext) ?? options.planContext
    : options.planContext;
  const normalizedProblemTag = normalizePlanProblemTag(problemTag);
  const templateLevel = normalizePlanLevel(level);
  const activePlanTemplates = filterByEnvironment(planTemplates, options.environment ?? "production");
  const exact = getPlanLookupProblemTags(problemTag)
    .map((lookupProblemTag) => activePlanTemplates.find((item) => item.problemTag === lookupProblemTag && item.level === templateLevel))
    .find((item): item is PlanTemplate => Boolean(item));
  if (exact) {
    const plan = applyDeepModeOverlay(applyPlanMicrocycle(
      applyPlanContext(
        applyPrimaryNextStepContext(
          sanitizePlanDayContentIds(
            applyPreferredContentIds(
              {
                ...toGenerated(exact, locale),
                level
              },
              level,
              preferredContentIds
            )
          ),
          locale,
          options.primaryNextStep
        ),
        locale,
        effectivePlanContext,
        { primaryNextStep: options.primaryNextStep, deepContext: options.deepContext }
      ),
      locale,
      effectivePlanContext
    ), locale, options.deepContext);

    return {
      ...plan,
      problemTag
    };
  }

  const sameTag = getPlanLookupProblemTags(problemTag)
    .map((lookupProblemTag) => activePlanTemplates.find((item) => item.problemTag === lookupProblemTag))
    .find((item): item is PlanTemplate => Boolean(item));
  if (sameTag) {
    const plan = applyDeepModeOverlay(applyPlanMicrocycle(
      applyPlanContext(
        applyPrimaryNextStepContext(
          sanitizePlanDayContentIds(
            applyPreferredContentIds(
              {
                ...toGenerated(sameTag, locale),
                level
              },
              level,
              preferredContentIds
            )
          ),
          locale,
          options.primaryNextStep
        ),
        locale,
        effectivePlanContext,
        { primaryNextStep: options.primaryNextStep, deepContext: options.deepContext }
      ),
      locale,
      effectivePlanContext
    ), locale, options.deepContext);

    return {
      ...plan,
      problemTag
    };
  }

  return applyDeepModeOverlay(applyPlanMicrocycle(
    applyPlanContext(
      applyPrimaryNextStepContext(
        sanitizePlanDayContentIds(
          applyPreferredContentIds(
            {
              source: "fallback",
              level,
              problemTag,
              title: locale === "en" ? "7-step general improvement plan" : "通用 7 步基础提升计划",
              target: locale === "en"
                ? "Build a steady swing and a practical training rhythm within one week"
                : "在一周内建立稳定击球与可执行训练节奏",
              summary: locale === "en"
                ? "Not enough context to customize yet. Starting with a general, actionable 7-step training rhythm."
                : "当前上下文不足，先使用一份通用且可执行的 7 步训练节奏。",
              days: createDefaultDays(locale)
            },
            level,
            preferredContentIds
          )
        ),
        locale,
        options.primaryNextStep
      ),
      locale,
      effectivePlanContext,
      { primaryNextStep: options.primaryNextStep, deepContext: options.deepContext }
    ),
    locale,
    effectivePlanContext
  ), locale, options.deepContext);
}

const DIMENSION_TO_PROBLEM_TAG: Record<string, string> = {
  "正手": "forehand-out",
  "反手": "backhand-into-net",
  "发球": "second-serve-reliability",
  "网前": "net-confidence",
  "移动": "late-contact",
  "比赛意识": "match-anxiety",
  "forehand": "forehand-out",
  "backhand": "backhand-into-net",
  "serve": "second-serve-reliability",
  "net play": "net-confidence",
  "movement": "late-contact",
  "match play": "match-anxiety",
  "match awareness": "match-anxiety"
};

export function getPlanFromDiagnosis(input: {
  level?: PlanLevel;
  problemTag?: string;
  title?: string;
  fixes?: string[];
  locale?: PlanLocale;
  planContext?: PlanContext | null;
}): GeneratedPlan {
  const level = input.level ?? "3.5";
  const locale = input.locale ?? "zh";
  const problemTag = input.problemTag ?? "general-improvement";
  const primaryNextStep = input.fixes?.[0];
  const base = getPlanTemplate(problemTag, level, locale, [], {
    primaryNextStep,
    planContext: input.planContext
  });

  if (locale === "en") {
    return {
      ...base,
      title: input.title ? `${input.title}: 7-step improvement plan` : base.title,
      target: primaryNextStep ? `Focus on "${primaryNextStep}" and build a consistent 7-step training rhythm.` : base.target,
      summary: primaryNextStep
        ? `Primary focus this week: ${primaryNextStep}`
        : "This plan is built around your primary issue. Focus on execution over the week — do not try to fix everything at once."
    };
  }

  return {
    ...base,
    title: input.title ? `${input.title}：7 步提升计划` : base.title,
    target: primaryNextStep ? `先围绕"${primaryNextStep}"建立连续 7 步训练。` : base.target,
    summary: primaryNextStep
      ? `本周先围绕这一个主动作推进：${primaryNextStep}`
      : "这份计划围绕你当前最主要的问题设计，先追求连续执行，不求一次改完。"
  };
}

export function getPlanFromAssessment(input: {
  level?: PlanLevel;
  weaknesses?: string[];
  observationNeeded?: string[];
  locale?: PlanLocale;
}): GeneratedPlan {
  const level = input.level ?? "3.5";
  const locale = input.locale ?? "zh";
  const mapped =
    (input.weaknesses?.[0] && DIMENSION_TO_PROBLEM_TAG[input.weaknesses[0]]) ||
    (input.observationNeeded?.[0] && DIMENSION_TO_PROBLEM_TAG[input.observationNeeded[0]]) ||
    "general-improvement";

  const base = getPlanTemplate(mapped, level, locale);

  if (locale === "en") {
    return {
      ...base,
      summary: input.observationNeeded?.length
        ? `The plan will shore up weak spots first, with ${input.observationNeeded.join(" and ")} as watch areas.`
        : "The plan focuses on the weakest areas from the assessment to build training rhythm."
    };
  }

  return {
    ...base,
    summary: input.observationNeeded?.length
      ? `计划会先补强短板，同时把 ${input.observationNeeded.join("、")} 作为待观察维度。`
      : "计划会优先围绕评估中的相对短板建立训练节奏。"
  };
}

export function getPlanPreviewTags(locale: PlanLocale = "zh"): string[] {
  if (locale === "en") {
    return ["Backhand into the net", "No confidence on second serve", "Forehand keeps going out", "Match nerves", "Not sure what to practise"];
  }

  return ["反手总下网", "二发没信心", "正手总出界", "比赛容易紧张", "不会自己练"];
}
