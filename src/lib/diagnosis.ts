import { contents } from "@/data/contents";
import { diagnosisRules } from "@/data/diagnosisRules";
import { AssessmentResult } from "@/types/assessment";
import { ContentItem } from "@/types/content";
import {
  DiagnosisAlias,
  DiagnosisConfidence,
  DiagnosisClause,
  DiagnosisInternalSignal,
  DiagnosisLayeredSignals,
  DiagnosisModifier,
  DiagnosisResult,
  DiagnosisRule,
  DiagnosisSignalBundle,
  DiagnosisSignalSegment,
  DiagnosisSlot,
  DiagnosisSlotType,
  DiagnosisSupportSignal
} from "@/types/diagnosis";

export type DiagnoseOptions = {
  level?: string;
  assessmentResult?: AssessmentResult | null;
  maxRecommendations?: number;
  rules?: DiagnosisRule[];
  contentPool?: ContentItem[];
  locale?: "zh" | "en";
};

export type ProblemPreviewOption = {
  label: string;
  label_en: string;
  problemTag: string;
};

const DEFAULT_PROBLEM_TAG = "general-improvement";

const DEFAULT_SUMMARY =
  "我们先给你一个基础方向：先找最影响你的 1 个问题，先把稳定性和准备节奏建立起来，再逐步加强力量和变化。";
const DEFAULT_SUMMARY_EN =
  "Start by finding the one thing that affects you the most. Build stability and timing first, then gradually add pace and variety.";

const DEFAULT_CAUSES = [
  "问题描述还比较宽泛，暂时无法精确定位到单一技术环节",
  "大多数初中级问题都和准备时机、击球点和动作节奏有关",
  "当前更需要先把问题缩小到一个具体场景"
];
const DEFAULT_CAUSES_EN = [
  "The description is still broad — hard to pinpoint a single technical issue",
  "Most beginner-to-intermediate problems relate to preparation timing, contact point, and swing rhythm",
  "The next step is narrowing the problem to a specific scenario"
];

const DEFAULT_FIXES = [
  "先只解决一个问题，不要同时改太多动作",
  "先追求稳定过网和更清楚的击球点",
  "下次描述问题时尽量带上场景，比如'反手总下网'或'二发没信心'"
];
const DEFAULT_FIXES_EN = [
  "Focus on one problem at a time — do not try to fix everything at once",
  "Aim for consistent clearance over the net and a cleaner contact point first",
  "Next time, describe the situation more specifically — e.g. 'my backhand keeps going into the net'"
];

const DEFAULT_DRILLS = [
  "每次训练只设 1 个主目标",
  "影子挥拍 20 次，感受准备和节奏",
  "慢节奏定点击球 20 球，先保证稳定过网"
];
const DEFAULT_DRILLS_EN = [
  "Set just one main goal per practice session",
  "20 shadow swings — focus on preparation and rhythm",
  "20 slow-feed target hits — prioritize clearing the net consistently"
];

const DEFAULT_CONTENT_IDS = ["content_cn_c_01", "content_cn_f_02", "content_gaiao_01"];

const SUPPORT_SIGNAL_CONTENT_IDS: Record<string, string[]> = {
  cant_self_practice: ["content_cn_c_03", "content_cn_f_02", "content_cn_f_03"],
  plateau_no_progress: ["content_cn_f_03", "content_cn_f_02", "content_cn_c_03"]
};

const PROBLEM_PREVIEW_OPTIONS: ProblemPreviewOption[] = [
  { label: "反手总是下网", label_en: "Backhand keeps going into the net", problemTag: "backhand-into-net" },
  { label: "一发总发不进", label_en: "My first serve will not go in", problemTag: "first-serve-in" },
  { label: "二发总双误", label_en: "Second serve keeps double faulting", problemTag: "second-serve-reliability" },
  { label: "多拍对拉总不稳", label_en: "Rally breaks down after a few balls", problemTag: "rally-consistency" },
  { label: "正手一发力就出界", label_en: "Forehand flies out when I swing harder", problemTag: "forehand-out" },
  { label: "双打不知道站哪", label_en: "Not sure where to stand in doubles", problemTag: "doubles-positioning" },
  { label: "脚步总慢半拍", label_en: "Footwork is always half a beat late", problemTag: "movement-slow" },
  { label: "网前截击老冒高", label_en: "My volleys keep floating", problemTag: "volley-floating" },
  { label: "比赛一紧张就乱", label_en: "Execution tightens up under pressure", problemTag: "pressure-tightness" },
  { label: "月亮球一来就很别扭", label_en: "Moonballs throw off my timing", problemTag: "moonball-trouble" },
  { label: "年纪大了跑不太动", label_en: "I cannot move as well anymore", problemTag: "mobility-limit" }
];

const LEVEL_PREFERENCE_MAP: Record<string, string[]> = {
  "2.5": ["2.5", "3.0"],
  "3.0": ["2.5", "3.0"],
  "3.5": ["3.0", "3.5"],
  "4.0": ["3.5", "4.0", "4.5"],
  "4.5": ["4.0", "4.5"]
};

const ASSESSMENT_DIMENSION_HINTS: Record<string, { skills: string[]; problemTags: string[] }> = {
  basics: {
    skills: ["basics", "forehand", "backhand"],
    problemTags: ["general-improvement", "cant-self-practice", "plateau-no-progress", "late-contact"]
  },
  forehand: {
    skills: ["forehand", "topspin"],
    problemTags: ["forehand-out", "forehand-no-power", "balls-too-short", "topspin-low"]
  },
  backhand: {
    skills: ["backhand", "slice"],
    problemTags: ["backhand-into-net", "backhand-slice-floating", "late-contact", "incoming-slice-trouble"]
  },
  serve: {
    skills: ["serve"],
    problemTags: ["second-serve-reliability", "serve-toss-consistency", "serve-accuracy"]
  },
  net: {
    skills: ["net", "doubles"],
    problemTags: ["net-confidence", "doubles-positioning"]
  },
  movement: {
    skills: ["movement", "footwork"],
    problemTags: ["late-contact", "balls-too-short", "movement-slow"]
  },
  matchplay: {
    skills: ["matchplay", "mental", "return"],
    problemTags: ["match-anxiety", "return-under-pressure", "cant-self-practice", "cant-hit-lob", "plateau-no-progress"]
  },
  rally: {
    skills: ["basics", "consistency", "forehand", "backhand"],
    problemTags: ["rally-consistency", "general-improvement", "plateau-no-progress", "backhand-into-net", "forehand-out"]
  },
  awareness: {
    skills: ["matchplay", "mental", "training"],
    problemTags: ["match-anxiety", "cant-self-practice", "plateau-no-progress"]
  },
  fundamentals: {
    skills: ["basics", "grip", "forehand", "backhand"],
    problemTags: ["general-improvement", "late-contact", "cant-self-practice"]
  },
  receiving: {
    skills: ["return", "backhand", "defense", "footwork"],
    problemTags: ["late-contact", "return-under-pressure", "backhand-into-net", "movement-slow"]
  },
  consistency: {
    skills: ["consistency", "basics", "training"],
    problemTags: ["general-improvement", "plateau-no-progress", "balls-too-short"]
  },
  both_sides: {
    skills: ["forehand", "backhand", "consistency"],
    problemTags: ["backhand-into-net", "forehand-out", "general-improvement"]
  },
  direction: {
    skills: ["forehand", "backhand", "training"],
    problemTags: ["forehand-out", "balls-too-short", "general-improvement"]
  },
  rhythm: {
    skills: ["movement", "footwork", "backhand"],
    problemTags: ["movement-slow", "late-contact", "incoming-slice-trouble"]
  },
  net_play: {
    skills: ["net", "doubles"],
    problemTags: ["net-confidence", "doubles-positioning"]
  },
  depth_variety: {
    skills: ["forehand", "topspin", "training"],
    problemTags: ["balls-too-short", "topspin-low", "forehand-no-power"]
  },
  forcing: {
    skills: ["forehand", "topspin", "matchplay"],
    problemTags: ["forehand-no-power", "balls-too-short", "general-improvement"]
  },
  tactics: {
    skills: ["matchplay", "mental", "doubles"],
    problemTags: ["match-anxiety", "doubles-positioning", "cant-self-practice"]
  }
};

const TITLE_MAP_ZH: Record<string, string> = {
  "backhand-into-net": "反手稳定性不足",
  "rally-consistency": "多拍对拉稳定性不足",
  "forehand-out": "正手控制不足",
  "first-serve-in": "一发进区率不足",
  "second-serve-reliability": "二发稳定性不足",
  "serve-toss-consistency": "发球抛球稳定性不足",
  "late-contact": "准备偏慢 / 击球点偏晚",
  "net-confidence": "网前信心和动作控制不足",
  "volley-floating": "截击控制不稳，回球容易冒高",
  "volley-into-net": "截击过网稳定性不足",
  "overhead-timing": "高压球时机和调步不足",
  "match-anxiety": "比赛紧张导致执行下降",
  "pressure-tightness": "压力下执行变形",
  "forehand-no-power": "正手发力链条不顺",
  "running-forehand": "跑动中正手稳定性不足",
  "running-backhand": "跑动中反手稳定性不足",
  "balls-too-short": "击球深度不足",
  "return-under-pressure": "接发球准备和策略不足",
  "backhand-slice-floating": "反手切削控制不足",
  "topspin-low": "正手上旋和弧线不足",
  "serve-accuracy": "发球进区率和落点控制不足",
  "movement-slow": "脚步启动和到位偏慢",
  "mobility-limit": "移动范围和到位能力受限",
  "stamina-drop": "体能下降后动作稳定性下滑",
  "doubles-positioning": "双打站位和轮转不清晰",
  "incoming-slice-trouble": "对手削球来球处理不顺",
  "moonball-trouble": "高吊球 / 月亮球来球处理不顺",
  "cant-hit-lob": "防守高球选择不足",
  "plateau-no-progress": "训练聚焦不够，进入平台期",
  "cant-self-practice": "训练规划不清晰",
  "general-improvement": "通用提升方向"
};

const TITLE_MAP_EN: Record<string, string> = {
  "backhand-into-net": "Backhand consistency",
  "rally-consistency": "Rally consistency",
  "forehand-out": "Forehand control",
  "first-serve-in": "First-serve make rate",
  "second-serve-reliability": "Second-serve reliability",
  "serve-toss-consistency": "Serve toss consistency",
  "late-contact": "Late preparation and contact point",
  "net-confidence": "Net play confidence and control",
  "volley-floating": "Volley height control",
  "volley-into-net": "Volley net clearance",
  "overhead-timing": "Overhead timing",
  "match-anxiety": "Match nerves affecting execution",
  "pressure-tightness": "Execution tightening under pressure",
  "forehand-no-power": "Forehand power chain",
  "running-forehand": "Running forehand stability",
  "running-backhand": "Running backhand stability",
  "balls-too-short": "Depth and penetration",
  "return-under-pressure": "Return of serve under pressure",
  "backhand-slice-floating": "Backhand slice control",
  "topspin-low": "Forehand topspin and arc",
  "serve-accuracy": "Serve accuracy and placement",
  "movement-slow": "Footwork start and court coverage",
  "mobility-limit": "Mobility and court coverage limits",
  "stamina-drop": "Stamina drop-off",
  "doubles-positioning": "Doubles positioning and rotation",
  "incoming-slice-trouble": "Handling incoming slice",
  "moonball-trouble": "Handling moonballs",
  "cant-hit-lob": "Defensive lob selection",
  "plateau-no-progress": "Training focus — breaking through a plateau",
  "cant-self-practice": "Practice planning",
  "general-improvement": "General improvement direction"
};

const CONFIDENCE_MAP: Record<DiagnosisConfidence, Record<"zh" | "en", string>> = {
  "较高": { zh: "较高", en: "Higher" },
  "中等": { zh: "中等", en: "Medium" },
  "较低": { zh: "较低", en: "Lower" }
};

const DIAGNOSIS_ALIAS_PATTERNS: Array<{ alias: DiagnosisAlias; patterns: RegExp[] }> = [
  { alias: "first_serve", patterns: [/(?:一发(?!力)|first serve|first-serve|firstserve)/i] },
  { alias: "second_serve", patterns: [/(?:二发|second serve|second-serve|secondserve)/i] },
  { alias: "overhead", patterns: [/(?:高压|overhead|smash|杀高球|高球处理)/i] },
  { alias: "moonball", patterns: [/(?:月亮球|moon ball|moonball|高吊球|高挑球|挑高球)/i] },
  { alias: "slice", patterns: [/(?:切削|slice|下旋)/i] },
  {
    alias: "key_point",
    patterns: [
      /(?:关键分|关键球|pressure point|big point|break point|game point|match point|deuce|tie ?break|tiebreak|30\s*30|30\s*40|40\s*30|40\s*40|\b(?:bp|gp|mp|tb)\b)/i
    ]
  },
  {
    alias: "mobility_limit",
    patterns: [/(?:左右追球跟不上|追球跟不上|移动跟不上|左右移动跟不上|脚步慢|移动受限|跑不动|movement slow|cover the court)/i]
  }
];

const DIAGNOSIS_MODIFIER_PATTERNS: Array<{ modifier: DiagnosisModifier; patterns: RegExp[] }> = [
  {
    modifier: "tight",
    patterns: [
      /(?:关键分|关键球|压力大|一紧张|紧张|手紧|pressure point|big point|break point|game point|match point|deuce|tie ?break|tiebreak|30\s*30|30\s*40|40\s*30|40\s*40|\b(?:bp|gp|mp|tb)\b|chok(?:e|ing)|tense up)/i
    ]
  },
  { modifier: "age", patterns: [/(?:年纪大了|年纪大|上年纪|年龄大|老了)/i] }
];

const DIAGNOSIS_SUPPORT_SIGNAL_PATTERNS: Array<{ signal: DiagnosisSupportSignal; patterns: RegExp[] }> = [
  {
    signal: "plateau_no_progress",
    patterns: [/(?:练了很久没进步|练了很多还是老样子|总在原地踏步|平台期|瓶颈|not improving|never get better|hit a plateau|stuck and not improving)/i]
  },
  {
    signal: "cant_self_practice",
    patterns: [/(?:不知道自己该练什么|不知道练什么|不会自己练|训练没计划|每次都乱练|what to practice|do not know what to practice|cannot plan my own practice|practice randomly)/i]
  }
];

const DIAGNOSIS_CLAUSE_SPLITTER = /[，。！？、；;]+|如果|但是|但/g;

const DIAGNOSIS_TRIGGER_PATTERNS: Array<{ signal: string; patterns: RegExp[] }> = [
  {
    signal: "opponent_at_net",
    patterns: [/(?:对手在网前|对手一上网|对手抢网|对手封网|opponent at net|they poach|poach(?:ing)? at net|rush(?:es)? the net|serve and volley)/i]
  },
  { signal: "net_pressure", patterns: [/(?:压网|上网压迫|net pressure|poach(?:ing)?|closing at net)/i] },
  { signal: "overhit", patterns: [/(?:一发力就|发力就飞|swing harder.*long|hit harder.*out)/i] },
  { signal: "hesitation", patterns: [/(?:犹豫|不敢打|hesitat)/i] }
];

const DIAGNOSIS_TYPO_NORMALIZATIONS: Array<{ pattern: RegExp; replacement: string }> = [
  { pattern: /\bduece\b/g, replacement: "deuce" },
  { pattern: /\bdueuse\b/g, replacement: "deuce" },
  { pattern: /\bduese\b/g, replacement: "deuce" },
  { pattern: /\btiebrake\b/g, replacement: "tiebreak" },
  { pattern: /\btiebrak\b/g, replacement: "tiebreak" },
  { pattern: /\btiebrkae\b/g, replacement: "tiebreak" },
  { pattern: /\btie\s*brake\b/g, replacement: "tiebreak" },
  { pattern: /\bbrek\s*point\b/g, replacement: "break point" },
  { pattern: /\bbrekpoint\b/g, replacement: "break point" },
  { pattern: /\bbreakpiont\b/g, replacement: "break point" },
  { pattern: /\bgamepiont\b/g, replacement: "game point" },
  { pattern: /\bmatchpiont\b/g, replacement: "match point" },
  { pattern: /\bsecnd\s*serve\b/g, replacement: "second serve" },
  { pattern: /\bseond\s*serve\b/g, replacement: "second serve" },
  { pattern: /\bsecond\s*seve\b/g, replacement: "second serve" },
  { pattern: /\bforehnad\b/g, replacement: "forehand" },
  { pattern: /\bbackhnad\b/g, replacement: "backhand" },
  { pattern: /\bnervious\b/g, replacement: "nervous" },
  { pattern: /\bpressue\b/g, replacement: "pressure" },
  { pattern: /\bpoching\b/g, replacement: "poaching" },
  { pattern: /\bdouble\s*fualt(s|ing)?\b/g, replacement: "double fault$1" },
  { pattern: /\bdoulbe\s*fault(s|ing)?\b/g, replacement: "double fault$1" },
  { pattern: /\bdoble\s*fault(s|ing)?\b/g, replacement: "double fault$1" },
  { pattern: /\bdoublefualt(s|ing)?\b/g, replacement: "doublefault$1" },
  { pattern: /\bdoulbefault(s|ing)?\b/g, replacement: "doublefault$1" },
  { pattern: /\bdoublefaut(s|ing)?\b/g, replacement: "doublefault$1" }
];

type DiagnosisPriorityLane =
  | "none"
  | "stroke_outcome"
  | "stroke_context"
  | "tactical_primary"
  | "physical_primary"
  | "mental_fallback";

type DiagnosisRuleSlotProfile = {
  lane: DiagnosisPriorityLane;
  required?: DiagnosisInternalSignal[];
  optional?: DiagnosisInternalSignal[];
};

type DiagnosisRuleCandidate = {
  rule: DiagnosisRule;
  matchedKeywords: string[];
  matchedSynonyms: string[];
  lexicalScore: number;
  slotScore: number;
  priorityWeight: number;
  layeredPrimaryBonus: number;
  clauseCoverageBonus: number;
  matchedClauseCount: number;
  laneConflictPenalty: number;
  score: number;
};

const DIAGNOSIS_SLOT_PATTERNS: Array<{ type: DiagnosisSlotType; value: string; patterns: RegExp[] }> = [
  { type: "stroke", value: "forehand", patterns: [/(?:正手|forehand)/i] },
  { type: "stroke", value: "backhand", patterns: [/(?:反手|backhand)/i] },
  { type: "stroke", value: "serve", patterns: [/(?:发球|一发(?!力)|二发|first serve|second serve|first_serve|second_serve|serve)/i] },
  { type: "stroke", value: "slice", patterns: [/(?:切削|切球|slice)/i] },
  { type: "stroke", value: "volley", patterns: [/(?:截击|截球|网前|volley)/i] },
  { type: "stroke", value: "overhead", patterns: [/(?:高压|smash|overhead)/i] },
  { type: "outcome", value: "net", patterns: [/(?:下网|挂网|不过网|into the net|cannot clear the net)/i] },
  { type: "outcome", value: "out", patterns: [/(?:出界|出底线|老飞|一抡就飞|long|flying long|going out|goes long)/i] },
  { type: "outcome", value: "float", patterns: [/(?:冒高|总浮|总飘|飘起来|floating|keeps floating|sits up)/i] },
  { type: "outcome", value: "double_fault", patterns: [/(?:双误|double fault|double faults|double faulting|doublefault|doublefaults|doublefaulting)/i] },
  { type: "outcome", value: "miss_in", patterns: [/(?:发不进|进区率太低|will not go in|keeps missing)/i] },
  {
    type: "context",
    value: "pressure",
    patterns: [
      /(?:关键分|关键球|pressure point|big point|under pressure|一紧张|紧张|记分|score matters|nervous|nerves|key_point|手硬|手紧|不敢打|break point|game point|match point|deuce|tie ?break|tiebreak|30\s*30|30\s*40|40\s*30|40\s*40|\b(?:bp|gp|mp|tb)\b|chok(?:e|ing)|tense up)/i
    ]
  },
  { type: "context", value: "rally", patterns: [/(?:多拍|回合|对拉|相持|拉锯|rally|baseline exchange|long exchange)/i] },
  { type: "context", value: "movement", patterns: [/(?:左右移动|移动时|移动中|跑动中|宽球|追球|wide|move wide|running|on the stretch)/i] },
  { type: "context", value: "incoming_slice", patterns: [/(?:对方切过来|对手切过来|遇到下旋|下旋来球|对方一切球|against slice|opponents slice|incoming slice|low skidding balls)/i] },
  { type: "context", value: "incoming_moonball", patterns: [/(?:月亮球|moonball|moon ball|高吊球|高挑球|挑高球)/i] },
  { type: "context", value: "doubles", patterns: [/(?:双打|doubles)/i] },
  { type: "condition", value: "mobility_limit", patterns: [/(?:年纪大了|年纪大|上年纪|年龄大|老了|跑不太动|跑不动|跟不上|movement range feels limited|cannot move well anymore|cover the court anymore|mobility_limit)/i] },
  { type: "condition", value: "tight", patterns: [/(?:手紧|tight|freeze|缩手缩脚|动作就变形|swing tighten)/i] }
];

const DIAGNOSIS_LANE_WEIGHTS: Record<DiagnosisPriorityLane, number> = {
  none: 0,
  stroke_outcome: 12,
  stroke_context: 9,
  tactical_primary: 7,
  physical_primary: 6,
  mental_fallback: 4
};

const REQUIRED_SLOT_WEIGHT = 4;
const OPTIONAL_SLOT_WEIGHT = 2;

const DIAGNOSIS_RULE_SLOT_PROFILES: Partial<Record<string, DiagnosisRuleSlotProfile>> = {
  "backhand-into-net": {
    lane: "stroke_outcome",
    required: ["slot_stroke_backhand", "slot_outcome_net"]
  },
  "forehand-out": {
    lane: "stroke_outcome",
    required: ["slot_stroke_forehand", "slot_outcome_out"]
  },
  "first-serve-in": {
    lane: "stroke_outcome",
    required: ["slot_stroke_serve", "slot_outcome_miss_in"]
  },
  "second-serve-reliability": {
    lane: "stroke_outcome",
    required: ["slot_stroke_serve", "slot_outcome_double_fault"],
    optional: ["slot_context_pressure"]
  },
  "volley-floating": {
    lane: "stroke_outcome",
    required: ["slot_stroke_volley", "slot_outcome_float"]
  },
  "volley-into-net": {
    lane: "stroke_outcome",
    required: ["slot_stroke_volley", "slot_outcome_net"]
  },
  "backhand-slice-floating": {
    lane: "stroke_outcome",
    required: ["slot_stroke_slice", "slot_outcome_float"],
    optional: ["slot_stroke_backhand"]
  },
  "running-forehand": {
    lane: "stroke_context",
    required: ["slot_stroke_forehand", "slot_context_movement"]
  },
  "running-backhand": {
    lane: "stroke_context",
    required: ["slot_stroke_backhand", "slot_context_movement"]
  },
  "rally-consistency": {
    lane: "stroke_context",
    required: ["slot_context_rally"],
    optional: ["slot_outcome_net", "slot_outcome_out", "slot_context_movement"]
  },
  "incoming-slice-trouble": {
    lane: "stroke_context",
    required: ["slot_context_incoming_slice"],
    optional: ["slot_stroke_backhand"]
  },
  "moonball-trouble": {
    lane: "stroke_context",
    required: ["slot_context_incoming_moonball"],
    optional: ["slot_stroke_forehand", "slot_stroke_backhand"]
  },
  "doubles-positioning": {
    lane: "tactical_primary",
    required: ["slot_context_doubles"]
  },
  "mobility-limit": {
    lane: "physical_primary",
    required: ["slot_condition_mobility_limit"]
  },
  "movement-slow": {
    lane: "none",
    optional: ["slot_context_movement"]
  },
  "pressure-tightness": {
    lane: "mental_fallback",
    required: ["slot_context_pressure"],
    optional: ["slot_condition_tight"]
  },
  "match-anxiety": {
    lane: "mental_fallback",
    required: ["slot_context_pressure"]
  }
};

function buildUniqueSignalList<T extends string>(values: T[]): T[] {
  return values.filter((value, index) => values.indexOf(value) === index);
}

function matchesAny(normalizedInput: string, patterns: RegExp[]): boolean {
  return patterns.some((pattern) => pattern.test(normalizedInput));
}

function splitDiagnosisClauseAnchors(text: string): string[] {
  const trimmed = text.trim();

  if (!trimmed) return [];

  const anchoredSceneMatch = trimmed.match(/^(.+?)在(关键分的时候|关键分时|比赛的时候|比赛时|比赛里|跑动中)$/);

  if (anchoredSceneMatch) {
    return [anchoredSceneMatch[1].trim(), anchoredSceneMatch[2].trim()].filter(Boolean);
  }

  return [trimmed];
}

function splitDiagnosisClauses(input: string): DiagnosisClause[] {
  return input
    .split(DIAGNOSIS_CLAUSE_SPLITTER)
    .flatMap((text) => splitDiagnosisClauseAnchors(text))
    .map((text) => text.trim())
    .filter(Boolean)
    .map((text) => ({
      text,
      normalizedText: normalizeDiagnosisInput(text)
    }));
}

function extractTriggerSignals(normalizedText: string): string[] {
  return buildUniqueSignalList(
    DIAGNOSIS_TRIGGER_PATTERNS
      .filter(({ patterns }) => matchesAny(normalizedText, patterns))
      .map(({ signal }) => signal)
  );
}

function buildLayeredSignals(
  clauses: DiagnosisClause[],
  aliases: DiagnosisAlias[],
  modifiers: DiagnosisModifier[],
  supportSignals: DiagnosisSupportSignal[],
  slots: DiagnosisSlot[]
): DiagnosisLayeredSignals {
  const slotSignals = new Set(slots.map((slot) => slot.signal));
  const primaryCandidates = buildUniqueSignalList(
    Object.entries(DIAGNOSIS_RULE_SLOT_PROFILES)
      .filter(([, profile]) => {
        if (!profile || profile.lane === "mental_fallback") return false;
        const requiredSignals = profile.required ?? [];
        return requiredSignals.length > 0 && requiredSignals.every((signal) => slotSignals.has(signal));
      })
      .map(([problemTag]) => problemTag)
  );

  const modifierAliases = aliases.filter((alias) => ["key_point", "moonball", "slice"].includes(alias));
  const triggers = buildUniqueSignalList(clauses.flatMap((clause) => extractTriggerSignals(clause.normalizedText)));

  return {
    primaryCandidates,
    modifiers: buildUniqueSignalList(
      [...modifierAliases, ...modifiers].filter((signal) => !supportSignals.includes(signal as DiagnosisSupportSignal))
    ),
    triggers
  };
}

function buildDiagnosisSlots(normalizedInput: string, aliases: DiagnosisAlias[]): DiagnosisSlot[] {
  const slotText = [normalizedInput, ...aliases].join(" ");

  return buildUniqueSignalList(
    DIAGNOSIS_SLOT_PATTERNS
      .filter(({ patterns }) => matchesAny(slotText, patterns))
      .map(({ type, value }) => `slot_${type}_${value}` as DiagnosisInternalSignal)
  ).map((signal) => {
    const [, type, ...valueParts] = signal.split("_");

    return {
      type: type as DiagnosisSlotType,
      value: valueParts.join("_"),
      signal
    };
  });
}

function buildSignalSegments(
  rawInput: string,
  aliases: DiagnosisAlias[],
  modifiers: DiagnosisModifier[],
  supportSignals: DiagnosisSupportSignal[],
  slots: DiagnosisSlot[]
): DiagnosisSignalSegment[] {
  const segments: DiagnosisSignalSegment[] = [{ source: "raw", value: rawInput }];

  for (const alias of aliases) {
    segments.push({ source: "alias", value: alias });
  }

  for (const modifier of modifiers) {
    segments.push({ source: "modifier", value: modifier });
  }

  for (const supportSignal of supportSignals) {
    segments.push({ source: "support", value: supportSignal });
  }

  for (const slot of slots) {
    segments.push({ source: "internal", value: slot.signal });
  }

  return segments;
}

function buildMatchableText(segments: DiagnosisSignalSegment[]): string {
  return segments
    .filter((segment) => segment.source === "raw" || segment.source === "alias" || segment.source === "modifier")
    .map((segment) => segment.value)
    .filter(Boolean)
    .join(" ")
    .trim();
}

export function extractDiagnosisSignalBundle(input: string): DiagnosisSignalBundle {
  const normalizedInput = normalizeDiagnosisInput(input);
  const clauses = splitDiagnosisClauses(input);

  const aliases = buildUniqueSignalList(
    DIAGNOSIS_ALIAS_PATTERNS
      .filter(({ patterns }) => matchesAny(normalizedInput, patterns))
      .map(({ alias }) => alias)
  );

  const modifiers = buildUniqueSignalList(
    DIAGNOSIS_MODIFIER_PATTERNS
      .filter(({ patterns }) => matchesAny(normalizedInput, patterns))
      .map(({ modifier }) => modifier)
  );

  const supportSignals = buildUniqueSignalList(
    DIAGNOSIS_SUPPORT_SIGNAL_PATTERNS
      .filter(({ patterns }) => matchesAny(normalizedInput, patterns))
      .map(({ signal }) => signal)
  );
  const slots = buildDiagnosisSlots(normalizedInput, aliases);
  const internalSignals = slots.map((slot) => slot.signal);
  const layeredSignals = buildLayeredSignals(clauses, aliases, modifiers, supportSignals, slots);
  const segments = buildSignalSegments(normalizedInput, aliases, modifiers, supportSignals, slots);
  const matchableText = buildMatchableText(segments);

  return {
    rawInput: input,
    normalizedInput,
    matchableText,
    clauses,
    layeredSignals,
    segments,
    aliases,
    modifiers,
    supportSignals,
    slots,
    internalSignals
  };
}

export function getMatchableInput(input: string): DiagnosisSignalBundle {
  return extractDiagnosisSignalBundle(input);
}

export function normalizeDiagnosisInput(input: string): string {
  const lowered = input.toLowerCase();
  const typoNormalized = DIAGNOSIS_TYPO_NORMALIZATIONS.reduce(
    (value, entry) => value.replace(entry.pattern, entry.replacement),
    lowered
  );

  return typoNormalized
    .trim()
    .replace(/[，。！？、；：""''（）()【】\[\],.!?;:"'`~\-_/]+/g, " ")
    .replace(/\s+/g, " ");
}

export function getMatchedKeywords(input: string, rule: DiagnosisRule): string[] {
  const normalized = normalizeDiagnosisInput(getMatchableInput(input).matchableText);
  return rule.keywords.filter((keyword) => normalized.includes(normalizeDiagnosisInput(keyword)));
}

export function getMatchedSynonyms(input: string, rule: DiagnosisRule): string[] {
  const normalized = normalizeDiagnosisInput(getMatchableInput(input).matchableText);
  return (rule.synonyms ?? []).filter((phrase) => normalized.includes(normalizeDiagnosisInput(phrase)));
}

function getMatchedKeywordsFromBundle(signalBundle: DiagnosisSignalBundle, rule: DiagnosisRule): string[] {
  const normalized = normalizeDiagnosisInput(signalBundle.matchableText);
  return rule.keywords.filter((keyword) => normalized.includes(normalizeDiagnosisInput(keyword)));
}

function getMatchedSynonymsFromBundle(signalBundle: DiagnosisSignalBundle, rule: DiagnosisRule): string[] {
  const normalized = normalizeDiagnosisInput(signalBundle.matchableText);
  return (rule.synonyms ?? []).filter((phrase) => normalized.includes(normalizeDiagnosisInput(phrase)));
}

function getLexicalDiagnosisScore(rule: DiagnosisRule, matchedKeywords: string[], matchedSynonyms: string[]): number {
  if (matchedKeywords.length === 0 && matchedSynonyms.length === 0) return 0;

  const keywordScore = matchedKeywords.length * 10;
  const synonymScore = matchedSynonyms.length * 7;
  const allMatchedBonus = matchedKeywords.length === rule.keywords.length ? 3 : 0;

  return keywordScore + synonymScore + allMatchedBonus;
}

function scoreDiagnosisRuleSlots(rule: DiagnosisRule, slots: DiagnosisSlot[]) {
  const profile = DIAGNOSIS_RULE_SLOT_PROFILES[rule.problemTag];
  const slotSignals = new Set(slots.map((slot) => slot.signal));
  const requiredSignals = profile?.required ?? [];
  const optionalSignals = profile?.optional ?? [];
  const matchedRequired = requiredSignals.filter((signal) => slotSignals.has(signal));
  const matchedOptional = optionalSignals.filter((signal) => slotSignals.has(signal));
  const hasAllRequired = requiredSignals.length > 0 && matchedRequired.length === requiredSignals.length;
  const priorityWeight = hasAllRequired ? DIAGNOSIS_LANE_WEIGHTS[profile?.lane ?? "none"] : 0;
  const slotScore = matchedRequired.length * REQUIRED_SLOT_WEIGHT + matchedOptional.length * OPTIONAL_SLOT_WEIGHT;

  return {
    slotScore,
    priorityWeight
  };
}

function getLayeredPrimaryBonus(rule: DiagnosisRule, signalBundle: DiagnosisSignalBundle): number {
  if (signalBundle.layeredSignals.primaryCandidates.includes(rule.problemTag)) {
    return 4;
  }

  if (rule.problemTag === "pressure-tightness" && signalBundle.layeredSignals.modifiers.includes("tight")) {
    return signalBundle.layeredSignals.primaryCandidates.length === 0 ? 2 : 0;
  }

  return 0;
}

function getMatchedClauseCount(
  signalBundle: DiagnosisSignalBundle,
  matchedKeywords: string[],
  matchedSynonyms: string[]
): number {
  const lexicalTerms = buildUniqueSignalList([
    ...matchedKeywords,
    ...matchedSynonyms
  ])
    .map((term) => normalizeDiagnosisInput(term))
    .filter((term) => term.length >= 2);

  if (lexicalTerms.length === 0 || signalBundle.clauses.length === 0) {
    return 0;
  }

  return signalBundle.clauses.reduce((count, clause) => {
    return lexicalTerms.some((term) => clause.normalizedText.includes(term))
      ? count + 1
      : count;
  }, 0);
}

function getClauseCoverageBonus(
  signalBundle: DiagnosisSignalBundle,
  matchedKeywords: string[],
  matchedSynonyms: string[]
): { matchedClauseCount: number; clauseCoverageBonus: number } {
  const matchedClauseCount = getMatchedClauseCount(signalBundle, matchedKeywords, matchedSynonyms);
  const clauseCoverageBonus = matchedClauseCount <= 1
    ? 0
    : Math.min(3, matchedClauseCount - 1) * 2;

  return {
    matchedClauseCount,
    clauseCoverageBonus
  };
}

function getLaneConflictPenalty(rule: DiagnosisRule, signalBundle: DiagnosisSignalBundle): number {
  const lane = DIAGNOSIS_RULE_SLOT_PROFILES[rule.problemTag]?.lane;

  if (lane !== "mental_fallback") {
    return 0;
  }

  return signalBundle.layeredSignals.primaryCandidates.length > 0 ? 6 : 0;
}

function buildDiagnosisRuleCandidateFromBundle(
  signalBundle: DiagnosisSignalBundle,
  rule: DiagnosisRule
): DiagnosisRuleCandidate | null {
  const matchedKeywords = getMatchedKeywordsFromBundle(signalBundle, rule);
  const matchedSynonyms = getMatchedSynonymsFromBundle(signalBundle, rule);
  const lexicalScore = getLexicalDiagnosisScore(rule, matchedKeywords, matchedSynonyms);
  const slotProfile = DIAGNOSIS_RULE_SLOT_PROFILES[rule.problemTag];
  const requiredSignals = slotProfile?.required ?? [];
  const slotSignals = new Set(signalBundle.slots.map((slot) => slot.signal));
  const hasAllRequiredSignals =
    requiredSignals.length > 0 &&
    requiredSignals.every((signal) => slotSignals.has(signal));
  const { slotScore, priorityWeight } = scoreDiagnosisRuleSlots(rule, signalBundle.slots);
  const layeredPrimaryBonus = getLayeredPrimaryBonus(rule, signalBundle);
  const { matchedClauseCount, clauseCoverageBonus } = getClauseCoverageBonus(
    signalBundle,
    matchedKeywords,
    matchedSynonyms
  );
  const laneConflictPenalty = getLaneConflictPenalty(rule, signalBundle);

  if (lexicalScore <= 0 && !hasAllRequiredSignals && layeredPrimaryBonus <= 0) {
    return null;
  }

  if (slotProfile?.lane === "mental_fallback" && requiredSignals.length > 0 && !hasAllRequiredSignals) {
    return null;
  }

  const score =
    lexicalScore +
    slotScore +
    priorityWeight +
    layeredPrimaryBonus +
    clauseCoverageBonus -
    laneConflictPenalty;

  if (score <= 0 && !hasAllRequiredSignals) {
    return null;
  }

  return {
    rule,
    matchedKeywords,
    matchedSynonyms,
    lexicalScore,
    slotScore,
    priorityWeight,
    layeredPrimaryBonus,
    clauseCoverageBonus,
    matchedClauseCount,
    laneConflictPenalty,
    score
  };
}

function buildDiagnosisRuleCandidate(input: string, rule: DiagnosisRule): DiagnosisRuleCandidate | null {
  const signalBundle = extractDiagnosisSignalBundle(input);
  return buildDiagnosisRuleCandidateFromBundle(signalBundle, rule);
}

export function scoreDiagnosisRule(input: string, rule: DiagnosisRule): number {
  return buildDiagnosisRuleCandidate(input, rule)?.score ?? 0;
}

export function getDiagnosisConfidence(score: number): DiagnosisConfidence {
  if (score >= 24) return "较高";
  if (score >= 12) return "中等";
  return "较低";
}

export function getDiagnosisConfidenceLabel(confidence: DiagnosisConfidence, locale: "zh" | "en" = "zh"): string {
  return CONFIDENCE_MAP[confidence]?.[locale] ?? confidence;
}

export function findBestDiagnosisRule(
  input: string,
  rules: DiagnosisRule[] = diagnosisRules
): {
  rule: DiagnosisRule | null;
  matchedKeywords: string[];
  matchedSynonyms: string[];
  score: number;
} {
  const signalBundle = extractDiagnosisSignalBundle(input);
  let bestCandidate: DiagnosisRuleCandidate | null = null;

  for (const rule of rules) {
    const candidate = buildDiagnosisRuleCandidateFromBundle(signalBundle, rule);

    if (!candidate) {
      continue;
    }

    if (
      !bestCandidate ||
      candidate.score > bestCandidate.score ||
      (candidate.score === bestCandidate.score &&
        candidate.layeredPrimaryBonus > bestCandidate.layeredPrimaryBonus) ||
      (candidate.score === bestCandidate.score &&
        candidate.layeredPrimaryBonus === bestCandidate.layeredPrimaryBonus &&
        candidate.clauseCoverageBonus > bestCandidate.clauseCoverageBonus) ||
      (candidate.score === bestCandidate.score &&
        candidate.slotScore + candidate.priorityWeight > bestCandidate.slotScore + bestCandidate.priorityWeight) ||
      (candidate.score === bestCandidate.score &&
        candidate.slotScore + candidate.priorityWeight === bestCandidate.slotScore + bestCandidate.priorityWeight &&
        candidate.lexicalScore > bestCandidate.lexicalScore) ||
      (candidate.score === bestCandidate.score &&
        candidate.slotScore + candidate.priorityWeight === bestCandidate.slotScore + bestCandidate.priorityWeight &&
        candidate.lexicalScore === bestCandidate.lexicalScore &&
        candidate.matchedSynonyms.length > bestCandidate.matchedSynonyms.length)
    ) {
      bestCandidate = candidate;
    }
  }

  return {
    rule: bestCandidate?.rule ?? null,
    matchedKeywords: bestCandidate?.matchedKeywords ?? [],
    matchedSynonyms: bestCandidate?.matchedSynonyms ?? [],
    score: bestCandidate?.score ?? 0
  };
}

function scoreContentAgainstLevel(item: ContentItem, preferredLevels: string[], level?: string): number {
  if (!level) {
    return 0;
  }

  let score = 0;

  if (item.levels.includes(level)) {
    score += 4;
  }

  for (const preferredLevel of preferredLevels) {
    if (item.levels.includes(preferredLevel)) {
      score += 2;
    }
  }

  return score;
}

type DiagnosisRecommendationSignalBoost = {
  contentIds: string[];
  problemTags: string[];
  skills: string[];
};

function overlapCount(left: string[], right: string[]): number {
  if (left.length === 0 || right.length === 0) {
    return 0;
  }

  const rightSet = new Set(right);
  return left.reduce((count, value) => count + (rightSet.has(value) ? 1 : 0), 0);
}

function getDiagnosisSignalBoost(signalBundle: DiagnosisSignalBundle): DiagnosisRecommendationSignalBoost {
  const contentIds: string[] = [];
  const problemTags: string[] = [];
  const skills: string[] = [];

  const slotSignals = new Set(signalBundle.internalSignals);
  const modifiers = signalBundle.layeredSignals.modifiers;
  const triggers = signalBundle.layeredSignals.triggers;

  if (modifiers.includes("tight") || slotSignals.has("slot_context_pressure")) {
    contentIds.push("content_rb_03", "content_cn_f_02", "content_rb_02");
    problemTags.push("pressure-tightness", "match-anxiety", "return-under-pressure");
    skills.push("mental", "matchplay", "return");
  }

  if (triggers.includes("opponent_at_net") || triggers.includes("net_pressure")) {
    contentIds.push("content_rb_01", "content_rb_03", "content_rb_02");
    problemTags.push("net-confidence", "doubles-positioning", "volley-floating", "volley-into-net", "return-under-pressure");
    skills.push("net", "doubles", "matchplay");
  }

  if (slotSignals.has("slot_context_movement") || slotSignals.has("slot_condition_mobility_limit")) {
    contentIds.push("content_cn_c_02", "content_fr_02", "content_cn_a_03");
    problemTags.push("movement-slow", "late-contact", "mobility-limit");
    skills.push("movement", "footwork");
  }

  if (slotSignals.has("slot_context_rally")) {
    contentIds.push("content_fr_02", "content_fr_03", "content_fr_01");
    problemTags.push("rally-consistency", "balls-too-short", "late-contact");
    skills.push("consistency", "forehand", "backhand");
  }

  if (slotSignals.has("slot_context_incoming_slice")) {
    contentIds.push("content_fr_01", "content_fr_02");
    problemTags.push("incoming-slice-trouble", "backhand-slice-floating", "late-contact");
    skills.push("slice", "backhand", "movement");
  }

  if (slotSignals.has("slot_context_incoming_moonball")) {
    contentIds.push("content_fr_02", "content_rb_03");
    problemTags.push("moonball-trouble", "cant-hit-lob");
    skills.push("defense", "matchplay", "movement");
  }

  if (slotSignals.has("slot_context_doubles")) {
    contentIds.push("content_rb_01", "content_rb_03", "content_rb_02");
    problemTags.push("doubles-positioning", "net-confidence");
    skills.push("doubles", "net", "matchplay");
  }

  return {
    contentIds: buildUniqueSignalList(contentIds),
    problemTags: buildUniqueSignalList(problemTags),
    skills: buildUniqueSignalList(skills)
  };
}

function getDiagnosisContentSearchText(item: ContentItem): string {
  return [
    item.title,
    item.displayTitleEn,
    item.focusLineEn,
    item.summary,
    item.reason,
    item.coachReason,
    ...item.useCases
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

const NON_DIRECT_VIDEO_URL_PATTERNS = [
  /search\.bilibili\.com\/all\?keyword=/i,
  /youtube\.com\/results\?search_query=/i
];

function isDirectLibraryVideo(item: ContentItem): boolean {
  if (item.type !== "video") {
    return false;
  }

  return !NON_DIRECT_VIDEO_URL_PATTERNS.some((pattern) => pattern.test(item.url));
}

type RankedDiagnosisContentCandidate = {
  item: ContentItem;
  index: number;
  score: number;
  seedIndex: number | undefined;
};

function selectDiagnosisRecommendationsWithDiversity(
  rankedCandidates: RankedDiagnosisContentCandidate[],
  maxRecommendations: number
): ContentItem[] {
  if (maxRecommendations <= 0 || rankedCandidates.length === 0) {
    return [];
  }

  const selected: RankedDiagnosisContentCandidate[] = [];
  const creatorUsageCounts = new Map<string, number>();
  const remaining = [...rankedCandidates];

  const first = remaining.shift();
  if (!first) {
    return [];
  }

  selected.push(first);
  creatorUsageCounts.set(first.item.creatorId, 1);

  while (selected.length < maxRecommendations && remaining.length > 0) {
    let bestIndex = 0;
    let bestAdjustedScore = Number.NEGATIVE_INFINITY;

    for (let index = 0; index < remaining.length; index += 1) {
      const candidate = remaining[index];
      const creatorRepeatCount = creatorUsageCounts.get(candidate.item.creatorId) ?? 0;
      const creatorPenalty = creatorRepeatCount * 14;
      const tagPenalty = selected.some((entry) => overlapCount(entry.item.problemTags, candidate.item.problemTags) >= 2)
        ? 4
        : 0;
      const adjustedScore = candidate.score - creatorPenalty - tagPenalty;
      const bestCandidate = remaining[bestIndex];

      if (
        adjustedScore > bestAdjustedScore ||
        (adjustedScore === bestAdjustedScore && candidate.score > bestCandidate.score) ||
        (adjustedScore === bestAdjustedScore && candidate.score === bestCandidate.score && candidate.index < bestCandidate.index)
      ) {
        bestAdjustedScore = adjustedScore;
        bestIndex = index;
      }
    }

    const [picked] = remaining.splice(bestIndex, 1);
    selected.push(picked);
    creatorUsageCounts.set(
      picked.item.creatorId,
      (creatorUsageCounts.get(picked.item.creatorId) ?? 0) + 1
    );
  }

  return selected.map((entry) => entry.item);
}

function getDiagnosisRecommendedContents(input: {
  rule: DiagnosisRule;
  signalBundle: DiagnosisSignalBundle;
  seedContentIds: string[];
  matchedKeywords: string[];
  matchedSynonyms: string[];
  contentPool: ContentItem[];
  maxRecommendations: number;
  level?: string;
}): ContentItem[] {
  const {
    rule,
    signalBundle,
    seedContentIds,
    matchedKeywords,
    matchedSynonyms,
    contentPool,
    maxRecommendations,
    level
  } = input;

  const boost = getDiagnosisSignalBoost(signalBundle);
  const seedIds = buildUniqueSignalList([...seedContentIds, ...boost.contentIds]);
  const seedItems = seedIds
    .map((id) => contentPool.find((item) => item.id === id))
    .filter((item): item is ContentItem => Boolean(item));
  const seedProblemTags = buildUniqueSignalList([
    rule.problemTag,
    ...seedItems.flatMap((item) => item.problemTags),
    ...boost.problemTags
  ]);
  const seedSkills = buildUniqueSignalList([
    ...rule.category,
    ...seedItems.flatMap((item) => item.skills),
    ...boost.skills
  ]);
  const lexicalTerms = buildUniqueSignalList([
    ...matchedKeywords,
    ...matchedSynonyms,
    ...signalBundle.aliases,
    ...signalBundle.modifiers,
    ...signalBundle.layeredSignals.triggers
  ])
    .map((term) => normalizeDiagnosisInput(term))
    .filter((term) => term.length >= 3);
  const seedIndexMap = new Map(seedIds.map((id, index) => [id, index]));
  const preferredLevels = level ? (LEVEL_PREFERENCE_MAP[level] ?? [level]) : [];

  const rankedCandidates = contentPool
    .map((item, index) => {
      const seedIndex = seedIndexMap.get(item.id);
      const searchText = getDiagnosisContentSearchText(item);
      let score = 0;

      if (seedIndex !== undefined) {
        score += 140 - seedIndex * 8;
        if (seedIndex === 0) {
          score += 120;
        } else if (seedIndex === 1) {
          score += 36;
        }
      }

      if (item.problemTags.includes(rule.problemTag)) {
        score += 32;
      }

      score += overlapCount(item.problemTags, seedProblemTags) * 10;
      score += overlapCount(item.skills, seedSkills) * 8;
      score += overlapCount(item.problemTags, boost.problemTags) * 8;
      score += overlapCount(item.skills, boost.skills) * 6;

      if (lexicalTerms.length > 0) {
        score += lexicalTerms.reduce((sum, term) => sum + (searchText.includes(term) ? 2 : 0), 0);
      }

      if (level) {
        score += scoreContentAgainstLevel(item, preferredLevels, level);
      }

      return { item, index, score, seedIndex };
    })
    .filter(({ item, score, seedIndex }) => {
      if (seedIndex !== undefined) {
        return true;
      }

      return score > 0 && (
        item.problemTags.includes(rule.problemTag) ||
        overlapCount(item.skills, seedSkills) > 0 ||
        overlapCount(item.problemTags, seedProblemTags) > 0
      );
    })
    .sort((left, right) => {
      if (right.score !== left.score) {
        return right.score - left.score;
      }

      if (left.seedIndex !== undefined || right.seedIndex !== undefined) {
        if (left.seedIndex === undefined) return 1;
        if (right.seedIndex === undefined) return -1;
        if (left.seedIndex !== right.seedIndex) {
          return left.seedIndex - right.seedIndex;
        }
      }

      return left.index - right.index;
    });

  const dedupedRankedCandidates = buildUniqueSignalList(rankedCandidates.map((entry) => entry.item.id))
    .map((id) => rankedCandidates.find((entry) => entry.item.id === id))
    .filter((entry): entry is RankedDiagnosisContentCandidate => Boolean(entry));

  return selectDiagnosisRecommendationsWithDiversity(dedupedRankedCandidates, maxRecommendations);
}

function prioritizeContentsByLevel(
  items: ContentItem[],
  maxRecommendations: number,
  level?: string
): ContentItem[] {
  if (!level) {
    return items.slice(0, maxRecommendations);
  }

  const preferredLevels = LEVEL_PREFERENCE_MAP[level] ?? [level];

  return items
    .map((item, index) => ({
      item,
      index,
      score: scoreContentAgainstLevel(item, preferredLevels, level)
    }))
    .sort((a, b) => {
      if (b.score !== a.score) {
        return b.score - a.score;
      }

      return a.index - b.index;
    })
    .map(({ item }) => item)
    .slice(0, maxRecommendations);
}

function getGenericFallbackContents(
  contentPool: ContentItem[] = contents,
  maxRecommendations = 3,
  level?: string
): ContentItem[] {
  const genericContents = DEFAULT_CONTENT_IDS
    .map((id) => contentPool.find((item) => item.id === id))
    .filter((item): item is ContentItem => Boolean(item));

  return prioritizeContentsByLevel(genericContents, maxRecommendations, level);
}

function getWeakestAssessmentDimension(assessmentResult?: AssessmentResult | null) {
  if (!assessmentResult) {
    return null;
  }

  const scoredDimensions = assessmentResult.dimensions.filter((dimension) => dimension.answeredCount > 0);

  if (scoredDimensions.length === 0) {
    return null;
  }

  return [...scoredDimensions].sort((a, b) => a.average - b.average)[0] ?? null;
}

export function getContentsByIds(
  ids: string[],
  contentPool: ContentItem[] = contents,
  maxRecommendations = 3,
  level?: string
): ContentItem[] {
  const mapped = ids
    .map((id) => contentPool.find((item) => item.id === id))
    .filter((item): item is ContentItem => Boolean(item));

  return prioritizeContentsByLevel(mapped, maxRecommendations, level);
}

export function getFallbackContents(
  _input: string,
  contentPool: ContentItem[] = contents,
  maxRecommendations = 3,
  level?: string,
  assessmentResult?: AssessmentResult | null
): ContentItem[] {
  const weakestDimension = getWeakestAssessmentDimension(assessmentResult);

  if (weakestDimension) {
    const hints = ASSESSMENT_DIMENSION_HINTS[weakestDimension.key];
    const candidates = contentPool.filter((item) => {
      const matchesProblemTag = item.problemTags.some((problemTag) => hints.problemTags.includes(problemTag));
      const matchesSkill = item.skills.some((skill) => hints.skills.includes(skill));

      return matchesProblemTag || matchesSkill;
    });

    if (candidates.length > 0) {
      return prioritizeContentsByLevel(candidates, maxRecommendations, level);
    }
  }

  return getGenericFallbackContents(contentPool, maxRecommendations, level);
}

export function getDiagnosisTitle(problemTag: string, locale: "zh" | "en" = "zh"): string {
  const map = locale === "en" ? TITLE_MAP_EN : TITLE_MAP_ZH;
  const fallbackMap = locale === "en" ? TITLE_MAP_EN : TITLE_MAP_ZH;
  return map[problemTag] ?? fallbackMap[DEFAULT_PROBLEM_TAG] ?? problemTag;
}

function buildModifierAwareTitle(
  problemTag: string,
  signalBundle: DiagnosisSignalBundle,
  locale: "zh" | "en" = "zh"
): string {
  const baseTitle = getDiagnosisTitle(problemTag, locale);
  const modifiers = signalBundle.layeredSignals.modifiers;

  if (problemTag === "forehand-out" && modifiers.includes("key_point")) {
    return locale === "en" ? "Forehand errors show up more on key points" : "关键分下的正手出界更明显";
  }

  if (problemTag === "second-serve-reliability" && modifiers.includes("tight")) {
    return locale === "en" ? "Second serve gets shakier on key points" : "关键分下二发更容易失稳";
  }

  if (problemTag === "moonball-trouble" && modifiers.includes("moonball")) {
    return locale === "en" ? "Moonballs keep disrupting your timing" : "月亮球来球会明显打乱你的节奏";
  }

  return baseTitle;
}

function buildModifierAwareFixes(
  problemTag: string,
  fixes: string[],
  signalBundle: DiagnosisSignalBundle,
  locale: "zh" | "en" = "zh"
): string[] {
  if (fixes.length === 0) {
    return fixes;
  }

  const modifiers = signalBundle.layeredSignals.modifiers;
  const triggers = signalBundle.layeredSignals.triggers;

  if (
    problemTag === "forehand-out" &&
    modifiers.includes("key_point") &&
    triggers.includes("opponent_at_net")
  ) {
    const override =
      locale === "en"
        ? "When you see the opponent at net on a key point, play the forehand higher and deeper first — do not chase the winner immediately."
        : "关键分看到对手在网前时，先把正手打高一点、深一点，不要先追求一拍穿越。";

    return [override, ...fixes.slice(1)];
  }

  if (problemTag === "second-serve-reliability" && modifiers.includes("tight")) {
    const override =
      locale === "en"
        ? "On key points, make the second serve your safest spin serve first — start by getting it in before adding pace."
        : "关键分时，把二发先当成最安全的上旋二发来发，先求进区，再谈球速。";

    return [override, ...fixes.slice(1)];
  }

  if (problemTag === "mobility-limit" && modifiers.includes("age")) {
    const override =
      locale === "en"
        ? "Shrink the movement radius first and protect the first recovery step instead of trying to cover every ball at full speed."
        : "先缩小移动半径，优先保住第一步和恢复步，不要一上来就想把所有球都全速追到。";

    return [override, ...fixes.slice(1)];
  }

  if (problemTag === "moonball-trouble" && modifiers.includes("moonball")) {
    const override =
      locale === "en"
        ? "Read the landing spot earlier and decide sooner whether to back up or take the moonball on the rise."
        : "先更早判断月亮球的落点，再早点决定是后退让位还是上升期处理。";

    return [override, ...fixes.slice(1)];
  }

  return fixes;
}

function buildModifierAwareCauses(
  problemTag: string,
  causes: string[],
  signalBundle: DiagnosisSignalBundle,
  locale: "zh" | "en" = "zh"
): string[] {
  if (causes.length === 0) {
    return causes;
  }

  const modifiers = signalBundle.layeredSignals.modifiers;
  const triggers = signalBundle.layeredSignals.triggers;

  if (
    problemTag === "forehand-out" &&
    modifiers.includes("key_point") &&
    triggers.includes("opponent_at_net")
  ) {
    const override =
      locale === "en"
        ? "On key points with the opponent at net, your attention shifts to not missing, which flattens the swing path and makes forehands fly long."
        : "关键分且对手在网前时，你会把注意力放在“别失误”上，挥拍路径容易变平，正手更容易飞出底线。";

    return [override, ...causes.slice(1)];
  }

  if (problemTag === "second-serve-reliability" && modifiers.includes("tight")) {
    const override =
      locale === "en"
        ? "On key points, fear of double faults can turn the second serve into a protective push, so toss rhythm and spin shape break down first."
        : "关键分怕双误时，二发容易变成保护性推送，抛球节奏和旋转形状会先散掉。";

    return [override, ...causes.slice(1)];
  }

  if (problemTag === "mobility-limit" && modifiers.includes("age")) {
    const override =
      locale === "en"
        ? "Age-related recovery speed loss makes the second and third movement steps harder, so position breaks after the first chase."
        : "年龄带来的恢复速度下降，会让第二步和第三步更吃力，因此第一拍追到后更容易失位。";

    return [override, ...causes.slice(1)];
  }

  if (problemTag === "moonball-trouble" && modifiers.includes("moonball")) {
    const override =
      locale === "en"
        ? "Moonballs disrupt spacing decisions first; once that decision is late, contact timing breaks before swing mechanics do."
        : "月亮球会先打乱你的站位选择；一旦站位决策偏晚，击球时机会先于动作本身失控。";

    return [override, ...causes.slice(1)];
  }

  return causes;
}

function buildModifierAwareDrills(
  problemTag: string,
  drills: string[],
  signalBundle: DiagnosisSignalBundle,
  locale: "zh" | "en" = "zh"
): string[] {
  if (drills.length === 0) {
    return drills;
  }

  const modifiers = signalBundle.layeredSignals.modifiers;
  const triggers = signalBundle.layeredSignals.triggers;

  if (
    problemTag === "forehand-out" &&
    modifiers.includes("key_point") &&
    triggers.includes("opponent_at_net")
  ) {
    const override =
      locale === "en"
        ? "12-minute key-point plus opponent-at-net simulation: forehand must go high and deep through the middle before any aggressive change."
        : "12 分钟关键分+对手上网模拟：正手先打高弧线中路深球，再考虑变线压制。";

    return [override, ...drills.slice(1)];
  }

  if (problemTag === "second-serve-reliability" && modifiers.includes("tight")) {
    const override =
      locale === "en"
        ? "12 key-point second-serve sequences: one reset breath plus one cue, then serve to a safe target before adding pace."
        : "关键分二发 12 组：每组先做一次呼吸重置并重复口令，先把安全目标区发进再加速。";

    return [override, ...drills.slice(1)];
  }

  if (problemTag === "mobility-limit" && modifiers.includes("age")) {
    const override =
      locale === "en"
        ? "8 sets of 20 seconds move plus 40 seconds reset: track only first-step initiation and one clean recovery step."
        : "20 秒移动 + 40 秒恢复，共 8 组：每组只盯第一步启动和一次干净回位。";

    return [override, ...drills.slice(1)];
  }

  if (problemTag === "moonball-trouble" && modifiers.includes("moonball")) {
    const override =
      locale === "en"
        ? "15 moonball reads: call bounce depth first, then decide rise-or-drop contact before swinging."
        : "月亮球判断 15 次：先报落点深浅，再决定上升期或下降期处理后再出手。";

    return [override, ...drills.slice(1)];
  }

  return drills;
}

function buildModifierAwareRecommendedContentIds(
  problemTag: string,
  baseContentIds: string[],
  signalBundle: DiagnosisSignalBundle
): string[] {
  const modifiers = signalBundle.layeredSignals.modifiers;
  const triggers = signalBundle.layeredSignals.triggers;
  const extraContentIds: string[] = [];

  if (
    problemTag === "forehand-out" &&
    modifiers.includes("key_point") &&
    triggers.includes("opponent_at_net")
  ) {
    extraContentIds.push("content_rb_03", "content_cn_f_01");
  }

  if (problemTag === "second-serve-reliability" && modifiers.includes("tight")) {
    extraContentIds.push("content_cn_e_02", "content_cn_f_01");
  }

  if (problemTag === "mobility-limit" && modifiers.includes("age")) {
    extraContentIds.push("content_fr_02");
  }

  if (problemTag === "moonball-trouble" && modifiers.includes("moonball")) {
    extraContentIds.push("content_common_01");
  }

  if (extraContentIds.length === 0) {
    return baseContentIds;
  }

  const [first, ...rest] = baseContentIds;

  return buildUniqueSignalList([first, ...extraContentIds, ...rest].filter(Boolean));
}

export function buildDiagnosisSummary(
  causes: string[],
  fixes: string[],
  fallbackUsed = false,
  locale: "zh" | "en" = "zh",
  problemTag?: string,
  signalBundle?: DiagnosisSignalBundle
): string {
  if (fallbackUsed) return locale === "en" ? DEFAULT_SUMMARY_EN : DEFAULT_SUMMARY;

  const modifiers = signalBundle?.layeredSignals.modifiers ?? [];
  const triggers = signalBundle?.layeredSignals.triggers ?? [];

  if (
    problemTag === "forehand-out" &&
    modifiers.includes("key_point") &&
    triggers.includes("opponent_at_net")
  ) {
    if (locale === "en") {
      return "Your main issue is still the forehand flying long, but it shows up more on key points when the opponent is at net because pressure makes it easier to overhit and rush the finish.";
    }

    return "你的主问题还是正手发力后容易出界，但它在关键分、对手来到网前时会更明显，因为人一紧就更容易着急发力，把球打飞。";
  }

  if (problemTag === "second-serve-reliability" && modifiers.includes("tight")) {
    if (locale === "en") {
      return "Your main issue is still second-serve reliability, but it shows up more clearly on key points because tension makes you protect the serve and lose your usual rhythm.";
    }

    return "你的主问题还是二发稳定性不足，但它在关键分时会更明显，因为一紧张就容易缩手缩脚，原本的发球节奏先散掉。";
  }

  if (problemTag === "mobility-limit" && modifiers.includes("age")) {
    if (locale === "en") {
      return "The main issue is still mobility and court coverage, but age and recovery speed now make wide balls and second movements harder to handle cleanly.";
    }

    return "你的主问题还是移动范围和到位能力受限，而且年纪上来以后，左右追球和连续恢复会更吃力，所以场地一拉开就更容易失位。";
  }

  if (problemTag === "moonball-trouble" && modifiers.includes("moonball")) {
    if (locale === "en") {
      return "Your main issue is handling moonballs and other high looping balls because they disrupt your spacing and timing before you decide whether to move back or take them early.";
    }

    return "你的主问题还是月亮球来球处理不顺，因为这类高吊球会先打乱你的站位和节奏，让你来不及决定是后退让位还是提前上升期处理。";
  }

  const cause = causes[0] ?? (locale === "en" ? "preparation and timing need clearer structure" : "准备和节奏上还需要更清晰的定位");
  const fix = fixes[0] ?? (locale === "en" ? "narrow the problem to a specific action" : "先把问题缩小到一个更具体的动作点");

  if (locale === "en") {
    return `The most important thing right now is not to fix everything at once, but to work on "${cause}" first. Start with: "${fix}".`;
  }

  return `你现在最值得先改的，不是一次性解决所有问题，而是先围绕"${cause}"去处理。建议先从"${fix}"开始。`;
}

function selectRuleContent(rule: DiagnosisRule, locale: "zh" | "en") {
  if (locale === "en") {
    return {
      causes: rule.causes_en ?? rule.causes,
      fixes: rule.fixes_en ?? rule.fixes,
      drills: rule.drills_en ?? rule.drills
    };
  }

  return {
    causes: rule.causes,
    fixes: rule.fixes,
    drills: rule.drills
  };
}

function getSupportAwareFallbackContentIds(supportSignals: DiagnosisSupportSignal[]) {
  return buildUniqueSignalList(supportSignals.flatMap((signal) => SUPPORT_SIGNAL_CONTENT_IDS[signal] ?? []));
}

function getSupportAwareFallbackCopy(
  supportSignals: DiagnosisSupportSignal[],
  locale: "zh" | "en"
): Pick<DiagnosisResult, "title" | "summary" | "causes" | "fixes" | "drills"> | null {
  const hasCantSelfPractice = supportSignals.includes("cant_self_practice");
  const hasPlateau = supportSignals.includes("plateau_no_progress");

  if (!hasCantSelfPractice && !hasPlateau) {
    return null;
  }

  if (locale === "en") {
    if (hasCantSelfPractice && hasPlateau) {
      return {
        title: "Let's narrow the training focus before adding more volume",
        summary: "Your description sounds more like a planning/support issue than a single stroke diagnosis. Start by shrinking the focus to one priority and using a clearer solo-practice structure.",
        causes: ["Too many goals are competing for attention", "Practice structure is not clear enough to guide the next session", "Without one main metric, it is hard to feel progress"],
        fixes: ["Pick one issue to train for the next week", "Use a simple solo-practice template instead of improvising", "Track one metric per session so progress is visible"],
        drills: ["Write down one training priority for this week", "Build one 20-30 minute solo-practice block", "Record one success-rate metric after each practice"]
      };
    }

    if (hasCantSelfPractice) {
      return {
        title: "Let's build a clearer self-practice structure first",
        summary: "This sounds more like a practice-planning gap than a single stroke issue. Start with a simple structure you can repeat on your own.",
        causes: ["Practice sessions do not have one clear target", "The next session is being improvised from scratch", "Solo training does not have a repeatable structure yet"],
        fixes: ["Choose one goal for each session", "Use a fixed 20-30 minute practice template", "Track one item after every practice"],
        drills: ["Write one goal and one tracking item before practice", "Run one simple 20-minute solo session", "Review the result in one sentence afterward"]
      };
    }

    return {
      title: "Let's shrink the focus before trying to fix everything",
      summary: "This sounds more like a plateau or focus issue than a single technical diagnosis. Start by reducing the number of things you are trying to change at once.",
      causes: ["Too many changes are being attempted at the same time", "There is no single match problem guiding practice", "Progress is hard to notice without one stable metric"],
      fixes: ["Pick one priority for the next week", "Use match mistakes to choose the next practice focus", "Track one stable metric across sessions"],
      drills: ["Write down one main issue for the week", "Track one repeated error after practice", "Keep the next three sessions focused on the same problem"]
    };
  }

  if (hasCantSelfPractice && hasPlateau) {
    return {
      title: "先把训练重点和自练结构理顺",
      summary: "你的描述更像训练规划支持问题，而不是单一技术动作。先把训练目标缩到一个主问题，再用更清楚的自练结构去执行。",
      causes: ["训练目标太多，注意力被分散", "每次练习缺少清楚结构，很难承接到下一次", "没有固定记录项时，进步很难被看见"],
      fixes: ["接下来一周只选一个主问题", "先用简单固定的自练模版，而不是每次临场想", "每次训练只记录一个指标"],
      drills: ["写下本周唯一主问题", "安排一组 20-30 分钟自练模版", "训练后只记录一个成功率指标"]
    };
  }

  if (hasCantSelfPractice) {
    return {
      title: "先把自练结构搭起来",
      summary: "你的描述更像训练规划缺口，而不是单一技术问题。先建立一个能重复执行的自练结构。",
      causes: ["每次练习没有单一目标", "下一次训练总是从零开始想", "自练缺少稳定模版"],
      fixes: ["每次训练只保留一个目标", "固定 20-30 分钟的小模版", "训练后记录一项结果"],
      drills: ["训练前写 1 个目标和 1 个记录项", "完成一组 20 分钟自练", "训练后写一句复盘"]
    };
  }

  return {
    title: "先把训练重点缩小到一个主问题",
    summary: "你的描述更像平台期或训练聚焦问题，而不是单一技术动作。先减少同时改动的事情，重新建立连续反馈。",
    causes: ["同一阶段想改的问题太多", "练习没有被比赛里最常见的失误牵引", "没有稳定指标时很难感受到进步"],
    fixes: ["接下来一周只围绕一个重点训练", "用比赛里最常见失误决定训练主题", "连续几次训练都记录同一个指标"],
    drills: ["写下本周唯一主问题", "训练后记录一个重复失误", "连续 3 次训练保持同一重点"]
  };
}

export function diagnoseProblem(input: string, options: DiagnoseOptions = {}): DiagnosisResult {
  const {
    level,
    assessmentResult,
    maxRecommendations = 3,
    rules = diagnosisRules,
    contentPool = contents,
    locale = "zh"
  } = options;
  const eligibleContentPool = contentPool.filter(isDirectLibraryVideo);

  const signalBundle = extractDiagnosisSignalBundle(input);
  const normalizedInput = signalBundle.normalizedInput;

  if (!normalizedInput) {
    return getDefaultDiagnosisResult(level, eligibleContentPool, maxRecommendations, locale);
  }

  const { rule, matchedKeywords, matchedSynonyms, score } = findBestDiagnosisRule(input, rules);

  if (!rule || score <= 0) {
    const supportAwareCopy = getSupportAwareFallbackCopy(signalBundle.supportSignals, locale);
    const supportContentIds = getSupportAwareFallbackContentIds(signalBundle.supportSignals);
    const fallbackMode = assessmentResult ? "assessment" : "no-assessment";

    const supportContents = getContentsByIds(supportContentIds, eligibleContentPool, maxRecommendations, level);
    const defCauses = supportAwareCopy?.causes ?? (locale === "en" ? DEFAULT_CAUSES_EN : DEFAULT_CAUSES);
    const defFixes = supportAwareCopy?.fixes ?? (locale === "en" ? DEFAULT_FIXES_EN : DEFAULT_FIXES);
    const defDrills = supportAwareCopy?.drills ?? (locale === "en" ? DEFAULT_DRILLS_EN : DEFAULT_DRILLS);

    return {
      input,
      normalizedInput,
      matchedRuleId: null,
      matchedKeywords: [],
      matchedSynonyms: [],
      matchScore: 0,
      confidence: "较低",
      category: ["general", "improvement"],
      problemTag: DEFAULT_PROBLEM_TAG,
      title: supportAwareCopy?.title ?? (
        fallbackMode === "assessment"
        ? (locale === "en"
          ? "Let's start from the weakest area in your assessment"
          : "我们先从你当前最值得补的一环开始")
        : (locale === "en"
          ? "Here is a general improvement direction to start with"
          : "先给你一组通用提升方向")
      ),
      summary: supportAwareCopy?.summary ??
        fallbackMode === "assessment"
          ? (locale === "en"
            ? "We could not match your problem precisely, but based on your level and current gaps these suggestions should help."
            : "我们暂时没有精确匹配到你的问题，但根据你的水平和当前短板，这些内容可能更适合你先看。")
          : (locale === "en"
            ? "Try the 1-minute assessment first for more targeted advice. In the meantime, start with these general suggestions."
            : "试试先做一次 1 分钟评估，我们能给你更准的建议。先从这些通用提升内容开始也可以。"),
      causes: defCauses,
      fixes: defFixes,
      drills: defDrills,
      recommendedContents: supportContents,
      searchQueries: null,
      fallbackUsed: true,
      fallbackMode,
      level
    };
  }

  const ruleContent = selectRuleContent(rule, locale);
  const modifierAwareCauses = buildModifierAwareCauses(rule.problemTag, ruleContent.causes, signalBundle, locale);
  const modifierAwareFixes = buildModifierAwareFixes(rule.problemTag, ruleContent.fixes, signalBundle, locale);
  const modifierAwareDrills = buildModifierAwareDrills(rule.problemTag, ruleContent.drills, signalBundle, locale);
  const modifierAwareContentIds = buildModifierAwareRecommendedContentIds(
    rule.problemTag,
    rule.recommendedContentIds,
    signalBundle
  );

  const recommendedContents = getDiagnosisRecommendedContents({
    rule,
    signalBundle,
    seedContentIds: modifierAwareContentIds,
    matchedKeywords,
    matchedSynonyms,
    contentPool: eligibleContentPool,
    maxRecommendations,
    level
  });
  const fallbackMode = recommendedContents.length === 0
    ? assessmentResult
      ? "assessment"
      : "no-assessment"
    : null;

  return {
    input,
    normalizedInput,
    matchedRuleId: rule.id,
    matchedKeywords,
    matchedSynonyms,
    matchScore: score,
    confidence: getDiagnosisConfidence(score),
    category: rule.category,
    problemTag: rule.problemTag,
    title: buildModifierAwareTitle(rule.problemTag, signalBundle, locale),
    summary: buildDiagnosisSummary(modifierAwareCauses, modifierAwareFixes, false, locale, rule.problemTag, signalBundle),
    causes: modifierAwareCauses,
    fixes: modifierAwareFixes,
    drills: modifierAwareDrills,
    recommendedContents,
    searchQueries: rule.searchQueries,
    fallbackUsed: recommendedContents.length === 0,
    fallbackMode,
    level
  };
}

export function getDefaultDiagnosisResult(
  level?: string,
  contentPool: ContentItem[] = contents,
  maxRecommendations = 3,
  locale: "zh" | "en" = "zh"
): DiagnosisResult {
  const recommendedContents = getContentsByIds(
    DEFAULT_CONTENT_IDS,
    contentPool,
    maxRecommendations,
    level
  );

  return {
    input: "",
    normalizedInput: "",
    matchedRuleId: null,
    matchedKeywords: [],
    matchedSynonyms: [],
    matchScore: 0,
    confidence: "较低",
    category: ["general", "improvement"],
    problemTag: DEFAULT_PROBLEM_TAG,
    title: locale === "en" ? "Describe your problem" : "直接描述你的问题",
    summary: locale === "en"
      ? "Tell us your issue in one sentence and we will give you a starting point and recommended direction."
      : "用一句话说出你的困惑，我们会先给你一个基础判断和推荐方向。",
    causes: locale === "en" ? DEFAULT_CAUSES_EN : DEFAULT_CAUSES,
    fixes: locale === "en" ? DEFAULT_FIXES_EN : DEFAULT_FIXES,
    drills: locale === "en" ? DEFAULT_DRILLS_EN : DEFAULT_DRILLS,
    recommendedContents,
    searchQueries: null,
    fallbackUsed: true,
    fallbackMode: null,
    level
  };
}

export function getProblemPreviewTags(locale: "zh" | "en" = "zh"): string[] {
  return PROBLEM_PREVIEW_OPTIONS.map((item) => locale === "en" ? item.label_en : item.label);
}

export function getProblemPreviewOptions(): ProblemPreviewOption[] {
  return PROBLEM_PREVIEW_OPTIONS;
}

export function hasSpecificContextCues(input: string): boolean {
  return /尤其|总是|更容易|一紧张|一快|左右移动|when|especially|always|under pressure|gets worse|doubles/i.test(input);
}
