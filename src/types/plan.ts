export type PlanLevel = "2.5" | "3.0" | "3.5" | "4.0" | "4.0+";

export type DayPlan = {
  day: number;
  focus: string;
  contentIds: string[];
  drills: string[];
  duration: string;
};

export type PlanTemplateDay = DayPlan & {
  focusEn: string;
  drillsEn: string[];
  durationEn: string;
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
