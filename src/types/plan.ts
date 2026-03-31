export type PlanLevel = "2.5" | "3.0" | "3.5" | "4.0" | "4.5";

export type PlanIntensity = "low" | "medium" | "medium_high";

export type PlanTempo = "slow" | "controlled" | "match_70";

export type DayPlanBlock = {
  title: string;
  items: string[];
};

export type DayPlan = {
  day: number;
  focus: string;
  contentIds: string[];
  drills: string[];
  duration: string;
  goal: string;
  warmupBlock: DayPlanBlock;
  mainBlock: DayPlanBlock;
  pressureBlock: DayPlanBlock;
  successCriteria: string[];
  intensity: PlanIntensity;
  tempo: PlanTempo;
};

export type PlanTemplateDay = {
  day: number;
  focus: string;
  contentIds: string[];
  drills: string[];
  duration: string;
  focusEn: string;
  drillsEn: string[];
  durationEn: string;
  goal?: string;
  goalEn?: string;
  warmupBlock?: DayPlanBlock;
  warmupBlockEn?: DayPlanBlock;
  mainBlock?: DayPlanBlock;
  mainBlockEn?: DayPlanBlock;
  pressureBlock?: DayPlanBlock;
  pressureBlockEn?: DayPlanBlock;
  successCriteria?: string[];
  successCriteriaEn?: string[];
  intensity?: PlanIntensity;
  tempo?: PlanTempo;
};

export type PlanTemplate = {
  problemTag: string;
  level: "3.0" | "3.5" | "4.0";
  title: string;
  titleEn: string;
  target: string;
  targetEn: string;
  days: PlanTemplateDay[];
};

export type GeneratedPlan = {
  source: "template" | "fallback";
  level: PlanLevel;
  problemTag: string;
  title: string;
  target: string;
  summary?: string;
  days: DayPlan[];
};
