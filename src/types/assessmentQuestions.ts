import { AssessmentQuestion } from "./assessment";

export const assessmentQuestions: AssessmentQuestion[] = [
  {
    id: "fh_01",
    dimension: "forehand",
    question: "你的正手在中等来球下通常如何？",
    options: [
      { label: "基本能回过去，但经常失误", score: 2 },
      { label: "能保持一定稳定性，偶尔能控制方向", score: 3 },
      { label: "比较稳定，能有意识控制方向和深度", score: 4 }
    ]
  },
  {
    id: "bh_01",
    dimension: "backhand",
    question: "你的反手在对抗中最常见的状态是什么？",
    options: [
      { label: "经常下网或来不及准备", score: 2 },
      { label: "能回过去，但质量一般", score: 3 },
      { label: "比较稳定，能参与相持", score: 4 }
    ]
  },
  {
    id: "sv_01",
    dimension: "serve",
    question: "你对自己的二发感觉如何？",
    options: [
      { label: "没有信心，容易双误", score: 2 },
      { label: "能发进去，但节奏不稳定", score: 3 },
      { label: "基本稳定，比赛里敢用", score: 4 }
    ]
  }
];