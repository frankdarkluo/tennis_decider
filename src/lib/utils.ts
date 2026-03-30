import clsx, { ClassValue } from "clsx";

export const ASSESSMENT_STORAGE_KEY = "tennislevel-assessment-result";
export const ASSESSMENT_DRAFT_STORAGE_KEY = "tennislevel-assessment-draft";

export function cn(...inputs: ClassValue[]) {
  return clsx(inputs);
}

export function toChineseSkill(skill: string): string {
  const map: Record<string, string> = {
    forehand: "正手",
    backhand: "反手",
    serve: "发球",
    net: "网前",
    movement: "步伐",
    matchplay: "比赛意识",
    rally: "对拉稳定性",
    awareness: "比赛意识",
    fundamentals: "基础动作",
    receiving: "接球能力",
    doubles: "双打",
    basics: "基础",
    consistency: "稳定性",
    both_sides: "正反手均衡",
    direction: "方向控制",
    rhythm: "节奏适应",
    "net_play": "网前",
    "depth_variety": "深度和变化",
    forcing: "施压能力",
    tactics: "策略执行",
    topspin: "上旋",
    return: "接发球",
    training: "训练",
    mental: "心理",
    grip: "握拍",
    footwork: "脚步",
    slice: "切削",
    defense: "防守",
    "match-anxiety": "比赛紧张"
  };
  return map[skill] ?? skill;
}

export function toChineseLevel(level: string): string {
  if (["2.5", "3.0", "3.5", "4.0", "4.5"].includes(level)) {
    return level;
  }
  return "3.0";
}

export function textIncludesAll(text: string, keywords: string[]) {
  return keywords.every((keyword) => text.includes(keyword));
}
