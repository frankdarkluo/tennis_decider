export type DiagnosisRule = {
  id: string;
  keywords: string[];
  synonyms: string[];
  category: string[];
  problemTag: string;
  causes: string[];
  fixes: string[];
  recommendedContentIds: string[];
  drills: string[];
  fallbackLevel?: string[];
};

export const diagnosisRules: DiagnosisRule[] = [
  {
    id: "rule_backhand_net",
    keywords: ["反手", "下网"],
    synonyms: ["反手打不过网", "反手老挂网", "反手一加力就下网"],
    category: ["backhand", "consistency"],
    problemTag: "backhand-into-net",
    causes: [
      "准备偏慢，击球点落在身体后侧",
      "拍面控制不稳定，向前送拍不足",
      "想发力但动作框架没有立住"
    ],
    fixes: ["更早转肩，提前准备", "把击球点放到身体前侧", "先追求稳定过网，再谈发力"],
    recommendedContentIds: ["content_fr_01", "content_cn_a_01", "content_gaiao_03"],
    drills: ["影子挥拍 20 次，重点感受前点击球", "慢节奏喂球反手直线 30 球", "两点移动后反手过网练习 20 球"],
    fallbackLevel: ["3.0", "3.5"]
  },
  {
    id: "rule_forehand_out",
    keywords: ["正手", "出界"],
    synonyms: ["正手老飞", "一发力就飞", "正手没有弧线"],
    category: ["forehand", "control"],
    problemTag: "forehand-out",
    causes: ["挥拍路径太平，缺少上旋", "击球点控制不稳，拍面偏开", "身体发力顺序混乱"],
    fixes: ["先增加上旋弧线", "降低一次击球的发力欲望", "先保证稳定过网，再逐步加速"],
    recommendedContentIds: ["content_cn_d_01", "content_cn_d_03", "content_gaiao_01"],
    drills: ["正手对拉 30 球，只求高过网", "定点正手上旋练习 20 球", "正手落点控制在底线前 1 米区域"],
    fallbackLevel: ["3.0", "3.5", "4.0"]
  },
  {
    id: "rule_second_serve_confidence",
    keywords: ["二发", "没信心"],
    synonyms: ["二发老双误", "二发不敢发", "第二发总想保守一推"],
    category: ["serve", "confidence"],
    problemTag: "second-serve-confidence",
    causes: ["只想发快，没有建立稳定节奏", "抛球位置不稳定", "没有先建立安全弧线意识"],
    fixes: ["先建立节奏感，再加力量", "先练稳定抛球和完整动作", "先接受安全二发，不急着追求球速"],
    recommendedContentIds: ["content_gaiao_02", "content_zlx_01", "content_zlx_02"],
    drills: ["抛球 30 次，不击球", "半动作发球 20 次，找上旋感", "二区安全二发 20 球，目标先全部进"],
    fallbackLevel: ["3.0", "3.5"]
  },
  {
    id: "rule_serve_toss",
    keywords: ["抛球", "不稳"],
    synonyms: ["抛球老歪", "发球抛球不稳", "一抛球就乱"],
    category: ["serve", "toss"],
    problemTag: "serve-toss-inconsistent",
    causes: ["抛球手臂路径不固定", "出手点不一致", "抛球前站姿和节奏变化太大"],
    fixes: ["先单独练抛球动作", "站姿固定后再抛", "每次抛球后停住观察落点"],
    recommendedContentIds: ["content_gaiao_02", "content_zlx_01"],
    drills: ["不击球抛球 30 次", "抛球后接球并记录落点 20 次", "抛球+空挥 15 次"],
    fallbackLevel: ["3.0", "3.5"]
  },
  {
    id: "rule_late_contact",
    keywords: ["来不及", "准备慢", "击球点晚"],
    synonyms: ["总慢半拍", "总被球顶住", "来球一快就没了"],
    category: ["timing", "movement"],
    problemTag: "late-contact",
    causes: ["分腿垫步时机不对", "转肩和引拍开始太晚", "脚步没有先到位"],
    fixes: ["先做更早的准备动作", "把注意力从挥拍改到到位", "先缩小动作，提升节奏匹配"],
    recommendedContentIds: ["content_fr_02", "content_cn_a_02", "content_cn_c_02"],
    drills: ["分腿垫步 + 侧身准备 20 组", "喂球后只做准备不击球 15 次", "小碎步找位后击球 20 球"],
    fallbackLevel: ["3.0", "3.5"]
  },
  {
    id: "rule_net_errors",
    keywords: ["网前", "失误"],
    synonyms: ["截击老丢", "网前一紧张就乱", "双打网前很怕"],
    category: ["net", "confidence"],
    problemTag: "net-confidence",
    causes: ["站位过于僵硬", "拍头控制不稳定", "以大挥拍方式去打截击"],
    fixes: ["缩小动作，先学会挡和送", "拍头保持稳定在身体前方", "先练简单高成功率截击"],
    recommendedContentIds: ["content_rb_01", "content_cn_b_01", "content_cn_b_03"],
    drills: ["近网挡球 20 次", "正反手截击各 15 球", "双打网前反应练习 10 组"],
    fallbackLevel: ["3.0", "3.5"]
  },
  {
    id: "rule_match_anxiety",
    keywords: ["比赛", "紧张"],
    synonyms: ["一比赛就不敢打", "一记分就手硬", "平时能打比赛不行"],
    category: ["matchplay", "mental"],
    problemTag: "match-anxiety",
    causes: ["训练和比赛脱节", "没有固定发接发流程", "对失误容忍度过低"],
    fixes: ["给自己设定简化战术", "先稳定发接发流程", "把注意力放回每一分的执行"],
    recommendedContentIds: ["content_rb_03", "content_cn_f_01", "content_cn_e_02"],
    drills: ["发球前固定节奏 10 次", "一发一接对抗 10 分钟", "只打高成功率落点的练习赛"],
    fallbackLevel: ["3.0", "3.5"]
  },
  {
    id: "rule_forehand_no_power",
    keywords: ["正手", "没力量"],
    synonyms: ["正手打不透", "正手很费劲但球不走", "怎么打都没穿透力"],
    category: ["forehand", "power"],
    problemTag: "forehand-no-power",
    causes: ["只用手臂打球", "重心转换不足", "击球点不稳定导致不敢加速"],
    fixes: ["先保证击球点稳定", "把力量来源放回身体和节奏", "先用七成力量打实再提速"],
    recommendedContentIds: ["content_fr_03", "content_cn_d_02", "content_gaiao_01"],
    drills: ["无球转体挥拍 20 次", "定点正手七成力量 20 球", "正手击球后自然随挥 20 次"],
    fallbackLevel: ["3.0", "3.5"]
  },
  {
    id: "rule_balls_too_short",
    keywords: ["打得太浅", "球太浅"],
    synonyms: ["打不深", "球总落在发球线附近", "对抗里总是短球"],
    category: ["depth", "consistency"],
    problemTag: "balls-too-short",
    causes: ["挥拍向前延伸不足", "只顾过网，没有明确深度目标", "脚步没跟上导致击球质量差"],
    fixes: ["先把目标区放到底线前 1 米", "击球后多想向前送拍", "不要站死，先到位再击球"],
    recommendedContentIds: ["content_cn_c_01", "content_cn_e_03"],
    drills: ["底线前目标区击球 20 球", "正反手交替深度练习 20 球", "发球后第一拍送深练习 15 球"],
    fallbackLevel: ["3.0", "3.5"]
  },
  {
    id: "rule_return_under_pressure",
    keywords: ["接发球", "被压制"],
    synonyms: ["接发球总慢半拍", "接发球被顶住", "发接发总先丢分"],
    category: ["return", "matchplay"],
    problemTag: "return-under-pressure",
    causes: ["站位不合适", "准备过慢", "接发想太多，动作过大"],
    fixes: ["先把目标设为送深", "缩小动作，早点准备", "固定自己的接发站位和流程"],
    recommendedContentIds: ["content_rb_02", "content_cn_e_01", "content_cn_e_03"],
    drills: ["接发简化挥拍 20 球", "接发只打中路深区 20 球", "发接发一分起打 10 组"],
    fallbackLevel: ["3.0", "3.5", "4.0"]
  },
  {
    id: "rule_slice_too_high",
    keywords: ["切削", "太高"],
    synonyms: ["切削飘起来", "切削没有压低", "反手切削总浮"],
    category: ["backhand", "slice"],
    problemTag: "slice-too-high",
    causes: ["拍面太开", "切球方向过于向上", "击球点不在身体前侧"],
    fixes: ["先控制拍面角度", "切球方向更向前", "把击球点放在身体前侧"],
    recommendedContentIds: ["content_common_03", "content_zlx_03"],
    drills: ["无球切削挥拍 20 次", "中慢球切削送深 20 球", "切削落点控制底线前 2 米"],
    fallbackLevel: ["3.0", "3.5", "4.0"]
  },
  {
    id: "rule_cant_self_practice",
    keywords: ["不会自己练", "不知道练什么"],
    synonyms: ["训练没计划", "每次都乱练", "上完课不知道怎么复习"],
    category: ["training", "planning"],
    problemTag: "cant-self-practice",
    causes: ["没有把问题拆小", "每次练的目标太多", "缺少固定训练模版"],
    fixes: ["一次只解决一个问题", "先安排 20–30 分钟小练习", "每次练都要有记录项"],
    recommendedContentIds: ["content_cn_c_03", "content_cn_f_02", "content_cn_f_03"],
    drills: ["列出本周唯一主问题", "每次训练写 1 个目标 1 个记录项", "训练后记录成功率和感觉"],
    fallbackLevel: ["2.5", "3.0", "3.5"]
  }
];
