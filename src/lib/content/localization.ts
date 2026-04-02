export type ContentEnglishOverride = {
  displayTitleEn: string;
  focusLineEn: string;
};

export type CreatorFeaturedVideoEnglishOverride = {
  displayTitleEn?: string;
  targetEn?: string;
};

export type CreatorEnglishOverride = {
  nameEn?: string;
  nameZh?: string;
  shortDescriptionEn?: string;
  bioEn?: string;
  suitableForEn?: string[];
  featuredVideos?: Record<string, CreatorFeaturedVideoEnglishOverride>;
};

export const CONTENT_ENGLISH_OVERRIDES: Record<string, ContentEnglishOverride> = {};

export const CREATOR_TAG_LABELS_EN: Record<string, string> = {
  "双打专项": "Doubles focus",
  "网前专修": "Net-play focus",
  "反手专项": "Backhand focus",
  "反手专修": "Backhand focus",
  "发球专项": "Serve focus",
  "发球专修": "Serve focus",
  "基础导向": "Form building",
  "基础筑形": "Form building",
  "实战导向": "Match patterns",
  "实战拆解": "Match patterns",
  "战术拆局": "Tactical reads",
  "新手友好": "Beginner-ready",
  "入门友好": "Beginner-ready",
  "正手专项": "Forehand focus",
  "正手专修": "Forehand focus",
  "细节导向": "Detail fixes",
  "细节纠偏": "Detail fixes",
  "脚步移动": "Footwork timing",
  "步法启动": "Footwork timing",
  "节奏训练": "Rhythm building",
  "讲解清晰": "Clear breakdowns",
  "讲解透彻": "Clear breakdowns",
  "进阶提升": "Level-up work",
  "进阶突破": "Level-up work"
};

export const CREATOR_TAG_LABELS_ZH: Record<string, string> = {
  "双打专项": "双打专攻",
  "网前专修": "网前专修",
  "反手专项": "反手专修",
  "反手专修": "反手专修",
  "发球专项": "发球专修",
  "发球专修": "发球专修",
  "基础导向": "基础筑形",
  "基础筑形": "基础筑形",
  "实战导向": "实战拆解",
  "实战拆解": "实战拆解",
  "战术拆局": "战术拆局",
  "新手友好": "入门友好",
  "入门友好": "入门友好",
  "正手专项": "正手专修",
  "正手专修": "正手专修",
  "细节导向": "细节纠偏",
  "细节纠偏": "细节纠偏",
  "脚步移动": "步法启动",
  "步法启动": "步法启动",
  "节奏训练": "节奏养成",
  "讲解清晰": "讲解透彻",
  "讲解透彻": "讲解透彻",
  "进阶提升": "进阶突破",
  "进阶突破": "进阶突破"
};

export const CREATOR_ENGLISH_OVERRIDES: Record<string, CreatorEnglishOverride> = {
  "creator_gaiao": {
    "featuredVideos": {
      "creator_gaiao_video_01": {
        "displayTitleEn": "Detailed beginner forehand lesson",
        "targetEn": "When your forehand foundation never feels stable"
      },
      "creator_gaiao_video_02": {
        "displayTitleEn": "Beginner backhand lesson",
        "targetEn": "When the backhand contact never feels solid"
      },
      "creator_gaiao_video_03": {
        "displayTitleEn": "Footwork drill collection",
        "targetEn": "When your first step is always late"
      },
      "creator_gaiao_video_04": {
        "displayTitleEn": "How to hit a sidespin serve",
        "targetEn": "When you cannot create sidespin on the serve"
      },
      "creator_gaiao_video_05": {
        "displayTitleEn": "How to stop hitting short rally balls",
        "targetEn": "When rally balls keep landing short"
      }
    }
  },
  "creator_mouratoglou_cn": {
    "featuredVideos": {
      "creator_mouratoglou_cn_video_01": {
        "displayTitleEn": "Forehand prep: turn earlier before contact",
        "targetEn": "When forehand preparation is always late"
      },
      "creator_mouratoglou_cn_video_02": {
        "displayTitleEn": "Five steps to better volleys",
        "targetEn": "When volley details feel messy"
      },
      "creator_mouratoglou_cn_video_03": {
        "displayTitleEn": "Make the serve flow smoothly, step by step",
        "targetEn": "When the serve motion feels jerky"
      },
      "creator_mouratoglou_cn_video_04": {
        "displayTitleEn": "Open-stance backhand fundamentals",
        "targetEn": "When you do not know how to use the open-stance backhand"
      },
      "creator_mouratoglou_cn_video_05": {
        "displayTitleEn": "Power control: Mouratoglou's golden rule",
        "targetEn": "When more effort makes you lose control"
      }
    }
  },
  "creator_furao": {
    "featuredVideos": {
      "creator_furao_video_01": {
        "displayTitleEn": "Two drills to increase two-handed backhand speed",
        "targetEn": "When your two-handed backhand has no pace"
      },
      "creator_furao_video_02": {
        "displayTitleEn": "Serve speed comes from the wrist, not just the arm",
        "targetEn": "When you try to speed up the serve with just the arm"
      },
      "creator_furao_video_03": {
        "displayTitleEn": "Forehand backswing: do not let it get too big",
        "targetEn": "When the forehand take-back keeps growing"
      },
      "creator_furao_video_04": {
        "displayTitleEn": "Match-play example: 4.5 vs 5.0 rally details",
        "targetEn": "When you want to study real match-play details"
      },
      "creator_furao_video_05": {
        "displayTitleEn": "Vcore racquet review",
        "targetEn": "When you want equipment-testing ideas"
      }
    }
  },
  "creator_racketbrothers": {
    "featuredVideos": {
      "creator_racketbrothers_video_01": {
        "displayTitleEn": "How to make your volleys more solid",
        "targetEn": "When your net volleys keep breaking down"
      },
      "creator_racketbrothers_video_02": {
        "displayTitleEn": "How to improve the serve and return",
        "targetEn": "When your first return ball has low quality"
      },
      "creator_racketbrothers_video_03": {
        "displayTitleEn": "Doubles match highlights and execution",
        "targetEn": "When you want to study doubles match execution"
      },
      "creator_racketbrothers_video_04": {
        "displayTitleEn": "How to make the slice stay lower",
        "targetEn": "When the slice floats instead of staying down"
      },
      "creator_racketbrothers_video_05": {
        "displayTitleEn": "One-handed backhand and volley connection",
        "targetEn": "When the one-hander and volley transition feels messy"
      }
    }
  },
  "creator_cn_a": {
    "featuredVideos": {
      "creator_cn_a_video_01": {
        "displayTitleEn": "A simple beginner volley you can actually repeat",
        "targetEn": "When your volley motion keeps falling apart"
      },
      "creator_cn_a_video_02": {
        "displayTitleEn": "One-minute slice serve: three simple steps",
        "targetEn": "When you cannot get spin on the slice serve"
      },
      "creator_cn_a_video_03": {
        "displayTitleEn": "Learn the jumping backhand with Djokovic cues",
        "targetEn": "When the jumping backhand never feels natural"
      },
      "creator_cn_a_video_04": {
        "displayTitleEn": "Five warm-up sequences before you play",
        "targetEn": "When you never know how to warm up"
      },
      "creator_cn_a_video_05": {
        "displayTitleEn": "A simple way to hit the down-the-line ball",
        "targetEn": "When you cannot hit a stable down-the-line shot"
      }
    }
  },
  "creator_leontv_cn": {
    "featuredVideos": {
      "creator_leontv_cn_video_01": {
        "displayTitleEn": "Three steps to a better split step",
        "targetEn": "When the split step is always half a beat late"
      },
      "creator_leontv_cn_video_02": {
        "displayTitleEn": "Three steps to more stable forehand power",
        "targetEn": "When forehand power comes mostly from the arm"
      },
      "creator_leontv_cn_video_03": {
        "displayTitleEn": "Flat topspin vs heavy topspin on the forehand",
        "targetEn": "When you cannot create enough topspin arc"
      },
      "creator_leontv_cn_video_04": {
        "displayTitleEn": "A complete return-of-serve lesson",
        "targetEn": "When returns keep getting pinned back"
      },
      "creator_leontv_cn_video_05": {
        "displayTitleEn": "Three recurring footwork mistakes in recreational tennis",
        "targetEn": "When the same footwork errors keep showing up"
      }
    }
  }
};
