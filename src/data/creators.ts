import { Creator } from "@/types/creator";

const bilibiliAvatar = (id: string) => `/avatars/bilibili/${id}.jpg`;
const youtubeAvatar = (handle: string) => `https://unavatar.io/youtube/${handle}`;

export const creators: Creator[] = [
  {
    id: "creator_gaiao",
    name: "盖奥网球",
    shortDescription: "内容全面清晰，适合打基础和自学入门",
    tags: ["新手友好", "基础导向", "讲解清晰"],
    region: "domestic",
    platforms: ["Bilibili"],
    levels: ["2.5", "3.0", "3.5", "4.0"],
    specialties: ["basics", "forehand", "serve", "grip", "footwork", "topspin"],
    styleTags: ["新手友好", "讲解清晰", "基础导向", "动作拆解"],
    bio: "内容全面清晰，适合基础入门和自学提升。",
    suitableFor: ["零基础", "正手框架建立", "发球入门"],
    featuredContentIds: ["content_gaiao_01", "content_gaiao_02", "content_gaiao_03", "content_gaiao_04", "content_gaiao_05", "content_gaiao_06"],
    featuredVideos: [
      {
        id: "creator_gaiao_video_01",
        title: "详细版 网球正手零基础教学",
        target: "正手框架总立不住",
        levels: ["2.5", "3.0"],
        thumbnail: '/thumbnails/bilibili/f141ebcafbe7565d32be6b26d6854fe6d3bf845c.jpg',
    viewCount: 150977,
        duration: '1:14',
        url: "https://www.bilibili.com/video/BV1XM4y187mR/",
        platform: "Bilibili"
      },
      {
        id: "creator_gaiao_video_02",
        title: "网球反手零基础教学",
        target: "反手总打不扎实",
        levels: ["2.5", "3.0", "3.5"],
        thumbnail: '/thumbnails/bilibili/e4600b2ca3cd245f33ad97fb5d03cb74ccb2006e.jpg',
    viewCount: 39525,
        duration: '1:03',
        url: "https://www.bilibili.com/video/BV1YL411d7oX/",
        platform: "Bilibili"
      },
      {
        id: "creator_gaiao_video_03",
        title: "网球步伐训练合集",
        target: "脚步启动总慢半拍",
        levels: ["2.5", "3.0", "3.5"],
        thumbnail: '/thumbnails/bilibili/040a19ed2bc864e2d9101347b15782f7e0e36bc4.jpg',
    viewCount: 60771,
        duration: '1:27',
        url: "https://www.bilibili.com/video/BV1Tg4y1w7Xe/",
        platform: "Bilibili"
      },
      {
        id: "creator_gaiao_video_04",
        title: "#网球 如何练会拐弯的侧旋发球 #网球发球#网球教学#网球盖奥",
        target: "侧旋发球总做不出来",
        levels: ["3.0", "3.5", "4.0"],
        thumbnail: '/thumbnails/bilibili/51f03db09cb87e128474d2ece17fbbdf2ea2f057.jpg',
    viewCount: 36915,
        duration: '0:32',
        url: "https://www.bilibili.com/video/BV1YA4y1D7YR/",
        platform: "Bilibili"
      },
      {
        id: "creator_gaiao_video_05",
        title: "球打不深怎么办",
        target: "相持球总打不深",
        levels: ["3.0", "3.5", "4.0"],
        thumbnail: '/thumbnails/bilibili/96883140bb27637300a9b52f844000e25556ab57.jpg',
    viewCount: 17182,
        duration: '0:48',
        url: "https://www.bilibili.com/video/BV1kp421d7od/",
        platform: "Bilibili"
      }
    ],
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
    shortDescription: "职业视角拆解发球框架",
    tags: ["进阶提升", "发球专项", "实战导向"],
    region: "domestic",
    platforms: ["Bilibili"],
    levels: ["3.0", "3.5", "4.0", "4.5"],
    specialties: ["serve", "forehand", "matchplay", "basics", "grip"],
    styleTags: ["职业视角", "系统化", "动作拆解"],
    bio: "偏职业教练视角和高质量技术拆解，适合想看更系统训练逻辑与动作框架的球员。",
    suitableFor: ["进阶动作框架", "职业训练视角", "比赛执行"],
    featuredContentIds: ["content_zlx_01", "content_cn_d_01"],
    featuredVideos: [
      {
        id: "creator_mouratoglou_cn_video_01",
        title: "网球技巧| 正手击球，提前开拍",
        target: "正手准备总是偏晚",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: '/thumbnails/bilibili/60f674fe6381eac7a5fc388bd4a9c21b5c74c12b.jpg',
    viewCount: 26542,
        duration: '0:37',
        url: "https://www.bilibili.com/video/BV1zK411d7SW/",
        platform: "Bilibili"
      },
      {
        id: "creator_mouratoglou_cn_video_02",
        title: "网球截击五部曲",
        target: "截击细节总是混乱",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: '/thumbnails/bilibili/12427e203edb27a230920f96083783deb633e228.jpg',
    viewCount: 21688,
        duration: '1:12',
        url: "https://www.bilibili.com/video/BV1xm4y1K7KS/",
        platform: "Bilibili"
      },
      {
        id: "creator_mouratoglou_cn_video_03",
        title: "大师讲堂|莫拉托格鲁教练教你一步一步让发球更流畅！",
        target: "发球动作总不流畅",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: '/thumbnails/bilibili/3824544837bd4bd47db704c163c91474e275a168.jpg',
    viewCount: 8824,
        duration: '2:56',
        url: "https://www.bilibili.com/video/BV1aB4y1m7Nv/",
        platform: "Bilibili"
      },
      {
        id: "creator_mouratoglou_cn_video_04",
        title: "网球教学：开放式反手击球",
        target: "开放式反手不会用",
        levels: ["3.5", "4.0", "4.5"],
        thumbnail: '/thumbnails/bilibili/fad09681d3b7e94b7838158060be2a30f42da685.jpg',
    viewCount: 7708,
        duration: '1:31',
        url: "https://www.bilibili.com/video/BV1cb4y1P7su/",
        platform: "Bilibili"
      },
      {
        id: "creator_mouratoglou_cn_video_05",
        title: "砰！莫式力量控制黄金法则！",
        target: "发力一大就失控",
        levels: ["3.5", "4.0", "4.5"],
        thumbnail: '/thumbnails/bilibili/48ccd4c24f6615da76ec5622beb45c0208da2e17.jpg',
    viewCount: 4426,
        duration: '0:39',
        url: "https://www.bilibili.com/video/BV1i7AdeSEFf/",
        platform: "Bilibili"
      }
    ],
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
    shortDescription: "动作细节和击球点纠正",
    tags: ["细节导向", "反手专项", "脚步移动"],
    region: "domestic",
    platforms: ["Bilibili"],
    levels: ["3.0", "3.5", "4.0"],
    specialties: ["forehand", "backhand", "movement", "basics", "grip"],
    styleTags: ["细节导向", "讲解清晰", "动作拆解"],
    bio: "偏技术细节和动作修正，适合处理反手稳定性、击球点和脚步问题。",
    suitableFor: ["反手下网", "击球点偏晚", "基础动作修正"],
    featuredContentIds: ["content_fr_01", "content_fr_02", "content_fr_03"],
    featuredVideos: [
      {
        id: "creator_furao_video_01",
        title: "干货and硬货｜双反球速提升不能错过的两个训练方法",
        target: "双反球速总起不来",
        levels: ["3.0", "3.5", "4.0"],
        thumbnail: '/thumbnails/bilibili/d83e49d82698a0dcdb6d03c412af855dfbec9d47.jpg',
    viewCount: 18358,
        duration: '7:23',
        url: "https://www.bilibili.com/video/BV1Ty4y1G7r6/",
        platform: "Bilibili"
      },
      {
        id: "creator_furao_video_02",
        title: "发球加速不是靠手臂，而是用手腕｜《跟职业一起训练》第四集",
        target: "发球想加速却只抡手",
        levels: ["3.0", "3.5", "4.0"],
        thumbnail: '/thumbnails/bilibili/01629ab79b28769850818e1c00ecb017fb69e228.jpg',
    viewCount: 46997,
        duration: '5:39',
        url: "https://www.bilibili.com/video/BV123411H7u6/",
        platform: "Bilibili"
      },
      {
        id: "creator_furao_video_03",
        title: "正！手！千！万！别！引！拍！",
        target: "正手引拍越做越大",
        levels: ["3.0", "3.5", "4.0"],
        thumbnail: '/thumbnails/bilibili/7910cfd92081586293280ac5f6c4f0091ba4a6d7.jpg',
    viewCount: 206893,
        duration: '9:22',
        url: "https://www.bilibili.com/video/BV1Zf4y1b7aW/",
        platform: "Bilibili"
      },
      {
        id: "creator_furao_video_04",
        title: "新年首战：网球工匠付饶4.5vs智利纳达尔Camilo5.0（2022继续向5.0攀登）",
        target: "想看实战对抗细节",
        levels: ["3.5", "4.0"],
        thumbnail: '/thumbnails/bilibili/82d0351f649ba96ee628548caafa0ae057748b00.jpg',
    viewCount: 10010,
        duration: '10:54',
        url: "https://www.bilibili.com/video/BV1jm4y1X7yF/",
        platform: "Bilibili"
      },
      {
        id: "creator_furao_video_05",
        title: "【网球工匠付饶】测评Vcore米白色款网球拍",
        target: "想看器材实测思路",
        levels: ["3.0", "3.5", "4.0"],
        thumbnail: '/thumbnails/bilibili/f8d7620ee92779dc3700de4d009f8167d6e8cb89.jpg',
    viewCount: 41994,
        duration: '5:05',
        url: "https://www.bilibili.com/video/BV1qz421i79v/",
        platform: "Bilibili"
      }
    ],
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
    shortDescription: "双打实战和比赛执行",
    tags: ["双打专项", "实战导向", "讲解清晰"],
    region: "domestic",
    platforms: ["Bilibili"],
    levels: ["3.0", "3.5", "4.0"],
    specialties: ["doubles", "net", "matchplay", "return"],
    styleTags: ["实战导向", "双打导向", "比赛导向"],
    bio: "偏实战与双打场景，适合希望提升网前处理、接发和比赛执行的球员。",
    suitableFor: ["双打网前", "接发被压制", "比赛策略执行"],
    featuredContentIds: ["content_rb_01", "content_rb_02", "content_rb_03", "content_cn_b_01", "content_cn_b_02", "content_cn_b_03"],
    featuredVideos: [
      {
        id: "creator_racketbrothers_video_01",
        title: "【网球教学-言之有理】5.0大佬教我如何让截击更SIX",
        target: "网前截击总不稳",
        levels: ["3.0", "3.5", "4.0"],
        thumbnail: '/thumbnails/bilibili/8e9a2416bfa72356df1d9ce499d1221652b5c7ef.jpg',
    viewCount: 138186,
        duration: '22:03',
        url: "https://www.bilibili.com/video/BV1954y147nF/",
        platform: "Bilibili"
      },
      {
        id: "creator_racketbrothers_video_02",
        title: "【网球教学-言之有理】5.0大佬教我如何让发球和接发球更GOOD",
        target: "接发第一拍质量低",
        levels: ["3.0", "3.5", "4.0"],
        thumbnail: '/thumbnails/bilibili/a7c193cdba7994f40ab95c947c618f94bb1f8973.jpg',
    viewCount: 285931,
        duration: '30:38',
        url: "https://www.bilibili.com/video/BV1Ep4y1W7kc/",
        platform: "Bilibili"
      },
      {
        id: "creator_racketbrothers_video_03",
        title: "【网球比赛】2023天天有网球年终总决赛周柏言/赵子昂HL",
        target: "想看双打实战执行",
        levels: ["3.0", "3.5", "4.0"],
        thumbnail: '/thumbnails/bilibili/d8bbdfd63f468624fd2530609984dbf8dea11039.jpg',
    viewCount: 36442,
        duration: '7:41',
        url: "https://www.bilibili.com/video/BV1JN4y18792/",
        platform: "Bilibili"
      },
      {
        id: "creator_racketbrothers_video_04",
        title: "【网球教学-言之有理】5.0大佬教我如何让切削更UP",
        target: "切削总飘不下压",
        levels: ["3.0", "3.5", "4.0"],
        thumbnail: '/thumbnails/bilibili/a3bd03f8d1177ffb7fbb365b176d5ba11812ea1e.jpg',
    viewCount: 189975,
        duration: '23:45',
        url: "https://www.bilibili.com/video/BV1TU4y187QS/",
        platform: "Bilibili"
      },
      {
        id: "creator_racketbrothers_video_05",
        title: "【网球教学-言之讲理】5.0大佬教“全国U14年终第一”怎样打好单手反拍&截击（上）",
        target: "单反和截击衔接乱",
        levels: ["3.5", "4.0"],
        thumbnail: '/thumbnails/bilibili/5dd6a9934e4a546847ff8a53668f0830c12ebfb7.jpg',
    viewCount: 50976,
        duration: '16:27',
        url: "https://www.bilibili.com/video/BV1Sj411r7Ka/",
        platform: "Bilibili"
      }
    ],
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
    name: "是沛恩呀",
    shortDescription: "反手准备和脚步理顺",
    tags: ["讲解清晰", "反手专项", "脚步移动"],
    region: "domestic",
    platforms: ["Bilibili"],
    levels: ["3.0", "3.5"],
    specialties: ["backhand", "footwork"],
    styleTags: ["讲解清晰", "动作拆解"],
    bio: "偏基础动作和击球准备拆解，适合想先把反手和脚步问题理顺的业余球员。",
    suitableFor: ["反手下网", "准备偏慢"],
    featuredContentIds: ["content_cn_a_01", "content_cn_a_02", "content_common_02"],
    featuredVideos: [
      {
        id: "creator_cn_a_video_01",
        title: "网球技术｜新手｜一种简单易练的截击✨",
        target: "截击动作总是乱",
        levels: ["3.0", "3.5"],
        thumbnail: '/thumbnails/bilibili/f7740abefccf6743e36f9aeb5e6a6f2da7b85385.jpg',
    viewCount: 82557,
        duration: '1:12',
        url: "https://www.bilibili.com/video/BV1b2UmBTEsV/",
        platform: "Bilibili"
      },
      {
        id: "creator_cn_a_video_02",
        title: "网球新手｜切削发球一分钟速成✅3步",
        target: "切削发球总转不起来",
        levels: ["3.0", "3.5"],
        thumbnail: '/thumbnails/bilibili/4d1163b793537b55bccf451ccc1a15ef27dd1c62.jpg',
    viewCount: 33837,
        duration: '1:01',
        url: "https://www.bilibili.com/video/BV1Q8NWzmESF/",
        platform: "Bilibili"
      },
      {
        id: "creator_cn_a_video_03",
        title: "网球技术｜一分钟✅｜跟着德约学起跳反手‼️➡️",
        target: "起跳反手总不会用",
        levels: ["3.0", "3.5"],
        thumbnail: '/thumbnails/bilibili/f34a8c49caa5ce8f855455c2bff586ae1a58d7b3.jpg',
    viewCount: 7216,
        duration: '1:01',
        url: "https://www.bilibili.com/video/BV1TrwQe9E2A/",
        platform: "Bilibili"
      },
      {
        id: "creator_cn_a_video_04",
        title: "网球热身｜5组动作提升状态🎾新手必练‼️",
        target: "上场前总不会热身",
        levels: ["3.0", "3.5"],
        thumbnail: '/thumbnails/bilibili/5e3944513a109f027eb34e68c7b10754f9015e3f.jpg',
    viewCount: 3969,
        duration: '1:17',
        url: "https://www.bilibili.com/video/BV1oaN9eEEpk/",
        platform: "Bilibili"
      },
      {
        id: "creator_cn_a_video_05",
        title: "网球必练｜一键模式✅新手也能打直球❗️",
        target: "总打不出稳定直线",
        levels: ["3.0", "3.5"],
        thumbnail: '/thumbnails/bilibili/521bc95fc6a86451bbb659fb31995cafc6611b4b.jpg',
    viewCount: 11063,
        duration: '1:24',
        url: "https://www.bilibili.com/video/BV1i1sUzVEfW/",
        platform: "Bilibili"
      }
    ],
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
    shortDescription: "系统化理顺正反手框架",
    tags: ["基础导向", "讲解清晰", "正手专项"],
    region: "domestic",
    platforms: ["Bilibili", "YouTube"],
    levels: ["2.5", "3.0", "3.5", "4.0"],
    specialties: ["basics", "forehand", "backhand", "matchplay", "grip"],
    styleTags: ["讲解清晰", "新手友好", "系统化"],
    bio: "偏系统化教学和练习框架，适合想把正反手、基础节奏和实战思路一起理顺的球员。",
    suitableFor: ["基础动作", "正反手稳定性", "实战理解"],
    featuredContentIds: ["content_cn_c_02", "content_cn_d_02", "content_cn_d_03"],
    featuredVideos: [
      {
        id: "creator_leontv_cn_video_01",
        title: "职业选手分腿垫步的三大步骤｜LeonTV｜网球教学",
        target: "分腿垫步总慢半拍",
        levels: ["2.5", "3.0", "3.5"],
        thumbnail: '/thumbnails/bilibili/bcd585e7eb1eb34b3f90ec584d18425635997e30.jpg',
    viewCount: 25227,
        duration: '7:25',
        url: "https://www.bilibili.com/video/BV1PN4y1R7jL/",
        platform: "Bilibili"
      },
      {
        id: "creator_leontv_cn_video_02",
        title: "【网球教学】正拍打出力并能保持稳定性的三个步骤｜ LeonTV ｜网球基础",
        target: "正手发力总靠手臂",
        levels: ["2.5", "3.0", "3.5"],
        thumbnail: '/thumbnails/bilibili/8ec3416ebcfbb18422c57f72fa81f2acab2bb791.jpg',
    viewCount: 309388,
        duration: '13:16',
        url: "https://www.bilibili.com/video/BV1h64y1D78J/",
        platform: "Bilibili"
      },
      {
        id: "creator_leontv_cn_video_03",
        title: "【网球 教学】平击上旋 vs 重上旋｜正拍 打出压制力的关键！｜LeonTV",
        target: "上旋弧线总拉不出",
        levels: ["3.0", "3.5", "4.0"],
        thumbnail: '/thumbnails/bilibili/7e035fbef7f29ef5cff1dac5f7a84bcd72e8b445.jpg',
    viewCount: 38860,
        duration: '8:06',
        url: "https://www.bilibili.com/video/BV1QRLizLEnv/",
        platform: "Bilibili"
      },
      {
        id: "creator_leontv_cn_video_04",
        title: "【网球教学】接发球完整教学｜任何层级都适用的必学技巧｜LeonTV",
        target: "接发总被对手压住",
        levels: ["2.5", "3.0", "3.5", "4.0"],
        thumbnail: '/thumbnails/bilibili/1a11be43cdbb07be461fcbd702d3124d8e6d318c.jpg',
    viewCount: 9247,
        duration: '15:38',
        url: "https://www.bilibili.com/video/BV1D7YfzDEfo/",
        platform: "Bilibili"
      },
      {
        id: "creator_leontv_cn_video_05",
        title: "90%业余球员都曾犯的三大脚步错误！实战修正｜网球脚步｜LeonTV",
        target: "脚步错误反复出现",
        levels: ["2.5", "3.0", "3.5", "4.0"],
        thumbnail: '/thumbnails/bilibili/1508293f4adf9fc8b3be7f0f2620e501e09b0cb5.jpg',
    viewCount: 19149,
        duration: '7:24',
        url: "https://www.bilibili.com/video/BV1mF5KzmEgP/",
        platform: "Bilibili"
      }
    ],
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
    shortDescription: "3.0-3.5 综合提升",
    tags: ["基础导向", "正手专项", "新手友好"],
    region: "domestic",
    platforms: ["Bilibili"],
    levels: ["2.5", "3.0", "3.5", "4.0"],
    specialties: ["basics", "movement", "matchplay"],
    styleTags: ["讲解清晰", "新手友好", "实战导向"],
    bio: "偏业余球友视角的动作拆解和打球思路整理，适合想把基础框架和实战理解一起理顺的球员。",
    suitableFor: ["2.5-4.0", "基础框架", "实战理解"],
    featuredContentIds: [],
    featuredVideos: [
      {
        id: "creator_james_video_01",
        title: "【留学网球日常】浅浅的谈一下第七代vcore的使用感受吧",
        target: "想挑一把更顺手的拍",
        levels: ["2.5", "3.0", "3.5", "4.0"],
        thumbnail: '/thumbnails/bilibili/7ad92d40468500df06a1604a134c4e82ce2a2258.jpg',
    viewCount: 25718,
        duration: '14:49',
        url: "https://www.bilibili.com/video/BV1FG4y1X7DA/",
        platform: "Bilibili"
      },
      {
        id: "creator_james_video_02",
        title: "【网球拍测评】Wilson shift是工业垃圾还是上旋福音？",
        target: "想知道上旋拍值不值",
        levels: ["2.5", "3.0", "3.5", "4.0"],
        thumbnail: '/thumbnails/bilibili/c67df583432d5a1dc79270adc969b04497018d06.jpg',
    viewCount: 21904,
        duration: '18:17',
        url: "https://www.bilibili.com/video/BV1hV4y197oy/",
        platform: "Bilibili"
      },
      {
        id: "creator_james_video_03",
        title: "【网球vlog日常】对话职业穿线师第一期！｜磅数，线径，材料？！！一个视频带你看清楚",
        target: "穿线参数总是搞不清",
        levels: ["2.5", "3.0", "3.5", "4.0"],
        thumbnail: '/thumbnails/bilibili/6ec591018de6011a25392e54c6942de9022a568a.jpg',
    viewCount: 16008,
        duration: '17:24',
        url: "https://www.bilibili.com/video/BV1bd1sYrEtc/",
        platform: "Bilibili"
      },
      {
        id: "creator_james_video_04",
        title: "【网球教学日常】跟着前ATP双打180的球员来学习截击！｜让你在网前变得更加充满侵略性！！！",
        target: "网前截击总打不死",
        levels: ["3.0", "3.5", "4.0"],
        thumbnail: '/thumbnails/bilibili/a28acffb34993a9c85b236b7093f06f1b97ebc71.jpg',
    viewCount: 7191,
        duration: '6:18',
        url: "https://www.bilibili.com/video/BV14J4m1x75K/",
        platform: "Bilibili"
      },
      {
        id: "creator_james_video_05",
        title: "【网球教学日常】ATP职业大佬提高你的正手稳定性｜让你的正手成为你的得分利器！！！",
        target: "正手稳定性总上不去",
        levels: ["3.0", "3.5", "4.0"],
        thumbnail: '/thumbnails/bilibili/fd9313de08983234979cb0c99ec8125ac8c54930.jpg',
    viewCount: 3643,
        duration: '17:43',
        url: "https://www.bilibili.com/video/BV18t421p7Nr/",
        platform: "Bilibili"
      }
    ],
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
    shortDescription: "适合新手练脚步和稳定",
    tags: ["新手友好", "脚步移动", "基础导向"],
    region: "domestic",
    platforms: ["Bilibili"],
    levels: ["2.5", "3.0", "3.5"],
    specialties: ["basics", "footwork", "consistency", "training"],
    styleTags: ["新手友好", "适合自学", "训练导向"],
    bio: "偏基础训练组织和步伐稳定性，适合想把练习内容安排得更扎实的新手球友。",
    suitableFor: ["自练安排", "脚步基础", "稳定性"],
    featuredContentIds: [],
    featuredVideos: [
      {
        id: "creator_liuliu_video_01",
        title: "网球切削慢动作教学丨细节拆解",
        target: "切削动作总做不顺",
        levels: ["2.5", "3.0", "3.5"],
        thumbnail: '/thumbnails/bilibili/d897eed483ddc1e13475a1077a45223916e04094.jpg',
    viewCount: 7900,
        duration: '0:27',
        url: "https://www.bilibili.com/video/BV1fxy3BgECv/",
        platform: "Bilibili"
      },
      {
        id: "creator_liuliu_video_02",
        title: "一个视频学会8种网球切削技术",
        target: "切削变化总是不会用",
        levels: ["2.5", "3.0", "3.5"],
        thumbnail: '/thumbnails/bilibili/91bf4726be460a0ff2b38fae6565f1dc7cd84fc0.jpg',
    viewCount: 9511,
        duration: '0:56',
        url: "https://www.bilibili.com/video/BV1wABXB1EtU/",
        platform: "Bilibili"
      },
      {
        id: "creator_liuliu_video_03",
        title: "网球底层逻辑：稳定大于一切！",
        target: "练习总在瞎发力",
        levels: ["2.5", "3.0", "3.5"],
        thumbnail: '/thumbnails/bilibili/54a3e9225691616a4a477ee0530c1db587cbb346.jpg',
    viewCount: 10543,
        duration: '5:29',
        url: "https://www.bilibili.com/video/BV1jQZQBQECX/",
        platform: "Bilibili"
      },
      {
        id: "creator_liuliu_video_04",
        title: "打网球必学的10个热身动作",
        target: "上场前总不会热身",
        levels: ["2.5", "3.0", "3.5"],
        thumbnail: '/thumbnails/bilibili/a137c39924d5a5ff433ad0047cede39d37503ca4.jpg',
    viewCount: 2636,
        duration: '1:32',
        url: "https://www.bilibili.com/video/BV1PAq5BuE85/",
        platform: "Bilibili"
      },
      {
        id: "creator_liuliu_video_05",
        title: "打网球必做的手眼协调性训练！",
        target: "训练结构总是乱练",
        levels: ["2.5", "3.0", "3.5"],
        thumbnail: '/thumbnails/bilibili/bafac66bd018ebbe22d0aeb6923e26a8ff953b2e.jpg',
    viewCount: 1568,
        duration: '0:33',
        url: "https://www.bilibili.com/video/BV13ywFzgE7D/",
        platform: "Bilibili"
      }
    ],
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
    shortDescription: "真实练球过程更有代入感",
    tags: ["新手友好", "实战导向", "脚步移动"],
    region: "domestic",
    platforms: ["Bilibili"],
    levels: ["2.5", "3.0", "3.5"],
    specialties: ["matchplay", "basics", "training", "movement"],
    styleTags: ["业余球友视角", "实战导向", "新手友好"],
    bio: "偏业余球友视角的练球和实战记录，适合想从真实练习过程里获得启发的球员。",
    suitableFor: ["练球思路", "实战体感", "入门提升"],
    featuredContentIds: ["content_cn_a_03", "content_cn_c_03", "content_cn_f_02"],
    featuredVideos: [
      {
        id: "creator_pikachu_video_01",
        title: "打球脚步又慢又乱❓四个基础步伐要掌握",
        target: "脚步又慢又乱",
        levels: ["2.5", "3.0", "3.5"],
        thumbnail: '/thumbnails/bilibili/95a16864f40364f032e3ffa7989717aa9ab9cf21.jpg',
    viewCount: 20949,
        duration: '1:58',
        url: "https://www.bilibili.com/video/BV1SZ6qYFEVS/",
        platform: "Bilibili"
      },
      {
        id: "creator_pikachu_video_02",
        title: "5个练习🎾没有球搭子，一个人也能默默涨球!",
        target: "没人陪练就不会练",
        levels: ["2.5", "3.0", "3.5"],
        thumbnail: '/thumbnails/bilibili/49156c0240cb1bee00a0cda1498f18a984bf3527.jpg',
    viewCount: 53846,
        duration: '1:06',
        url: "https://www.bilibili.com/video/BV1LvS3YWEnL/",
        platform: "Bilibili"
      },
      {
        id: "creator_pikachu_video_03",
        title: "网球学练馆的11种练法🎾方法用得对，训练不枯燥",
        target: "训练总是越练越乱",
        levels: ["2.5", "3.0", "3.5"],
        thumbnail: '/thumbnails/bilibili/9b9d88aec4933ae8c7d31db2bec9ac08f114ba31.jpg',
    viewCount: 24778,
        duration: '1:03',
        url: "https://www.bilibili.com/video/BV16uHizBEp2/",
        platform: "Bilibili"
      },
      {
        id: "creator_pikachu_video_04",
        title: "🎾网球发球力量从哪来？身体像弹弓一样弹射❗",
        target: "发球想有力却只抡手",
        levels: ["2.5", "3.0", "3.5"],
        thumbnail: '/thumbnails/bilibili/d8f3fcf15bf12292a32cae5d5515157961691398.jpg',
    viewCount: 764254,
        duration: '0:35',
        url: "https://www.bilibili.com/video/BV1ox421f7VX/",
        platform: "Bilibili"
      },
      {
        id: "creator_pikachu_video_05",
        title: "网球新手必看❗五种网球握拍全解析",
        target: "总搞不清该怎么握拍",
        levels: ["2.5", "3.0", "3.5"],
        thumbnail: '/thumbnails/bilibili/158754b6b85286c29789c61f54394e8a29ffb7eb.jpg',
    viewCount: 52134,
        duration: '2:34',
        url: "https://www.bilibili.com/video/BV1Dm421s7Rg/",
        platform: "Bilibili"
      }
    ],
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
    shortDescription: "进阶动作细节和纠错",
    tags: ["细节导向", "进阶提升", "反手专项"],
    region: "domestic",
    platforms: ["Bilibili"],
    levels: ["3.0", "3.5", "4.0", "4.5"],
    specialties: ["forehand", "backhand", "serve", "basics"],
    styleTags: ["职业视角", "细节导向", "动作拆解"],
    bio: "偏职业选手/教练级动作拆解，适合想看更精细技术要点的进阶球员。",
    suitableFor: ["进阶技术细节", "正反手修正", "发球框架"],
    featuredContentIds: ["content_zlx_03", "content_common_03"],
    featuredVideos: [
      {
        id: "creator_matsuo_yuki_cn_video_01",
        title: "【觉醒】只用15分钟就掌握切削发球！松尾教练也惊呆了！【松尾友贵Proの网球教学】",
        target: "发球缺少旋转变化",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: '/thumbnails/bilibili/c22922ade6408547499c57f016cefd54166cfd2a.jpg',
    viewCount: 14678,
        duration: '12:42',
        url: "https://www.bilibili.com/video/BV1JT5wz4EJJ/",
        platform: "Bilibili"
      },
      {
        id: "creator_matsuo_yuki_cn_video_02",
        title: "让对手讨厌的有穿透力的切削球！简单易懂的3个要点！【松尾友贵Proの网球教学】",
        target: "切削总飘不往前走",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: '/thumbnails/bilibili/5367bb69a6ce6b1c50e53b0a643bf64fccd5bc68.jpg',
    viewCount: 7797,
        duration: '7:10',
        url: "https://www.bilibili.com/video/BV1aTaxzxENT/",
        platform: "Bilibili"
      },
      {
        id: "creator_matsuo_yuki_cn_video_03",
        title: "战术大师！伊藤葵选手的挑高球和角度球击球方式学习！",
        target: "高球和角度球不会用",
        levels: ["3.5", "4.0", "4.5"],
        thumbnail: '/thumbnails/bilibili/86554dbec03f66a72ddee9b2382552ab5feab606.jpg',
    viewCount: 5658,
        duration: '14:38',
        url: "https://www.bilibili.com/video/BV1uJaTzvEVq/",
        platform: "Bilibili"
      },
      {
        id: "creator_matsuo_yuki_cn_video_04",
        title: "【初学必见】只用20分钟就可以掌握挡击接发回球！【松尾友贵Proの网球教学】",
        target: "接发总被发球压住",
        levels: ["3.0", "3.5", "4.0"],
        thumbnail: '/thumbnails/bilibili/688c521b3a7e6cdb5d7e4c02d9ab45db0d8be0d3.jpg',
    viewCount: 4406,
        duration: '9:33',
        url: "https://www.bilibili.com/video/BV18xXgYnEMA/",
        platform: "Bilibili"
      },
      {
        id: "creator_matsuo_yuki_cn_video_05",
        title: "【害怕比赛】练习很好比赛无法正常发挥！一定要看！【松尾友贵Proの网球教学】",
        target: "比赛一打就发挥失常",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: '/thumbnails/bilibili/8e3bce7037f4dccb467993ca3db9fab2eef66cd7.jpg',
    viewCount: 3898,
        duration: '8:58',
        url: "https://www.bilibili.com/video/BV1tcNjzsEZi/",
        platform: "Bilibili"
      }
    ],
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
    shortDescription: "训练结构和发球基础",
    tags: ["节奏训练", "发球专项", "脚步移动"],
    region: "domestic",
    platforms: ["Bilibili"],
    levels: ["2.5", "3.0", "3.5", "4.0"],
    specialties: ["serve", "basics", "movement", "training"],
    styleTags: ["训练导向", "系统化", "讲解清晰"],
    bio: "偏训练营式内容和专项练习思路，适合想把发球、移动和训练结构串起来的球员。",
    suitableFor: ["训练计划", "发球基础", "脚步训练"],
    featuredContentIds: ["content_zlx_02"],
    featuredVideos: [
      {
        id: "creator_austin_camp_video_01",
        title: "上旋发球零基础教学",
        target: "上旋发球总发不起来",
        levels: ["2.5", "3.0", "3.5", "4.0"],
        thumbnail: '/thumbnails/bilibili/02ec1b009f740466e241119ce1b0b61bb00eace3.jpg',
    viewCount: 38913,
        duration: '2:13',
        url: "https://www.bilibili.com/video/BV1KG4y1x77a/",
        platform: "Bilibili"
      },
      {
        id: "creator_austin_camp_video_02",
        title: "不会单反的看完就会了，单反不好的看完狂涨1个水平",
        target: "单反动作总不扎实",
        levels: ["3.0", "3.5", "4.0"],
        thumbnail: '/thumbnails/bilibili/6a1fcdbf33864d830133ffb87f4e73f7cba50f0a.jpg',
    viewCount: 27701,
        duration: '3:09',
        url: "https://www.bilibili.com/video/BV1UW4y1q7jB/",
        platform: "Bilibili"
      },
      {
        id: "creator_austin_camp_video_03",
        title: "网球平击发球零基础教学",
        target: "平击发球总没速度",
        levels: ["2.5", "3.0", "3.5", "4.0"],
        thumbnail: '/thumbnails/bilibili/f62ce04f74b98f58dc4b58db1d3d2bc2a991a12a.jpg',
    viewCount: 19543,
        duration: '5:14',
        url: "https://www.bilibili.com/video/BV1dF4m1V7BS/",
        platform: "Bilibili"
      },
      {
        id: "creator_austin_camp_video_04",
        title: "网球无脑战术？练好这个就已经吃遍天了",
        target: "比赛战术总想不清",
        levels: ["3.0", "3.5", "4.0"],
        thumbnail: '/thumbnails/bilibili/af95906662a153d3211a190b7659488aa09326ba.jpg',
    viewCount: 24429,
        duration: '1:19',
        url: "https://www.bilibili.com/video/BV13u4y1e7Lx/",
        platform: "Bilibili"
      },
      {
        id: "creator_austin_camp_video_05",
        title: "球感练好，训练比事半功倍",
        target: "训练结构总是乱练",
        levels: ["2.5", "3.0", "3.5", "4.0"],
        thumbnail: '/thumbnails/bilibili/c9ea7db9c326e2fbd84fe629af0d0fbee834a394.jpg',
    viewCount: 14197,
        duration: '1:38',
        url: "https://www.bilibili.com/video/BV1MW4y1e7KG/",
        platform: "Bilibili"
      }
    ],
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
    id: "creator_yexiu_gege",
    name: "叶修鸽哥",
    shortDescription: "适合自练和训练框架搭建",
    tags: ["基础导向", "脚步移动", "讲解清晰"],
    region: "domestic",
    platforms: ["Bilibili"],
    levels: ["2.5", "3.0", "3.5", "4.0"],
    specialties: ["basics", "footwork", "training", "net", "serve"],
    styleTags: ["讲解清晰", "训练导向", "系统化"],
    bio: "偏从零自习课和训练组织，适合想把脚步、网前和日常练习框架搭起来的球员。",
    suitableFor: ["自练框架", "脚步与站定", "训练计划"],
    featuredContentIds: [],
    featuredVideos: [
      {
        id: "creator_yexiu_gege_video_01",
        title: "从零开始的网球自习系列课-训练计划制定篇",
        target: "练球总没计划和结构",
        levels: ["2.5", "3.0", "3.5", "4.0"],
        thumbnail: '/thumbnails/bilibili/1e157438275a1ef778836f6d00f51046f6f8717c.jpg',
    viewCount: 12817,
        duration: '19:21',
        url: "https://www.bilibili.com/video/BV1HEyaBiEaW/",
        platform: "Bilibili"
      },
      {
        id: "creator_yexiu_gege_video_02",
        title: "从零开始的网球自习系列课-双打截击篇",
        target: "网前截击总没章法",
        levels: ["3.0", "3.5", "4.0"],
        thumbnail: '/thumbnails/bilibili/62dd22f83ac821c12150956dd37acf0ab0899fa8.jpg',
    viewCount: 11665,
        duration: '9:27',
        url: "https://www.bilibili.com/video/BV1EbkyB8EQx/",
        platform: "Bilibili"
      },
      {
        id: "creator_yexiu_gege_video_03",
        title: "如何减速站定击球",
        target: "跑到位后总站不住",
        levels: ["2.5", "3.0", "3.5"],
        thumbnail: '/thumbnails/bilibili/0f25066c8bbd193224acd331e5077e5423f4ee2c.jpg',
    viewCount: 15822,
        duration: '9:11',
        url: "https://www.bilibili.com/video/BV1vLcBzSE1P/",
        platform: "Bilibili"
      },
      {
        id: "creator_yexiu_gege_video_04",
        title: "从零开始的网球自习系列课-脚下篇",
        target: "脚步路线总是乱",
        levels: ["2.5", "3.0", "3.5", "4.0"],
        thumbnail: '/thumbnails/bilibili/f8037ecf37217b779e729324c44125b210c33ecd.png',
    viewCount: 38862,
        duration: '38:49',
        url: "https://www.bilibili.com/video/BV1tf421S7rt/",
        platform: "Bilibili"
      },
      {
        id: "creator_yexiu_gege_video_05",
        title: "从零开始的网球自习系列课-发球下肢篇",
        target: "发球下肢发力总脱节",
        levels: ["3.0", "3.5", "4.0"],
        thumbnail: '/thumbnails/bilibili/333e09d33fd5a97df40ea6525232840c12f4d9ee.jpg',
    viewCount: 25774,
        duration: '7:44',
        url: "https://www.bilibili.com/video/BV1h24qenEqf/",
        platform: "Bilibili"
      }
    ],
    recommendedCount: 0,
    profileUrl: "https://space.bilibili.com/20019050/upload/video",
    platformLinks: {
      Bilibili: "https://space.bilibili.com/20019050/upload/video"
    },
    avatar: bilibiliAvatar("creator_yexiu_gege"),
    rankingSignals: {
      subscriberScore: 0.48,
      averageViewsScore: 0.59,
      activityScore: 0.72,
      catalogScore: 0.7,
      authorityScore: 0.64,
      curatorBoost: 0.64
    }
  },
  {
    id: "creator_sara_airehan",
    name: "Sara爱热汗",
    shortDescription: "前职业球员视角，发球和脚步讲得清楚",
    tags: ["讲解清晰", "发球专项", "脚步移动"],
    region: "domestic",
    platforms: ["Bilibili"],
    levels: ["2.5", "3.0", "3.5", "4.0"],
    specialties: ["serve", "movement", "footwork", "training", "basics"],
    styleTags: ["前职业球员", "讲解清晰", "训练导向"],
    bio: "偏前职业球员视角的发球、热身和脚步训练，适合想把动作顺序和训练感觉建立起来的球员。",
    suitableFor: ["发球入门", "脚步训练", "热身跟练"],
    featuredContentIds: [],
    featuredVideos: [
      {
        id: "creator_sara_airehan_video_01",
        title: "【网球】职业选手3分钟教会你发球｜超详细讲解",
        target: "发球入门总抓不到顺序",
        levels: ["2.5", "3.0", "3.5"],
        thumbnail: "/thumbnails/bilibili/ebfcb72c9928de678886101ea90d50fec71f848c.jpg",
    viewCount: 110801,
        duration: "2:37",
        url: "https://www.bilibili.com/video/BV1jP4y187gD/",
        platform: "Bilibili"
      },
      {
        id: "creator_sara_airehan_video_02",
        title: "网球发球提升｜想要发好球，必须要学会抛球",
        target: "发球抛球总不稳定",
        levels: ["2.5", "3.0", "3.5", "4.0"],
        thumbnail: "/thumbnails/bilibili/2c042fee15c8db0fd921869c156e214ddc9df6a6.jpg",
    viewCount: 56871,
        duration: "3:32",
        url: "https://www.bilibili.com/video/BV1Mf4y1v7Ub/",
        platform: "Bilibili"
      },
      {
        id: "creator_sara_airehan_video_03",
        title: "职业选手的发球训练｜5步教会你手臂内旋Pronation",
        target: "发球内旋总找不到感觉",
        levels: ["3.0", "3.5", "4.0"],
        thumbnail: "/thumbnails/bilibili/000339229681b17217d4a591ec2357141e07d819.jpg",
    viewCount: 60035,
        duration: "3:00",
        url: "https://www.bilibili.com/video/BV1bK4y1L7YE/",
        platform: "Bilibili"
      },
      {
        id: "creator_sara_airehan_video_04",
        title: "吐血整理！10个网球折返跑训练｜加强脚下",
        target: "脚下启动总拖沓",
        levels: ["2.5", "3.0", "3.5"],
        thumbnail: "/thumbnails/bilibili/238e2d9bd910222c8e8e4980f667d3ea14c72b6b.jpg",
    viewCount: 6025,
        duration: "1:27",
        url: "https://www.bilibili.com/video/BV13v421y7mq/",
        platform: "Bilibili"
      },
      {
        id: "creator_sara_airehan_video_05",
        title: "4分钟网球交叉步跟练｜提升步伐",
        target: "交叉步总跟不上球路",
        levels: ["2.5", "3.0", "3.5"],
        thumbnail: "/thumbnails/bilibili/82ff37c0ed048e2da20ced5679c33e50cb8a78b7.jpg",
    viewCount: 14327,
        duration: "3:55",
        url: "https://www.bilibili.com/video/BV1WG411i7pP/",
        platform: "Bilibili"
      }
    ],
    recommendedCount: 0,
    profileUrl: "https://space.bilibili.com/358241838?spm_id_from=333.788.upinfo.detail.click",
    platformLinks: {
      Bilibili: "https://space.bilibili.com/358241838?spm_id_from=333.788.upinfo.detail.click"
    },
    avatar: bilibiliAvatar("creator_sara_airehan"),
    rankingSignals: {
      subscriberScore: 0.56,
      averageViewsScore: 0.58,
      activityScore: 0.63,
      catalogScore: 0.54,
      authorityScore: 0.72,
      curatorBoost: 0.66
    }
  },
  {
    id: "creator_braden_tennis_academy",
    name: "布雷登网球学院",
    shortDescription: "握拍、站位和发力讲得细",
    tags: ["基础导向", "细节导向", "讲解清晰"],
    region: "domestic",
    platforms: ["Bilibili"],
    levels: ["2.5", "3.0", "3.5", "4.0"],
    specialties: ["grip", "forehand", "backhand", "topspin", "basics"],
    styleTags: ["基础导向", "动作拆解", "细节导向"],
    bio: "偏握拍、站位、发力和击球原理拆解，适合想把基础动作细节重新理顺的球员。",
    suitableFor: ["握拍重建", "基础站位", "发力理解"],
    featuredContentIds: [],
    featuredVideos: [
      {
        id: "creator_braden_tennis_academy_video_01",
        title: "网球正手击球非持拍手的另一个关键性作用",
        target: "正手非持拍手总乱摆",
        levels: ["2.5", "3.0", "3.5", "4.0"],
        thumbnail: "/thumbnails/bilibili/2afec3a3d44eb6e5bc2bb32298bba20e1c5c9aaf.jpg",
    viewCount: 7519,
        duration: "3:16",
        url: "https://www.bilibili.com/video/BV1Ue4y1c7A1/",
        platform: "Bilibili"
      },
      {
        id: "creator_braden_tennis_academy_video_02",
        title: "全网最系统最全面的握拍、站位与发力方式教程6",
        target: "握拍站位总不顺",
        levels: ["2.5", "3.0", "3.5", "4.0"],
        thumbnail: "/thumbnails/bilibili/bc5e2235a1bdd65ab35b246c6eb5aa17312475aa.jpg",
    viewCount: 5532,
        duration: "3:26",
        url: "https://www.bilibili.com/video/BV1vV4y1o7fw/",
        platform: "Bilibili"
      },
      {
        id: "creator_braden_tennis_academy_video_03",
        title: "全网最系统最全面的握拍、站位与发力方式教程（五）双反握拍",
        target: "双反握拍总别扭",
        levels: ["2.5", "3.0", "3.5", "4.0"],
        thumbnail: "/thumbnails/bilibili/1ad5ce6f215e48590a50cff9480af870d4a236d9.jpg",
    viewCount: 7443,
        duration: "4:32",
        url: "https://www.bilibili.com/video/BV1ML411Y7ar/",
        platform: "Bilibili"
      },
      {
        id: "creator_braden_tennis_academy_video_04",
        title: "全网最系统最全面的握拍、站位与发力方式教程（四）正手握拍4",
        target: "正手握拍总不稳定",
        levels: ["2.5", "3.0", "3.5", "4.0"],
        thumbnail: "/thumbnails/bilibili/a251c020b28646ab6001f7f1c7224f1e92649851.jpg",
    viewCount: 6948,
        duration: "4:01",
        url: "https://www.bilibili.com/video/BV1Fa4y1P7GG/",
        platform: "Bilibili"
      },
      {
        id: "creator_braden_tennis_academy_video_05",
        title: "打上旋球真的是击球的下部吗？",
        target: "上旋总转不起来",
        levels: ["3.0", "3.5", "4.0"],
        thumbnail: "/thumbnails/bilibili/dbe3fd60814ebac76d39c27f850a2e29a386b61a.jpg",
    viewCount: 11675,
        duration: "3:32",
        url: "https://www.bilibili.com/video/BV12s4y1Z7RZ/",
        platform: "Bilibili"
      }
    ],
    recommendedCount: 0,
    profileUrl: "https://space.bilibili.com/506356125/upload/video",
    platformLinks: {
      Bilibili: "https://space.bilibili.com/506356125/upload/video"
    },
    avatar: bilibiliAvatar("creator_braden_tennis_academy"),
    rankingSignals: {
      subscriberScore: 0.47,
      averageViewsScore: 0.57,
      activityScore: 0.52,
      catalogScore: 0.62,
      authorityScore: 0.61,
      curatorBoost: 0.62
    }
  },
  {
    id: "creator_search_curated",
    name: "教练整理搜索入口",
    shortDescription: "暂未绑定单一博主",
    tags: ["基础导向", "实战导向", "讲解清晰"],
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
    shortDescription: "世界级教练的系统拆解",
    tags: ["进阶提升", "发球专项", "实战导向"],
    region: "overseas",
    platforms: ["YouTube"],
    levels: ["3.0", "3.5", "4.0", "4.5"],
    specialties: ["serve", "forehand", "matchplay", "basics"],
    styleTags: ["职业视角", "系统化", "动作拆解"],
    bio: "偏世界级教练视角和职业训练逻辑，适合想理解高水平技术框架与比赛思维的球员。",
    suitableFor: ["职业训练视角", "进阶技术", "比赛执行"],
    featuredContentIds: [],
    featuredVideos: [
      {
        id: "creator_mouratoglou_official_video_01",
        title: "How to fix your serve and finally get full power",
        target: "发球总打不出全力",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: 'https://img.youtube.com/vi/6HuaZ1kTTkM/mqdefault.jpg',
    viewCount: 391731,
        duration: '10:46',
        url: "https://www.youtube.com/watch?v=6HuaZ1kTTkM",
        platform: "YouTube"
      },
      {
        id: "creator_mouratoglou_official_video_02",
        title: "The return of serve: TENNIS MASTERCLASS by Patrick Mouratoglou, EPISODE 1",
        target: "接发启动总是偏慢",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: 'https://img.youtube.com/vi/vPtNtNi8_NI/mqdefault.jpg',
    viewCount: 1814794,
        duration: '20:52',
        url: "https://www.youtube.com/watch?v=vPtNtNi8_NI",
        platform: "YouTube"
      },
      {
        id: "creator_mouratoglou_official_video_03",
        title: "Serve and volley: TENNIS MASTERCLASS by Patrick Mouratoglou, EPISODE 8",
        target: "上网衔接总断节奏",
        levels: ["3.5", "4.0", "4.5"],
        thumbnail: 'https://img.youtube.com/vi/pUb1fZ-f994/mqdefault.jpg',
    viewCount: 219645,
        duration: '12:48',
        url: "https://www.youtube.com/watch?v=pUb1fZ-f994",
        platform: "YouTube"
      },
      {
        id: "creator_mouratoglou_official_video_04",
        title: "15-minute slice serve lesson",
        target: "切削发球总找不到感觉",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: 'https://img.youtube.com/vi/I3tyFvI17OE/mqdefault.jpg',
    viewCount: 124928,
        duration: '12:13',
        url: "https://www.youtube.com/watch?v=I3tyFvI17OE",
        platform: "YouTube"
      },
      {
        id: "creator_mouratoglou_official_video_05",
        title: "Get Rid of Double Faults: Serve Lesson with Patrick Mouratoglou",
        target: "二发双误总是偏多",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: 'https://img.youtube.com/vi/6ko_0cjfP-0/mqdefault.jpg',
    viewCount: 914143,
        duration: '11:27',
        url: "https://www.youtube.com/watch?v=6ko_0cjfP-0",
        platform: "YouTube"
      }
    ],
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
    shortDescription: "职业球员分享比赛经验",
    tags: ["实战导向", "进阶提升", "发球专项"],
    region: "overseas",
    platforms: ["YouTube"],
    levels: ["3.5", "4.0", "4.5"],
    specialties: ["serve", "matchplay", "mental"],
    styleTags: ["职业球员", "比赛导向", "经验导向"],
    bio: "偏职业球员视角和比赛经验分享，适合想从顶级选手经验中理解训练与比赛心态的球员。",
    suitableFor: ["比赛经验", "职业视角", "发球与执行"],
    featuredContentIds: [],
    featuredVideos: [
      {
        id: "creator_venus_williams_video_01",
        title: "How To Hit A Basic Tennis Serve with Venus Williams",
        target: "一发动作为何总不稳",
        levels: ["3.5", "4.0", "4.5"],
        thumbnail: 'https://img.youtube.com/vi/bRCQwLgEs9M/mqdefault.jpg',
    viewCount: 3079945,
        duration: '13:08',
        url: "https://www.youtube.com/watch?v=bRCQwLgEs9M",
        platform: "YouTube"
      },
      {
        id: "creator_venus_williams_video_02",
        title: "How to Hit a 2nd Serve in Tennis With Venus Williams",
        target: "二发总是不敢加转",
        levels: ["3.5", "4.0", "4.5"],
        thumbnail: 'https://img.youtube.com/vi/3mhGN6KtjZg/mqdefault.jpg',
    viewCount: 107532,
        duration: '5:47',
        url: "https://www.youtube.com/watch?v=3mhGN6KtjZg",
        platform: "YouTube"
      },
      {
        id: "creator_venus_williams_video_03",
        title: "How To Hit Forehand with Venus Williams",
        target: "正手击球总不够扎实",
        levels: ["3.5", "4.0", "4.5"],
        thumbnail: 'https://img.youtube.com/vi/mXy0jJl8Pnc/mqdefault.jpg',
    viewCount: 782912,
        duration: '11:18',
        url: "https://www.youtube.com/watch?v=mXy0jJl8Pnc",
        platform: "YouTube"
      },
      {
        id: "creator_venus_williams_video_04",
        title: "How To Hit A Tennis Backhand With Venus Williams",
        target: "反手动作总不够顺",
        levels: ["3.5", "4.0", "4.5"],
        thumbnail: 'https://img.youtube.com/vi/5M52JoEDtwY/mqdefault.jpg',
    viewCount: 332086,
        duration: '9:25',
        url: "https://www.youtube.com/watch?v=5M52JoEDtwY",
        platform: "YouTube"
      },
      {
        id: "creator_venus_williams_video_05",
        title: "How To Improve Your Footwork With Venus Williams",
        target: "脚步总跟不上节奏",
        levels: ["3.5", "4.0", "4.5"],
        thumbnail: 'https://img.youtube.com/vi/PX6n7jvbCj0/mqdefault.jpg',
    viewCount: 97753,
        duration: '9:10',
        url: "https://www.youtube.com/watch?v=PX6n7jvbCj0",
        platform: "YouTube"
      }
    ],
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
    shortDescription: "发球脚步和实战训练",
    tags: ["节奏训练", "发球专项", "实战导向"],
    region: "overseas",
    platforms: ["YouTube"],
    levels: ["3.0", "3.5", "4.0"],
    specialties: ["serve", "movement", "matchplay"],
    styleTags: ["讲解清晰", "实战导向"],
    bio: "偏职业球员与教练视角，适合想加强发球、步伐和实战训练思路的业余球员。",
    suitableFor: ["发球节奏", "脚步移动", "实战训练"],
    featuredContentIds: [],
    featuredVideos: [
      {
        id: "creator_tennis_with_dylan_video_01",
        title: "How to Serve more ACCURATELY in Tennis",
        target: "发球落点总控制不住",
        levels: ["3.0", "3.5", "4.0"],
        thumbnail: 'https://img.youtube.com/vi/IzsqHxQ0AWM/mqdefault.jpg',
    viewCount: 85451,
        duration: '6:28',
        url: "https://www.youtube.com/watch?v=IzsqHxQ0AWM",
        platform: "YouTube"
      },
      {
        id: "creator_tennis_with_dylan_video_02",
        title: "How To Hit A Powerful Kick Serve! A Full 8 Step Guide",
        target: "kick serve一直发不起来",
        levels: ["3.5", "4.0", "4.5"],
        thumbnail: 'https://img.youtube.com/vi/KSq5w6CT9tg/mqdefault.jpg',
    viewCount: 56224,
        duration: '23:51',
        url: "https://www.youtube.com/watch?v=KSq5w6CT9tg",
        platform: "YouTube"
      },
      {
        id: "creator_tennis_with_dylan_video_03",
        title: "Master Your Tennis Serve: Top 5 Fluency Exercises",
        target: "发球动作总不够流畅",
        levels: ["3.0", "3.5", "4.0"],
        thumbnail: 'https://img.youtube.com/vi/tws4espU65c/mqdefault.jpg',
    viewCount: 5224,
        duration: '5:22',
        url: "https://www.youtube.com/watch?v=tws4espU65c",
        platform: "YouTube"
      },
      {
        id: "creator_tennis_with_dylan_video_04",
        title: "How to level up your footwork game!",
        target: "脚步总慢一步",
        levels: ["3.0", "3.5", "4.0"],
        thumbnail: 'https://img.youtube.com/vi/wE2NvPBezVo/mqdefault.jpg',
    viewCount: 3467,
        duration: '5:05',
        url: "https://www.youtube.com/watch?v=wE2NvPBezVo",
        platform: "YouTube"
      },
      {
        id: "creator_tennis_with_dylan_video_05",
        title: "How to Master your Drop Shot | Tennis lesson & Tips",
        target: "小球手感总拿不准",
        levels: ["3.0", "3.5", "4.0"],
        thumbnail: 'https://img.youtube.com/vi/qKWBcr1esUs/mqdefault.jpg',
    viewCount: 39697,
        duration: '6:43',
        url: "https://www.youtube.com/watch?v=qKWBcr1esUs",
        platform: "YouTube"
      }
    ],
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
    shortDescription: "系统化正反手教学",
    tags: ["基础导向", "正手专项", "讲解清晰"],
    region: "overseas",
    platforms: ["YouTube"],
    levels: ["3.0", "3.5", "4.0"],
    specialties: ["serve", "forehand", "backhand", "basics"],
    styleTags: ["讲解清晰", "系统化", "新手友好"],
    bio: "偏系统化基础教学，适合需要把发球和整体动作框架重新理顺的业余球员。",
    suitableFor: ["发球抛球不稳", "基础动作重建", "技术框架梳理"],
    featuredContentIds: ["content_ttt_01"],
    featuredVideos: [
      {
        id: "creator_top_tennis_training_video_01",
        title: "Simple Tennis Serve Technique Masterclass for Beginners",
        target: "发球抛球总是不稳",
        levels: ["3.0", "3.5", "4.0"],
        thumbnail: 'https://img.youtube.com/vi/IiRGdagtOKE/mqdefault.jpg',
    viewCount: 1662697,
        duration: '16:42',
        url: "https://www.youtube.com/watch?v=IiRGdagtOKE",
        platform: "YouTube"
      },
      {
        id: "creator_top_tennis_training_video_02",
        title: "Forehand Power Unlocked: Use This To Create Speed 🚀",
        target: "正手总打不出速度",
        levels: ["3.0", "3.5", "4.0"],
        thumbnail: 'https://img.youtube.com/vi/M5R8M6xsr74/mqdefault.jpg',
    viewCount: 10554,
        duration: '0:34',
        url: "https://www.youtube.com/watch?v=M5R8M6xsr74",
        platform: "YouTube"
      },
      {
        id: "creator_top_tennis_training_video_03",
        title: "Carlos Alcaraz Forehand Analysis",
        target: "想学现代正手发力",
        levels: ["3.5", "4.0", "4.5"],
        thumbnail: 'https://img.youtube.com/vi/6lZHjJiALrY/mqdefault.jpg',
    viewCount: 24506,
        duration: '0:34',
        url: "https://www.youtube.com/watch?v=6lZHjJiALrY",
        platform: "YouTube"
      },
      {
        id: "creator_top_tennis_training_video_04",
        title: "Forehand Transformation of US College Player 🧐",
        target: "正手动作想系统重建",
        levels: ["3.0", "3.5", "4.0"],
        thumbnail: 'https://img.youtube.com/vi/pdiVTlAw87M/mqdefault.jpg',
    viewCount: 43189,
        duration: '0:26',
        url: "https://www.youtube.com/watch?v=pdiVTlAw87M",
        platform: "YouTube"
      },
      {
        id: "creator_top_tennis_training_video_05",
        title: "Hammer Your Serve For More Power 🎾🔨",
        target: "发球总缺少爆发力",
        levels: ["3.0", "3.5", "4.0"],
        thumbnail: 'https://img.youtube.com/vi/ZFFKO5pRe4U/mqdefault.jpg',
    viewCount: 35081,
        duration: '0:24',
        url: "https://www.youtube.com/watch?v=ZFFKO5pRe4U",
        platform: "YouTube"
      }
    ],
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
    shortDescription: "底线深度和比赛策略",
    tags: ["进阶提升", "实战导向", "节奏训练"],
    region: "overseas",
    platforms: ["YouTube"],
    levels: ["3.0", "3.5", "4.0", "4.5"],
    specialties: ["consistency", "forehand", "backhand", "matchplay"],
    styleTags: ["讲解清晰", "实战导向", "系统化"],
    bio: "偏业余球员高频问题教学，适合补相持深度、稳定性和比赛执行的基础认知。",
    suitableFor: ["球总打浅", "底线深度控制", "稳定性提升"],
    featuredContentIds: ["content_et_01"],
    featuredVideos: [
      {
        id: "creator_essential_tennis_video_01",
        title: "How To Control Groundstroke Depth",
        target: "相持球总落在发球线",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: 'https://img.youtube.com/vi/rqvhgHDx-lE/mqdefault.jpg',
    viewCount: 173776,
        duration: '6:43',
        url: "https://www.youtube.com/watch?v=rqvhgHDx-lE",
        platform: "YouTube"
      },
      {
        id: "creator_essential_tennis_video_02",
        title: "How to make REAL serve improvement",
        target: "发球练了很久没进步",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: 'https://img.youtube.com/vi/9IcmG7vGE2A/mqdefault.jpg',
    viewCount: 2691,
        duration: '1:16',
        url: "https://www.youtube.com/watch?v=9IcmG7vGE2A",
        platform: "YouTube"
      },
      {
        id: "creator_essential_tennis_video_03",
        title: "You're standing in the WRONG place (doubles strategy)",
        target: "双打站位总是站错",
        levels: ["3.0", "3.5", "4.0"],
        thumbnail: 'https://img.youtube.com/vi/EDCjPd41ipo/mqdefault.jpg',
    viewCount: 20694,
        duration: '15:02',
        url: "https://www.youtube.com/watch?v=EDCjPd41ipo",
        platform: "YouTube"
      },
      {
        id: "creator_essential_tennis_video_04",
        title: "How to improve your FLAT and SLICE serves:",
        target: "平击和切削发球分不清",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: 'https://img.youtube.com/vi/a1ItdT8iPiE/mqdefault.jpg',
    viewCount: 2507,
        duration: '0:49',
        url: "https://www.youtube.com/watch?v=a1ItdT8iPiE",
        platform: "YouTube"
      },
      {
        id: "creator_essential_tennis_video_05",
        title: "Why you CAN'T shake your bad tennis habits",
        target: "坏习惯怎么都改不掉",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: 'https://img.youtube.com/vi/mk5FDsmiqWU/mqdefault.jpg',
    viewCount: 4047,
        duration: '2:25',
        url: "https://www.youtube.com/watch?v=mk5FDsmiqWU",
        platform: "YouTube"
      }
    ],
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
    shortDescription: "长线技术框架和重建",
    tags: ["基础导向", "发球专项", "讲解清晰"],
    region: "overseas",
    platforms: ["YouTube"],
    levels: ["3.0", "3.5", "4.0", "4.5"],
    specialties: ["serve", "forehand", "backhand", "basics"],
    styleTags: ["系统化", "动作拆解", "讲解清晰"],
    bio: "偏长线技术框架和专项细节讲解，适合想系统补基础动作的球员。",
    suitableFor: ["技术重建", "发球框架", "正反手动作"],
    featuredContentIds: [],
    featuredVideos: [
      {
        id: "creator_online_tennis_instruction_video_01",
        title: "How to Hit Powerful Forehands Like Andrey Rublev💪🏼",
        target: "正手力量总起不来",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: 'https://img.youtube.com/vi/A4RcqEYAX_4/mqdefault.jpg',
    viewCount: 1159,
        duration: '0:36',
        url: "https://www.youtube.com/watch?v=A4RcqEYAX_4",
        platform: "YouTube"
      },
      {
        id: "creator_online_tennis_instruction_video_02",
        title: "Let’s level up your serve 🚀",
        target: "发球想整体升级一档",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: 'https://img.youtube.com/vi/sqTAN15wKPA/mqdefault.jpg',
    viewCount: 798,
        duration: '0:37',
        url: "https://www.youtube.com/watch?v=sqTAN15wKPA",
        platform: "YouTube"
      },
      {
        id: "creator_online_tennis_instruction_video_03",
        title: "Stop over-rotating your forehand 🎾 💥",
        target: "正手总是过度转体",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: 'https://img.youtube.com/vi/JEwzpFtz3f4/mqdefault.jpg',
    viewCount: 978,
        duration: '1:43',
        url: "https://www.youtube.com/watch?v=JEwzpFtz3f4",
        platform: "YouTube"
      },
      {
        id: "creator_online_tennis_instruction_video_04",
        title: "Unlock the forehand secret of Roger Federer 🎾✨",
        target: "想学更流畅的正手",
        levels: ["3.5", "4.0", "4.5"],
        thumbnail: 'https://img.youtube.com/vi/u6h56Fatgoo/mqdefault.jpg',
    viewCount: 1491,
        duration: '0:52',
        url: "https://www.youtube.com/watch?v=u6h56Fatgoo",
        platform: "YouTube"
      },
      {
        id: "creator_online_tennis_instruction_video_05",
        title: "Avoid late contact when hitting! 🎾",
        target: "击球点总是偏晚",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: 'https://img.youtube.com/vi/_2gV8oLht7w/mqdefault.jpg',
    viewCount: 815,
        duration: '1:29',
        url: "https://www.youtube.com/watch?v=_2gV8oLht7w",
        platform: "YouTube"
      }
    ],
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
    shortDescription: "动作修正和移动基础",
    tags: ["细节导向", "脚步移动", "基础导向"],
    region: "overseas",
    platforms: ["YouTube"],
    levels: ["3.0", "3.5", "4.0", "4.5"],
    specialties: ["forehand", "backhand", "basics", "movement"],
    styleTags: ["动作拆解", "讲解清晰", "训练导向"],
    bio: "偏动作修正和训练细节，适合想把击球和移动基础做扎实的球员。",
    suitableFor: ["动作修正", "基础训练", "击球稳定性"],
    featuredContentIds: [],
    featuredVideos: [
      {
        id: "creator_performance_plus_tennis_video_01",
        title: "PRO Forehand In 5 Simple Steps | Tennis Forehand Technique Lesson",
        target: "正手基础总不成形",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: 'https://img.youtube.com/vi/CFhKuNW8n4M/mqdefault.jpg',
    viewCount: 25746,
        duration: '10:39',
        url: "https://www.youtube.com/watch?v=CFhKuNW8n4M",
        platform: "YouTube"
      },
      {
        id: "creator_performance_plus_tennis_video_02",
        title: "Hit More Balanced Forehands With These Footwork Patterns",
        target: "正手脚步总站不稳",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: 'https://img.youtube.com/vi/wJL_bF2vTR4/mqdefault.jpg',
    viewCount: 3830,
        duration: '7:05',
        url: "https://www.youtube.com/watch?v=wJL_bF2vTR4",
        platform: "YouTube"
      },
      {
        id: "creator_performance_plus_tennis_video_03",
        title: "Professional Volley Technique Explained | Volley Tennis Lesson",
        target: "网前截击总不稳定",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: 'https://img.youtube.com/vi/CZieswXdzX8/mqdefault.jpg',
    viewCount: 81796,
        duration: '7:44',
        url: "https://www.youtube.com/watch?v=CZieswXdzX8",
        platform: "YouTube"
      },
      {
        id: "creator_performance_plus_tennis_video_04",
        title: "How To IMPROVE Your Racket Drop Right Away! | Tennis Serve Lesson",
        target: "发球拍头下沉不够",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: 'https://img.youtube.com/vi/EodEeytcd44/mqdefault.jpg',
    viewCount: 13600,
        duration: '8:43',
        url: "https://www.youtube.com/watch?v=EodEeytcd44",
        platform: "YouTube"
      },
      {
        id: "creator_performance_plus_tennis_video_05",
        title: "5 Drills For EASY Serve Pronation! Tennis Serve Lesson",
        target: "发球内旋总做不出来",
        levels: ["3.5", "4.0", "4.5"],
        thumbnail: 'https://img.youtube.com/vi/CJlW6tOT4Ho/mqdefault.jpg',
    viewCount: 57618,
        duration: '12:30',
        url: "https://www.youtube.com/watch?v=CJlW6tOT4Ho",
        platform: "YouTube"
      }
    ],
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
    shortDescription: "现代击球和实战细节",
    tags: ["进阶提升", "正手专项", "实战导向"],
    region: "overseas",
    platforms: ["YouTube"],
    levels: ["3.5", "4.0", "4.5"],
    specialties: ["forehand", "backhand", "matchplay"],
    styleTags: ["讲解清晰", "细节导向"],
    bio: "偏现代击球和职业训练视角，适合想看高质量击球细节与实战决策的球员。",
    suitableFor: ["现代正反手", "击球细节", "实战决策"],
    featuredContentIds: [],
    featuredVideos: [
      {
        id: "creator_karue_sell_video_01",
        title: "How I Improved My Forehand and Won 17 MATCHES IN A ROW",
        target: "正手稳定性迟迟上不去",
        levels: ["3.5", "4.0", "4.5"],
        thumbnail: 'https://img.youtube.com/vi/a5cQqfBOvRM/mqdefault.jpg',
    viewCount: 420355,
        duration: '12:24',
        url: "https://www.youtube.com/watch?v=a5cQqfBOvRM",
        platform: "YouTube"
      },
      {
        id: "creator_karue_sell_video_02",
        title: "Hit Better Groundstrokes: Driving vs Lifting - Make The Right Choice ft ATP Top 300 and @WinstonDu",
        target: "拉球还是平击总拿不准",
        levels: ["3.5", "4.0", "4.5"],
        thumbnail: 'https://img.youtube.com/vi/4gzgsVEs0Nc/mqdefault.jpg',
    viewCount: 182763,
        duration: '16:18',
        url: "https://www.youtube.com/watch?v=4gzgsVEs0Nc",
        platform: "YouTube"
      },
      {
        id: "creator_karue_sell_video_03",
        title: "The ULTIMATE Double Handed Backhand Lesson | Ft. Winston DU",
        target: "双反细节总不够顺",
        levels: ["3.5", "4.0", "4.5"],
        thumbnail: 'https://img.youtube.com/vi/7ZR7n-PWCUQ/mqdefault.jpg',
    viewCount: 298426,
        duration: '22:56',
        url: "https://www.youtube.com/watch?v=7ZR7n-PWCUQ",
        platform: "YouTube"
      },
      {
        id: "creator_karue_sell_video_04",
        title: "I Am A Top 300 Player In The World - Here Are 10 Drills That Helped Me Improve My Footwork",
        target: "移动节奏总跟不上",
        levels: ["3.5", "4.0", "4.5"],
        thumbnail: 'https://img.youtube.com/vi/qwHc-YqK3qw/mqdefault.jpg',
    viewCount: 211029,
        duration: '24:37',
        url: "https://www.youtube.com/watch?v=qwHc-YqK3qw",
        platform: "YouTube"
      },
      {
        id: "creator_karue_sell_video_05",
        title: "Tennis Tactics SIMPLIFIED By Former Top 400 ATP - 3 Simple Rules You Need To Follow",
        target: "比赛选择总是太乱",
        levels: ["3.5", "4.0", "4.5"],
        thumbnail: 'https://img.youtube.com/vi/G9wZ942dwJE/mqdefault.jpg',
    viewCount: 139181,
        duration: '13:48',
        url: "https://www.youtube.com/watch?v=G9wZ942dwJE",
        platform: "YouTube"
      }
    ],
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
    shortDescription: "4.5 学员实拍纠正",
    tags: ["细节导向", "进阶提升", "反手专项"],
    region: "overseas",
    platforms: ["YouTube"],
    levels: ["3.5", "4.0", "4.5"],
    specialties: ["serve", "backhand", "slice", "matchplay"],
    styleTags: ["细节导向", "纠错导向", "讲解清晰"],
    bio: "偏动作修正和击球细节纠错，适合想看切削、发球和击球轨迹修正的球员。",
    suitableFor: ["切削总飘", "动作细节修正", "击球轨迹不稳定"],
    featuredContentIds: ["content_it_01"],
    featuredVideos: [
      {
        id: "creator_intuitive_tennis_video_01",
        title: "Backhand Slice Tennis Lesson with 4.5 NTRP Student",
        target: "反手切削总飘太高",
        levels: ["3.5", "4.0", "4.5"],
        thumbnail: 'https://img.youtube.com/vi/d-VvKDgoIew/mqdefault.jpg',
    viewCount: 458190,
        duration: '11:13',
        url: "https://www.youtube.com/watch?v=d-VvKDgoIew",
        platform: "YouTube"
      },
      {
        id: "creator_intuitive_tennis_video_02",
        title: "How To Hit A Kick Serve?",
        target: "kick serve总是做不出来",
        levels: ["3.5", "4.0", "4.5"],
        thumbnail: 'https://img.youtube.com/vi/j6c1WPIsk_8/mqdefault.jpg',
    viewCount: 345517,
        duration: '17:14',
        url: "https://www.youtube.com/watch?v=j6c1WPIsk_8",
        platform: "YouTube"
      },
      {
        id: "creator_intuitive_tennis_video_03",
        title: "Hit Up on Kick with Bent Arm? | 4.5 NTRP Player Serve Lesson",
        target: "kick serve发力路径不清",
        levels: ["3.5", "4.0", "4.5"],
        thumbnail: 'https://img.youtube.com/vi/NPdd7vEVgjw/mqdefault.jpg',
    viewCount: 34204,
        duration: '15:44',
        url: "https://www.youtube.com/watch?v=NPdd7vEVgjw",
        platform: "YouTube"
      },
      {
        id: "creator_intuitive_tennis_video_04",
        title: "Kick Serve vs Slice Serve | How to Avoid Slice When Trying to Kick",
        target: "kick和slice总是混掉",
        levels: ["3.5", "4.0", "4.5"],
        thumbnail: 'https://img.youtube.com/vi/PXt7NbymwRw/mqdefault.jpg',
    viewCount: 537907,
        duration: '7:49',
        url: "https://www.youtube.com/watch?v=PXt7NbymwRw",
        platform: "YouTube"
      },
      {
        id: "creator_intuitive_tennis_video_05",
        title: "The Biggest Kick Serve Myths | Why They Will Halt Improvement",
        target: "学kick serve总走弯路",
        levels: ["3.5", "4.0", "4.5"],
        thumbnail: 'https://img.youtube.com/vi/UKco_SyQgeU/mqdefault.jpg',
    viewCount: 83239,
        duration: '9:41',
        url: "https://www.youtube.com/watch?v=UKco_SyQgeU",
        platform: "YouTube"
      }
    ],
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
    shortDescription: "适合重建基础动作框架",
    tags: ["新手友好", "基础导向", "讲解清晰"],
    region: "overseas",
    platforms: ["YouTube"],
    levels: ["3.0", "3.5", "4.0"],
    specialties: ["serve", "forehand", "backhand", "basics"],
    styleTags: ["新手友好", "讲解清晰"],
    bio: "偏系统化技术教学，适合想补正反手、发球和基础动作框架的业余球员。",
    suitableFor: ["基础动作", "正反手修正", "发球入门"],
    featuredContentIds: [],
    featuredVideos: [
      {
        id: "creator_tennis_evolution_video_01",
        title: "Master the Kick Serve | Slow Motion ATP Pro Demo",
        target: "kick serve发力轨迹不清",
        levels: ["3.0", "3.5", "4.0"],
        thumbnail: 'https://img.youtube.com/vi/yjdw6WToO80/mqdefault.jpg',
    viewCount: 2329,
        duration: '6:37',
        url: "https://www.youtube.com/watch?v=yjdw6WToO80",
        platform: "YouTube"
      },
      {
        id: "creator_tennis_evolution_video_02",
        title: "Learning Lag: The Secret to Effortless Racquet Speed",
        target: "想提拍速却总发死力",
        levels: ["3.0", "3.5", "4.0"],
        thumbnail: 'https://img.youtube.com/vi/uOcqkQgjtoU/mqdefault.jpg',
    viewCount: 4182,
        duration: '5:22',
        url: "https://www.youtube.com/watch?v=uOcqkQgjtoU",
        platform: "YouTube"
      },
      {
        id: "creator_tennis_evolution_video_03",
        title: "The Famous Spanish Drill to Build Consistency 🇪🇸",
        target: "相持稳定性总是断档",
        levels: ["3.0", "3.5", "4.0"],
        thumbnail: 'https://img.youtube.com/vi/xnMnNXALL-E/mqdefault.jpg',
    viewCount: 51158,
        duration: '4:59',
        url: "https://www.youtube.com/watch?v=xnMnNXALL-E",
        platform: "YouTube"
      },
      {
        id: "creator_tennis_evolution_video_04",
        title: "Stop Using the Wrong Forehand Stance | Open vs Closed Explained",
        target: "正手站位总选不对",
        levels: ["3.0", "3.5", "4.0"],
        thumbnail: 'https://img.youtube.com/vi/lobiC9wUHLw/mqdefault.jpg',
    viewCount: 2243,
        duration: '5:41',
        url: "https://www.youtube.com/watch?v=lobiC9wUHLw",
        platform: "YouTube"
      },
      {
        id: "creator_tennis_evolution_video_05",
        title: "Your Tennis Footwork is NOT Helping You Play Better",
        target: "移动脚步总帮倒忙",
        levels: ["3.0", "3.5", "4.0"],
        thumbnail: 'https://img.youtube.com/vi/8a4QSG53ftc/mqdefault.jpg',
    viewCount: 2010,
        duration: '6:41',
        url: "https://www.youtube.com/watch?v=8a4QSG53ftc",
        platform: "YouTube"
      }
    ],
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
  },
  {
    id: "creator_time_value_of_tennis",
    name: "Time Value of Tennis",
    shortDescription: "技术细节和比赛理解并重",
    tags: ["细节导向", "进阶提升", "实战导向"],
    region: "overseas",
    platforms: ["YouTube"],
    levels: ["3.0", "3.5", "4.0", "4.5"],
    specialties: ["forehand", "backhand", "matchplay", "basics", "consistency"],
    styleTags: ["细节导向", "比赛导向", "讲解清晰"],
    bio: "偏技术细节和比赛决策拆解，适合想同时理解动作质量和回合思路的球员。",
    suitableFor: ["技术细节", "回合思路", "进阶提升"],
    featuredContentIds: [],
    featuredVideos: [
      {
        id: "creator_time_value_of_tennis_video_01",
        title: "To Make Every Volley In Against Anyone , Do This",
        target: "网前总不敢主动上",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://i.ytimg.com/vi/_dYUksHdM6k/mqdefault.jpg",
    viewCount: 202189,
        duration: "9:04",
        url: "https://www.youtube.com/watch?v=_dYUksHdM6k",
        platform: "YouTube"
      },
      {
        id: "creator_time_value_of_tennis_video_02",
        title: "How To Handle High Balls With A One Handed Backhand!",
        target: "反手高点击球总处理不好",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://i.ytimg.com/vi/5_FWpma6BA4/mqdefault.jpg",
    viewCount: 147271,
        duration: "6:54",
        url: "https://www.youtube.com/watch?v=5_FWpma6BA4",
        platform: "YouTube"
      },
      {
        id: "creator_time_value_of_tennis_video_03",
        title: "Avoid the MOST COMMON MISTAKE trying to generate TOPSPIN! Learn what the tennis Pro's do.",
        target: "上旋总是转不起来",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://i.ytimg.com/vi/ekj5T9aBv6Y/mqdefault.jpg",
    viewCount: 93002,
        duration: "5:22",
        url: "https://www.youtube.com/watch?v=ekj5T9aBv6Y",
        platform: "YouTube"
      },
      {
        id: "creator_time_value_of_tennis_video_04",
        title: "How To Hit The PERFECT RETURN!",
        target: "接发总被发球压住",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://i.ytimg.com/vi/SoHBjFOK5I0/mqdefault.jpg",
    viewCount: 4651,
        duration: "8:43",
        url: "https://www.youtube.com/watch?v=SoHBjFOK5I0",
        platform: "YouTube"
      },
      {
        id: "creator_time_value_of_tennis_video_05",
        title: "This will TRANSFORM YOUR SERVE and add up to 20 MPH to it! Serve technique lesson",
        target: "发球总缺少球速和顺畅度",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: "https://i.ytimg.com/vi/ue0M7ki9G1w/mqdefault.jpg",
    viewCount: 1602207,
        duration: "6:26",
        url: "https://www.youtube.com/watch?v=ue0M7ki9G1w",
        platform: "YouTube"
      }
    ],
    recommendedCount: 0,
    profileUrl: "https://www.youtube.com/@timevalueoftennis2866",
    platformLinks: {
      YouTube: "https://www.youtube.com/@timevalueoftennis2866"
    },
    avatar: youtubeAvatar("@timevalueoftennis2866"),
    rankingSignals: {
      subscriberScore: 0.62,
      averageViewsScore: 0.64,
      activityScore: 0.58,
      catalogScore: 0.7,
      authorityScore: 0.7,
      curatorBoost: 0.68
    }
  },
  {
    id: "creator_the_tennis_mentor",
    name: "The Tennis Mentor",
    shortDescription: "基础动作和训练逻辑讲得扎实",
    tags: ["基础导向", "讲解清晰", "节奏训练"],
    region: "overseas",
    platforms: ["YouTube"],
    levels: ["2.5", "3.0", "3.5", "4.0"],
    specialties: ["serve", "forehand", "backhand", "basics", "training"],
    styleTags: ["讲解清晰", "系统化", "新手友好"],
    bio: "偏基础动作和训练逻辑，适合想用更清楚的方法建立正反手、发球和训练节奏的球员。",
    suitableFor: ["基础动作", "训练节奏", "发球入门"],
    featuredContentIds: [],
    featuredVideos: [
      {
        id: "creator_the_tennis_mentor_video_01",
        title: "5 BIGGEST Forehand Mistakes (& How To Fix Them)",
        target: "正手动作总有明显漏洞",
        levels: ["2.5", "3.0", "3.5", "4.0"],
        thumbnail: "https://i.ytimg.com/vi/0MeYx4hXm0Y/mqdefault.jpg",
    viewCount: 42117,
        duration: "10:37",
        url: "https://www.youtube.com/watch?v=0MeYx4hXm0Y",
        platform: "YouTube"
      },
      {
        id: "creator_the_tennis_mentor_video_02",
        title: "Andy Murray Has 3 Return Tips For You",
        target: "接发总是来不及准备",
        levels: ["2.5", "3.0", "3.5", "4.0"],
        thumbnail: "https://i.ytimg.com/vi/fxQ6XFAn2gs/mqdefault.jpg",
    viewCount: 355170,
        duration: "1:23",
        url: "https://www.youtube.com/watch?v=fxQ6XFAn2gs",
        platform: "YouTube"
      },
      {
        id: "creator_the_tennis_mentor_video_03",
        title: "How To MISS LESS Tennis Balls",
        target: "稳定性总是很难维持",
        levels: ["2.5", "3.0", "3.5", "4.0"],
        thumbnail: "https://i.ytimg.com/vi/Gg4olIlr864/mqdefault.jpg",
    viewCount: 26570,
        duration: "0:52",
        url: "https://www.youtube.com/watch?v=Gg4olIlr864",
        platform: "YouTube"
      },
      {
        id: "creator_the_tennis_mentor_video_04",
        title: "Open Stance Backhand Lesson",
        target: "反手站位和启动总不顺",
        levels: ["2.5", "3.0", "3.5", "4.0"],
        thumbnail: "https://i.ytimg.com/vi/jvkfG7z5scE/mqdefault.jpg",
    viewCount: 11819,
        duration: "1:06",
        url: "https://www.youtube.com/watch?v=jvkfG7z5scE",
        platform: "YouTube"
      },
      {
        id: "creator_the_tennis_mentor_video_05",
        title: "The 5 Footwork Fundamentals Every Tennis Player Needs",
        target: "脚步启动总慢半拍",
        levels: ["2.5", "3.0", "3.5", "4.0"],
        thumbnail: "https://i.ytimg.com/vi/UjRv-SbO6K8/mqdefault.jpg",
    viewCount: 40049,
        duration: "14:06",
        url: "https://www.youtube.com/watch?v=UjRv-SbO6K8",
        platform: "YouTube"
      }
    ],
    recommendedCount: 0,
    profileUrl: "https://www.youtube.com/@TheTennisMentor/videos",
    platformLinks: {
      YouTube: "https://www.youtube.com/@TheTennisMentor/videos"
    },
    avatar: youtubeAvatar("@TheTennisMentor"),
    rankingSignals: {
      subscriberScore: 0.6,
      averageViewsScore: 0.62,
      activityScore: 0.72,
      catalogScore: 0.74,
      authorityScore: 0.66,
      curatorBoost: 0.7
    }
  }
];
