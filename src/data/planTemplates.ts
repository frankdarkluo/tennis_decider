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

export const planTemplates: PlanTemplate[] = [
  {
    problemTag: "second-serve-confidence",
    level: "3.5",
    title: "二发稳定性 7 天重建计划",
    target: "先建立安全二发的节奏、抛球和信心",
    days: [
      { day: 1, focus: "稳定抛球", contentIds: ["content_gaiao_02"], drills: ["抛球 30 次", "空挥发球 20 次"], duration: "20 分钟" },
      { day: 2, focus: "建立二发节奏", contentIds: ["content_zlx_01"], drills: ["半动作二发 20 次", "二区慢发 20 球"], duration: "25 分钟" },
      { day: 3, focus: "上旋安全感", contentIds: ["content_zlx_02"], drills: ["上旋感觉练习 20 次", "一区二区交替二发 20 球"], duration: "25 分钟" },
      { day: 4, focus: "节奏复盘", contentIds: ["content_zlx_01"], drills: ["录像 10 球", "记录抛球稳定性"], duration: "20 分钟" },
      { day: 5, focus: "在疲劳下保持动作", contentIds: ["content_gaiao_02"], drills: ["慢跑后发二发 15 球", "发球前固定流程 10 次"], duration: "20 分钟" },
      { day: 6, focus: "带目标区发球", contentIds: ["content_zlx_02"], drills: ["二区目标区 15 球", "一区目标区 15 球"], duration: "25 分钟" },
      { day: 7, focus: "模拟比赛发球", contentIds: ["content_zlx_01"], drills: ["每分只发一次二发 20 球", "记录成功率"], duration: "30 分钟" }
    ]
  },
  {
    problemTag: "backhand-into-net",
    level: "3.0",
    title: "反手过网稳定性 7 天计划",
    target: "先解决反手总下网的问题，建立稳定前点击球",
    days: [
      { day: 1, focus: "更早准备", contentIds: ["content_cn_a_02"], drills: ["转肩准备 20 次", "不击球准备动作 15 次"], duration: "20 分钟" },
      { day: 2, focus: "前点击球", contentIds: ["content_cn_a_01"], drills: ["影子挥拍 20 次", "定点前点击球 20 球"], duration: "25 分钟" },
      { day: 3, focus: "慢节奏稳定过网", contentIds: ["content_gaiao_03"], drills: ["反手过网 30 球", "反手只求高过网 20 球"], duration: "25 分钟" },
      { day: 4, focus: "脚步配合", contentIds: ["content_cn_a_03"], drills: ["两点移动 15 组", "移动后反手 20 球"], duration: "20 分钟" },
      { day: 5, focus: "反手直线控制", contentIds: ["content_zlx_03"], drills: ["反手直线 20 球", "反手中路深球 20 球"], duration: "25 分钟" },
      { day: 6, focus: "录像复盘", contentIds: ["content_cn_a_01"], drills: ["录 10 个反手", "记录击球点是否在前"], duration: "20 分钟" },
      { day: 7, focus: "带相持的反手练习", contentIds: ["content_cn_a_02"], drills: ["反手相持 5 组", "失误只记录是否晚点"], duration: "30 分钟" }
    ]
  },
  {
    problemTag: "forehand-out",
    level: "3.5",
    title: "正手控制与上旋 7 天计划",
    target: "减少正手出界，先拉起弧线和控制",
    days: [
      { day: 1, focus: "降低发力欲望", contentIds: ["content_cn_d_01"], drills: ["七成力正手 20 球", "只求高过网 20 球"], duration: "20 分钟" },
      { day: 2, focus: "建立上旋意识", contentIds: ["content_cn_d_03"], drills: ["上旋无球挥拍 20 次", "高弧线正手 20 球"], duration: "25 分钟" },
      { day: 3, focus: "击球点和拍面", contentIds: ["content_gaiao_01"], drills: ["固定点击球 20 球", "击球后停住检查拍面 10 次"], duration: "25 分钟" },
      { day: 4, focus: "深度控制", contentIds: ["content_cn_c_01"], drills: ["底线前 1 米目标区 20 球", "正手中路深球 20 球"], duration: "20 分钟" },
      { day: 5, focus: "移动中保持控制", contentIds: ["content_cn_a_03"], drills: ["两点移动后正手 20 球", "只记录弧线和深度"], duration: "25 分钟" },
      { day: 6, focus: "对拉验证", contentIds: ["content_cn_d_03"], drills: ["连续对拉 30 球", "失误只记是否出界"], duration: "25 分钟" },
      { day: 7, focus: "半比赛应用", contentIds: ["content_cn_d_01"], drills: ["发球后第一拍正手 15 分", "正手限定高弧线比赛 10 分"], duration: "30 分钟" }
    ]
  },
  {
    problemTag: "match-anxiety",
    level: "3.5",
    title: "比赛紧张应对 7 天计划",
    target: "建立固定流程，把注意力从结果拉回执行",
    days: [
      { day: 1, focus: "定义自己的比赛流程", contentIds: ["content_cn_f_01"], drills: ["写下发球前流程", "写下接发前流程"], duration: "15 分钟" },
      { day: 2, focus: "发球前固定节奏", contentIds: ["content_cn_e_02"], drills: ["发球前重复流程 10 次", "空拍演练 10 次"], duration: "20 分钟" },
      { day: 3, focus: "接发只做一件事", contentIds: ["content_cn_e_03"], drills: ["接发只打中路深区 20 球", "接发简化挥拍 20 球"], duration: "20 分钟" },
      { day: 4, focus: "练习赛只设一个目标", contentIds: ["content_cn_f_03"], drills: ["只记录一发流程是否完成", "不记录输赢"], duration: "30 分钟" },
      { day: 5, focus: "失败容忍度练习", contentIds: ["content_cn_f_01"], drills: ["每失误后重复关键词", "记录下一个动作执行情况"], duration: "15 分钟" },
      { day: 6, focus: "发接发一分起打", contentIds: ["content_cn_e_01"], drills: ["一发一接 10 组", "每分开始前先做固定流程"], duration: "25 分钟" },
      { day: 7, focus: "完整模拟比赛", contentIds: ["content_cn_e_02"], drills: ["打一盘抢七", "赛后只复盘流程完成率"], duration: "35 分钟" }
    ]
  },
  {
    problemTag: "cant-self-practice",
    level: "3.0",
    title: "不会自己练 7 天入门计划",
    target: "建立最简单可执行的自练结构",
    days: [
      { day: 1, focus: "只选一个主问题", contentIds: ["content_cn_f_02"], drills: ["列出本周唯一主问题", "写 1 个练习目标"], duration: "15 分钟" },
      { day: 2, focus: "正手/反手基础自练", contentIds: ["content_cn_c_03"], drills: ["影子挥拍各 20 次", "定点慢打 20 球"], duration: "20 分钟" },
      { day: 3, focus: "发球自练模版", contentIds: ["content_gaiao_02"], drills: ["抛球 20 次", "半动作发球 20 次"], duration: "20 分钟" },
      { day: 4, focus: "步伐自练模版", contentIds: ["content_cn_c_02"], drills: ["分腿垫步 20 组", "两点移动 15 组"], duration: "15 分钟" },
      { day: 5, focus: "记录和复盘", contentIds: ["content_cn_f_03"], drills: ["写 3 条今天感觉", "记录成功率 1 项"], duration: "15 分钟" },
      { day: 6, focus: "组合一次 30 分钟训练", contentIds: ["content_cn_f_02"], drills: ["5 分钟热身", "10 分钟主问题", "10 分钟发球", "5 分钟记录"], duration: "30 分钟" },
      { day: 7, focus: "形成每周固定模版", contentIds: ["content_cn_c_03"], drills: ["写下下周 3 次训练安排", "每次只保留 1 个重点"], duration: "20 分钟" }
    ]
  }
];
