import { Creator } from "./creator";

export const creators: Creator[] = [
  {
    id: "creator_gaiao",
    name: "盖奥网球",
    region: "domestic",
    platforms: ["YouTube", "Bilibili", "Xiaohongshu"],
    levels: ["2.5", "3.0", "3.5"],
    specialties: ["forehand", "serve", "basics"],
    styleTags: ["新手友好", "基础导向", "动作拆解"],
    bio: "适合零基础到 3.0 左右球员，偏基础动作建立和启蒙教学。",
    suitableFor: ["零基础", "动作框架建立", "发球入门"],
    featuredContentIds: ["content_gaiao_01", "content_gaiao_02", "content_gaiao_03"],
    profileUrl: "https://placeholder.com/gaiao"
  },
  {
    id: "creator_zhaolingxi",
    name: "赵灵熙",
    region: "domestic",
    platforms: ["Bilibili", "Xiaohongshu"],
    levels: ["3.0", "3.5", "4.0"],
    specialties: ["serve", "basics", "matchplay"],
    styleTags: ["细节导向", "进阶修正", "发球教学"],
    bio: "适合 3.0–4.0 球员做基本功细节打磨，尤其适合作为发球和技术进阶样本。",
    suitableFor: ["3.0-3.5", "发球重建", "技术细节优化"],
    featuredContentIds: ["content_zlx_01", "content_zlx_02", "content_zlx_03"],
    profileUrl: "https://placeholder.com/zhaolingxi"
  },
  {
    id: "creator_placeholder_01",
    name: "中文博主 A",
    region: "domestic",
    platforms: ["Bilibili"],
    levels: ["3.0", "3.5"],
    specialties: ["backhand", "footwork"],
    styleTags: ["讲解清晰", "实战导向"],
    bio: "适合 3.0–3.5 球员解决反手和脚步问题。",
    suitableFor: ["反手下网", "步伐混乱"],
    featuredContentIds: ["content_placeholder_01"],
    profileUrl: "https://placeholder.com/a"
  }
];