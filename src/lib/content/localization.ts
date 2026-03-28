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
  shortDescriptionEn: string;
  bioEn: string;
  suitableForEn: string[];
  featuredVideos?: Record<string, CreatorFeaturedVideoEnglishOverride>;
};

export const CONTENT_ENGLISH_OVERRIDES: Record<string, ContentEnglishOverride> = {
  content_cn_a_01: {
    displayTitleEn: "Backhand into the net? Fix contact before adding pace",
    focusLineEn: "For backhands that dive into the net as soon as you swing harder."
  },
  content_cn_a_02: {
    displayTitleEn: "Late contact? Prepare earlier and meet the ball out front",
    focusLineEn: "For players who feel rushed and keep contacting the ball beside or behind the body."
  },
  content_cn_a_03: {
    displayTitleEn: "Slow, messy footwork? Clean up these four foundation patterns",
    focusLineEn: "For players who freeze on the first step or never find a comfortable hitting position."
  },
  content_cn_b_02: {
    displayTitleEn: "Doubles positioning: the basic formations every pair needs",
    focusLineEn: "For doubles players who keep overlapping with a partner or leaving open space."
  },
  content_cn_b_03: {
    displayTitleEn: "Volleys: shorten the motion and raise your success rate",
    focusLineEn: "For volley swings that get too big and send the ball long or into the net."
  },
  content_cn_c_01: {
    displayTitleEn: "Consistency first: hit deeper before chasing power",
    focusLineEn: "For rally balls that land short and never push the opponent back."
  },
  content_cn_c_02: {
    displayTitleEn: "Split-step timing: why you keep arriving late",
    focusLineEn: "For slow first steps and split steps that happen at the wrong moment."
  },
  content_cn_c_03: {
    displayTitleEn: "No hitting partner? Five solo drills you can start today",
    focusLineEn: "For players who do not know how to structure a useful session alone."
  },
  content_cn_d_01: {
    displayTitleEn: "Forehand flying long? Build arc before adding speed",
    focusLineEn: "For forehands that sail long once you try to accelerate."
  },
  content_cn_d_03: {
    displayTitleEn: "Feel the topspin: brush up the back of the ball",
    focusLineEn: "For players who cannot create a safe, repeatable topspin arc."
  },
  content_cn_e_01: {
    displayTitleEn: "Passive on returns? Fix the setup and court position first",
    focusLineEn: "For return games where the server controls the first shot before you settle in."
  },
  content_cn_e_02: {
    displayTitleEn: "Stop losing the opening games: lock in your serve-return routine",
    focusLineEn: "For matches that get chaotic before your first few points feel organized."
  },
  content_cn_e_03: {
    displayTitleEn: "Do not rush the return: send the first ball deep",
    focusLineEn: "For return balls that land short and hand over the attack immediately."
  },
  content_cn_f_01: {
    displayTitleEn: "Under pressure, stop watching the score and play the next ball",
    focusLineEn: "For players who tighten up as soon as the score starts to matter."
  },
  content_cn_f_02: {
    displayTitleEn: "Practice feels random? Build a cleaner training menu",
    focusLineEn: "For players who get to the court without a clear session structure."
  },
  content_cn_f_03: {
    displayTitleEn: "Practising a lot but not improving? Narrow the goal",
    focusLineEn: "For players who try to change too many things in one session."
  },
  content_fr_01: {
    displayTitleEn: "Backhand net errors: clean up contact and racquet-face control",
    focusLineEn: "For backhands that keep finding the net or making contact too late."
  },
  content_fr_03: {
    displayTitleEn: "Forehand power chain: go from stable to faster",
    focusLineEn: "For forehands that feel weak or break down when you add speed."
  },
  content_gaiao_01: {
    displayTitleEn: "Forehand fundamentals: build a repeatable swing shape",
    focusLineEn: "For players whose forehand mechanics still feel unsettled."
  },
  content_gaiao_02: {
    displayTitleEn: "Serve fundamentals: build rhythm before power",
    focusLineEn: "For players who rush the serve and lose trust in the second serve."
  },
  content_gaiao_03: {
    displayTitleEn: "Backhand basics: why the contact never feels solid",
    focusLineEn: "For players whose backhand contact stays weak or inconsistent."
  },
  content_rb_01: {
    displayTitleEn: "Doubles net play: positioning and volley timing",
    focusLineEn: "For doubles players who hesitate at net or miss the poach timing."
  },
  content_rb_02: {
    displayTitleEn: "Return of serve under pressure: positioning and first-ball choices",
    focusLineEn: "For return games where the first shot has no quality or direction."
  },
  content_rb_03: {
    displayTitleEn: "Match execution in doubles: stabilize first, then press",
    focusLineEn: "For players whose match decisions and doubles rhythm break down under pressure."
  },
  content_zlx_01: {
    displayTitleEn: "Serve rhythm: feel the pause instead of forcing pace",
    focusLineEn: "For second serves that lose rhythm as soon as you try to hit harder."
  },
  content_zlx_02: {
    displayTitleEn: "Step-in serve rhythm: coordinate the feet and upper body",
    focusLineEn: "For players who cannot sync the step-in serve."
  },
  content_zlx_03: {
    displayTitleEn: "Technical details: connect the backhand to transition play",
    focusLineEn: "For players who struggle to link the backhand to movement into the front court."
  },
  content_gaiao_04: {
    displayTitleEn: "Forehand topspin: start with the right grip and arc",
    focusLineEn: "For flat forehands that fly long when you try to add spin."
  },
  content_gaiao_05: {
    displayTitleEn: "Movement basics: build your split step and arrival rhythm",
    focusLineEn: "For slow starters who never feel balanced at contact."
  },
  content_gaiao_06: {
    displayTitleEn: "Serve variation: add sidespin with grip and brush direction",
    focusLineEn: "For players who want spin on the serve but cannot create rotation."
  },
  content_ttt_01: {
    displayTitleEn: "Serve masterclass for beginners: toss, rhythm, and body position",
    focusLineEn: "For unstable tosses that throw off the entire serve motion."
  },
  content_et_01: {
    displayTitleEn: "How to control groundstroke depth",
    focusLineEn: "For rally balls that keep landing short near the service line."
  },
  content_it_01: {
    displayTitleEn: "Backhand slice lesson with a 4.5 student",
    focusLineEn: "For slices that float up and land short with no pressure."
  },
  content_cn_b_01: {
    displayTitleEn: "Doubles net play: learn to hold position and block first",
    focusLineEn: "For players who freeze or panic when standing at the net in doubles."
  },
  content_cn_d_02: {
    displayTitleEn: "Forehand power: stop blaming your arm",
    focusLineEn: "For forehands where only the arm swings and the body does not join in."
  },
  content_common_01: {
    displayTitleEn: "Lobs: understand arc and placement before you hit",
    focusLineEn: "For defensive shots that always go flat instead of buying recovery time."
  },
  content_common_02: {
    displayTitleEn: "Handling underspin: do not let the contact point drift behind you",
    focusLineEn: "For players whose form breaks down against incoming slice or underspin."
  },
  content_common_03: {
    displayTitleEn: "Backhand slice floating? Fix racquet face and follow-through",
    focusLineEn: "For slices that lack control and land without any pressure."
  },
  content_fr_02: {
    displayTitleEn: "Late contact? Fix your preparation timing and footwork",
    focusLineEn: "For players who are always half a beat late getting set for the ball."
  }
};

export const CREATOR_TAG_LABELS_EN: Record<string, string> = {
  "双打专项": "Doubles",
  "反手专项": "Backhand",
  "发球专项": "Serve",
  "基础导向": "Fundamentals",
  "实战导向": "Match play",
  "新手友好": "Beginner-friendly",
  "正手专项": "Forehand",
  "细节导向": "Detail-focused",
  "脚步移动": "Footwork",
  "节奏训练": "Rhythm training",
  "讲解清晰": "Clear instruction",
  "进阶提升": "Level Up"
};

export const CREATOR_ENGLISH_OVERRIDES: Record<string, CreatorEnglishOverride> = {
  creator_gaiao: {
    nameEn: "Gaiao Tennis",
    shortDescriptionEn: "Clear, all-around lessons for beginners building fundamentals",
    bioEn: "Clear, wide-ranging instruction for beginners who want a solid base and a reliable self-study path.",
    suitableForEn: ["Complete beginners", "Building a forehand foundation", "Serve basics"],
    featuredVideos: {
      creator_gaiao_video_01: {
        displayTitleEn: "Detailed beginner forehand lesson",
        targetEn: "When your forehand foundation never feels stable"
      },
      creator_gaiao_video_02: {
        displayTitleEn: "Beginner backhand lesson",
        targetEn: "When the backhand contact never feels solid"
      },
      creator_gaiao_video_03: {
        displayTitleEn: "Footwork drill collection",
        targetEn: "When your first step is always late"
      },
      creator_gaiao_video_04: {
        displayTitleEn: "How to hit a sidespin serve",
        targetEn: "When you cannot create sidespin on the serve"
      },
      creator_gaiao_video_05: {
        displayTitleEn: "How to stop hitting short rally balls",
        targetEn: "When rally balls keep landing short"
      }
    }
  },
  creator_mouratoglou_cn: {
    nameEn: "Coach Mouratoglou",
    shortDescriptionEn: "Pro-level serve framework breakdowns",
    bioEn: "A professional-coach perspective with high-quality technical breakdowns, great for players who want more systematic training logic and stroke structure.",
    suitableForEn: ["Advanced technique structure", "Pro training perspective", "Match execution"],
    featuredVideos: {
      creator_mouratoglou_cn_video_01: {
        displayTitleEn: "Forehand prep: turn earlier before contact",
        targetEn: "When forehand preparation is always late"
      },
      creator_mouratoglou_cn_video_02: {
        displayTitleEn: "Five steps to better volleys",
        targetEn: "When volley details feel messy"
      },
      creator_mouratoglou_cn_video_03: {
        displayTitleEn: "Make the serve flow smoothly, step by step",
        targetEn: "When the serve motion feels jerky"
      },
      creator_mouratoglou_cn_video_04: {
        displayTitleEn: "Open-stance backhand fundamentals",
        targetEn: "When you do not know how to use the open-stance backhand"
      },
      creator_mouratoglou_cn_video_05: {
        displayTitleEn: "Power control: Mouratoglou's golden rule",
        targetEn: "When more effort makes you lose control"
      }
    }
  },
  creator_furao: {
    nameEn: "Fu Rao Tennis",
    shortDescriptionEn: "Technical fixes for contact point and mechanics",
    bioEn: "Detail-driven technique corrections, especially useful for backhand stability, contact point, and footwork problems.",
    suitableForEn: ["Backhands into the net", "Late contact", "Basic stroke corrections"],
    featuredVideos: {
      creator_furao_video_01: {
        displayTitleEn: "Two drills to increase two-handed backhand speed",
        targetEn: "When your two-handed backhand has no pace"
      },
      creator_furao_video_02: {
        displayTitleEn: "Serve speed comes from the wrist, not just the arm",
        targetEn: "When you try to speed up the serve with just the arm"
      },
      creator_furao_video_03: {
        displayTitleEn: "Forehand backswing: do not let it get too big",
        targetEn: "When the forehand take-back keeps growing"
      },
      creator_furao_video_04: {
        displayTitleEn: "Match-play example: 4.5 vs 5.0 rally details",
        targetEn: "When you want to study real match-play details"
      },
      creator_furao_video_05: {
        displayTitleEn: "Vcore racquet review",
        targetEn: "When you want equipment-testing ideas"
      }
    }
  },
  creator_racketbrothers: {
    shortDescriptionEn: "Doubles tactics and match execution",
    bioEn: "Match-play and doubles-oriented instruction, especially useful for volley control, returns, and on-court decision-making.",
    suitableForEn: ["Doubles net play", "Returns under pressure", "Executing match tactics"],
    featuredVideos: {
      creator_racketbrothers_video_01: {
        displayTitleEn: "How to make your volleys more solid",
        targetEn: "When your net volleys keep breaking down"
      },
      creator_racketbrothers_video_02: {
        displayTitleEn: "How to improve the serve and return",
        targetEn: "When your first return ball has low quality"
      },
      creator_racketbrothers_video_03: {
        displayTitleEn: "Doubles match highlights and execution",
        targetEn: "When you want to study doubles match execution"
      },
      creator_racketbrothers_video_04: {
        displayTitleEn: "How to make the slice stay lower",
        targetEn: "When the slice floats instead of staying down"
      },
      creator_racketbrothers_video_05: {
        displayTitleEn: "One-handed backhand and volley connection",
        targetEn: "When the one-hander and volley transition feels messy"
      }
    }
  },
  creator_cn_a: {
    nameEn: "Peien Tennis",
    shortDescriptionEn: "Backhand preparation and footwork basics",
    bioEn: "Breaks down fundamental stroke prep and ready-position habits, a strong fit for recreational players who want to clean up backhand and footwork issues first.",
    suitableForEn: ["Backhand net errors", "Slow preparation"],
    featuredVideos: {
      creator_cn_a_video_01: {
        displayTitleEn: "A simple beginner volley you can actually repeat",
        targetEn: "When your volley motion keeps falling apart"
      },
      creator_cn_a_video_02: {
        displayTitleEn: "One-minute slice serve: three simple steps",
        targetEn: "When you cannot get spin on the slice serve"
      },
      creator_cn_a_video_03: {
        displayTitleEn: "Learn the jumping backhand with Djokovic cues",
        targetEn: "When the jumping backhand never feels natural"
      },
      creator_cn_a_video_04: {
        displayTitleEn: "Five warm-up sequences before you play",
        targetEn: "When you never know how to warm up"
      },
      creator_cn_a_video_05: {
        displayTitleEn: "A simple way to hit the down-the-line ball",
        targetEn: "When you cannot hit a stable down-the-line shot"
      }
    }
  },
  creator_leontv_cn: {
    nameEn: "LeonTV Tennis",
    shortDescriptionEn: "Systematic forehand and backhand fundamentals",
    bioEn: "Structured teaching with clear practice frameworks, good for players who want to organize both groundstrokes, basic rhythm, and match understanding together.",
    suitableForEn: ["Stroke fundamentals", "Forehand and backhand stability", "Practical match understanding"],
    featuredVideos: {
      creator_leontv_cn_video_01: {
        displayTitleEn: "Three steps to a better split step",
        targetEn: "When the split step is always half a beat late"
      },
      creator_leontv_cn_video_02: {
        displayTitleEn: "Three steps to more stable forehand power",
        targetEn: "When forehand power comes mostly from the arm"
      },
      creator_leontv_cn_video_03: {
        displayTitleEn: "Flat topspin vs heavy topspin on the forehand",
        targetEn: "When you cannot create enough topspin arc"
      },
      creator_leontv_cn_video_04: {
        displayTitleEn: "A complete return-of-serve lesson",
        targetEn: "When returns keep getting pinned back"
      },
      creator_leontv_cn_video_05: {
        displayTitleEn: "Three recurring footwork mistakes in recreational tennis",
        targetEn: "When the same footwork errors keep showing up"
      }
    }
  },
  creator_james: {
    nameEn: "Prince James",
    shortDescriptionEn: "All-around improvement for 3.0 to 3.5 players",
    bioEn: "A recreational-player perspective on mechanics and decision-making, helpful when you want cleaner fundamentals plus better on-court understanding.",
    suitableForEn: ["2.5 to 4.0 players", "Basic stroke framework", "Match understanding"]
  },
  creator_liuliu: {
    nameEn: "Liuliu Tennis",
    shortDescriptionEn: "Beginner-friendly footwork and consistency",
    bioEn: "Focused on basic practice organization and steadier footwork, a good fit for beginners who want more structured sessions.",
    suitableForEn: ["Solo practice structure", "Footwork basics", "Consistency"]
  },
  creator_pikachu: {
    nameEn: "Pikachu Tennis",
    shortDescriptionEn: "Relatable practice logs and real-play examples",
    bioEn: "Real-player practice and match recordings that help recreational players learn from believable sessions and small improvements.",
    suitableForEn: ["Practice ideas", "Match feel", "Beginner improvement"]
  },
  creator_matsuo_yuki_cn: {
    nameEn: "Yuki Matsuo Pro",
    shortDescriptionEn: "Advanced technique details and corrections",
    bioEn: "Professional-player and coach-level breakdowns for players who want more refined technical detail.",
    suitableForEn: ["Advanced technique details", "Forehand and backhand corrections", "Serve structure"]
  },
  creator_austin_camp: {
    nameEn: "Austin Tennis Camp",
    shortDescriptionEn: "Serve basics and structured training",
    bioEn: "Camp-style content and drill design, useful for linking serve basics, footwork, and session structure.",
    suitableForEn: ["Training plans", "Serve basics", "Footwork drills"]
  },
  creator_yexiu_gege: {
    nameEn: "Yexiu Tennis",
    shortDescriptionEn: "Self-practice structure for everyday players",
    bioEn: "Organized, from-zero practice lessons for players who want a clearer framework for footwork, net play, and daily sessions.",
    suitableForEn: ["Solo practice structure", "Footwork and setup", "Training plans"]
  },
  creator_sara_airehan: {
    nameEn: "Sara Tennis",
    shortDescriptionEn: "Former-pro perspective on serve and footwork",
    bioEn: "A former-pro perspective on serving, warm-up, and footwork, especially helpful for players who want cleaner sequencing and better movement feel.",
    suitableForEn: ["Serve basics", "Footwork drills", "Warm-up follow-alongs"]
  },
  creator_braden_tennis_academy: {
    nameEn: "Braden Tennis Academy",
    shortDescriptionEn: "Grip, spacing, and power explained clearly",
    bioEn: "Detailed breakdowns of grip, court positioning, power generation, and strike mechanics, strong for rebuilding fundamentals.",
    suitableForEn: ["Grip reset", "Basic positioning", "Understanding power generation"]
  },
  creator_topspin_zhixuan: {
    nameEn: "TOPSPIN Tennis",
    shortDescriptionEn: "Camp-style footwork and serve systems",
    bioEn: "Original drill-based content around footwork, wall training, serve organization, and one-handed backhand progressions, useful for players building practice structure.",
    suitableForEn: ["Footwork training", "One-handed backhand progressions", "Serve organization"]
  },
  creator_yang_xiaohan: {
    nameEn: "Xiaohan Tennis",
    shortDescriptionEn: "Demonstration-led forehand, backhand, and volley lessons",
    bioEn: "A former provincial-team background with demonstration-heavy teaching, helpful for players who learn best by watching real mechanics.",
    suitableForEn: ["Forehand topspin", "Backhand basics", "Volleys at net"]
  },
  creator_bugu_tennis: {
    nameEn: "Bugu Tennis",
    shortDescriptionEn: "Patient explanations from beginner to intermediate",
    bioEn: "Original, step-by-step explanations with an emphasis on spacing, balance, and foundational technique for players building slowly.",
    suitableForEn: ["Hitting position", "Beginner-to-intermediate progress", "Rhythm building"]
  },
  creator_wangdong_tennis: {
    nameEn: "Wangdong Tennis",
    shortDescriptionEn: "Power-chain and training-list style lessons",
    bioEn: "A coaching-team account focused on forehand power chains, topspin basics, ball tracking, and at-home training ideas, useful as a practice checklist and review tool.",
    suitableForEn: ["Forehand power chain", "At-home training", "Topspin basics"]
  },
  creator_yin_coach_tennis: {
    nameEn: "Coach Yin Tennis",
    shortDescriptionEn: "Training methods and youth-court coaching",
    bioEn: "More about junior training, physical preparation, and coaching methods. Stable direct teaching videos are limited for now, but the account is still useful on the rankings page.",
    suitableForEn: ["Junior training", "Training methods", "Lesson review"]
  },
  creator_yi_laoshi_sport: {
    nameEn: "Coach Yi Tennis",
    shortDescriptionEn: "Short, fast fixes for common technique errors",
    bioEn: "One-minute corrections, quick tips, and serve details. Stable direct teaching videos are limited for now, but the account is still worth surfacing in rankings.",
    suitableForEn: ["Quick corrections", "Serve tips", "Footwork details"]
  },
  creator_qingying_tennis: {
    nameEn: "Qingying Tennis",
    shortDescriptionEn: "A Chinese-subtitled teaching library with strong fundamentals",
    bioEn: "Primarily curates Chinese-subtitled versions of strong overseas tennis instruction. It is not an original Chinese teaching channel, but it is very practical as a learning library.",
    suitableForEn: ["Chinese-subtitled lessons", "Fundamentals", "Serve and forehand basics"]
  },
  creator_weiwei_tennis: {
    nameEn: "Weiwei Tennis",
    shortDescriptionEn: "Subtitled teaching focused on serve and contact point",
    bioEn: "Curates high-quality overseas lessons with Chinese subtitles, especially around contact point, serve, and backhand technique.",
    suitableForEn: ["Chinese-subtitled lessons", "Contact-point improvement", "Serve and backhand"]
  },
  creator_mt_tennis_cn: {
    nameEn: "MT Tennis",
    shortDescriptionEn: "Slow motion and subtitled model-based study",
    bioEn: "Uses Chinese-subtitled overseas teaching plus slow-motion breakdowns, useful for studying forehand power and technical models.",
    suitableForEn: ["Slow-motion study", "Chinese-subtitled library", "Technique model analysis"]
  },
  creator_mouratoglou_official: {
    nameZh: "莫拉托格鲁教练",
    shortDescriptionEn: "World-class coach breakdowns on serve and tactics",
    bioEn: "Systematic coaching from one of the top coaches in professional tennis, covering serve mechanics, match strategy, and shot selection.",
    suitableForEn: ["Serve mechanics", "Match tactics", "Advanced technique"]
  },
  creator_venus_williams: {
    nameZh: "维纳斯·威廉姆斯",
    shortDescriptionEn: "Pro player insights on match mentality",
    bioEn: "A Grand Slam champion sharing first-hand experience on competition mindset, shot selection, and what it takes to compete at a high level.",
    suitableForEn: ["Match mentality", "Pro perspective", "Serve and power"]
  },
  creator_tennis_with_dylan: {
    nameZh: "迪伦网球",
    shortDescriptionEn: "Serve, footwork, and live drill sessions",
    bioEn: "Energetic drills and footwork-focused practice sessions, useful for players who want to sharpen movement and serve rhythm.",
    suitableForEn: ["Footwork drills", "Serve rhythm", "Live practice"]
  },
  creator_top_tennis_training: {
    nameZh: "顶级网球训练",
    shortDescriptionEn: "Structured forehand and backhand lessons",
    bioEn: "Methodical groundstroke instruction covering forehand and backhand fundamentals with clear progressions.",
    suitableForEn: ["Forehand fundamentals", "Backhand stability", "Clear progressions"]
  },
  creator_essential_tennis: {
    nameZh: "Essential网球",
    shortDescriptionEn: "Rally depth and match strategy for club players",
    bioEn: "Strategy-first teaching focused on rally consistency, court positioning, and smart shot selection for recreational competitors.",
    suitableForEn: ["Rally depth", "Court positioning", "Match strategy"]
  },
  creator_online_tennis_instruction: {
    nameZh: "在线网球教学",
    shortDescriptionEn: "Long-form technique rebuilds and frameworks",
    bioEn: "In-depth stroke reconstruction lessons for players who want to rebuild their technique from the ground up.",
    suitableForEn: ["Technique rebuild", "Serve framework", "Stroke structure"]
  },
  creator_performance_plus_tennis: {
    nameZh: "进阶网球训练",
    shortDescriptionEn: "Movement corrections and stroke adjustments",
    bioEn: "Detail-oriented coaching focused on fixing movement patterns and refining stroke mechanics.",
    suitableForEn: ["Movement fixes", "Stroke refinement", "Footwork basics"]
  },
  creator_karue_sell: {
    nameZh: "卡鲁·塞尔",
    shortDescriptionEn: "Modern strokes and live match details",
    bioEn: "A modern-game perspective with insights on shot shaping, timing, and real match execution.",
    suitableForEn: ["Modern technique", "Forehand power", "Match execution"]
  },
  creator_intuitive_tennis: {
    nameZh: "直觉网球",
    shortDescriptionEn: "Real student corrections at the 4.0–4.5 level",
    bioEn: "On-court lesson recordings showing real-time corrections for intermediate to advanced recreational players.",
    suitableForEn: ["Live corrections", "Backhand fixes", "4.0+ improvement"]
  },
  creator_tennis_evolution: {
    nameZh: "网球进化",
    shortDescriptionEn: "Beginner-friendly stroke rebuilds",
    bioEn: "Step-by-step fundamentals for players who want to rebuild their strokes with a clean, repeatable framework.",
    suitableForEn: ["Stroke rebuild", "Beginner fundamentals", "Clean technique"]
  },
  creator_time_value_of_tennis: {
    nameZh: "网球时间价值",
    shortDescriptionEn: "Technical detail paired with match IQ",
    bioEn: "Balances fine-grained technique with tactical understanding, useful for players who want both cleaner strokes and smarter play.",
    suitableForEn: ["Technique + tactics", "Advanced detail", "Match understanding"]
  },
  creator_the_tennis_mentor: {
    nameZh: "网球导师",
    shortDescriptionEn: "Solid fundamentals and training logic",
    bioEn: "Clear, well-structured lessons on basic mechanics and practice organization for recreational players.",
    suitableForEn: ["Fundamentals", "Practice structure", "Training logic"]
  },
  creator_2minute_tennis: {
    nameZh: "两分钟网球",
    shortDescriptionEn: "Quick, precise tips on match-play details",
    bioEn: "Short, high-density videos that zero in on specific technique points and match situations.",
    suitableForEn: ["Quick tips", "Match-play details", "Forehand fixes"]
  },
  creator_feel_tennis_instruction: {
    nameZh: "感觉网球",
    shortDescriptionEn: "Deep, thorough technique breakdowns",
    bioEn: "Detailed stroke analysis that goes beyond the surface, useful for players who want to truly understand why a technique works.",
    suitableForEn: ["Deep technique", "Stroke analysis", "Advanced detail"]
  },
  creator_total_tennis_domination: {
    nameZh: "全面制胜网球",
    shortDescriptionEn: "Power generation and match connections",
    bioEn: "Focused on how to generate power efficiently and connect technique to real match situations.",
    suitableForEn: ["Power generation", "Match application", "Advanced technique"]
  },
  creator_fuzzy_yellow_balls: {
    nameZh: "毛绒黄球",
    shortDescriptionEn: "Sharp match breakdowns with tactical depth",
    bioEn: "Pro match analysis with clear explanations of tactics, patterns, and decision-making at the highest level.",
    suitableForEn: ["Match analysis", "Tactical patterns", "Strategy insights"]
  },
  creator_daily_tennis_lesson: {
    nameZh: "每日网球课",
    shortDescriptionEn: "Systematic basics organized by topic",
    bioEn: "Well-organized lessons covering fundamental strokes topic by topic, good for building a solid base.",
    suitableForEn: ["Organized basics", "Topic-based learning", "Beginner-friendly"]
  },
  creator_tennis_hacker: {
    nameZh: "网球黑客",
    shortDescriptionEn: "Adult player perspective with direct fixes",
    bioEn: "A recreational player's coaching perspective with practical, no-nonsense corrections.",
    suitableForEn: ["Adult learners", "Direct corrections", "Practical fixes"]
  },
  creator_meike_babel_tennis: {
    nameZh: "迈克·巴贝尔网球",
    shortDescriptionEn: "Match patterns and doubles strategy",
    bioEn: "Detailed match-pattern breakdowns and doubles tactics from a coaching perspective.",
    suitableForEn: ["Match patterns", "Doubles strategy", "Advanced play"]
  },
  creator_racquetflex: {
    nameZh: "球拍力学",
    shortDescriptionEn: "Serve and stroke mechanics explained in depth",
    bioEn: "Physics-informed breakdowns of serve mechanics and hitting principles.",
    suitableForEn: ["Serve mechanics", "Stroke physics", "Detailed analysis"]
  },
  creator_tpa_tennis: {
    nameZh: "TPA网球",
    shortDescriptionEn: "Practical modern forehand and serve lessons",
    bioEn: "Practical instruction on modern forehand technique and serve development.",
    suitableForEn: ["Modern forehand", "Serve development", "Practical tips"]
  },
  creator_edgar_giffenig_tennis: {
    nameZh: "埃德加网球教学",
    shortDescriptionEn: "Tactics and fundamentals explained clearly",
    bioEn: "Coaching-focused content that ties tactics to fundamentals with clear, structured explanations.",
    suitableForEn: ["Tactics", "Fundamentals", "Structured coaching"]
  },
  creator_patrick_smith_tennis_coaching: {
    nameZh: "帕特里克教练",
    shortDescriptionEn: "Doubles timing and shot selection insights",
    bioEn: "Useful doubles coaching on timing, positioning, and shot selection.",
    suitableForEn: ["Doubles coaching", "Timing", "Shot selection"]
  },
  creator_one_minute_tennis: {
    nameZh: "一分钟网球",
    shortDescriptionEn: "Dense short videos on specific technique points",
    bioEn: "Bite-sized videos that each target one specific technique detail or footwork issue.",
    suitableForEn: ["Short format", "Specific fixes", "Footwork details"]
  },
  creator_your_online_tennis_coach: {
    nameZh: "你的网球教练",
    shortDescriptionEn: "Timing, vision, and volley details explained well",
    bioEn: "Focused on timing, ball tracking, and volley mechanics with clear explanations.",
    suitableForEn: ["Timing", "Ball tracking", "Volley mechanics"]
  },
  creator_crunch_time_coaching: {
    nameZh: "关键时刻教练",
    shortDescriptionEn: "Real lesson footage with serve and forehand focus",
    bioEn: "On-court lesson recordings emphasizing serve and forehand development.",
    suitableForEn: ["Lesson footage", "Serve focus", "Forehand development"]
  }
};
