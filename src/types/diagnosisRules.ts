import { DiagnosisRule } from "./diagnosis";

export const diagnosisRules: DiagnosisRule[] = [
  {
    id: "rule_backhand_net",
    keywords: ["反手", "下网"],
    category: ["backhand", "consistency"],
    problemTag: "backhand-into-net",
    causes: [
      "准备偏慢，击球点落在身体后侧",
      "拍面控制不稳定，向前送拍不足",
      "想发力但动作框架没有立住"
    ],
    fixes: [
      "更早转肩，提前准备",
      "把击球点放到身体前侧",
      "先追求稳定过网，再谈发力"
    ],
    recommendedContentIds: ["content_gaiao_03", "content_zlx_03"],
    drills: [
      "影子挥拍 20 次，重点感受前点击球",
      "慢节奏喂球反手直线 30 球",
      "两点移动后反手过网练习 20 球"
    ],
    fallbackLevel: ["3.0", "3.5"]
  },
  {
    id: "rule_second_serve_confidence",
    keywords: ["二发", "没信心"],
    category: ["serve", "confidence"],
    problemTag: "second-serve-confidence",
    causes: [
      "只想发快，没有建立稳定节奏",
      "抛球位置不稳定",
      "没有先建立上旋/安全弧线意识"
    ],
    fixes: [
      "先建立节奏感，再加力量",
      "先练稳定抛球和完整动作",
      "先接受‘安全二发’，不要急着追求球速"
    ],
    recommendedContentIds: ["content_gaiao_02", "content_zlx_01", "content_zlx_02"],
    drills: [
      "抛球 30 次，不击球",
      "半动作发球 20 次，找上旋感",
      "二区安全二发 20 球，目标先全部进"
    ],
    fallbackLevel: ["3.0", "3.5"]
  },
  {
    id: "rule_forehand_out",
    keywords: ["正手", "出界"],
    category: ["forehand", "control"],
    problemTag: "forehand-out",
    causes: [
      "挥拍路径太平，缺少上旋",
      "击球点过靠前或拍面偏开",
      "身体发力顺序混乱"
    ],
    fixes: [
      "先增加上旋弧线",
      "降低一次击球的发力欲望",
      "先保证三拍里两拍稳，再逐步加速"
    ],
    recommendedContentIds: ["content_gaiao_01"],
    drills: [
      "正手对拉 30 球，只求高过网",
      "定点正手上旋练习 20 球",
      "正手落点控制在底线前 1 米区域"
    ],
    fallbackLevel: ["3.0", "3.5"]
  },
  {
    id: "rule_late_contact",
    keywords: ["来不及", "准备慢", "击球点晚"],
    category: ["timing", "movement"],
    problemTag: "late-contact",
    causes: [
      "分腿垫步时机不对",
      "转肩和引拍开始太晚",
      "脚步没有先到位"
    ],
    fixes: [
      "先做更早的准备动作",
      "把注意力从挥拍改到到位",
      "先缩小动作，提升节奏匹配"
    ],
    recommendedContentIds: ["content_gaiao_03"],
    drills: [
      "分腿垫步 + 侧身准备 20 组",
      "喂球后只做准备不击球 15 次",
      "小碎步找位后击球 20 球"
    ],
    fallbackLevel: ["3.0", "3.5"]
  },
  {
    id: "rule_net_errors",
    keywords: ["网前", "失误"],
    category: ["net", "confidence"],
    problemTag: "net-confidence",
    causes: [
      "站位过于僵硬",
      "拍头控制不稳定",
      "以大挥拍方式去打截击"
    ],
    fixes: [
      "缩小动作，先学会挡和送",
      "拍头保持稳定在身体前方",
      "先练简单高成功率截击"
    ],
    recommendedContentIds: ["content_zlx_03"],
    drills: [
      "近网挡球 20 次",
      "正反手截击各 15 球",
      "双打网前反应练习 10 组"
    ],
    fallbackLevel: ["3.0", "3.5"]
  },
  {
    id: "rule_match_anxiety",
    keywords: ["比赛", "紧张"],
    category: ["matchplay", "mental"],
    problemTag: "match-anxiety",
    causes: [
      "训练和比赛脱节",
      "没有固定发接发流程",
      "对失误容忍度过低"
    ],
    fixes: [
      "给自己设定简化战术",
      "先稳定发接发流程",
      "把注意力放回每一分的执行"
    ],
    recommendedContentIds: ["content_zlx_03"],
    drills: [
      "发球前固定节奏 10 次",
      "一发一接对抗 10 分钟",
      "只打高成功率落点的练习赛"
    ],
    fallbackLevel: ["3.0", "3.5"]
  }
];