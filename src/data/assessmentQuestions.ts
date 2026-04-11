import { AssessmentQuestion } from "@/types/assessment";

export const ASSESSMENT_QUESTIONS: AssessmentQuestion[] = [
  {
    id: "rally_stability",
    type: "scored",
    dimension: "rally",
    prompt: "平时对拉时，你多数情况下能把球维持在什么质量？",
    uiVariant: "list",
    options: [
      { id: "rally_1", value: "rally_1", label: "3 拍内经常先自己失误", score: 1 },
      { id: "rally_2", value: "rally_2", label: "4–8 拍通常能维持，但球一快、一深或一变方向就容易断", score: 2 },
      { id: "rally_3", value: "rally_3", label: "9–15 拍多数能维持，遇到稍快的球也还能继续打", score: 3 },
      { id: "rally_4", value: "rally_4", label: "16 拍以上也能基本保持质量，主动失误相对少", score: 4 }
    ]
  },
  {
    id: "forehand_weapon",
    type: "scored",
    dimension: "forehand",
    prompt: "遇到自己舒服的正手球时，你最接近哪种状态？",
    uiVariant: "list",
    options: [
      { id: "forehand_1", value: "forehand_1", label: "主要是把球回过去，很难主动发力或压制", score: 1 },
      { id: "forehand_2", value: "forehand_2", label: "敢发力，但失误偏多，比赛里不太敢常用", score: 2 },
      { id: "forehand_3", value: "forehand_3", label: "大多数时候能打出有质量的正手，偶尔能主动压住对手", score: 3 },
      { id: "forehand_4", value: "forehand_4", label: "正手已经是明确武器，能靠它主动变线、加速或制造机会", score: 4 }
    ]
  },
  {
    id: "backhand_slice_reliability",
    type: "scored",
    dimension: "backhand_slice",
    prompt: "你的反手和切削整体更接近哪种状态？",
    uiVariant: "list",
    options: [
      { id: "backhand_slice_1", value: "backhand_slice_1", label: "反手明显吃亏，切削也基本不敢用", score: 1 },
      { id: "backhand_slice_2", value: "backhand_slice_2", label: "反手能打，但一受压就容易散；切削常飘或太短", score: 2 },
      { id: "backhand_slice_3", value: "backhand_slice_3", label: "反手多数能稳住，切削能作为过渡球或防守变化使用", score: 3 },
      { id: "backhand_slice_4", value: "backhand_slice_4", label: "反手能稳定对抗，切削也能主动压低或打乱对手节奏", score: 4 }
    ]
  },
  {
    id: "serve_quality",
    type: "scored",
    dimension: "serve",
    prompt: "在自己的发球局里，你的发球更接近哪种状态？",
    uiVariant: "list",
    options: [
      { id: "serve_1", value: "serve_1", label: "一发进率和二发安全都不稳，经常直接送分", score: 1 },
      { id: "serve_2", value: "serve_2", label: "一发能发进一些，但二发比较虚，容易被对手上手", score: 2 },
      { id: "serve_3", value: "serve_3", label: "一发有基本落点或节奏，二发大多数时候能把回合稳定开始", score: 3 },
      { id: "serve_4", value: "serve_4", label: "一发能制造优势，二发也可靠，不容易被直接压制", score: 4 }
    ]
  },
  {
    id: "return_quality",
    type: "scored",
    dimension: "return",
    prompt: "面对对手发球时，你的接发更接近哪种状态？",
    uiVariant: "list",
    options: [
      { id: "return_1", value: "return_1", label: "经常接不到舒服的击球点，只能勉强碰到或直接失误", score: 1 },
      { id: "return_2", value: "return_2", label: "普通发球能接回去，但速度快一点或旋转明显就容易失误", score: 2 },
      { id: "return_3", value: "return_3", label: "大多数发球都能接进场，并把回合正常拉起来", score: 3 },
      { id: "return_4", value: "return_4", label: "不仅能接进场，还能通过落点、节奏或线路给对手压力", score: 4 }
    ]
  },
  {
    id: "movement_recovery",
    type: "scored",
    dimension: "movement",
    prompt: "跑动、制动和还原整体更接近哪种状态？",
    uiVariant: "list",
    options: [
      { id: "movement_1", value: "movement_1", label: "经常启动慢半拍，打完也容易站住", score: 1 },
      { id: "movement_2", value: "movement_2", label: "能追到不少球，但急停后下一拍常接不上", score: 2 },
      { id: "movement_3", value: "movement_3", label: "大多数球能赶到，打完也能基本回到准备位置", score: 3 },
      { id: "movement_4", value: "movement_4", label: "启动、制动、还原都比较自然，跑动中还能保持基本击球质量", score: 4 }
    ]
  },
  {
    id: "net_transition_volley",
    type: "scored",
    dimension: "net",
    prompt: "上网、截击和过渡球处理更接近哪种状态？",
    uiVariant: "list",
    options: [
      { id: "net_1", value: "net_1", label: "基本不上网，上网后第一拍常直接失误", score: 1 },
      { id: "net_2", value: "net_2", label: "简单高球能截到，但低球、快球或半截击就容易乱", score: 2 },
      { id: "net_3", value: "net_3", label: "知道什么时候该上网，第一拍大多能处理干净，半截击偶尔能救", score: 3 },
      { id: "net_4", value: "net_4", label: "能主动利用上网施压或结束分数，低球和半截击也有基本质量", score: 4 }
    ]
  },
  {
    id: "overhead_highball",
    type: "scored",
    dimension: "overhead",
    prompt: "处理高球、高压和头顶球时，你更接近哪种状态？",
    uiVariant: "list",
    options: [
      { id: "overhead_1", value: "overhead_1", label: "经常判断不好落点，不敢主动压", score: 1 },
      { id: "overhead_2", value: "overhead_2", label: "能打到球，但脚步和击球点不稳，质量一般", score: 2 },
      { id: "overhead_3", value: "overhead_3", label: "大多数高球和高压都能处理干净，不容易白送", score: 3 },
      { id: "overhead_4", value: "overhead_4", label: "能主动用高压终结，遇到需要回撤的高球也比较从容", score: 4 }
    ]
  },
  {
    id: "pressure_matchplay",
    type: "scored",
    dimension: "pressure",
    prompt: "比分紧、被追分，或者连续失误后，你通常会怎样？",
    uiVariant: "list",
    options: [
      { id: "pressure_1", value: "pressure_1", label: "明显发紧，动作变形，失误会一下变多", score: 1 },
      { id: "pressure_2", value: "pressure_2", label: "会明显保守，虽然能回球，但质量掉得很多", score: 2 },
      { id: "pressure_3", value: "pressure_3", label: "大体还能保持平时水平，不至于关键分完全失常", score: 3 },
      { id: "pressure_4", value: "pressure_4", label: "关键分能保持清楚思路，也敢用自己最可靠的球", score: 4 }
    ]
  },
  {
    id: "point_construction",
    type: "scored",
    dimension: "tactics",
    prompt: "比赛或对拉中，你是否能按一个清楚的思路去组织分点？",
    uiVariant: "list",
    options: [
      { id: "tactics_1", value: "tactics_1", label: "大多只是先把球回过去，很少会想下一拍怎么打", score: 1 },
      { id: "tactics_2", value: "tactics_2", label: "知道自己想打什么，但比赛里经常第一拍做不到，后面就乱了", score: 2 },
      { id: "tactics_3", value: "tactics_3", label: "有 1–2 个比较常用的套路，比如先压一侧再找空档", score: 3 },
      { id: "tactics_4", value: "tactics_4", label: "能根据对手、比分和来球质量主动切换套路，不只是机械回球", score: 4 }
    ]
  },
  {
    id: "play_style_profile",
    type: "profile",
    dimension: "play_style",
    prompt: "你现在更接近哪种打球风格？",
    uiVariant: "card-grid",
    options: [
      { id: "style_defensive", value: "defensive", label: "稳定防守型", description: "先把球打稳，等对手失误", icon: "shield" },
      { id: "style_baseline_attack", value: "baseline_attack", label: "底线推进型", description: "更想靠正反手质量压住对手", icon: "zap" },
      { id: "style_all_court", value: "all_court", label: "全场过渡型", description: "会主动找机会上网，从底线打到网前", icon: "move-up-right" },
      { id: "style_net_pressure", value: "net_pressure", label: "网前压迫型", description: "喜欢抢网、截击、双打式施压", icon: "target" }
    ]
  },
  {
    id: "play_context_modifier",
    type: "profile",
    dimension: "context",
    prompt: "你现在最接近哪种真实打球情况？",
    uiVariant: "card-grid",
    options: [
      { id: "context_singles_standard", value: "singles_standard", label: "单打为主", description: "跑动不是明显限制", icon: "user" },
      { id: "context_singles_limited_mobility", value: "singles_limited_mobility", label: "单打为主但需控负荷", description: "体能、跑动或恢复需要被特别考虑", icon: "activity" },
      { id: "context_mixed_with_doubles", value: "mixed_with_doubles", label: "单双都打", description: "网前和配合也重要", icon: "users" },
      { id: "context_doubles_primary", value: "doubles_primary", label: "双打为主", description: "希望更多站位轮转和网前内容", icon: "grid-2x2" }
    ]
  }
];

export const SCORED_QUESTION_IDS = ASSESSMENT_QUESTIONS
  .filter((question) => question.type === "scored")
  .map((question) => question.id);

export const PROFILE_QUESTION_IDS = ASSESSMENT_QUESTIONS
  .filter((question) => question.type === "profile")
  .map((question) => question.id);

export const QUESTIONS_BY_ID = Object.fromEntries(
  ASSESSMENT_QUESTIONS.map((question) => [question.id, question])
) as Record<string, AssessmentQuestion>;

export const assessmentQuestions = ASSESSMENT_QUESTIONS;

export default assessmentQuestions;
