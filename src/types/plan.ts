export type DayPlan = {
  day: number;
  focus: string;
  contentIds: string[];
  drills: string[];
  duration: string;
};

export type PlanTemplate = {
  problemTag: string;
  level: "3.0" | "3.5" | "4.0";
  title: string;
  target: string;
  days: DayPlan[];
};

export type GeneratedPlan = {
  source: "template" | "fallback";
  level: "3.0" | "3.5" | "4.0";
  problemTag: string;
  title: string;
  target: string;
  summary?: string;
  days: DayPlan[];
};