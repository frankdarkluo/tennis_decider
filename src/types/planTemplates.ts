import { PlanTemplate } from "./plan";

export const planTemplates: PlanTemplate[] = [
  {
    problemTag: "second-serve-confidence",
    level: "3.5",
    title: "二发稳定性 7 天重建计划",
    target: "先建立安全二发的节奏、抛球和信心",
    days: [
      {
        day: 1,
        focus: "稳定抛球",
        contentIds: ["content_gaiao_02"],
        drills: ["抛球 30 次", "空挥发球 20 次"],
        duration: "20 分钟"
      },
      {
        day: 2,
        focus: "建立二发节奏",
        contentIds: ["content_zlx_01"],
        drills: ["半动作二发 20 次", "二区慢发 20 球"],
        duration: "25 分钟"
      },
      {
        day: 3,
        focus: "上旋安全感",
        contentIds: ["content_zlx_02"],
        drills: ["上旋感觉练习 20 次", "一区二区交替二发 20 球"],
        duration: "25 分钟"
      },
      {
        day: 4,
        focus: "节奏复盘",
        contentIds: ["content_zlx_01"],
        drills: ["录像 10 球", "记录抛球稳定性"],
        duration: "20 分钟"
      },
      {
        day: 5,
        focus: "在疲劳下保持动作",
        contentIds: ["content_gaiao_02"],
        drills: ["慢跑后发二发 15 球", "发球前固定流程 10 次"],
        duration: "20 分钟"
      },
      {
        day: 6,
        focus: "带目标区发球",
        contentIds: ["content_zlx_02"],
        drills: ["二区目标区 15 球", "一区目标区 15 球"],
        duration: "25 分钟"
      },
      {
        day: 7,
        focus: "模拟比赛发球",
        contentIds: ["content_zlx_01"],
        drills: ["每分只发一次二发 20 球", "记录成功率"],
        duration: "30 分钟"
      }
    ]
  }
];