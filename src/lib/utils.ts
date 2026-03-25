import clsx, { ClassValue } from "clsx";

export const ASSESSMENT_STORAGE_KEY = "tennislevel-assessment-result";

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
    doubles: "双打",
    basics: "基础",
    consistency: "稳定性",
    topspin: "上旋",
    return: "接发球",
    training: "训练",
    mental: "心理",
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
