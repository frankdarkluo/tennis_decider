export type CreatorRegion = "domestic" | "overseas";

export type Creator = {
  id: string;
  name: string;
  region: CreatorRegion;
  platforms: string[];
  levels: string[];
  specialties: string[];
  styleTags: string[];
  bio: string;
  suitableFor: string[];
  featuredContentIds: string[];
  profileUrl?: string;
  avatar?: string;
};

export const creators: Creator[] = [
  {
    id: "creator_gaiao",
    name: "盖奥网球",
    region: "domestic",
    platforms: ["Bilibili", "Xiaohongshu", "YouTube"],
    levels: ["2.5", "3.0", "3.5"],
    specialties: ["basics", "forehand", "serve"],
    styleTags: ["新手友好", "基础导向", "动作拆解"],
    bio: "适合零基础到 3.5 左右球员，偏基础动作建立和启蒙教学。",
    suitableFor: ["零基础", "正手框架建立", "发球入门"],
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
    styleTags: ["细节导向", "发球教学", "进阶修正"],
    bio: "适合 3.0–4.0 球员做基本功细节打磨，尤其适合作为发球和技术进阶样本。",
    suitableFor: ["3.0-3.5", "发球重建", "技术细节优化"],
    featuredContentIds: ["content_zlx_01", "content_zlx_02", "content_zlx_03"],
    profileUrl: "https://placeholder.com/zhaolingxi"
  },
  {
    id: "creator_cn_a",
    name: "中文博主 A",
    region: "domestic",
    platforms: ["Bilibili"],
    levels: ["3.0", "3.5"],
    specialties: ["backhand", "footwork"],
    styleTags: ["讲解清晰", "实战导向"],
    bio: "适合 3.0–3.5 球员解决反手和脚步问题。",
    suitableFor: ["反手下网", "步伐混乱"],
    featuredContentIds: ["content_cn_a_01", "content_cn_a_02", "content_cn_a_03"],
    profileUrl: "https://placeholder.com/cn-a"
  },
  {
    id: "creator_cn_b",
    name: "中文博主 B",
    region: "domestic",
    platforms: ["Xiaohongshu", "Zhihu"],
    levels: ["3.0", "3.5"],
    specialties: ["doubles", "net", "matchplay"],
    styleTags: ["新手友好", "双打导向"],
    bio: "适合双打爱好者，侧重网前站位、配合和简单战术。",
    suitableFor: ["双打网前", "站位意识", "简单战术"],
    featuredContentIds: ["content_cn_b_01", "content_cn_b_02", "content_cn_b_03"],
    profileUrl: "https://placeholder.com/cn-b"
  },
  {
    id: "creator_cn_c",
    name: "中文博主 C",
    region: "domestic",
    platforms: ["Bilibili", "Zhihu"],
    levels: ["2.5", "3.0", "3.5"],
    specialties: ["movement", "consistency", "basics"],
    styleTags: ["动作基础", "讲解慢", "适合自学"],
    bio: "适合动作节奏较慢、需要从稳定性入手的球员。",
    suitableFor: ["总失误", "来不及准备", "不会自己练"],
    featuredContentIds: ["content_cn_c_01", "content_cn_c_02", "content_cn_c_03"],
    profileUrl: "https://placeholder.com/cn-c"
  },
  {
    id: "creator_cn_d",
    name: "中文博主 D",
    region: "domestic",
    platforms: ["Xiaohongshu"],
    levels: ["3.0", "3.5", "4.0"],
    specialties: ["forehand", "topspin", "matchplay"],
    styleTags: ["细节导向", "节奏训练"],
    bio: "适合已经能对拉，但正手控制和上旋意识不够稳定的球员。",
    suitableFor: ["正手出界", "上旋不足", "相持不稳"],
    featuredContentIds: ["content_cn_d_01", "content_cn_d_02", "content_cn_d_03"],
    profileUrl: "https://placeholder.com/cn-d"
  },
  {
    id: "creator_cn_e",
    name: "中文博主 E",
    region: "domestic",
    platforms: ["Bilibili", "Xiaohongshu"],
    levels: ["3.0", "3.5", "4.0"],
    specialties: ["return", "serve", "matchplay"],
    styleTags: ["比赛导向", "接发专题"],
    bio: "适合在接发球和发接发节奏上遇到问题的球员。",
    suitableFor: ["接发球被压制", "比赛开局慢", "发接发流程"],
    featuredContentIds: ["content_cn_e_01", "content_cn_e_02", "content_cn_e_03"],
    profileUrl: "https://placeholder.com/cn-e"
  },
  {
    id: "creator_cn_f",
    name: "中文博主 F",
    region: "domestic",
    platforms: ["Zhihu", "Bilibili"],
    levels: ["3.0", "3.5"],
    specialties: ["mental", "training", "matchplay"],
    styleTags: ["思路清晰", "训练规划", "比赛心理"],
    bio: "适合不知道如何安排训练、比赛里容易乱的球员。",
    suitableFor: ["比赛紧张", "不会自练", "训练无计划"],
    featuredContentIds: ["content_cn_f_01", "content_cn_f_02", "content_cn_f_03"],
    profileUrl: "https://placeholder.com/cn-f"
  }
];
