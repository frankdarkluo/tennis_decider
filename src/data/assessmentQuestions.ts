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
    id: "coarse_movement",
    phase: "coarse",
    type: "choice",
    question: "来回移动和还原时，你通常是什么状态？",
    options: [
      { label: "经常站住，看着球过去", value: 1 },
      { label: "会去追球，但经常慢半拍", value: 2 },
      { label: "大部分球都能赶到并回位", value: 3 },
      { label: "启动和回位都比较自然，很少被打定住", value: 4 }
    ],
    dimension: "movement"
  },
  {
    id: "coarse_awareness",
    phase: "coarse",
    type: "choice",
    question: "你练球或者比赛时脑海里在想什么？",
    options: [
      { label: "先把球打过去就行", value: 1 },
      { label: "会想打方向但经常做不到", value: 2 },
      { label: "能有意识地调动对手", value: 3 },
      { label: "能根据对手弱点组织战术", value: 4 }
    ],
    dimension: "awareness"
  },
  {
    id: "coarse_pressure",
    phase: "coarse",
    type: "choice",
    question: "比分紧张或练习加压时，你通常会怎样？",
    options: [
      { label: "明显发紧，失误一下变多", value: 1 },
      { label: "会保守，质量掉得比较多", value: 2 },
      { label: "大体还能保持平时水平", value: 3 },
      { label: "越到关键分越能打出自己的球", value: 4 }
    ],
    dimension: "pressure_performance"
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
    id: "fine_a_movement",
    phase: "fine",
    branch: "A",
    type: "choice",
    question: "打球时你的跑位和还原做得怎么样？",
    options: [
      { label: "打完常站在原地", value: 1 },
      { label: "会动，但很少及时回位", value: 2 },
      { label: "大多能回到准备位置", value: 3 },
      { label: "每拍后回位已经比较自然", value: 4 }
    ],
    dimension: "movement"
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
    id: "fine_b_slice",
    phase: "fine",
    branch: "B",
    type: "choice",
    question: "你的切削现在更接近哪种状态？",
    options: [
      { label: "基本不敢用，或者一切就飘", value: 1 },
      { label: "能打出来，但高度和落点不太稳", value: 2 },
      { label: "能把切削当过渡球或变化球用", value: 3 },
      { label: "能稳定压低，也能主动用它改变节奏", value: 4 }
    ],
    dimension: "slice"
  },
  {
    id: "fine_b_serve_game",
    phase: "fine",
    branch: "B",
    type: "choice",
    question: "你的发球局稳定吗？",
    options: [
      { label: "经常保不住发球局", value: 1 },
      { label: "偶尔能保发，但不太稳", value: 2 },
      { label: "多数时候能靠发球局稳住局面", value: 3 },
      { label: "发球局已经是我的可靠优势", value: 4 }
    ],
    dimension: "serve"
  },
  {
    id: "fine_c_volley",
    phase: "fine",
    branch: "C",
    type: "choice",
    question: "你在网前处理截击时更接近哪种状态？",
    options: [
      { label: "基本不上网，或者截击一碰就乱", value: 1 },
      { label: "简单球能处理，但受压就容易失误", value: 2 },
      { label: "会主动上网，截击大多能处理干净", value: 3 },
      { label: "截击已经是我稳定的得分或压迫手段", value: 4 }
    ],
    dimension: "volley"
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
    id: "fine_c_overhead",
    phase: "fine",
    branch: "C",
    type: "choice",
    question: "遇到高压球时，你现在更接近哪种状态？",
    options: [
      { label: "经常找不准点，或者干脆不敢压", value: 1 },
      { label: "能打到，但脚步和落点还不太稳", value: 2 },
      { label: "大部分高压都能处理干净并回到位", value: 3 },
      { label: "高压球已经是我可靠的终结手段", value: 4 }
    ],
    dimension: "overhead"
  },
  {
    id: "fine_c_adaptability",
    phase: "fine",
    branch: "C",
    type: "choice",
    question: "你能根据对手调整打法吗？",
    options: [
      { label: "基本不管对手，自己怎么打都一样", value: 1 },
      { label: "能看出来问题，但比赛里很难执行", value: 2 },
      { label: "比赛中能做一些针对性调整", value: 3 },
      { label: "会主动根据对手特点设计和切换打法", value: 4 }
    ],
    dimension: "tactical_adaptability"
  }
];

export default assessmentQuestions;
