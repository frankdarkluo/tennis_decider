export type PlanMicrocycleRole =
  | "stabilize"
  | "repeatable_mechanics"
  | "controlled_variability"
  | "review_reset"
  | "pressure_repetition"
  | "transfer"
  | "consolidation";

export const PLAN_MICROCYCLE_ROLES: Array<{
  day: number;
  role: PlanMicrocycleRole;
  labelZh: string;
  labelEn: string;
}> = [
  { day: 1, role: "stabilize", labelZh: "稳定建立", labelEn: "stabilize" },
  { day: 2, role: "repeatable_mechanics", labelZh: "可重复动作", labelEn: "repeatable mechanics" },
  { day: 3, role: "controlled_variability", labelZh: "受控变化", labelEn: "controlled variability" },
  { day: 4, role: "review_reset", labelZh: "复盘重置", labelEn: "review and reset" },
  { day: 5, role: "pressure_repetition", labelZh: "压力重复", labelEn: "pressure repetition" },
  { day: 6, role: "transfer", labelZh: "场景转移", labelEn: "transfer" },
  { day: 7, role: "consolidation", labelZh: "巩固收口", labelEn: "consolidation" }
];
