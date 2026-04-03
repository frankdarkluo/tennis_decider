import { AssessmentQuestion } from "@/types/assessment";

export const assessmentQuestions: AssessmentQuestion[] = [
  {
    id: "gender",
    phase: "profile",
    type: "gender",
    question: "你的性别？",
    options: [
      { label: "男", value: 1 },
      { label: "女", value: 2 }
    ]
  },
  /*
  {
    id: "years",
    phase: "profile",
    type: "slider",
    question: "打了多久网球？",
    sliderConfig: {
      min: 0,
      max: 10,
      step: 0.5,
      default: 2,
      displayLabels: [
        { value: 0, label: "0" },
        { value: 2, label: "2年" },
        { value: 5, label: "5年" },
        { value: 10, label: "10年+" }
      ]
    }
  },
  */
  {
    id: "coarse_rally",
    phase: "coarse",
    type: "choice",
    question: "日常练习中，你通常能连续对打多少拍？",
    options: [
      { label: "3 拍以内", value: 1 },
      { label: "4-8 拍", value: 2 },
      { label: "9-15 拍", value: 3 },
      { label: "16 拍以上，主动失误比较少", value: 4 }
    ],
    dimension: "rally"
  },
  {
    id: "coarse_serve",
    phase: "coarse",
    type: "choice",
    question: "你的发球大概什么状态？",
    options: [
      { label: "还在练，经常发不进", value: 1 },
      { label: "能发进但没什么旋转", value: 2 },
      { label: "有一定旋转和落点控制", value: 3 },
      { label: "一发有攻击性，二发也比较稳", value: 4 }
    ],
    dimension: "serve"
  },
  {
    id: "coarse_awareness",
    phase: "coarse",
    type: "choice",
    question: "你对打或比赛时脑子里在想什么？",
    options: [
      { label: "先把球打过去就行", value: 1 },
      { label: "会想打方向但经常做不到", value: 2 },
      { label: "能有意识地调动对手", value: 3 },
      { label: "能根据对手弱点组织战术", value: 4 }
    ],
    dimension: "awareness"
  },
  {
    id: "fine_a_grip",
    phase: "fine",
    branch: "A",
    type: "choice",
    question: "打球时你的握拍和准备动作？",
    options: [
      { label: "还不太确定怎么握", value: 1 },
      { label: "知道怎么握但经常忘", value: 2 },
      { label: "基本固定，偶尔会乱", value: 3 },
      { label: "已经很自然不用想了", value: 4 }
    ],
    dimension: "fundamentals"
  },
  {
    id: "fine_a_fast",
    phase: "fine",
    branch: "A",
    type: "choice",
    question: "对方来球速度稍快时？",
    options: [
      { label: "经常反应不过来", value: 1 },
      { label: "能碰到但方向控不住", value: 2 },
      { label: "大多能回过去", value: 3 },
      { label: "能回过去而且有一定质量", value: 4 }
    ],
    dimension: "receiving"
  },
  {
    id: "fine_a_issue",
    phase: "fine",
    branch: "A",
    type: "choice",
    question: "你目前打球最大的困扰是？",
    options: [
      { label: "动作还没有固定下来", value: 1 },
      { label: "动作有了但失误太多", value: 2 },
      { label: "稳定性时好时坏", value: 3 },
      { label: "能打稳但想要更多变化", value: 4 }
    ],
    dimension: "consistency"
  },
  {
    id: "fine_b_both_sides",
    phase: "fine",
    branch: "B",
    type: "choice",
    question: "你正手和反手的差距大吗？",
    options: [
      { label: "反手明显比正手弱很多", value: 1 },
      { label: "反手能打但不敢主动用", value: 2 },
      { label: "差距不大，都还比较稳", value: 3 },
      { label: "两边都能主动打出质量", value: 4 }
    ],
    dimension: "both_sides"
  },
  {
    id: "fine_b_direction",
    phase: "fine",
    branch: "B",
    type: "choice",
    question: "你能有意识地控制球的方向吗？",
    options: [
      { label: "基本控制不了", value: 1 },
      { label: "偶尔能打到想要的方向", value: 2 },
      { label: "大部分时候能控制", value: 3 },
      { label: "能稳定地打出直线和斜线", value: 4 }
    ],
    dimension: "direction"
  },
  {
    id: "fine_b_rhythm",
    phase: "fine",
    branch: "B",
    type: "choice",
    question: "对方突然变节奏或加旋转时？",
    options: [
      { label: "很容易被打崩", value: 1 },
      { label: "能撑住但回球质量明显下降", value: 2 },
      { label: "能适应，回球质量还行", value: 3 },
      { label: "基本不受影响", value: 4 }
    ],
    dimension: "rhythm"
  },
  {
    id: "fine_c_net",
    phase: "fine",
    branch: "C",
    type: "choice",
    question: "你上网时的状态？",
    options: [
      { label: "基本不上网", value: 1 },
      { label: "偶尔上网，简单球能处理", value: 2 },
      { label: "会主动上网，截击比较有信心", value: 3 },
      { label: "网前是我的得分手段之一", value: 4 }
    ],
    dimension: "net_play"
  },
  {
    id: "fine_c_depth",
    phase: "fine",
    branch: "C",
    type: "choice",
    question: "你的击球有深度和变化吗？",
    options: [
      { label: "球经常落在发球线附近", value: 1 },
      { label: "能打深但变化不多", value: 2 },
      { label: "能控制深度也能变方向", value: 3 },
      { label: "能用深度、角度和旋转组合变化", value: 4 }
    ],
    dimension: "depth_variety"
  },
  {
    id: "fine_c_forcing",
    phase: "fine",
    branch: "C",
    type: "choice",
    question: "你能主动让对手失误吗？",
    options: [
      { label: "主要靠对手自己失误", value: 1 },
      { label: "偶尔能打出压迫性的球", value: 2 },
      { label: "能比较稳定地逼迫对手失误", value: 3 },
      { label: "能通过组合球主动创造得分机会", value: 4 }
    ],
    dimension: "forcing"
  }
];

export default assessmentQuestions;
