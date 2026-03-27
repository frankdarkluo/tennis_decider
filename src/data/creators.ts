import { Creator } from "@/types/creator";

const bilibiliAvatar = (id: string) => `/avatars/bilibili/${id}.jpg`;
const youtubeAvatar = (handle: string) => `https://unavatar.io/youtube/${handle}`;

export const creators: Creator[] = [
  {
    id: "creator_gaiao",
    name: "盖奥网球",
    shortDescription: "适合零基础到 4.0 球员",
    tags: ["新手友好", "基础导向", "讲解清晰"],
    region: "domestic",
    platforms: ["Bilibili"],
    levels: ["2.5", "3.0", "3.5", "4.0"],
    specialties: ["basics", "forehand", "serve", "grip", "footwork", "topspin"],
    styleTags: ["新手友好", "讲解清晰", "基础导向", "动作拆解"],
    bio: "适合零基础到 4.0 左右球员，偏基础动作建立和启蒙教学。",
    suitableFor: ["零基础", "正手框架建立", "发球入门"],
    featuredContentIds: ["content_gaiao_01", "content_gaiao_02", "content_gaiao_03", "content_gaiao_04", "content_gaiao_05", "content_gaiao_06"],
    featuredVideos: [
      {
        id: "creator_gaiao_video_01",
        title: "详细版 网球正手零基础教学",
        target: "正手框架总立不住",
        levels: ["2.5", "3.0"],
        thumbnail: 'http://i2.hdslb.com/bfs/archive/f141ebcafbe7565d32be6b26d6854fe6d3bf845c.jpg',
        duration: '1:14',
        url: "https://www.bilibili.com/video/BV1XM4y187mR/",
        platform: "Bilibili"
      },
      {
        id: "creator_gaiao_video_02",
        title: "网球反手零基础教学",
        target: "反手总打不扎实",
        levels: ["2.5", "3.0", "3.5"],
        thumbnail: 'http://i2.hdslb.com/bfs/archive/e4600b2ca3cd245f33ad97fb5d03cb74ccb2006e.jpg',
        duration: '1:03',
        url: "https://www.bilibili.com/video/BV1YL411d7oX/",
        platform: "Bilibili"
      },
      {
        id: "creator_gaiao_video_03",
        title: "网球步伐训练合集",
        target: "脚步启动总慢半拍",
        levels: ["2.5", "3.0", "3.5"],
        thumbnail: 'http://i0.hdslb.com/bfs/archive/040a19ed2bc864e2d9101347b15782f7e0e36bc4.jpg',
        duration: '1:27',
        url: "https://www.bilibili.com/video/BV1Tg4y1w7Xe/",
        platform: "Bilibili"
      },
      {
        id: "creator_gaiao_video_04",
        title: "#网球 如何练会拐弯的侧旋发球 #网球发球#网球教学#网球盖奥",
        target: "侧旋发球总做不出来",
        levels: ["3.0", "3.5", "4.0"],
        thumbnail: 'http://i2.hdslb.com/bfs/archive/51f03db09cb87e128474d2ece17fbbdf2ea2f057.jpg',
        duration: '0:32',
        url: "https://www.bilibili.com/video/BV1YA4y1D7YR/",
        platform: "Bilibili"
      },
      {
        id: "creator_gaiao_video_05",
        title: "球打不深怎么办",
        target: "相持球总打不深",
        levels: ["3.0", "3.5", "4.0"],
        thumbnail: 'http://i1.hdslb.com/bfs/archive/96883140bb27637300a9b52f844000e25556ab57.jpg',
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
        thumbnail: 'http://i2.hdslb.com/bfs/archive/60f674fe6381eac7a5fc388bd4a9c21b5c74c12b.jpg',
        duration: '0:37',
        url: "https://www.bilibili.com/video/BV1zK411d7SW/",
        platform: "Bilibili"
      },
      {
        id: "creator_mouratoglou_cn_video_02",
        title: "网球截击五部曲",
        target: "截击细节总是混乱",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: 'http://i2.hdslb.com/bfs/archive/12427e203edb27a230920f96083783deb633e228.jpg',
        duration: '1:12',
        url: "https://www.bilibili.com/video/BV1xm4y1K7KS/",
        platform: "Bilibili"
      },
      {
        id: "creator_mouratoglou_cn_video_03",
        title: "大师讲堂|莫拉托格鲁教练教你一步一步让发球更流畅！",
        target: "发球动作总不流畅",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: 'http://i0.hdslb.com/bfs/archive/3824544837bd4bd47db704c163c91474e275a168.jpg',
        duration: '2:56',
        url: "https://www.bilibili.com/video/BV1aB4y1m7Nv/",
        platform: "Bilibili"
      },
      {
        id: "creator_mouratoglou_cn_video_04",
        title: "网球教学：开放式反手击球",
        target: "开放式反手不会用",
        levels: ["3.5", "4.0", "4.5"],
        thumbnail: 'http://i2.hdslb.com/bfs/archive/fad09681d3b7e94b7838158060be2a30f42da685.jpg',
        duration: '1:31',
        url: "https://www.bilibili.com/video/BV1cb4y1P7su/",
        platform: "Bilibili"
      },
      {
        id: "creator_mouratoglou_cn_video_05",
        title: "砰！莫式力量控制黄金法则！",
        target: "发力一大就失控",
        levels: ["3.5", "4.0", "4.5"],
        thumbnail: 'http://i0.hdslb.com/bfs/archive/48ccd4c24f6615da76ec5622beb45c0208da2e17.jpg',
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
        thumbnail: 'http://i0.hdslb.com/bfs/archive/d83e49d82698a0dcdb6d03c412af855dfbec9d47.jpg',
        duration: '7:23',
        url: "https://www.bilibili.com/video/BV1Ty4y1G7r6/",
        platform: "Bilibili"
      },
      {
        id: "creator_furao_video_02",
        title: "发球加速不是靠手臂，而是用手腕｜《跟职业一起训练》第四集",
        target: "发球想加速却只抡手",
        levels: ["3.0", "3.5", "4.0"],
        thumbnail: 'http://i0.hdslb.com/bfs/archive/01629ab79b28769850818e1c00ecb017fb69e228.jpg',
        duration: '5:39',
        url: "https://www.bilibili.com/video/BV123411H7u6/",
        platform: "Bilibili"
      },
      {
        id: "creator_furao_video_03",
        title: "正！手！千！万！别！引！拍！",
        target: "正手引拍越做越大",
        levels: ["3.0", "3.5", "4.0"],
        thumbnail: 'http://i2.hdslb.com/bfs/archive/7910cfd92081586293280ac5f6c4f0091ba4a6d7.jpg',
        duration: '9:22',
        url: "https://www.bilibili.com/video/BV1Zf4y1b7aW/",
        platform: "Bilibili"
      },
      {
        id: "creator_furao_video_04",
        title: "新年首战：网球工匠付饶4.5vs智利纳达尔Camilo5.0（2022继续向5.0攀登）",
        target: "想看实战对抗细节",
        levels: ["3.5", "4.0"],
        thumbnail: 'http://i2.hdslb.com/bfs/archive/82d0351f649ba96ee628548caafa0ae057748b00.jpg',
        duration: '10:54',
        url: "https://www.bilibili.com/video/BV1jm4y1X7yF/",
        platform: "Bilibili"
      },
      {
        id: "creator_furao_video_05",
        title: "【网球工匠付饶】测评Vcore米白色款网球拍",
        target: "想看器材实测思路",
        levels: ["3.0", "3.5", "4.0"],
        thumbnail: 'http://i0.hdslb.com/bfs/archive/f8d7620ee92779dc3700de4d009f8167d6e8cb89.jpg',
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
        thumbnail: 'http://i1.hdslb.com/bfs/archive/8e9a2416bfa72356df1d9ce499d1221652b5c7ef.jpg',
        duration: '22:03',
        url: "https://www.bilibili.com/video/BV1954y147nF/",
        platform: "Bilibili"
      },
      {
        id: "creator_racketbrothers_video_02",
        title: "【网球教学-言之有理】5.0大佬教我如何让发球和接发球更GOOD",
        target: "接发第一拍质量低",
        levels: ["3.0", "3.5", "4.0"],
        thumbnail: 'http://i1.hdslb.com/bfs/archive/a7c193cdba7994f40ab95c947c618f94bb1f8973.jpg',
        duration: '30:38',
        url: "https://www.bilibili.com/video/BV1Ep4y1W7kc/",
        platform: "Bilibili"
      },
      {
        id: "creator_racketbrothers_video_03",
        title: "【网球比赛】2023天天有网球年终总决赛周柏言/赵子昂HL",
        target: "想看双打实战执行",
        levels: ["3.0", "3.5", "4.0"],
        thumbnail: 'http://i1.hdslb.com/bfs/archive/d8bbdfd63f468624fd2530609984dbf8dea11039.jpg',
        duration: '7:41',
        url: "https://www.bilibili.com/video/BV1JN4y18792/",
        platform: "Bilibili"
      },
      {
        id: "creator_racketbrothers_video_04",
        title: "【网球教学-言之有理】5.0大佬教我如何让切削更UP",
        target: "切削总飘不下压",
        levels: ["3.0", "3.5", "4.0"],
        thumbnail: 'http://i1.hdslb.com/bfs/archive/a3bd03f8d1177ffb7fbb365b176d5ba11812ea1e.jpg',
        duration: '23:45',
        url: "https://www.bilibili.com/video/BV1TU4y187QS/",
        platform: "Bilibili"
      },
      {
        id: "creator_racketbrothers_video_05",
        title: "【网球教学-言之讲理】5.0大佬教“全国U14年终第一”怎样打好单手反拍&截击（上）",
        target: "单反和截击衔接乱",
        levels: ["3.5", "4.0"],
        thumbnail: 'http://i0.hdslb.com/bfs/archive/5dd6a9934e4a546847ff8a53668f0830c12ebfb7.jpg',
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
        thumbnail: 'http://i2.hdslb.com/bfs/archive/f7740abefccf6743e36f9aeb5e6a6f2da7b85385.jpg',
        duration: '1:12',
        url: "https://www.bilibili.com/video/BV1b2UmBTEsV/",
        platform: "Bilibili"
      },
      {
        id: "creator_cn_a_video_02",
        title: "网球新手｜切削发球一分钟速成✅3步",
        target: "切削发球总转不起来",
        levels: ["3.0", "3.5"],
        thumbnail: 'http://i0.hdslb.com/bfs/archive/4d1163b793537b55bccf451ccc1a15ef27dd1c62.jpg',
        duration: '1:01',
        url: "https://www.bilibili.com/video/BV1Q8NWzmESF/",
        platform: "Bilibili"
      },
      {
        id: "creator_cn_a_video_03",
        title: "网球技术｜一分钟✅｜跟着德约学起跳反手‼️➡️",
        target: "起跳反手总不会用",
        levels: ["3.0", "3.5"],
        thumbnail: 'http://i2.hdslb.com/bfs/archive/f34a8c49caa5ce8f855455c2bff586ae1a58d7b3.jpg',
        duration: '1:01',
        url: "https://www.bilibili.com/video/BV1TrwQe9E2A/",
        platform: "Bilibili"
      },
      {
        id: "creator_cn_a_video_04",
        title: "网球热身｜5组动作提升状态🎾新手必练‼️",
        target: "上场前总不会热身",
        levels: ["3.0", "3.5"],
        thumbnail: 'http://i1.hdslb.com/bfs/archive/5e3944513a109f027eb34e68c7b10754f9015e3f.jpg',
        duration: '1:17',
        url: "https://www.bilibili.com/video/BV1oaN9eEEpk/",
        platform: "Bilibili"
      },
      {
        id: "creator_cn_a_video_05",
        title: "网球必练｜一键模式✅新手也能打直球❗️",
        target: "总打不出稳定直线",
        levels: ["3.0", "3.5"],
        thumbnail: 'http://i2.hdslb.com/bfs/archive/521bc95fc6a86451bbb659fb31995cafc6611b4b.jpg',
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
        thumbnail: 'http://i2.hdslb.com/bfs/archive/bcd585e7eb1eb34b3f90ec584d18425635997e30.jpg',
        duration: '7:25',
        url: "https://www.bilibili.com/video/BV1PN4y1R7jL/",
        platform: "Bilibili"
      },
      {
        id: "creator_leontv_cn_video_02",
        title: "【网球教学】正拍打出力并能保持稳定性的三个步骤｜ LeonTV ｜网球基础",
        target: "正手发力总靠手臂",
        levels: ["2.5", "3.0", "3.5"],
        thumbnail: 'http://i2.hdslb.com/bfs/archive/8ec3416ebcfbb18422c57f72fa81f2acab2bb791.jpg',
        duration: '13:16',
        url: "https://www.bilibili.com/video/BV1h64y1D78J/",
        platform: "Bilibili"
      },
      {
        id: "creator_leontv_cn_video_03",
        title: "【网球 教学】平击上旋 vs 重上旋｜正拍 打出压制力的关键！｜LeonTV",
        target: "上旋弧线总拉不出",
        levels: ["3.0", "3.5", "4.0"],
        thumbnail: 'http://i1.hdslb.com/bfs/archive/7e035fbef7f29ef5cff1dac5f7a84bcd72e8b445.jpg',
        duration: '8:06',
        url: "https://www.bilibili.com/video/BV1QRLizLEnv/",
        platform: "Bilibili"
      },
      {
        id: "creator_leontv_cn_video_04",
        title: "【网球教学】接发球完整教学｜任何层级都适用的必学技巧｜LeonTV",
        target: "接发总被对手压住",
        levels: ["2.5", "3.0", "3.5", "4.0"],
        thumbnail: 'http://i0.hdslb.com/bfs/archive/1a11be43cdbb07be461fcbd702d3124d8e6d318c.jpg',
        duration: '15:38',
        url: "https://www.bilibili.com/video/BV1D7YfzDEfo/",
        platform: "Bilibili"
      },
      {
        id: "creator_leontv_cn_video_05",
        title: "90%业余球员都曾犯的三大脚步错误！实战修正｜网球脚步｜LeonTV",
        target: "脚步错误反复出现",
        levels: ["2.5", "3.0", "3.5", "4.0"],
        thumbnail: 'http://i2.hdslb.com/bfs/archive/1508293f4adf9fc8b3be7f0f2620e501e09b0cb5.jpg',
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
        thumbnail: 'http://i1.hdslb.com/bfs/archive/7ad92d40468500df06a1604a134c4e82ce2a2258.jpg',
        duration: '14:49',
        url: "https://www.bilibili.com/video/BV1FG4y1X7DA/",
        platform: "Bilibili"
      },
      {
        id: "creator_james_video_02",
        title: "【网球拍测评】Wilson shift是工业垃圾还是上旋福音？",
        target: "想知道上旋拍值不值",
        levels: ["2.5", "3.0", "3.5", "4.0"],
        thumbnail: 'http://i2.hdslb.com/bfs/archive/c67df583432d5a1dc79270adc969b04497018d06.jpg',
        duration: '18:17',
        url: "https://www.bilibili.com/video/BV1hV4y197oy/",
        platform: "Bilibili"
      },
      {
        id: "creator_james_video_03",
        title: "【网球vlog日常】对话职业穿线师第一期！｜磅数，线径，材料？！！一个视频带你看清楚",
        target: "穿线参数总是搞不清",
        levels: ["2.5", "3.0", "3.5", "4.0"],
        thumbnail: 'http://i2.hdslb.com/bfs/archive/6ec591018de6011a25392e54c6942de9022a568a.jpg',
        duration: '17:24',
        url: "https://www.bilibili.com/video/BV1bd1sYrEtc/",
        platform: "Bilibili"
      },
      {
        id: "creator_james_video_04",
        title: "【网球教学日常】跟着前ATP双打180的球员来学习截击！｜让你在网前变得更加充满侵略性！！！",
        target: "网前截击总打不死",
        levels: ["3.0", "3.5", "4.0"],
        thumbnail: 'http://i0.hdslb.com/bfs/archive/a28acffb34993a9c85b236b7093f06f1b97ebc71.jpg',
        duration: '6:18',
        url: "https://www.bilibili.com/video/BV14J4m1x75K/",
        platform: "Bilibili"
      },
      {
        id: "creator_james_video_05",
        title: "【网球教学日常】ATP职业大佬提高你的正手稳定性｜让你的正手成为你的得分利器！！！",
        target: "正手稳定性总上不去",
        levels: ["3.0", "3.5", "4.0"],
        thumbnail: 'http://i0.hdslb.com/bfs/archive/fd9313de08983234979cb0c99ec8125ac8c54930.jpg',
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
        thumbnail: 'http://i0.hdslb.com/bfs/archive/d897eed483ddc1e13475a1077a45223916e04094.jpg',
        duration: '0:27',
        url: "https://www.bilibili.com/video/BV1fxy3BgECv/",
        platform: "Bilibili"
      },
      {
        id: "creator_liuliu_video_02",
        title: "一个视频学会8种网球切削技术",
        target: "切削变化总是不会用",
        levels: ["2.5", "3.0", "3.5"],
        thumbnail: 'http://i2.hdslb.com/bfs/archive/91bf4726be460a0ff2b38fae6565f1dc7cd84fc0.jpg',
        duration: '0:56',
        url: "https://www.bilibili.com/video/BV1wABXB1EtU/",
        platform: "Bilibili"
      },
      {
        id: "creator_liuliu_video_03",
        title: "网球底层逻辑：稳定大于一切！",
        target: "练习总在瞎发力",
        levels: ["2.5", "3.0", "3.5"],
        thumbnail: 'http://i2.hdslb.com/bfs/archive/54a3e9225691616a4a477ee0530c1db587cbb346.jpg',
        duration: '5:29',
        url: "https://www.bilibili.com/video/BV1jQZQBQECX/",
        platform: "Bilibili"
      },
      {
        id: "creator_liuliu_video_04",
        title: "打网球必学的10个热身动作",
        target: "上场前总不会热身",
        levels: ["2.5", "3.0", "3.5"],
        thumbnail: 'http://i2.hdslb.com/bfs/archive/a137c39924d5a5ff433ad0047cede39d37503ca4.jpg',
        duration: '1:32',
        url: "https://www.bilibili.com/video/BV1PAq5BuE85/",
        platform: "Bilibili"
      },
      {
        id: "creator_liuliu_video_05",
        title: "打网球必做的手眼协调性训练！",
        target: "训练结构总是乱练",
        levels: ["2.5", "3.0", "3.5"],
        thumbnail: 'http://i0.hdslb.com/bfs/archive/bafac66bd018ebbe22d0aeb6923e26a8ff953b2e.jpg',
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
        thumbnail: 'http://i2.hdslb.com/bfs/archive/95a16864f40364f032e3ffa7989717aa9ab9cf21.jpg',
        duration: '1:58',
        url: "https://www.bilibili.com/video/BV1SZ6qYFEVS/",
        platform: "Bilibili"
      },
      {
        id: "creator_pikachu_video_02",
        title: "5个练习🎾没有球搭子，一个人也能默默涨球!",
        target: "没人陪练就不会练",
        levels: ["2.5", "3.0", "3.5"],
        thumbnail: 'http://i0.hdslb.com/bfs/archive/49156c0240cb1bee00a0cda1498f18a984bf3527.jpg',
        duration: '1:06',
        url: "https://www.bilibili.com/video/BV1LvS3YWEnL/",
        platform: "Bilibili"
      },
      {
        id: "creator_pikachu_video_03",
        title: "网球学练馆的11种练法🎾方法用得对，训练不枯燥",
        target: "训练总是越练越乱",
        levels: ["2.5", "3.0", "3.5"],
        thumbnail: 'http://i0.hdslb.com/bfs/archive/9b9d88aec4933ae8c7d31db2bec9ac08f114ba31.jpg',
        duration: '1:03',
        url: "https://www.bilibili.com/video/BV16uHizBEp2/",
        platform: "Bilibili"
      },
      {
        id: "creator_pikachu_video_04",
        title: "🎾网球发球力量从哪来？身体像弹弓一样弹射❗",
        target: "发球想有力却只抡手",
        levels: ["2.5", "3.0", "3.5"],
        thumbnail: 'http://i0.hdslb.com/bfs/archive/d8f3fcf15bf12292a32cae5d5515157961691398.jpg',
        duration: '0:35',
        url: "https://www.bilibili.com/video/BV1ox421f7VX/",
        platform: "Bilibili"
      },
      {
        id: "creator_pikachu_video_05",
        title: "网球新手必看❗五种网球握拍全解析",
        target: "总搞不清该怎么握拍",
        levels: ["2.5", "3.0", "3.5"],
        thumbnail: 'http://i2.hdslb.com/bfs/archive/158754b6b85286c29789c61f54394e8a29ffb7eb.jpg',
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
        thumbnail: 'http://i2.hdslb.com/bfs/archive/c22922ade6408547499c57f016cefd54166cfd2a.jpg',
        duration: '12:42',
        url: "https://www.bilibili.com/video/BV1JT5wz4EJJ/",
        platform: "Bilibili"
      },
      {
        id: "creator_matsuo_yuki_cn_video_02",
        title: "让对手讨厌的有穿透力的切削球！简单易懂的3个要点！【松尾友贵Proの网球教学】",
        target: "切削总飘不往前走",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: 'http://i2.hdslb.com/bfs/archive/5367bb69a6ce6b1c50e53b0a643bf64fccd5bc68.jpg',
        duration: '7:10',
        url: "https://www.bilibili.com/video/BV1aTaxzxENT/",
        platform: "Bilibili"
      },
      {
        id: "creator_matsuo_yuki_cn_video_03",
        title: "战术大师！伊藤葵选手的挑高球和角度球击球方式学习！",
        target: "高球和角度球不会用",
        levels: ["3.5", "4.0", "4.5"],
        thumbnail: 'http://i2.hdslb.com/bfs/archive/86554dbec03f66a72ddee9b2382552ab5feab606.jpg',
        duration: '14:38',
        url: "https://www.bilibili.com/video/BV1uJaTzvEVq/",
        platform: "Bilibili"
      },
      {
        id: "creator_matsuo_yuki_cn_video_04",
        title: "【初学必见】只用20分钟就可以掌握挡击接发回球！【松尾友贵Proの网球教学】",
        target: "接发总被发球压住",
        levels: ["3.0", "3.5", "4.0"],
        thumbnail: 'http://i0.hdslb.com/bfs/archive/688c521b3a7e6cdb5d7e4c02d9ab45db0d8be0d3.jpg',
        duration: '9:33',
        url: "https://www.bilibili.com/video/BV18xXgYnEMA/",
        platform: "Bilibili"
      },
      {
        id: "creator_matsuo_yuki_cn_video_05",
        title: "【害怕比赛】练习很好比赛无法正常发挥！一定要看！【松尾友贵Proの网球教学】",
        target: "比赛一打就发挥失常",
        levels: ["3.0", "3.5", "4.0", "4.5"],
        thumbnail: 'http://i2.hdslb.com/bfs/archive/8e3bce7037f4dccb467993ca3db9fab2eef66cd7.jpg',
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
        thumbnail: 'http://i2.hdslb.com/bfs/archive/02ec1b009f740466e241119ce1b0b61bb00eace3.jpg',
        duration: '2:13',
        url: "https://www.bilibili.com/video/BV1KG4y1x77a/",
        platform: "Bilibili"
      },
      {
        id: "creator_austin_camp_video_02",
        title: "不会单反的看完就会了，单反不好的看完狂涨1个水平",
        target: "单反动作总不扎实",
        levels: ["3.0", "3.5", "4.0"],
        thumbnail: 'http://i1.hdslb.com/bfs/archive/6a1fcdbf33864d830133ffb87f4e73f7cba50f0a.jpg',
        duration: '3:09',
        url: "https://www.bilibili.com/video/BV1UW4y1q7jB/",
        platform: "Bilibili"
      },
      {
        id: "creator_austin_camp_video_03",
        title: "网球平击发球零基础教学",
        target: "平击发球总没速度",
        levels: ["2.5", "3.0", "3.5", "4.0"],
        thumbnail: 'http://i1.hdslb.com/bfs/archive/f62ce04f74b98f58dc4b58db1d3d2bc2a991a12a.jpg',
        duration: '5:14',
        url: "https://www.bilibili.com/video/BV1dF4m1V7BS/",
        platform: "Bilibili"
      },
      {
        id: "creator_austin_camp_video_04",
        title: "网球无脑战术？练好这个就已经吃遍天了",
        target: "比赛战术总想不清",
        levels: ["3.0", "3.5", "4.0"],
        thumbnail: 'http://i0.hdslb.com/bfs/archive/af95906662a153d3211a190b7659488aa09326ba.jpg',
        duration: '1:19',
        url: "https://www.bilibili.com/video/BV13u4y1e7Lx/",
        platform: "Bilibili"
      },
      {
        id: "creator_austin_camp_video_05",
        title: "球感练好，训练比事半功倍",
        target: "训练结构总是乱练",
        levels: ["2.5", "3.0", "3.5", "4.0"],
        thumbnail: 'http://i1.hdslb.com/bfs/archive/c9ea7db9c326e2fbd84fe629af0d0fbee834a394.jpg',
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
        thumbnail: 'http://i0.hdslb.com/bfs/archive/1e157438275a1ef778836f6d00f51046f6f8717c.jpg',
        duration: '19:21',
        url: "https://www.bilibili.com/video/BV1HEyaBiEaW/",
        platform: "Bilibili"
      },
      {
        id: "creator_yexiu_gege_video_02",
        title: "从零开始的网球自习系列课-双打截击篇",
        target: "网前截击总没章法",
        levels: ["3.0", "3.5", "4.0"],
        thumbnail: 'http://i2.hdslb.com/bfs/archive/62dd22f83ac821c12150956dd37acf0ab0899fa8.jpg',
        duration: '9:27',
        url: "https://www.bilibili.com/video/BV1EbkyB8EQx/",
        platform: "Bilibili"
      },
      {
        id: "creator_yexiu_gege_video_03",
        title: "如何减速站定击球",
        target: "跑到位后总站不住",
        levels: ["2.5", "3.0", "3.5"],
        thumbnail: 'http://i1.hdslb.com/bfs/archive/0f25066c8bbd193224acd331e5077e5423f4ee2c.jpg',
        duration: '9:11',
        url: "https://www.bilibili.com/video/BV1vLcBzSE1P/",
        platform: "Bilibili"
      },
      {
        id: "creator_yexiu_gege_video_04",
        title: "从零开始的网球自习系列课-脚下篇",
        target: "脚步路线总是乱",
        levels: ["2.5", "3.0", "3.5", "4.0"],
        thumbnail: 'http://i2.hdslb.com/bfs/archive/f8037ecf37217b779e729324c44125b210c33ecd.png',
        duration: '38:49',
        url: "https://www.bilibili.com/video/BV1tf421S7rt/",
        platform: "Bilibili"
      },
      {
        id: "creator_yexiu_gege_video_05",
        title: "从零开始的网球自习系列课-发球下肢篇",
        target: "发球下肢发力总脱节",
        levels: ["3.0", "3.5", "4.0"],
        thumbnail: 'http://i0.hdslb.com/bfs/archive/333e09d33fd5a97df40ea6525232840c12f4d9ee.jpg',
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
  }
];
