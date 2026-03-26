import { DiagnosisRule, DiagnosisSearchQueries } from "@/types/diagnosis";

const searchQueriesByRule = {
  rule_backhand_net: {
    bilibili: ["是佩恩呀 反手 下网 网球", "网球工匠付饶 反手 下网", "反手击球点 拍面控制 网球"],
    youtube: ["tennis backhand into net fix", "backhand contact point correction tennis", "backhand net error drill"]
  },
  rule_forehand_out: {
    bilibili: ["盖奥网球 正手 出界 上旋", "网球工匠付饶 正手 弧线 网球", "正手出界 上旋 控制 网球"],
    youtube: ["tennis forehand going long fix", "forehand topspin technique tennis", "forehand out control drill"]
  },
  rule_second_serve_confidence: {
    bilibili: ["盖奥网球 二发 稳定性", "冠军教练-莫拉托格鲁 二发 网球", "二发没信心 发球稳定性 网球"],
    youtube: ["tennis second serve confidence", "reliable second serve drill", "beginner second serve technique"]
  },
  rule_serve_toss: {
    bilibili: ["发球抛球 不稳 纠正 网球", "冠军教练-莫拉托格鲁 发球 抛球", "盖奥网球 抛球 教学"],
    youtube: ["tennis serve toss fix", "serve toss consistency drill", "tennis toss placement lesson"]
  },
  rule_late_contact: {
    bilibili: ["是佩恩呀 击球点 晚 网球", "准备慢 击球点偏晚 纠正", "分腿垫步 提前准备 网球"],
    youtube: ["tennis late contact point fix", "early preparation tennis", "tennis timing drill"]
  },
  rule_net_errors: {
    bilibili: ["网球截击 动作太大 纠正", "网前截击 基础 教学", "双打网前 截击 稳定性"],
    youtube: ["tennis volley technique beginner", "compact volley drill", "net play basics tennis"]
  },
  rule_match_anxiety: {
    bilibili: ["网球比赛紧张 怎么办", "比赛心态 调整 网球", "比赛失误多 心态 网球"],
    youtube: ["tennis match nerves tips", "how to stay calm tennis match", "tennis mental game beginner"]
  },
  rule_forehand_no_power: {
    bilibili: ["正手没力量 发力链 网球", "盖奥网球 正手 发力", "正手转体发力 教学 网球"],
    youtube: ["tennis forehand power technique", "forehand kinetic chain tennis", "generate power forehand"]
  },
  rule_balls_too_short: {
    bilibili: ["网球打不深 怎么办", "击球深度 训练 网球", "网球 稳定性 打深 底线 深度"],
    youtube: ["tennis hit deeper shots", "depth control tennis drill", "how to stop hitting short tennis"]
  },
  rule_return_under_pressure: {
    bilibili: ["网球 接发球 站位 准备", "接发球被压制 怎么办", "接发回深 训练 网球"],
    youtube: ["tennis return of serve tips", "return position beginner tennis", "deep return drill tennis"]
  },
  rule_slice_too_high: {
    bilibili: ["反手切削 飘起来 纠正", "切削拍面控制 网球", "切削送不低 教学 网球"],
    youtube: ["tennis slice backhand fix", "slice floats tennis correction", "backhand slice control drill"]
  },
  rule_topspin_low: {
    bilibili: ["正手上旋 怎么打 网球", "盖奥网球 正手 上旋", "正手弧线不够 纠正 网球"],
    youtube: ["tennis forehand topspin technique", "how to hit topspin forehand", "forehand spin drill"]
  },
  rule_serve_accuracy: {
    bilibili: ["发球发不进 纠正 网球", "发球进区率 训练", "发球落点控制 教学 网球"],
    youtube: ["tennis serve accuracy drill", "serve consistency targets tennis", "how to improve serve placement"]
  },
  rule_movement_slow: {
    bilibili: ["六六网球 脚步 训练", "分腿垫步 教学 网球", "网球移动 基础 训练"],
    youtube: ["tennis footwork drill beginner", "split step timing tennis", "tennis movement training"]
  },
  rule_doubles_positioning: {
    bilibili: ["双打站位 基础 网球", "双打轮转 配合 教学", "一前一后 站位 网球"],
    youtube: ["tennis doubles positioning basics", "doubles formation beginner", "doubles net play position"]
  },
  rule_trouble_with_slice: {
    bilibili: ["是佩恩呀 下旋 来球 网球", "低球处理 教学 网球", "对方切球 怎么接 网球"],
    youtube: ["how to hit against slice tennis", "tennis handle slice return", "low ball tennis technique"]
  },
  rule_cant_hit_lob: {
    bilibili: ["网球高球 怎么打", "防守高球 教学 网球", "挑高球 训练 网球"],
    youtube: ["tennis defensive lob technique", "how to hit a lob tennis", "lob shot drill beginner"]
  },
  rule_plateau_no_progress: {
    bilibili: ["网球瓶颈期 怎么突破", "网球 练了很多 没进步 训练 聚焦", "网球进步 方法 训练"],
    youtube: ["tennis plateau how to improve", "stuck at 3.0 tennis tips", "tennis improvement strategy"]
  },
  rule_cant_self_practice: {
    bilibili: ["没有教练怎么练球 网球", "网球自己练 方法", "网球课后复习 训练"],
    youtube: ["tennis solo practice drills", "how to practice tennis alone", "tennis self training routine"]
  }
} satisfies Record<string, DiagnosisSearchQueries>;

export const diagnosisRules: DiagnosisRule[] = [
  {
    id: "rule_backhand_net",
    keywords: ["反手", "下网"],
    synonyms: ["反手打不过网", "反手老挂网", "反手一加力就下网", "反手总下网", "反手过不了网", "backhand into the net"],
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
    searchQueries: searchQueriesByRule.rule_backhand_net,
    fallbackLevel: ["3.0", "3.5"]
  },
  {
    id: "rule_forehand_out",
    keywords: ["正手", "出界"],
    synonyms: ["正手老飞", "一发力就飞", "正手没有弧线", "正手总出底线", "正手一抡就飞", "forehand long"],
    category: ["forehand", "control"],
    problemTag: "forehand-out",
    causes: ["挥拍路径太平，缺少上旋", "击球点控制不稳，拍面偏开", "身体发力顺序混乱"],
    fixes: ["先增加上旋弧线", "降低一次击球的发力欲望", "先保证稳定过网，再逐步加速"],
    recommendedContentIds: ["content_cn_d_01", "content_cn_d_03", "content_gaiao_01"],
    drills: ["正手对拉 30 球，只求高过网", "定点正手上旋练习 20 球", "正手落点控制在底线前 1 米区域"],
    searchQueries: searchQueriesByRule.rule_forehand_out,
    fallbackLevel: ["3.0", "3.5", "4.0"]
  },
  {
    id: "rule_second_serve_confidence",
    keywords: ["二发", "没信心"],
    synonyms: ["二发老双误", "二发不敢发", "第二发总想保守一推", "第二发没有底气", "二发一紧张就推球", "second serve double fault"],
    category: ["serve", "confidence"],
    problemTag: "second-serve-confidence",
    causes: ["只想发快，没有建立稳定节奏", "抛球位置不稳定", "没有先建立安全弧线意识"],
    fixes: ["先建立节奏感，再加力量", "先练稳定抛球和完整动作", "先接受安全二发，不急着追求球速"],
    recommendedContentIds: ["content_gaiao_02", "content_zlx_01", "content_zlx_02"],
    drills: ["抛球 30 次，不击球", "半动作发球 20 次，找上旋感", "二区安全二发 20 球，目标先全部进"],
    searchQueries: searchQueriesByRule.rule_second_serve_confidence,
    fallbackLevel: ["3.0", "3.5"]
  },
  {
    id: "rule_serve_toss",
    keywords: ["抛球", "不稳"],
    synonyms: ["抛球老歪", "发球抛球不稳", "一抛球就乱", "抛球忽前忽后", "抛球老偏左", "serve toss inconsistent"],
    category: ["serve", "toss"],
    problemTag: "serve-toss-inconsistent",
    causes: ["抛球手臂路径不固定", "出手点不一致", "抛球前站姿和节奏变化太大"],
    fixes: ["先单独练抛球动作", "站姿固定后再抛", "每次抛球后停住观察落点"],
    recommendedContentIds: ["content_gaiao_02", "content_zlx_01", "content_ttt_01"],
    drills: ["不击球抛球 30 次", "抛球后接球并记录落点 20 次", "抛球+空挥 15 次"],
    searchQueries: searchQueriesByRule.rule_serve_toss,
    fallbackLevel: ["3.0", "3.5"]
  },
  {
    id: "rule_late_contact",
    keywords: ["来不及", "准备慢", "击球点晚"],
    synonyms: ["总慢半拍", "总被球顶住", "来球一快就没了", "击球总在身后", "老是晚一点才碰到球", "late contact"],
    category: ["timing", "movement"],
    problemTag: "late-contact",
    causes: ["分腿垫步时机不对", "转肩和引拍开始太晚", "脚步没有先到位"],
    fixes: ["先做更早的准备动作", "把注意力从挥拍改到到位", "先缩小动作，提升节奏匹配"],
    recommendedContentIds: ["content_fr_02", "content_cn_a_02", "content_cn_c_02"],
    drills: ["分腿垫步 + 侧身准备 20 组", "喂球后只做准备不击球 15 次", "小碎步找位后击球 20 球"],
    searchQueries: searchQueriesByRule.rule_late_contact,
    fallbackLevel: ["3.0", "3.5"]
  },
  {
    id: "rule_net_errors",
    keywords: ["网前", "失误"],
    synonyms: ["截击老丢", "网前一紧张就乱", "双打网前很怕", "网前老下网", "截击老冒高", "volley errors"],
    category: ["net", "confidence"],
    problemTag: "net-confidence",
    causes: ["站位过于僵硬", "拍头控制不稳定", "以大挥拍方式去打截击"],
    fixes: ["缩小动作，先学会挡和送", "拍头保持稳定在身体前方", "先练简单高成功率截击"],
    recommendedContentIds: ["content_rb_01", "content_cn_b_01", "content_cn_b_03"],
    drills: ["近网挡球 20 次", "正反手截击各 15 球", "双打网前反应练习 10 组"],
    searchQueries: searchQueriesByRule.rule_net_errors,
    fallbackLevel: ["3.0", "3.5"]
  },
  {
    id: "rule_match_anxiety",
    keywords: ["比赛", "紧张"],
    synonyms: ["一比赛就不敢打", "一记分就手硬", "平时能打比赛不行", "比赛手紧", "一到记分就乱", "match nerves"],
    category: ["matchplay", "mental"],
    problemTag: "match-anxiety",
    causes: ["训练和比赛脱节", "没有固定发接发流程", "对失误容忍度过低"],
    fixes: ["给自己设定简化战术", "先稳定发接发流程", "把注意力放回每一分的执行"],
    recommendedContentIds: ["content_rb_03", "content_cn_f_01", "content_cn_e_02"],
    drills: ["发球前固定节奏 10 次", "一发一接对抗 10 分钟", "只打高成功率落点的练习赛"],
    searchQueries: searchQueriesByRule.rule_match_anxiety,
    fallbackLevel: ["3.0", "3.5"]
  },
  {
    id: "rule_forehand_no_power",
    keywords: ["正手", "没力量"],
    synonyms: ["正手打不透", "正手很费劲但球不走", "怎么打都没穿透力", "正手打不出去", "球不往前走", "forehand no power"],
    category: ["forehand", "power"],
    problemTag: "forehand-no-power",
    causes: ["只用手臂打球", "重心转换不足", "击球点不稳定导致不敢加速"],
    fixes: ["先保证击球点稳定", "把力量来源放回身体和节奏", "先用七成力量打实再提速"],
    recommendedContentIds: ["content_fr_03", "content_cn_d_02", "content_gaiao_01"],
    drills: ["无球转体挥拍 20 次", "定点正手七成力量 20 球", "正手击球后自然随挥 20 次"],
    searchQueries: searchQueriesByRule.rule_forehand_no_power,
    fallbackLevel: ["3.0", "3.5"]
  },
  {
    id: "rule_balls_too_short",
    keywords: ["打得太浅", "球太浅"],
    synonyms: ["打不深", "球总落在发球线附近", "对抗里总是短球", "老给短球", "总压不深", "球都落中场"],
    category: ["depth", "consistency"],
    problemTag: "balls-too-short",
    causes: ["挥拍向前延伸不足", "只顾过网，没有明确深度目标", "脚步没跟上导致击球质量差"],
    fixes: ["先把目标区放到底线前 1 米", "击球后多想向前送拍", "不要站死，先到位再击球"],
    recommendedContentIds: ["content_cn_c_01", "content_cn_e_03", "content_et_01"],
    drills: ["底线前目标区击球 20 球", "正反手交替深度练习 20 球", "发球后第一拍送深练习 15 球"],
    searchQueries: searchQueriesByRule.rule_balls_too_short,
    fallbackLevel: ["3.0", "3.5"]
  },
  {
    id: "rule_return_under_pressure",
    keywords: ["接发球", "被压制"],
    synonyms: ["接发球总慢半拍", "接发球被顶住", "发接发总先丢分", "接发总是被压", "接发回球太短", "return gets jammed"],
    category: ["return", "matchplay"],
    problemTag: "return-under-pressure",
    causes: ["站位不合适", "准备过慢", "接发想太多，动作过大"],
    fixes: ["先把目标设为送深", "缩小动作，早点准备", "固定自己的接发站位和流程"],
    recommendedContentIds: ["content_rb_02", "content_cn_e_01", "content_cn_e_03"],
    drills: ["接发简化挥拍 20 球", "接发只打中路深区 20 球", "发接发一分起打 10 组"],
    searchQueries: searchQueriesByRule.rule_return_under_pressure,
    fallbackLevel: ["3.0", "3.5", "4.0"]
  },
  {
    id: "rule_slice_too_high",
    keywords: ["切削", "太高"],
    synonyms: ["切削飘起来", "切削没有压低", "反手切削总浮", "切削总飘", "切削球飞起来", "slice floats"],
    category: ["backhand", "slice"],
    problemTag: "slice-too-high",
    causes: ["拍面太开", "切球方向过于向上", "击球点不在身体前侧"],
    fixes: ["先控制拍面角度", "切球方向更向前", "把击球点放在身体前侧"],
    recommendedContentIds: ["content_common_03", "content_zlx_03", "content_it_01"],
    drills: ["无球切削挥拍 20 次", "中慢球切削送深 20 球", "切削落点控制底线前 2 米"],
    searchQueries: searchQueriesByRule.rule_slice_too_high,
    fallbackLevel: ["3.0", "3.5", "4.0"]
  },
  {
    id: "rule_topspin_low",
    keywords: ["上旋", "旋转", "弧线", "topspin"],
    synonyms: ["正手没有旋转", "正手球太平", "拉不出上旋", "正手弧线不够", "正手过网太低", "forehand lacks topspin"],
    category: ["forehand", "topspin"],
    problemTag: "topspin-low",
    causes: ["挥拍路径太平，从下往上的分量不够", "只想着往前推球，没有把弧线拉起来", "击球后收拍太早，旋转感没有建立"],
    fixes: ["先把结束位置收到肩膀以上", "先接受更高的过网弧线，再谈球速", "多感受向上刷球，而不是平推出去"],
    recommendedContentIds: ["content_cn_d_03", "content_cn_d_01", "content_fr_03"],
    drills: ["无球刷拍 20 次，感受从下往上", "高弧线正手 20 球，只求过网高度", "底线前 1 米目标区正手 20 球"],
    searchQueries: searchQueriesByRule.rule_topspin_low,
    fallbackLevel: ["3.0", "3.5", "4.0"]
  },
  {
    id: "rule_serve_accuracy",
    keywords: ["发球", "发不进", "落点"],
    synonyms: ["发球老出界", "发球总进不了区", "发球落点不稳", "一发进区率太低", "发球想发哪发不到", "serve accuracy problem"],
    category: ["serve", "control"],
    problemTag: "serve-accuracy",
    causes: ["抛球和挥拍节奏不一致", "目标区意识不清楚，发球只是大概往前打", "一上来就追求力量，控制先散掉了"],
    fixes: ["先只盯一个发球目标区", "发力降到七成，先把进区率做出来", "把发球拆成抛球、节奏、落点三个单项分别练"],
    recommendedContentIds: ["content_gaiao_02", "content_zlx_01", "content_ttt_01"],
    drills: ["半动作发球 20 次，只求进区", "一区或二区单目标区发球 20 球", "连续 10 个进区后再换边"],
    searchQueries: searchQueriesByRule.rule_serve_accuracy,
    fallbackLevel: ["2.5", "3.0", "3.5"]
  },
  {
    id: "rule_movement_slow",
    keywords: ["脚步", "移动", "来不及", "步伐"],
    synonyms: ["脚步总慢半拍", "移动跟不上", "球到了脚还没到", "跑不到位", "步伐太慢", "footwork too slow"],
    category: ["movement", "footwork"],
    problemTag: "movement-slow",
    causes: ["分腿垫步缺失或时机偏晚", "第一步启动不够积极，重心起得太高", "只盯着挥拍，忽略了先到位"],
    fixes: ["对方击球前先做一次分腿垫步", "把注意力先放到第一步启动", "先缩小挥拍动作，给脚步留时间"],
    recommendedContentIds: ["content_cn_c_02", "content_cn_a_03", "content_fr_02"],
    drills: ["分腿垫步 20 组", "两点启动移动 15 组", "喂球后先到位再击球 20 球"],
    searchQueries: searchQueriesByRule.rule_movement_slow,
    fallbackLevel: ["2.5", "3.0", "3.5"]
  },
  {
    id: "rule_doubles_positioning",
    keywords: ["双打", "站位", "站哪"],
    synonyms: ["双打不知道怎么站", "双打总是站错位置", "接发后不知道往哪走", "双打轮转总乱", "双打配合老撞位", "doubles positioning confusion"],
    category: ["doubles", "net"],
    problemTag: "doubles-positioning",
    causes: ["没有先建立最基础的一前一后站位逻辑", "击球后不知道自己该补哪一侧", "双打时只盯球，没有和搭档一起移动"],
    fixes: ["先只记住最常见的一前一后站位", "每打一拍先想自己下一步往哪补位", "和搭档约定最基础的轮转规则"],
    recommendedContentIds: ["content_cn_b_02", "content_rb_01", "content_rb_03"],
    drills: ["双打空位走位 10 组", "接发后第一步站位练习 15 组", "双打练习赛只记录站位失误"],
    searchQueries: searchQueriesByRule.rule_doubles_positioning,
    fallbackLevel: ["3.0", "3.5"]
  },
  {
    id: "rule_trouble_with_slice",
    keywords: ["下旋", "切球", "低球"],
    synonyms: ["遇到下旋就打不好", "对方切过来就失误", "低球总处理不好", "下旋来球不知道怎么打", "对方一切球我就乱", "struggle against slice"],
    category: ["backhand", "control"],
    problemTag: "trouble-with-slice",
    causes: ["没有提前判断来球旋转和落点", "击球点经常掉到身体后侧，来不及往上提拉", "面对低球还在用平击思路处理"],
    fixes: ["看到对方切球时先多给自己半拍时间", "尽量在前点往上提拉，不要等球掉太低", "先用高过网弧线把这一拍处理过去"],
    recommendedContentIds: ["content_common_02", "content_cn_a_02", "content_fr_02"],
    drills: ["喂低球 20 球，只练前点击球", "低球上提 20 球，只记录过网高度", "切球来回 10 组，练判断和站位"],
    searchQueries: searchQueriesByRule.rule_trouble_with_slice,
    fallbackLevel: ["3.0", "3.5", "4.0"]
  },
  {
    id: "rule_cant_hit_lob",
    keywords: ["高球", "挑高", "lob"],
    synonyms: ["不会打高球", "防守只会平打", "不会挑高球", "被压到底线不知道怎么办", "高球总打不深", "cannot hit a lob"],
    category: ["defense", "matchplay"],
    problemTag: "cant-hit-lob",
    causes: ["防守时没有先争取时间的意识", "面对高压球还想硬平打回去", "高球出手角度太低，给不到足够弧线和深度"],
    fixes: ["被压住时默认先打一个高而深的高球", "别急着反攻，先把节奏拉回来", "出手时先想高度和深度，不要先想速度"],
    recommendedContentIds: ["content_common_01", "content_cn_c_01", "content_rb_03"],
    drills: ["底线防守高球 15 球", "被压到底线时只打高深球 10 组", "高球后恢复站位 10 组"],
    searchQueries: searchQueriesByRule.rule_cant_hit_lob,
    fallbackLevel: ["3.0", "3.5", "4.0"]
  },
  {
    id: "rule_plateau_no_progress",
    keywords: ["没进步", "瓶颈", "原地踏步"],
    synonyms: ["练了很多还是老样子", "感觉到了瓶颈", "总是在原地踏步", "每次都练但没感觉进步", "练了很久没变化", "tennis plateau"],
    category: ["training", "planning"],
    problemTag: "plateau-no-progress",
    causes: ["每次练习同时改太多点，没有一个主问题", "练习和比赛脱节，没有用比赛反馈反推训练重点", "缺少连续两周以上的聚焦练习"],
    fixes: ["先选一个最影响比赛的问题连续练两周", "训练后记录一个最常见失误，而不是泛泛复盘", "把计划从‘练很多’改成‘练一个最关键的问题’"],
    recommendedContentIds: ["content_cn_f_03", "content_cn_f_02", "content_cn_c_03"],
    drills: ["写下本周唯一主问题", "每次训练只记录一个指标", "连续两周只围绕同一个问题安排练习"],
    searchQueries: searchQueriesByRule.rule_plateau_no_progress,
    fallbackLevel: ["3.0", "3.5", "4.0"]
  },
  {
    id: "rule_cant_self_practice",
    keywords: ["不会自己练", "不知道练什么"],
    synonyms: ["训练没计划", "每次都乱练", "上完课不知道怎么复习", "自己练没章法", "练球没重点", "不知道怎么安排训练"],
    category: ["training", "planning"],
    problemTag: "cant-self-practice",
    causes: ["没有把问题拆小", "每次练的目标太多", "缺少固定训练模版"],
    fixes: ["一次只解决一个问题", "先安排 20–30 分钟小练习", "每次练都要有记录项"],
    recommendedContentIds: ["content_cn_c_03", "content_cn_f_02", "content_cn_f_03"],
    drills: ["列出本周唯一主问题", "每次训练写 1 个目标 1 个记录项", "训练后记录成功率和感觉"],
    searchQueries: searchQueriesByRule.rule_cant_self_practice,
    fallbackLevel: ["2.5", "3.0", "3.5"]
  }
];
