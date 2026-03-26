import { Creator } from "@/types/creator";

const bilibiliAvatar = (id: string) => `/avatars/bilibili/${id}.jpg`;
const youtubeAvatar = (handle: string) => `https://unavatar.io/youtube/${handle}`;

export const creators: Creator[] = [
  {
    id: "creator_gaiao",
    name: "盖奥网球",
    region: "domestic",
    platforms: ["Bilibili"],
    levels: ["2.5", "3.0", "3.5", "4.0"],
    specialties: ["basics", "forehand", "serve", "grip", "footwork", "topspin"],
    styleTags: ["新手友好", "讲解清晰", "基础导向", "动作拆解"],
    bio: "适合零基础到 4.0 左右球员，偏基础动作建立和启蒙教学。",
    suitableFor: ["零基础", "正手框架建立", "发球入门"],
    featuredContentIds: ["content_gaiao_01", "content_gaiao_02", "content_gaiao_03", "content_gaiao_04", "content_gaiao_05", "content_gaiao_06"],
    profileUrl: "https://space.bilibili.com/1664596828?spm_id_from=333.337.0.0",
    platformLinks: {
      Bilibili: "https://space.bilibili.com/1664596828?spm_id_from=333.337.0.0"
    },
    avatar: bilibiliAvatar("creator_gaiao"),
    rankingSignals: {
      subscriberScore: 0.96,
      averageViewsScore: 0.95,
      activityScore: 0.86,
      catalogScore: 0.9,
      authorityScore: 0.9,
      curatorBoost: 1
    }
  },
  {
    id: "creator_mouratoglou_cn",
    name: "冠军教练-莫拉托格鲁",
    region: "domestic",
    platforms: ["Bilibili"],
    levels: ["3.0", "3.5", "4.0", "4.5"],
    specialties: ["serve", "forehand", "matchplay", "basics", "grip"],
    styleTags: ["职业视角", "系统化", "动作拆解"],
    bio: "偏职业教练视角和高质量技术拆解，适合想看更系统训练逻辑与动作框架的球员。",
    suitableFor: ["进阶动作框架", "职业训练视角", "比赛执行"],
    featuredContentIds: ["content_zlx_01", "content_cn_d_01"],
    profileUrl: "https://space.bilibili.com/1096810530?spm_id_from=333.337.search-card.all.click",
    platformLinks: {
      Bilibili: "https://space.bilibili.com/1096810530?spm_id_from=333.337.search-card.all.click"
    },
    avatar: bilibiliAvatar("creator_mouratoglou_cn"),
    rankingSignals: {
      subscriberScore: 0.88,
      averageViewsScore: 0.9,
      activityScore: 0.8,
      catalogScore: 0.75,
      authorityScore: 1,
      curatorBoost: 0.95
    }
  },
  {
    id: "creator_furao",
    name: "网球工匠付饶",
    region: "domestic",
    platforms: ["Bilibili"],
    levels: ["3.0", "3.5", "4.0"],
    specialties: ["forehand", "backhand", "movement", "basics", "grip"],
    styleTags: ["细节导向", "讲解清晰", "动作拆解"],
    bio: "偏技术细节和动作修正，适合处理反手稳定性、击球点和脚步问题。",
    suitableFor: ["反手下网", "击球点偏晚", "基础动作修正"],
    featuredContentIds: ["content_fr_01", "content_fr_02", "content_fr_03"],
    profileUrl: "https://space.bilibili.com/370058962?spm_id_from=333.337.search-card.all.click",
    platformLinks: {
      Bilibili: "https://space.bilibili.com/370058962?spm_id_from=333.337.search-card.all.click"
    },
    avatar: bilibiliAvatar("creator_furao"),
    rankingSignals: {
      subscriberScore: 0.72,
      averageViewsScore: 0.78,
      activityScore: 0.82,
      catalogScore: 0.7,
      authorityScore: 0.75,
      curatorBoost: 0.82
    }
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
    featuredContentIds: ["content_rb_01", "content_rb_02", "content_rb_03", "content_cn_b_01", "content_cn_b_02", "content_cn_b_03"],
    profileUrl: "https://space.bilibili.com/6796357?spm_id_from=333.337.search-card.all.click",
    platformLinks: {
      Bilibili: "https://space.bilibili.com/6796357?spm_id_from=333.337.search-card.all.click"
    },
    avatar: bilibiliAvatar("creator_racketbrothers"),
    rankingSignals: {
      subscriberScore: 0.68,
      averageViewsScore: 0.74,
      activityScore: 0.76,
      catalogScore: 0.68,
      authorityScore: 0.76,
      curatorBoost: 0.77
    }
  },
  {
    id: "creator_cn_a",
    name: "是佩恩呀",
    region: "domestic",
    platforms: ["Bilibili"],
    levels: ["3.0", "3.5"],
    specialties: ["backhand", "footwork"],
    styleTags: ["讲解清晰", "动作拆解"],
    bio: "偏基础动作和击球准备拆解，适合想先把反手和脚步问题理顺的业余球员。",
    suitableFor: ["反手下网", "准备偏慢"],
    featuredContentIds: ["content_cn_a_01", "content_cn_a_02", "content_common_02"],
    profileUrl: "https://space.bilibili.com/551162560/upload/video",
    platformLinks: {
      Bilibili: "https://space.bilibili.com/551162560/upload/video"
    },
    avatar: bilibiliAvatar("creator_cn_a"),
    rankingSignals: {
      subscriberScore: 0.54,
      averageViewsScore: 0.6,
      activityScore: 0.66,
      catalogScore: 0.58,
      authorityScore: 0.7,
      curatorBoost: 0.56
    }
  },
  {
    id: "creator_leontv_cn",
    name: "LeonTV网球频道",
    region: "domestic",
    platforms: ["Bilibili", "YouTube"],
    levels: ["2.5", "3.0", "3.5", "4.0"],
    specialties: ["basics", "forehand", "backhand", "matchplay", "grip"],
    styleTags: ["讲解清晰", "新手友好", "系统化"],
    bio: "偏系统化教学和练习框架，适合想把正反手、基础节奏和实战思路一起理顺的球员。",
    suitableFor: ["基础动作", "正反手稳定性", "实战理解"],
    featuredContentIds: ["content_cn_c_02", "content_cn_d_02", "content_cn_d_03"],
    profileUrl: "https://space.bilibili.com/431898127?spm_id_from=333.337.search-card.all.click",
    platformLinks: {
      Bilibili: "https://space.bilibili.com/431898127?spm_id_from=333.337.search-card.all.click",
      YouTube: "https://www.youtube.com/@LeonTV/videos"
    },
    avatar: bilibiliAvatar("creator_leontv_cn"),
    rankingSignals: {
      subscriberScore: 0.5,
      averageViewsScore: 0.57,
      activityScore: 0.68,
      catalogScore: 0.66,
      authorityScore: 0.72,
      curatorBoost: 0.72
    }
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
    profileUrl: "https://space.bilibili.com/524583239?spm_id_from=333.337.search-card.all.click",
    platformLinks: {
      Bilibili: "https://space.bilibili.com/524583239?spm_id_from=333.337.search-card.all.click"
    },
    avatar: bilibiliAvatar("creator_james"),
    rankingSignals: {
      subscriberScore: 0.5,
      averageViewsScore: 0.56,
      activityScore: 0.6,
      catalogScore: 0.55,
      authorityScore: 0.55,
      curatorBoost: 0.55
    }
  },
  {
    id: "creator_liuliu",
    name: "六六网球",
    region: "domestic",
    platforms: ["Bilibili"],
    levels: ["2.5", "3.0", "3.5"],
    specialties: ["basics", "footwork", "consistency", "training"],
    styleTags: ["新手友好", "适合自学", "训练导向"],
    bio: "偏基础训练组织和步伐稳定性，适合想把练习内容安排得更扎实的新手球友。",
    suitableFor: ["自练安排", "脚步基础", "稳定性"],
    featuredContentIds: [],
    recommendedCount: 0,
    profileUrl: "https://space.bilibili.com/3546889345567354?spm_id_from=333.337.search-card.all.click",
    platformLinks: {
      Bilibili: "https://space.bilibili.com/3546889345567354?spm_id_from=333.337.search-card.all.click"
    },
    avatar: bilibiliAvatar("creator_liuliu"),
    rankingSignals: {
      subscriberScore: 0.52,
      averageViewsScore: 0.6,
      activityScore: 0.67,
      catalogScore: 0.6,
      authorityScore: 0.6,
      curatorBoost: 0.6
    }
  },
  {
    id: "creator_pikachu",
    name: "打网球的皮卡邱",
    region: "domestic",
    platforms: ["Bilibili"],
    levels: ["2.5", "3.0", "3.5"],
    specialties: ["matchplay", "basics", "training", "movement"],
    styleTags: ["业余球友视角", "实战导向", "新手友好"],
    bio: "偏业余球友视角的练球和实战记录，适合想从真实练习过程里获得启发的球员。",
    suitableFor: ["练球思路", "实战体感", "入门提升"],
    featuredContentIds: ["content_cn_a_03", "content_cn_c_03", "content_cn_f_02"],
    recommendedCount: 3,
    profileUrl: "https://space.bilibili.com/477934059?spm_id_from=333.337.search-card.all.click",
    platformLinks: {
      Bilibili: "https://space.bilibili.com/477934059?spm_id_from=333.337.search-card.all.click"
    },
    avatar: bilibiliAvatar("creator_pikachu"),
    rankingSignals: {
      subscriberScore: 0.48,
      averageViewsScore: 0.58,
      activityScore: 0.64,
      catalogScore: 0.56,
      authorityScore: 0.58,
      curatorBoost: 0.58
    }
  },
  {
    id: "creator_matsuo_yuki_cn",
    name: "松尾友贵Proの网球教学",
    region: "domestic",
    platforms: ["Bilibili"],
    levels: ["3.0", "3.5", "4.0", "4.5"],
    specialties: ["forehand", "backhand", "serve", "basics"],
    styleTags: ["职业视角", "细节导向", "动作拆解"],
    bio: "偏职业选手/教练级动作拆解，适合想看更精细技术要点的进阶球员。",
    suitableFor: ["进阶技术细节", "正反手修正", "发球框架"],
    featuredContentIds: ["content_zlx_03", "content_common_03"],
    profileUrl: "https://space.bilibili.com/3546822188468643?spm_id_from=333.337.search-card.all.click",
    platformLinks: {
      Bilibili: "https://space.bilibili.com/3546822188468643?spm_id_from=333.337.search-card.all.click"
    },
    avatar: bilibiliAvatar("creator_matsuo_yuki_cn"),
    rankingSignals: {
      subscriberScore: 0.57,
      averageViewsScore: 0.76,
      activityScore: 0.55,
      catalogScore: 0.5,
      authorityScore: 0.86,
      curatorBoost: 0.8
    }
  },
  {
    id: "creator_austin_camp",
    name: "奥斯汀-冬令营",
    region: "domestic",
    platforms: ["Bilibili"],
    levels: ["2.5", "3.0", "3.5", "4.0"],
    specialties: ["serve", "basics", "movement", "training"],
    styleTags: ["训练导向", "系统化", "讲解清晰"],
    bio: "偏训练营式内容和专项练习思路，适合想把发球、移动和训练结构串起来的球员。",
    suitableFor: ["训练计划", "发球基础", "脚步训练"],
    featuredContentIds: ["content_zlx_02"],
    profileUrl: "https://space.bilibili.com/324446217?spm_id_from=333.337.search-card.all.click",
    platformLinks: {
      Bilibili: "https://space.bilibili.com/324446217?spm_id_from=333.337.search-card.all.click"
    },
    avatar: bilibiliAvatar("creator_austin_camp"),
    rankingSignals: {
      subscriberScore: 0.45,
      averageViewsScore: 0.54,
      activityScore: 0.62,
      catalogScore: 0.58,
      authorityScore: 0.62,
      curatorBoost: 0.6
    }
  },
  {
    id: "creator_search_curated",
    name: "教练整理搜索入口",
    region: "domestic",
    platforms: ["Bilibili"],
    levels: ["2.5", "3.0", "3.5", "4.0"],
    specialties: ["training", "matchplay", "basics", "consistency", "return", "defense", "mental"],
    styleTags: ["搜索入口", "教练整理", "无单一博主归属"],
    bio: "用于承载教练手工整理、但暂时无法诚实归属到单一 B 站博主的搜索入口内容，不参与博主排行榜或博主页推荐。",
    suitableFor: ["搜索入口内容", "暂未绑定单一 B 站博主", "主题检索"],
    featuredContentIds: [
      "content_cn_c_01",
      "content_common_01",
      "content_cn_e_01",
      "content_cn_e_02",
      "content_cn_e_03",
      "content_cn_f_01",
      "content_cn_f_03"
    ],
    rankingEligible: false,
    discoveryEligible: false,
    rankingSignals: {
      subscriberScore: 0,
      averageViewsScore: 0,
      activityScore: 0,
      catalogScore: 0,
      authorityScore: 0,
      curatorBoost: 0
    }
  },
  {
    id: "creator_mouratoglou_official",
    name: "patrickmouratoglou_official",
    region: "overseas",
    platforms: ["YouTube"],
    levels: ["3.0", "3.5", "4.0", "4.5"],
    specialties: ["serve", "forehand", "matchplay", "basics"],
    styleTags: ["职业视角", "系统化", "动作拆解"],
    bio: "偏世界级教练视角和职业训练逻辑，适合想理解高水平技术框架与比赛思维的球员。",
    suitableFor: ["职业训练视角", "进阶技术", "比赛执行"],
    featuredContentIds: [],
    recommendedCount: 0,
    profileUrl: "https://www.youtube.com/@patrickmouratoglou_official",
    platformLinks: {
      YouTube: "https://www.youtube.com/@patrickmouratoglou_official"
    },
    avatar: youtubeAvatar("@patrickmouratoglou_official"),
    rankingSignals: {
      subscriberScore: 0.92,
      averageViewsScore: 0.84,
      activityScore: 0.88,
      catalogScore: 0.82,
      authorityScore: 1,
      curatorBoost: 0.98
    }
  },
  {
    id: "creator_venus_williams",
    name: "Venus Williams",
    region: "overseas",
    platforms: ["YouTube"],
    levels: ["3.5", "4.0", "4.5"],
    specialties: ["serve", "matchplay", "mental"],
    styleTags: ["职业球员", "比赛导向", "经验导向"],
    bio: "偏职业球员视角和比赛经验分享，适合想从顶级选手经验中理解训练与比赛心态的球员。",
    suitableFor: ["比赛经验", "职业视角", "发球与执行"],
    featuredContentIds: [],
    recommendedCount: 0,
    profileUrl: "https://www.youtube.com/@VenusWilliams/videos",
    platformLinks: {
      YouTube: "https://www.youtube.com/@VenusWilliams/videos"
    },
    avatar: youtubeAvatar("@VenusWilliams"),
    rankingSignals: {
      subscriberScore: 0.98,
      averageViewsScore: 0.88,
      activityScore: 0.76,
      catalogScore: 0.58,
      authorityScore: 1,
      curatorBoost: 0.95
    }
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
    profileUrl: "https://www.youtube.com/@Tenniswithdylan",
    platformLinks: {
      YouTube: "https://www.youtube.com/@Tenniswithdylan"
    },
    avatar: youtubeAvatar("@Tenniswithdylan"),
    rankingSignals: {
      subscriberScore: 0.8,
      averageViewsScore: 0.84,
      activityScore: 0.86,
      catalogScore: 0.74,
      authorityScore: 0.82,
      curatorBoost: 1
    }
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
    profileUrl: "https://www.youtube.com/@TopTennisTrainingOfficial",
    platformLinks: {
      YouTube: "https://www.youtube.com/@TopTennisTrainingOfficial"
    },
    avatar: youtubeAvatar("@TopTennisTrainingOfficial"),
    rankingSignals: {
      subscriberScore: 0.88,
      averageViewsScore: 0.86,
      activityScore: 0.85,
      catalogScore: 0.88,
      authorityScore: 0.84,
      curatorBoost: 0.82
    }
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
    profileUrl: "https://www.youtube.com/@EssentialTennis/videos",
    platformLinks: {
      YouTube: "https://www.youtube.com/@EssentialTennis/videos"
    },
    avatar: youtubeAvatar("@EssentialTennis"),
    rankingSignals: {
      subscriberScore: 0.9,
      averageViewsScore: 0.84,
      activityScore: 0.9,
      catalogScore: 1,
      authorityScore: 0.82,
      curatorBoost: 0.8
    }
  },
  {
    id: "creator_online_tennis_instruction",
    name: "Online Tennis Instruction",
    region: "overseas",
    platforms: ["YouTube"],
    levels: ["3.0", "3.5", "4.0", "4.5"],
    specialties: ["serve", "forehand", "backhand", "basics"],
    styleTags: ["系统化", "动作拆解", "讲解清晰"],
    bio: "偏长线技术框架和专项细节讲解，适合想系统补基础动作的球员。",
    suitableFor: ["技术重建", "发球框架", "正反手动作"],
    featuredContentIds: [],
    recommendedCount: 0,
    profileUrl: "https://www.youtube.com/@OnlineTennisInstruction",
    platformLinks: {
      YouTube: "https://www.youtube.com/@OnlineTennisInstruction"
    },
    avatar: youtubeAvatar("@OnlineTennisInstruction"),
    rankingSignals: {
      subscriberScore: 0.82,
      averageViewsScore: 0.78,
      activityScore: 0.82,
      catalogScore: 0.9,
      authorityScore: 0.82,
      curatorBoost: 0.78
    }
  },
  {
    id: "creator_performance_plus_tennis",
    name: "Performance-Plus Tennis",
    region: "overseas",
    platforms: ["YouTube"],
    levels: ["3.0", "3.5", "4.0", "4.5"],
    specialties: ["forehand", "backhand", "basics", "movement"],
    styleTags: ["动作拆解", "讲解清晰", "训练导向"],
    bio: "偏动作修正和训练细节，适合想把击球和移动基础做扎实的球员。",
    suitableFor: ["动作修正", "基础训练", "击球稳定性"],
    featuredContentIds: [],
    recommendedCount: 0,
    profileUrl: "https://www.youtube.com/@PerformancePlusTennis/videos",
    platformLinks: {
      YouTube: "https://www.youtube.com/@PerformancePlusTennis/videos"
    },
    avatar: youtubeAvatar("@PerformancePlusTennis"),
    rankingSignals: {
      subscriberScore: 0.72,
      averageViewsScore: 0.76,
      activityScore: 0.75,
      catalogScore: 0.72,
      authorityScore: 0.78,
      curatorBoost: 0.76
    }
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
    profileUrl: "https://www.youtube.com/@Karue-Sell",
    platformLinks: {
      YouTube: "https://www.youtube.com/@Karue-Sell"
    },
    avatar: youtubeAvatar("@Karue-Sell"),
    rankingSignals: {
      subscriberScore: 0.78,
      averageViewsScore: 0.82,
      activityScore: 0.8,
      catalogScore: 0.7,
      authorityScore: 0.86,
      curatorBoost: 0.76
    }
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
    profileUrl: "https://www.youtube.com/@intuitivetennis",
    platformLinks: {
      YouTube: "https://www.youtube.com/@intuitivetennis"
    },
    avatar: youtubeAvatar("@intuitivetennis"),
    rankingSignals: {
      subscriberScore: 0.8,
      averageViewsScore: 0.8,
      activityScore: 0.83,
      catalogScore: 0.78,
      authorityScore: 0.84,
      curatorBoost: 0.78
    }
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
    profileUrl: "https://www.youtube.com/@TennisEvolution",
    platformLinks: {
      YouTube: "https://www.youtube.com/@TennisEvolution"
    },
    avatar: youtubeAvatar("@TennisEvolution"),
    rankingSignals: {
      subscriberScore: 0.68,
      averageViewsScore: 0.66,
      activityScore: 0.7,
      catalogScore: 0.76,
      authorityScore: 0.68,
      curatorBoost: 0.68
    }
  }
];
