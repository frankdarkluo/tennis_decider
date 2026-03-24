import { AssessmentQuestion } from "@/types/assessment";

/**
 * TennisLevel MVP 评估问卷初稿
 *
 * 设计原则：
 * 1. 先服务 3.0–3.5 为核心的初中级球员，同时兼顾 2.5 与 4.0 的粗略区分
 * 2. 问题尽量使用“用户能自我感知”的表述，而不是过度专业化术语
 * 3. 每题 1–5 分，后续可由 assessment.ts 中的映射逻辑输出参考能力区间
 * 4. 六个维度各 3 题，共 18 题，适合 4–6 分钟完成
 */

export const assessmentQuestions: AssessmentQuestion[] = [
  // -------------------------------------------------
  // 一、正手 forehand
  // -------------------------------------------------
  {
    id: "fh_01",
    dimension: "forehand",
    question: "在中等速度来球下，你的正手通常是什么状态？",
    options: [
      { label: "经常打丢或打不扎实，只是尽量把球碰回去", score: 1 },
      { label: "偶尔能回过去，但稳定性较差", score: 2 },
      { label: "大多数时候能回过去，但方向和深度一般", score: 3 },
      { label: "比较稳定，偶尔能主动打出方向或深度", score: 4 },
      { label: "比较从容，能较清楚地控制节奏、方向和落点", score: 5 }
    ]
  },
  {
    id: "fh_02",
    dimension: "forehand",
    question: "当你想用正手发力时，最常见的结果是什么？",
    options: [
      { label: "基本不敢发力，一发力就容易失误", score: 1 },
      { label: "经常直接出界或下网", score: 2 },
      { label: "偶尔能打好，但成功率不高", score: 3 },
      { label: "有一定把握，能在相持中适度加速", score: 4 },
      { label: "能够较稳定地通过正手制造压力", score: 5 }
    ]
  },
  {
    id: "fh_03",
    dimension: "forehand",
    question: "你对自己正手击球点和挥拍节奏的感觉更接近哪一种？",
    options: [
      { label: "经常赶不上点，动作常常临时拼凑", score: 1 },
      { label: "偶尔能找到舒服击球点，但大多不稳定", score: 2 },
      { label: "基本能找到击球点，但节奏经常被来球打乱", score: 3 },
      { label: "大多数时候能在相对舒服的位置击球", score: 4 },
      { label: "对击球点和节奏有较稳定的掌控感", score: 5 }
    ]
  },

  // -------------------------------------------------
  // 二、反手 backhand
  // -------------------------------------------------
  {
    id: "bh_01",
    dimension: "backhand",
    question: "在对抗中，你的反手最常见的表现是什么？",
    options: [
      { label: "经常下网或直接失误，很难参与相持", score: 1 },
      { label: "能偶尔回过去，但质量和稳定性都不高", score: 2 },
      { label: "大多数时候能回过去，但容易被压制", score: 3 },
      { label: "比较稳定，能维持基本相持", score: 4 },
      { label: "比较自信，能用反手控制方向或节奏", score: 5 }
    ]
  },
  {
    id: "bh_02",
    dimension: "backhand",
    question: "当对手持续压你反手时，你通常会怎样？",
    options: [
      { label: "很快失误，基本顶不住", score: 1 },
      { label: "只能勉强回一两拍，质量偏差", score: 2 },
      { label: "能坚持几个回合，但很难主动处理", score: 3 },
      { label: "能稳定顶住，并偶尔化被动为主动", score: 4 },
      { label: "不太怕被压反手，能较明确地组织回球", score: 5 }
    ]
  },
  {
    id: "bh_03",
    dimension: "backhand",
    question: "你对自己反手准备和击球点的感觉更接近哪一种？",
    options: [
      { label: "总觉得来不及准备，击球点经常偏晚", score: 1 },
      { label: "偶尔能准备到位，但很多时候仓促出手", score: 2 },
      { label: "多数情况下能准备，但稳定性一般", score: 3 },
      { label: "准备和击球点比较稳定，失误可控", score: 4 },
      { label: "能够较主动地调整站位并找到舒服击球点", score: 5 }
    ]
  },

  // -------------------------------------------------
  // 三、发球 serve
  // -------------------------------------------------
  {
    id: "sv_01",
    dimension: "serve",
    question: "你对自己的一发整体感觉如何？",
    options: [
      { label: "经常发不进，动作也不太固定", score: 1 },
      { label: "能发进去一些，但质量和节奏都不稳定", score: 2 },
      { label: "有基本动作，一发能发进，但威胁一般", score: 3 },
      { label: "一发比较稳定，偶尔能带来主动优势", score: 4 },
      { label: "一发较有质量，能较明确地组织发球后的下一拍", score: 5 }
    ]
  },
  {
    id: "sv_02",
    dimension: "serve",
    question: "你对自己的二发最真实的感受是什么？",
    options: [
      { label: "很没信心，经常双误", score: 1 },
      { label: "能发进去一些，但比赛里不太敢用动作", score: 2 },
      { label: "基本能发进，但质量一般、容易被抢攻", score: 3 },
      { label: "二发较稳定，比赛里有一定安全感", score: 4 },
      { label: "二发不仅稳定，还有一定旋转或落点变化", score: 5 }
    ]
  },
  {
    id: "sv_03",
    dimension: "serve",
    question: "你对发球节奏、抛球和整套动作的一致性感觉如何？",
    options: [
      { label: "非常不稳定，每次都像重新拼动作", score: 1 },
      { label: "偶尔能顺，但大部分时候不太一致", score: 2 },
      { label: "有基本节奏，但压力一来就容易乱", score: 3 },
      { label: "整体较一致，偶尔会波动", score: 4 },
      { label: "动作节奏比较固定，比赛和训练差异不大", score: 5 }
    ]
  },

  // -------------------------------------------------
  // 四、网前 net
  // -------------------------------------------------
  {
    id: "nt_01",
    dimension: "net",
    question: "当你来到网前准备截击时，最常见的感受是什么？",
    options: [
      { label: "很不舒服，常常不知道怎么出手", score: 1 },
      { label: "经常失误，不太敢主动上网", score: 2 },
      { label: "简单机会球能处理，但整体信心一般", score: 3 },
      { label: "网前基本稳定，能处理常见来球", score: 4 },
      { label: "网前比较自信，能主动完成终结或施压", score: 5 }
    ]
  },
  {
    id: "nt_02",
    dimension: "net",
    question: "面对对手打到你身体附近或速度较快的网前来球时，你通常怎样？",
    options: [
      { label: "经常来不及反应，直接失误", score: 1 },
      { label: "勉强碰到球，但很难控制", score: 2 },
      { label: "能挡回一些，但落点和稳定性一般", score: 3 },
      { label: "大多数时候能较稳地处理", score: 4 },
      { label: "能比较从容地根据来球做出选择", score: 5 }
    ]
  },
  {
    id: "nt_03",
    dimension: "net",
    question: "在双打或上网得分的机会球上，你的表现更接近哪一种？",
    options: [
      { label: "基本不敢主动上，怕失误", score: 1 },
      { label: "会尝试上网，但成功率比较低", score: 2 },
      { label: "有明显机会时能上，但处理较保守", score: 3 },
      { label: "能把握多数简单机会球", score: 4 },
      { label: "善于抓机会在网前施压或结束得分", score: 5 }
    ]
  },

  // -------------------------------------------------
  // 五、移动 movement
  // -------------------------------------------------
  {
    id: "mv_01",
    dimension: "movement",
    question: "在底线相持中，你对自己脚步到位的感觉如何？",
    options: [
      { label: "经常站着等球，最后被动伸拍", score: 1 },
      { label: "会动，但经常还是赶不上舒服击球点", score: 2 },
      { label: "大多数球能追到，但到位质量一般", score: 3 },
      { label: "脚步比较积极，通常能赶到合理位置", score: 4 },
      { label: "移动和调整都比较从容，能为下一拍做准备", score: 5 }
    ]
  },
  {
    id: "mv_02",
    dimension: "movement",
    question: "当对手调动你前后左右跑动时，你通常会怎样？",
    options: [
      { label: "很容易乱掉，连续两三拍就失去平衡", score: 1 },
      { label: "勉强能追到球，但经常回球质量很差", score: 2 },
      { label: "能追到多数球，但恢复位置不够快", score: 3 },
      { label: "跑动和回位都比较稳定", score: 4 },
      { label: "不但能追到球，还能在跑动中保持较好击球质量", score: 5 }
    ]
  },
  {
    id: "mv_03",
    dimension: "movement",
    question: "你对分腿垫步、启动和小碎步调整的使用情况更接近哪一种？",
    options: [
      { label: "几乎没有这个意识", score: 1 },
      { label: "知道要做，但实战里经常忘或做不出来", score: 2 },
      { label: "有一定意识，但还不够稳定", score: 3 },
      { label: "大多数时候会主动使用", score: 4 },
      { label: "已经比较自然，能明显帮助自己找击球点", score: 5 }
    ]
  },

  // -------------------------------------------------
  // 六、比赛意识 matchplay
  // -------------------------------------------------
  {
    id: "mp_01",
    dimension: "matchplay",
    question: "在比赛或计分对抗中，你通常如何组织每一分？",
    options: [
      { label: "基本没有思路，主要靠把球回过去", score: 1 },
      { label: "偶尔有想法，但多数时候还是很随机", score: 2 },
      { label: "知道一些基本思路，但执行不稳定", score: 3 },
      { label: "有相对明确的发球、接发或相持思路", score: 4 },
      { label: "能根据对手特点和比分主动调整策略", score: 5 }
    ]
  },
  {
    id: "mp_02",
    dimension: "matchplay",
    question: "当比赛进入关键分或你连续失误后，你通常是什么状态？",
    options: [
      { label: "很容易慌，动作和选择都会明显变形", score: 1 },
      { label: "会紧张，常常不敢按平时动作打", score: 2 },
      { label: "有波动，但还能勉强维持基本发挥", score: 3 },
      { label: "能大致稳住心态，继续按简单战术执行", score: 4 },
      { label: "对关键分和波动有较好的自我调节能力", score: 5 }
    ]
  },
  {
    id: "mp_03",
    dimension: "matchplay",
    question: "你对自己发接发和前三拍处理的把握如何？",
    options: [
      { label: "经常一开分就陷入被动，没什么准备", score: 1 },
      { label: "偶尔能处理好，但大多数时候比较乱", score: 2 },
      { label: "有一些基本套路，但执行一般", score: 3 },
      { label: "前三拍有基础计划，能提高成功率", score: 4 },
      { label: "比较清楚如何通过前三拍建立主动或避免送分", score: 5 }
    ]
  }
];

export default assessmentQuestions;
