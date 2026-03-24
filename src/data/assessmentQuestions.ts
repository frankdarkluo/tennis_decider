import { AssessmentQuestion } from "@/types/assessment";

export const assessmentQuestions: AssessmentQuestion[] = [
  {
    id: "fh_01",
    dimension: "forehand",
    question: "你的正手在中等来球下通常是什么状态？",
    options: [
      { label: "经常失误，只能勉强把球回过去", score: 1 },
      { label: "偶尔能连续回合，但稳定性一般", score: 2 },
      { label: "大多数时候能稳定回过去，偶尔能控制方向", score: 3 },
      { label: "比较稳定，能有意识控制方向和落点", score: 4 },
      { label: "不仅稳定，还能主动用正手制造压迫", score: 5 },
      { label: "我不太确定，需要再观察", score: 0 }
    ]
  },
  {
    id: "fh_02",
    dimension: "forehand",
    question: "当你想用正手发力时，最常见的结果是什么？",
    options: [
      { label: "一发力就容易出界或动作变形", score: 1 },
      { label: "偶尔能打出力量，但失误明显增多", score: 2 },
      { label: "能适度加力，但还不太敢持续这么打", score: 3 },
      { label: "能在一定强度下保持稳定和方向", score: 4 },
      { label: "能稳定加速，并根据来球调整节奏", score: 5 },
      { label: "我不太确定，需要再观察", score: 0 }
    ]
  },
  {
    id: "bh_01",
    dimension: "backhand",
    question: "你的反手在对抗中通常表现如何？",
    options: [
      { label: "经常下网或打不实，很怕被打到反手", score: 1 },
      { label: "能回过去一些球，但不太稳定", score: 2 },
      { label: "基本能参与相持，但质量一般", score: 3 },
      { label: "比较稳定，能控制基本方向", score: 4 },
      { label: "反手已经是可靠武器，不容易被针对", score: 5 },
      { label: "我不太确定，需要再观察", score: 0 }
    ]
  },
  {
    id: "bh_02",
    dimension: "backhand",
    question: "面对稍快一点的来球时，你的反手最常出现什么问题？",
    options: [
      { label: "经常来不及准备，击球点很晚", score: 1 },
      { label: "准备经常偏慢，容易下网或回浅", score: 2 },
      { label: "偶尔会晚，但多数时候还能处理", score: 3 },
      { label: "准备比较及时，能保持基本稳定", score: 4 },
      { label: "准备很自然，能主动应对不同节奏", score: 5 },
      { label: "我不太确定，需要再观察", score: 0 }
    ]
  },
  {
    id: "sv_01",
    dimension: "serve",
    question: "你对自己发球整体的感受更接近哪一项？",
    options: [
      { label: "动作还没建立，发球经常发不进去", score: 1 },
      { label: "偶尔能发进，但稳定性和节奏都一般", score: 2 },
      { label: "一发有时不错，但整体还不够可靠", score: 3 },
      { label: "发球比较稳定，比赛里能正常使用", score: 4 },
      { label: "发球已经有一定威胁，能主动拿优势", score: 5 },
      { label: "我不太确定，需要再观察", score: 0 }
    ]
  },
  {
    id: "sv_02",
    dimension: "serve",
    question: "你对二发的信心通常如何？",
    options: [
      { label: "没有信心，常常担心双误", score: 1 },
      { label: "能发进去一些，但比赛里不敢放手发", score: 2 },
      { label: "基本能发进，但质量不高、节奏不稳", score: 3 },
      { label: "比较稳定，比赛里敢正常使用", score: 4 },
      { label: "二发稳定且有策略，不只是保守把球发进", score: 5 },
      { label: "我不太确定，需要再观察", score: 0 }
    ]
  },
  {
    id: "mv_01",
    dimension: "movement",
    question: "在底线相持中，你对自己移动和到位的评价更接近哪一项？",
    options: [
      { label: "经常赶不上球，击球点总是很别扭", score: 1 },
      { label: "能追到球，但经常来不及完全到位", score: 2 },
      { label: "多数时候能到位，但脚步调整还不够细", score: 3 },
      { label: "移动比较到位，击球准备较稳定", score: 4 },
      { label: "移动积极且高效，能很好适应不同来球", score: 5 },
      { label: "我不太确定，需要再观察", score: 0 }
    ]
  },
  {
    id: "mp_01",
    dimension: "matchplay",
    question: "在比赛或对抗中，你通常有多清楚自己应该怎么打？",
    options: [
      { label: "基本没有思路，主要靠把球回过去", score: 1 },
      { label: "偶尔有想法，但一紧张就乱了", score: 2 },
      { label: "有一些基本思路，比如多打对手弱点", score: 3 },
      { label: "能根据对手和比分调整基本策略", score: 4 },
      { label: "比赛中思路清晰，能主动执行和调整战术", score: 5 },
      { label: "我不太确定，需要再观察", score: 0 }
    ]
  }
];

export default assessmentQuestions;
