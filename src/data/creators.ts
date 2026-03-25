export type CreatorRegion = "domestic" | "overseas";

const bilibiliProfileUrl = (query: string) =>
  `https://search.bilibili.com/all?keyword=${encodeURIComponent(query)}`;

const xiaohongshuProfileUrl = (query: string) =>
  `https://www.xiaohongshu.com/search_result?keyword=${encodeURIComponent(query)}`;

const zhihuProfileUrl = (query: string) =>
  `https://www.zhihu.com/search?type=content&q=${encodeURIComponent(query)}`;

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
  recommendedCount?: number;
  profileUrl?: string;
  avatar?: string;
};

export const creators: Creator[] = [
  {
    id: "creator_gaiao",
    name: "盖奥网球",
    region: "domestic",
    platforms: ["Bilibili", "Xiaohongshu", "YouTube"],
    levels: ["2.5", "3.0", "3.5", "4.0"],
    specialties: ["basics", "forehand", "serve"],
    styleTags: ["新手友好", "基础导向", "动作拆解"],
    bio: "适合零基础到 4.0 左右球员，偏基础动作建立和启蒙教学。",
    suitableFor: ["零基础", "正手框架建立", "发球入门"],
    featuredContentIds: ["content_gaiao_01", "content_gaiao_02", "content_gaiao_03"],
    profileUrl: "https://space.bilibili.com/1664596828?spm_id_from=333.337.0.0"
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
    profileUrl: bilibiliProfileUrl("赵灵熙 网球")
  },
  {
    id: "creator_james",
    name: "青蛙王子James",
    region: "domestic",
    platforms: ["Bilibili"],
    levels: ["2.5", "3.0", "3.5", "4.0"],
    specialties: ["basics", "movement", "matchplay"],
    styleTags: ["讲解清晰", "新手友好", "实战导向"],
    bio: "偏业余球友视角的动作拆解和打球思路整理，适合想把基础框架和实战理解一起理顺的球员。",
    suitableFor: ["2.5-4.0", "基础框架", "实战理解"],
    featuredContentIds: [],
    recommendedCount: 0,
    profileUrl: "https://space.bilibili.com/524583239?spm_id_from=333.337.search-card.all.click"
  },
  {
    id: "creator_cn_a",
    name: "赵周晓桥",
    region: "domestic",
    platforms: ["Bilibili"],
    levels: ["3.0", "3.5"],
    specialties: ["backhand", "footwork"],
    styleTags: ["讲解清晰", "动作拆解"],
    bio: "偏基础动作和击球准备拆解，适合想先把反手和脚步问题理顺的业余球员。",
    suitableFor: ["反手下网", "准备偏慢"],
    featuredContentIds: ["content_cn_a_01", "content_cn_a_02", "content_cn_a_03"],
    profileUrl: bilibiliProfileUrl("赵周晓桥 网球")
  },
  {
    id: "creator_cn_b",
    name: "全网球APP",
    region: "domestic",
    platforms: ["Xiaohongshu", "Zhihu"],
    levels: ["3.0", "3.5"],
    specialties: ["doubles", "net", "matchplay"],
    styleTags: ["实战导向", "双打导向"],
    bio: "偏专题整理和比赛场景内容，适合先建立双打站位、网前处理和基础战术认知。",
    suitableFor: ["双打网前", "站位意识", "简单战术"],
    featuredContentIds: ["content_cn_b_01", "content_cn_b_02", "content_cn_b_03"],
    profileUrl: zhihuProfileUrl("全网球APP 网球 双打")
  },
  {
    id: "creator_cn_c",
    name: "网球之家",
    region: "domestic",
    platforms: ["Bilibili", "Zhihu"],
    levels: ["2.5", "3.0", "3.5"],
    specialties: ["movement", "consistency", "basics"],
    styleTags: ["基础导向", "适合自学"],
    bio: "偏基础训练与入门整理，适合从稳定性、步伐和自练结构切入的球友。",
    suitableFor: ["总失误", "来不及准备", "不会自己练"],
    featuredContentIds: ["content_cn_c_01", "content_cn_c_02", "content_cn_c_03"],
    profileUrl: zhihuProfileUrl("网球之家 网球 训练")
  },
  {
    id: "creator_cn_d",
    name: "爱奇艺体育网球",
    region: "domestic",
    platforms: ["Xiaohongshu"],
    levels: ["3.0", "3.5", "4.0"],
    specialties: ["forehand", "topspin", "matchplay"],
    styleTags: ["细节导向", "节奏训练"],
    bio: "偏技术专题和职业比赛周边内容，适合想理解正手控制、上旋和比赛节奏的球员。",
    suitableFor: ["正手出界", "上旋不足", "相持不稳"],
    featuredContentIds: ["content_cn_d_01", "content_cn_d_02", "content_cn_d_03"],
    profileUrl: xiaohongshuProfileUrl("爱奇艺体育 网球")
  },
  {
    id: "creator_cn_e",
    name: "张奔斗",
    region: "domestic",
    platforms: ["Bilibili", "Xiaohongshu"],
    levels: ["3.0", "3.5", "4.0"],
    specialties: ["return", "serve", "matchplay"],
    styleTags: ["比赛导向", "思路清晰"],
    bio: "偏比赛理解和战术表达，适合想提升接发处理、开局思路和比赛执行的球员。",
    suitableFor: ["接发球被压制", "比赛开局慢", "发接发流程"],
    featuredContentIds: ["content_cn_e_01", "content_cn_e_02", "content_cn_e_03"],
    profileUrl: zhihuProfileUrl("张奔斗 网球")
  },
  {
    id: "creator_cn_f",
    name: "孙甜甜网球课堂",
    region: "domestic",
    platforms: ["Zhihu", "Bilibili"],
    levels: ["3.0", "3.5"],
    specialties: ["mental", "training", "matchplay"],
    styleTags: ["训练规划", "比赛心理"],
    bio: "偏业余球员训练组织和比赛心态整理，适合不知道怎么安排课后练习的球友。",
    suitableFor: ["比赛紧张", "不会自练", "训练无计划"],
    featuredContentIds: ["content_cn_f_01", "content_cn_f_02", "content_cn_f_03"],
    profileUrl: xiaohongshuProfileUrl("孙甜甜 网球 课堂")
  },
  {
    id: "creator_racketbrothers",
    name: "RacketBrothers",
    region: "domestic",
    platforms: ["Bilibili"],
    levels: ["3.0", "3.5", "4.0"],
    specialties: ["doubles", "net", "matchplay", "return"],
    styleTags: ["实战导向", "双打导向", "比赛导向"],
    bio: "偏实战与双打场景，适合希望提升网前处理、接发和比赛执行的球员。",
    suitableFor: ["双打网前", "接发被压制", "比赛策略执行"],
    featuredContentIds: ["content_rb_01", "content_rb_02", "content_rb_03"],
    profileUrl: "https://space.bilibili.com/6796357?spm_id_from=333.337.search-card.all.click"
  },
  {
    id: "creator_furao",
    name: "网球工匠付饶",
    region: "domestic",
    platforms: ["Bilibili"],
    levels: ["3.0", "3.5", "4.0"],
    specialties: ["forehand", "backhand", "movement", "basics"],
    styleTags: ["细节导向", "讲解清晰", "动作拆解"],
    bio: "偏技术细节和动作修正，适合处理反手稳定性，击球点和脚步问题。",
    suitableFor: ["反手下网", "击球点偏晚", "基础动作修正"],
    featuredContentIds: ["content_fr_01", "content_fr_02", "content_fr_03"],
    profileUrl: "https://space.bilibili.com/370058962?spm_id_from=333.337.search-card.all.click"
  },
  {
    id: "creator_tennis_with_dylan",
    name: "Tennis with Dylan",
    region: "overseas",
    platforms: ["YouTube"],
    levels: ["3.0", "3.5", "4.0"],
    specialties: ["serve", "movement", "matchplay"],
    styleTags: ["讲解清晰", "实战导向"],
    bio: "偏职业球员与教练视角，适合想加强发球、步伐和实战训练思路的业余球员。",
    suitableFor: ["发球节奏", "脚步移动", "实战训练"],
    featuredContentIds: [],
    recommendedCount: 0,
    profileUrl: "https://www.youtube.com/@Tenniswithdylan"
  },
  {
    id: "creator_karue_sell",
    name: "Karue Sell",
    region: "overseas",
    platforms: ["YouTube"],
    levels: ["3.5", "4.0", "4.5"],
    specialties: ["forehand", "backhand", "matchplay"],
    styleTags: ["讲解清晰", "细节导向"],
    bio: "偏现代击球和职业训练视角，适合想看高质量击球细节与实战决策的球员。",
    suitableFor: ["现代正反手", "击球细节", "实战决策"],
    featuredContentIds: [],
    recommendedCount: 0,
    profileUrl: "https://www.youtube.com/@Karue-Sell"
  },
  {
    id: "creator_top_tennis_training",
    name: "Top Tennis Training",
    region: "overseas",
    platforms: ["YouTube"],
    levels: ["3.0", "3.5", "4.0"],
    specialties: ["serve", "forehand", "backhand", "basics"],
    styleTags: ["讲解清晰", "系统化", "新手友好"],
    bio: "偏系统化基础教学，适合需要把发球和整体动作框架重新理顺的业余球员。",
    suitableFor: ["发球抛球不稳", "基础动作重建", "技术框架梳理"],
    featuredContentIds: ["content_ttt_01"],
    recommendedCount: 1,
    profileUrl: "https://www.youtube.com/@toptennistrainingofficial"
  },
  {
    id: "creator_intuitive_tennis",
    name: "Intuitive Tennis",
    region: "overseas",
    platforms: ["YouTube"],
    levels: ["3.5", "4.0", "4.5"],
    specialties: ["serve", "backhand", "slice", "matchplay"],
    styleTags: ["细节导向", "纠错导向", "讲解清晰"],
    bio: "偏动作修正和击球细节纠错，适合想看切削、发球和击球轨迹修正的球员。",
    suitableFor: ["切削总飘", "动作细节修正", "击球轨迹不稳定"],
    featuredContentIds: ["content_it_01"],
    recommendedCount: 1,
    profileUrl: "https://www.youtube.com/@intuitivetennis"
  },
  {
    id: "creator_essential_tennis",
    name: "Essential Tennis",
    region: "overseas",
    platforms: ["YouTube"],
    levels: ["3.0", "3.5", "4.0", "4.5"],
    specialties: ["consistency", "forehand", "backhand", "matchplay"],
    styleTags: ["讲解清晰", "实战导向", "系统化"],
    bio: "偏业余球员高频问题教学，适合补相持深度、稳定性和比赛执行的基础认知。",
    suitableFor: ["球总打浅", "底线深度控制", "稳定性提升"],
    featuredContentIds: ["content_et_01"],
    recommendedCount: 1,
    profileUrl: "https://www.youtube.com/@essentialtennis"
  },
  {
    id: "creator_tennis_evolution",
    name: "Tennis Evolution",
    region: "overseas",
    platforms: ["YouTube"],
    levels: ["3.0", "3.5", "4.0"],
    specialties: ["serve", "forehand", "backhand", "basics"],
    styleTags: ["新手友好", "讲解清晰"],
    bio: "偏系统化技术教学，适合想补正反手、发球和基础动作框架的业余球员。",
    suitableFor: ["基础动作", "正反手修正", "发球入门"],
    featuredContentIds: [],
    recommendedCount: 0,
    profileUrl: "https://www.youtube.com/@TennisEvolution"
  }
];
