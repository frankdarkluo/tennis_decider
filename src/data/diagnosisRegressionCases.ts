import { DiagnosisEvidenceLevel } from "@/types/diagnosis";

export type DiagnosisRegressionCaseRiskTag =
  | "key_point"
  | "moonball"
  | "doubles_net"
  | "mobility_age"
  | "long_tail_net"
  | "tactics"
  | "pressure_pattern"
  | "movement_context"
  | "support_only"
  | "general";

export type DiagnosisRegressionCase = {
  id: string;
  input: string;
  expectedProblemTag: string;
  allowedEvidenceLevels: DiagnosisEvidenceLevel[];
  riskTag: DiagnosisRegressionCaseRiskTag;
};

export const diagnosisRegressionCases: DiagnosisRegressionCase[] = [
  {
    id: "key-point-second-serve-double-fault",
    input: "关键分二发总双误",
    expectedProblemTag: "second-serve-reliability",
    allowedEvidenceLevels: ["medium", "high"],
    riskTag: "key_point"
  },
  {
    id: "moonball-backhand-discomfort",
    input: "月亮球一来我反手就很别扭",
    expectedProblemTag: "moonball-trouble",
    allowedEvidenceLevels: ["medium", "high"],
    riskTag: "moonball"
  },
  {
    id: "doubles-positioning-unclear",
    input: "双打网前轮转总乱，搭档一动我就不知道站哪",
    expectedProblemTag: "doubles-positioning",
    allowedEvidenceLevels: ["medium", "high"],
    riskTag: "doubles_net"
  },
  {
    id: "age-related-mobility-limit",
    input: "年纪大了跑不太动，左右追球跟不上",
    expectedProblemTag: "mobility-limit",
    allowedEvidenceLevels: ["medium", "high"],
    riskTag: "mobility_age"
  },
  {
    id: "pressure-forehand-out-with-net-trigger",
    input: "正手在关键分的时候，如果对手在网前，我容易紧张，一发力就出界",
    expectedProblemTag: "forehand-out",
    allowedEvidenceLevels: ["high"],
    riskTag: "key_point"
  },
  {
    id: "support-only-plateau",
    input: "练了很久没进步，不知道自己该练什么",
    expectedProblemTag: "general-improvement",
    allowedEvidenceLevels: ["low"],
    riskTag: "support_only"
  },
  {
    id: "english-pressure-second-serve-typo",
    input: "At brekpoint my second serve doublefaults",
    expectedProblemTag: "second-serve-reliability",
    allowedEvidenceLevels: ["medium", "high"],
    riskTag: "key_point"
  },
  {
    id: "net-first-volley-dirty-contact",
    input: "网前第一拍总处理不干净",
    expectedProblemTag: "volley-contact-instability",
    allowedEvidenceLevels: ["medium", "high"],
    riskTag: "long_tail_net"
  },
  {
    id: "half-volley-cannot-lift",
    input: "半截击总是挑不起来",
    expectedProblemTag: "half-volley-late-contact",
    allowedEvidenceLevels: ["medium", "high"],
    riskTag: "long_tail_net"
  },
  {
    id: "doubles-poach-hesitation",
    input: "双打网前不敢抢",
    expectedProblemTag: "doubles-poach-hesitation",
    allowedEvidenceLevels: ["medium", "high"],
    riskTag: "doubles_net"
  },
  {
    id: "point-construction-missing",
    input: "不会组织分点",
    expectedProblemTag: "passive-point-construction",
    allowedEvidenceLevels: ["medium", "high"],
    riskTag: "tactics"
  },
  {
    id: "pressure-safe-short-collapse",
    input: "比赛里关键分一紧张就只敢搓短球",
    expectedProblemTag: "safe-short-collapse",
    allowedEvidenceLevels: ["medium", "high"],
    riskTag: "pressure_pattern"
  },
  {
    id: "on-the-run-late-contact",
    input: "跑动中正手总晚点",
    expectedProblemTag: "on-the-run-late-contact",
    allowedEvidenceLevels: ["medium", "high"],
    riskTag: "movement_context"
  }
];
