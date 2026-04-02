import { DiagnosisRule, DiagnosisSearchQueries } from "@/types/diagnosis";

const searchQueriesByRule = {
  rule_backhand_net: {
    bilibili: ["是佩恩呀 反手 下网 网球", "网球工匠付饶 反手 下网", "反手击球点 拍面控制 网球"],
    youtube: ["tennis backhand into net fix", "backhand contact point correction tennis", "backhand net error drill"]
  },
  rule_forehand_out: {
    bilibili: ["盖奥网球 正手 出界 上旋", "网球工匠付饶 正手 弧线 网球", "正手出界 上旋 控制 网球"],
    youtube: ["tennis forehand going long fix", "forehand topspin technique tennis", "forehand out control drill"]
  },
  rule_second_serve_confidence: {
    bilibili: ["盖奥网球 二发 稳定性", "冠军教练-莫拉托格鲁 二发 网球", "二发没信心 发球稳定性 网球"],
    youtube: ["tennis second serve confidence", "reliable second serve drill", "beginner second serve technique"]
  },
  rule_serve_toss: {
    bilibili: ["发球抛球 不稳 纠正 网球", "冠军教练-莫拉托格鲁 发球 抛球", "盖奥网球 抛球 教学"],
    youtube: ["tennis serve toss fix", "serve toss consistency drill", "tennis toss placement lesson"]
  },
  rule_serve_timing: {
    bilibili: ["发球 节奏 时机 网球", "发球 动作 节奏 控制", "发球 timing 训练"],
    youtube: ["tennis serve rhythm timing", "serve timing drills", "how to improve serve timing"]
  },
  rule_late_contact: {
    bilibili: ["是佩恩呀 击球点 晚 网球", "准备慢 击球点偏晚 纠正", "分腿垫步 提前准备 网球"],
    youtube: ["tennis late contact point fix", "early preparation tennis", "tennis timing drill"]
  },
  rule_net_errors: {
    bilibili: ["网球截击 动作太大 纠正", "网前截击 基础 教学", "双打网前 截击 稳定性"],
    youtube: ["tennis volley technique beginner", "compact volley drill", "net play basics tennis"]
  },
  rule_volley_floating: {
    bilibili: ["网球截击 冒高 纠正", "双打网前 截击 飘起来", "网前截击 拍面控制 网球"],
    youtube: ["tennis volley floating fix", "keep volleys low tennis", "volley racquet face control"]
  },
  rule_volley_into_net: {
    bilibili: ["网球截击 下网 纠正", "网前截击 老下网 网球", "双打网前 截击 过网 训练"],
    youtube: ["tennis volley into net fix", "net clearance volley drill", "compact volley contact tennis"]
  },
  rule_overhead_timing: {
    bilibili: ["网球高压 时机 纠正", "杀高球 总打不到点 网球", "高压球 步法 节奏 网球"],
    youtube: ["tennis overhead timing fix", "overhead footwork tennis", "smash timing drill"]
  },
  rule_match_anxiety: {
    bilibili: ["网球比赛紧张 怎么办", "比赛心态 调整 网球", "比赛失误多 心态 网球"],
    youtube: ["tennis match nerves tips", "how to stay calm tennis match", "tennis mental game beginner"]
  },
  rule_pressure_tightness: {
    bilibili: ["网球 关键分 手紧 怎么办", "比赛压力下 动作变形 网球", "网球 关键球 执行 心态"],
    youtube: ["tennis tight under pressure", "tennis key point nerves", "how to stay loose tennis match"]
  },
  rule_forehand_no_power: {
    bilibili: ["正手没力量 发力链 网球", "盖奥网球 正手 发力", "正手转体发力 教学 网球"],
    youtube: ["tennis forehand power technique", "forehand kinetic chain tennis", "generate power forehand"]
  },
  rule_running_forehand: {
    bilibili: ["跑动中正手 网球", "正手 跑动击球 训练", "移动中正手 击球点 网球"],
    youtube: ["running forehand tennis fix", "open stance running forehand drill", "tennis wide forehand movement"]
  },
  rule_running_backhand: {
    bilibili: ["跑动中反手 网球", "反手 跑动击球 训练", "移动中反手 击球点 网球"],
    youtube: ["running backhand tennis fix", "wide backhand recovery tennis", "tennis running backhand drill"]
  },
  rule_balls_too_short: {
    bilibili: ["网球打不深 怎么办", "击球深度 训练 网球", "网球 稳定性 打深 底线 深度"],
    youtube: ["tennis hit deeper shots", "depth control tennis drill", "how to stop hitting short tennis"]
  },
  rule_rally_consistency: {
    bilibili: ["网球 多拍 对拉 稳定性", "网球 相持 稳定 训练", "网球 对拉 失误 减少"],
    youtube: ["tennis rally consistency drill", "baseline rally control tennis", "reduce rally errors tennis"]
  },
  rule_return_under_pressure: {
    bilibili: ["网球 接发球 站位 准备", "接发球被压制 怎么办", "接发回深 训练 网球"],
    youtube: ["tennis return of serve tips", "return position beginner tennis", "deep return drill tennis"]
  },
  rule_slice_too_high: {
    bilibili: ["反手切削 飘起来 纠正", "切削拍面控制 网球", "切削送不低 教学 网球"],
    youtube: ["tennis slice backhand fix", "slice floats tennis correction", "backhand slice control drill"]
  },
  rule_topspin_low: {
    bilibili: ["正手上旋 怎么打 网球", "盖奥网球 正手 上旋", "正手弧线不够 纠正 网球"],
    youtube: ["tennis forehand topspin technique", "how to hit topspin forehand", "forehand spin drill"]
  },
  rule_serve_accuracy: {
    bilibili: ["发球发不进 纠正 网球", "发球进区率 训练", "发球落点控制 教学 网球"],
    youtube: ["tennis serve accuracy drill", "serve consistency targets tennis", "how to improve serve placement"]
  },
  rule_first_serve_in: {
    bilibili: ["一发总发不进 网球", "第一发 进区率 训练 网球", "网球 一发 稳定性"],
    youtube: ["first serve percentage tennis", "tennis first serve consistency", "first serve in drill tennis"]
  },
  rule_movement_slow: {
    bilibili: ["六六网球 脚步 训练", "分腿垫步 教学 网球", "网球移动 基础 训练"],
    youtube: ["tennis footwork drill beginner", "split step timing tennis", "tennis movement training"]
  },
  rule_mobility_limit: {
    bilibili: ["网球 跑不动 怎么办", "移动范围 受限 网球", "年纪大了 网球 移动"],
    youtube: ["tennis mobility limitations", "tennis movement for older players", "court coverage mobility tennis"]
  },
  rule_stamina_drop: {
    bilibili: ["网球 体能下降 后面打不动", "打到后面 失误变多 网球", "网球 体能 训练 基础"],
    youtube: ["tennis stamina drop late in matches", "tennis conditioning basics", "stay fresh longer tennis"]
  },
  rule_doubles_positioning: {
    bilibili: ["双打站位 基础 网球", "双打轮转 配合 教学", "一前一后 站位 网球"],
    youtube: ["tennis doubles positioning basics", "doubles formation beginner", "doubles net play position"]
  },
  rule_trouble_with_slice: {
    bilibili: ["是佩恩呀 下旋 来球 网球", "低球处理 教学 网球", "对方切球 怎么接 网球"],
    youtube: ["how to hit against slice tennis", "tennis handle slice return", "low ball tennis technique"]
  },
  rule_moonball_trouble: {
    bilibili: ["月亮球 不好打 网球", "高吊球 处理 网球", "月亮球 反手 别扭 网球"],
    youtube: ["tennis moonball trouble", "high ball timing tennis", "how to handle moonballs tennis"]
  },
  rule_cant_hit_lob: {
    bilibili: ["网球高球 怎么打", "防守高球 教学 网球", "挑高球 训练 网球"],
    youtube: ["tennis defensive lob technique", "how to hit a lob tennis", "lob shot drill beginner"]
  }
} satisfies Record<string, DiagnosisSearchQueries>;

export const diagnosisRules: DiagnosisRule[] = [
  {
    id: "rule_backhand_net",
    keywords: ["反手", "下网", "backhand", "net"],
    synonyms: ["反手打不过网", "反手老挂网", "反手一加力就下网", "反手总下网", "反手过不了网", "backhand into the net", "my backhand keeps going into the net", "my backhand cannot clear the net", "backhand keeps dropping into the net"],
    category: ["backhand", "consistency"],
    problemTag: "backhand-into-net",
    causes: ["准备偏慢，击球点落在身体后侧", "拍面控制不稳定，向前送拍不足", "想发力但动作框架没有立住"],
    causes_en: ["Late preparation — contact point drops behind the body", "Racquet face is unstable, not enough forward extension", "Trying to hit hard before the swing frame is solid"],
    fixes: ["更早转肩，提前准备", "把击球点放到身体前侧", "先追求稳定过网，再谈发力"],
    fixes_en: ["Turn the shoulders earlier to prepare in time", "Move the contact point in front of the body", "Prioritize consistently clearing the net before adding power"],
    drills: ["影子挥拍 20 次，重点感受前点击球", "慢节奏喂球反手直线 30 球", "两点移动后反手过网练习 20 球"],
    drills_en: ["20 shadow swings — focus on hitting out front", "30 slow-feed backhand down-the-line shots", "20 two-point movement drills followed by backhand clearance"],
    recommendedContentIds: ["content_fr_01", "content_cn_a_01", "content_gaiao_03"],
    searchQueries: searchQueriesByRule.rule_backhand_net,
    fallbackLevel: ["3.0", "3.5"],
    environment: ["testing", "production"]
  },
  {
    id: "rule_forehand_out",
    keywords: ["正手", "出界", "forehand", "long"],
    synonyms: ["正手老飞", "一发力就飞", "正手没有弧线", "正手总出底线", "正手一抡就飞", "forehand long", "my forehand keeps flying long", "my forehand keeps going out", "my forehand goes long when I swing harder"],
    category: ["forehand", "control"],
    problemTag: "forehand-out",
    causes: ["挥拍路径太平，缺少上旋", "击球点控制不稳，拍面偏开", "身体发力顺序混乱"],
    causes_en: ["Swing path is too flat — not enough topspin", "Contact point is unstable, racquet face opens up", "Body rotation and power sequence are out of order"],
    fixes: ["先增加上旋弧线", "降低一次击球的发力欲望", "先保证稳定过网，再逐步加速"],
    fixes_en: ["Add more topspin arc first", "Dial back the power intent on each shot", "Get consistent clearance first, then gradually add speed"],
    drills: ["正手对拉 30 球，只求高过网", "定点正手上旋练习 20 球", "正手落点控制在底线前 1 米区域"],
    drills_en: ["30 forehand rallies — just aim high over the net", "20 fixed-target forehand topspin shots", "20 forehands landing 1 metre inside the baseline"],
    recommendedContentIds: ["content_cn_d_01", "content_cn_d_03", "content_gaiao_01"],
    searchQueries: searchQueriesByRule.rule_forehand_out,
    fallbackLevel: ["3.0", "3.5", "4.0"],
    environment: ["testing", "production"]
  },
  {
    id: "rule_second_serve_confidence",
    keywords: ["二发", "没信心", "second serve", "confidence"],
    synonyms: ["二发老双误", "二发不敢发", "第二发总想保守一推", "第二发没有底气", "二发一紧张就推球", "second serve double fault", "I do not trust my second serve", "I am scared to hit my second serve", "my second serve keeps double faulting"],
    category: ["serve", "confidence"],
    problemTag: "second-serve-reliability",
    causes: ["只想发快，没有建立稳定节奏", "抛球位置不稳定", "没有先建立安全弧线意识"],
    causes_en: ["Only thinking about speed, no stable rhythm established", "Toss location is inconsistent", "No awareness of building a safe arc first"],
    fixes: ["先建立节奏感，再加力量", "先练稳定抛球和完整动作", "先接受安全二发，不急着追求球速"],
    fixes_en: ["Build rhythm first, then add pace", "Practice a stable toss and full motion first", "Accept a safe second serve — speed can come later"],
    drills: ["抛球 30 次，不击球", "半动作发球 20 次，找上旋感", "二区安全二发 20 球，目标先全部进"],
    drills_en: ["30 toss-only reps — no hitting", "20 half-motion serves — find the spin feel", "20 safe second serves into the ad court — goal: 100% in"],
    recommendedContentIds: ["content_gaiao_02", "content_zlx_01", "content_zlx_02"],
    searchQueries: searchQueriesByRule.rule_second_serve_confidence,
    fallbackLevel: ["3.0", "3.5"],
    environment: ["testing", "production"]
  },
  {
    id: "rule_first_serve_in",
    keywords: ["一发", "发不进", "first_serve"],
    synonyms: ["一发总发不进", "第一发进区率太低", "第一发老失误", "first serve will not go in", "my first serve keeps missing", "I cannot land my first serve"],
    category: ["serve", "control"],
    problemTag: "first-serve-in",
    causes: ["一发发力意图过满", "抛球和挥拍节奏不一致", "没有先建立安全进区基准"],
    causes_en: ["Trying to hit the first serve too hard", "Toss timing and swing rhythm are out of sync", "No safe first-serve make-rate baseline yet"],
    fixes: ["先把一发降到七成力量", "先固定抛球和挥拍节奏", "先记录可重复的一发进区率"],
    fixes_en: ["Dial the first serve back to about 70% effort", "Lock in the toss and swing rhythm first", "Track a repeatable first-serve make rate before chasing pace"],
    drills: ["一区一发 20 球", "二区一发 20 球", "只记录进区率"],
    drills_en: ["20 first serves to the deuce court", "20 first serves to the ad court", "Track only the make rate"],
    recommendedContentIds: ["content_gaiao_02", "content_ttt_01", "content_zlx_01"],
    searchQueries: searchQueriesByRule.rule_first_serve_in,
    fallbackLevel: ["3.0", "3.5", "4.0"],
    environment: ["testing", "production"]
  },
  {
    id: "rule_serve_toss",
    keywords: ["抛球", "扔球", "扔不准", "serve toss", "toss"],
    synonyms: ["抛球老歪", "发球抛球不稳", "一抛球就乱", "抛球忽前忽后", "抛球老偏左", "发球老是扔不准球", "serve toss inconsistent", "my serve toss is all over the place", "I cannot toss the ball consistently on serve", "my toss keeps drifting around"],
    category: ["serve", "toss"],
    problemTag: "serve-toss-consistency",
    causes: ["抛球手臂路径不固定", "出手点不一致", "抛球前站姿和节奏变化太大"],
    causes_en: ["Tossing arm path is not consistent", "Release point varies each time", "Stance and rhythm change too much before the toss"],
    fixes: ["先单独练抛球动作", "站姿固定后再抛", "每次抛球后停住观察落点"],
    fixes_en: ["Practice the toss motion in isolation", "Set your stance before tossing", "Pause after each toss and check where it lands"],
    drills: ["不击球抛球 30 次", "抛球后接球并记录落点 20 次", "抛球+空挥 15 次"],
    drills_en: ["30 toss-only reps — no hitting", "20 toss-and-catch reps — note where each one falls", "15 toss-plus-shadow-swing reps"],
    recommendedContentIds: ["content_gaiao_02", "content_zlx_01", "content_ttt_01"],
    searchQueries: searchQueriesByRule.rule_serve_toss,
    fallbackLevel: ["3.0", "3.5"],
    environment: ["testing", "production"]
  },
  {
    id: "rule_rally_consistency",
    keywords: ["多拍", "回合", "对拉", "相持", "rally"],
    synonyms: ["多拍回合不稳定", "多拍对拉不稳定", "相持稳定性差", "对拉超过 5 拍就失误", "多拍一多就散", "my rally breaks down after a few shots", "my baseline rally is unstable", "I cannot keep rally consistency", "I miss too much in longer rallies"],
    category: ["consistency", "rally"],
    problemTag: "rally-consistency",
    causes: ["击球节奏前后不一致，越打越急", "落点和弧线目标不稳定，回合中容易追求过快", "准备动作和回位衔接断档，导致连续球质量下滑"],
    causes_en: ["Shot rhythm changes from ball to ball and speeds up too early", "Depth and arc targets drift during longer exchanges", "Preparation and recovery links break down across consecutive balls"],
    fixes: ["先把对拉目标设成中路深区，先稳住 6 拍以上", "每拍前只保留一个节奏口令，不急着发力", "失误后先复位脚步和击球点，再继续回合"],
    fixes_en: ["Set the rally target to deep middle and stabilize 6+ balls first", "Use one rhythm cue before each ball instead of forcing pace", "After an error, reset footwork and contact point before continuing"],
    drills: ["中路对拉 6 拍起步 12 组", "正反手交替相持 20 球，只记深度", "失误后复位再启动 10 组"],
    drills_en: ["12 sets starting from 6-ball middle rallies", "20 alternating forehand-backhand rally balls tracking depth only", "10 error-reset-restart sequences"],
    recommendedContentIds: ["content_fr_02", "content_fr_03", "content_fr_01"],
    searchQueries: searchQueriesByRule.rule_rally_consistency,
    fallbackLevel: ["3.0", "3.5", "4.0"],
    environment: ["testing", "production"]
  },
  {
    id: "rule_serve_timing",
    keywords: ["发球", "节奏", "时机", "serve", "timing", "rhythm"],
    synonyms: ["发球节奏总断", "发球时机不稳", "发球动作衔接不顺", "my serve timing is off", "my serve rhythm breaks down", "I mistime my serve"],
    category: ["serve", "timing"],
    problemTag: "serve-timing",
    causes: ["抛球、引拍和发力节奏脱节", "发力意图过强导致时机乱", "缺少可重复的发球节奏口令"],
    causes_en: ["Toss, take-back, and acceleration are out of sync", "Power intent is too high and breaks timing", "No repeatable serve-rhythm cue"],
    fixes: ["先把动作节奏放慢并固定顺序", "先保证可重复触球时机再加速", "每次发球只保留一个节奏提醒词"],
    fixes_en: ["Slow down and lock in the sequence first", "Stabilize contact timing before adding pace", "Use one rhythm cue before each serve"],
    drills: ["发球节奏分段练习 15 组", "抛球到击球点时机练习 20 次", "一区二区交替节奏发球各 12 球"],
    drills_en: ["15 segmented serve-rhythm reps", "20 toss-to-contact timing reps", "12 alternating deuce/ad rhythm serves"],
    recommendedContentIds: [
      "content_expanded_youtube_creator_tenniswithtyler_zxizdcpkhbg",
      "content_expanded_youtube_creator_the_game_of_tennis_0l6vuf46vj0",
      "content_expanded_youtube_creator_the_game_of_tennis_bff2emdrhmk",
      "content_gaiao_02",
      "content_zlx_01"
    ],
    environment: ["testing", "production"],
    searchQueries: searchQueriesByRule.rule_serve_timing,
    fallbackLevel: ["3.0", "3.5", "4.0"]
  },
  {
    id: "rule_late_contact",
    keywords: ["来不及", "准备慢", "击球点晚", "late contact", "late preparation"],
    synonyms: ["总慢半拍", "总被球顶住", "来球一快就没了", "击球总在身后", "老是晚一点才碰到球", "late contact", "I keep contacting the ball late", "the ball keeps getting on top of me", "I feel rushed on every shot"],
    category: ["timing", "movement"],
    problemTag: "late-contact",
    causes: ["分腿垫步时机不对", "转肩和引拍开始太晚", "脚步没有先到位"],
    causes_en: ["Split step timing is off", "Shoulder turn and take-back start too late", "Feet are not getting into position first"],
    fixes: ["先做更早的准备动作", "把注意力从挥拍改到到位", "先缩小动作，提升节奏匹配"],
    fixes_en: ["Start preparing earlier", "Shift focus from the swing to getting in position", "Shorten the motion to match the pace of play"],
    drills: ["分腿垫步 + 侧身准备 20 组", "喂球后只做准备不击球 15 次", "小碎步找位后击球 20 球"],
    drills_en: ["20 split-step + turn-and-set drills", "15 feed-and-prepare reps — no hitting, just set up", "20 small-step positioning drills followed by a hit"],
    recommendedContentIds: ["content_fr_02", "content_cn_a_02", "content_cn_c_02"],
    searchQueries: searchQueriesByRule.rule_late_contact,
    fallbackLevel: ["3.0", "3.5"],
    environment: ["testing", "production"]
  },
  {
    id: "rule_net_errors",
    keywords: ["网前", "失误", "截击", "volley", "net play"],
    synonyms: ["截击老丢", "网前一紧张就乱", "双打网前很怕", "volley errors", "I keep missing volleys", "I panic at the net", "net play feels shaky"],
    category: ["net", "confidence"],
    problemTag: "net-confidence",
    causes: ["站位过于僵硬", "拍头控制不稳定", "以大挥拍方式去打截击"],
    causes_en: ["Positioning is too stiff", "Racquet head control is not steady", "Using a full swing instead of a compact volley motion"],
    fixes: ["缩小动作，先学会挡和送", "拍头保持稳定在身体前方", "先练简单高成功率截击"],
    fixes_en: ["Keep the motion small — learn to block and push first", "Keep the racquet head steady in front of the body", "Start with simple, high-percentage volleys"],
    drills: ["近网挡球 20 次", "正反手截击各 15 球", "双打网前反应练习 10 组"],
    drills_en: ["20 close-up block volleys", "15 forehand volleys + 15 backhand volleys", "10 doubles net reaction drills"],
    recommendedContentIds: ["content_rb_01", "content_cn_b_01", "content_cn_b_03"],
    searchQueries: searchQueriesByRule.rule_net_errors,
    fallbackLevel: ["3.0", "3.5"],
    environment: ["testing", "production"]
  },
  {
    id: "rule_volley_floating",
    keywords: ["截击", "冒高", "volley", "floating"],
    synonyms: ["网前截击老冒高", "双打时网前截击老冒高", "截击总飘", "volley keeps floating", "my volley keeps floating in doubles", "I cannot keep my volleys down"],
    category: ["net", "control"],
    problemTag: "volley-floating",
    causes: ["拍面太开，挡球时托球过多", "截击触球点偏低偏后", "网前动作不够紧凑稳定"],
    causes_en: ["Racquet face opens up too much on contact", "Volley contact stays too low and too far back", "The net-play motion is not compact or stable enough"],
    fixes: ["先把拍面立住，不要托球", "截击触球点放在身体前侧", "先用小动作把球送深送低"],
    fixes_en: ["Keep the racquet face steadier instead of lifting the ball", "Make volley contact farther in front", "Use a compact motion to punch the ball low and deep"],
    drills: ["近网挡球 20 次", "正反手截击各 15 球", "双打网前低平截击 10 组"],
    drills_en: ["20 short-court block volleys", "15 forehand and 15 backhand volleys", "10 doubles net drills focused on keeping the volley low"],
    recommendedContentIds: ["content_rb_01", "content_cn_b_01", "content_cn_b_03"],
    searchQueries: searchQueriesByRule.rule_volley_floating,
    fallbackLevel: ["3.0", "3.5"],
    environment: ["testing", "production"]
  },
  {
    id: "rule_volley_into_net",
    keywords: ["截击", "下网", "volley", "net"],
    synonyms: ["网前截击总下网", "截击总不过网", "双打网前一碰就下网", "my volley keeps going into the net", "I keep dumping volleys into the net", "volley into the net"],
    category: ["net", "consistency"],
    problemTag: "volley-into-net",
    causes: ["拍头稳定性不足", "触球点掉到身体后侧", "想发力但没有先建立挡送节奏"],
    causes_en: ["Racquet-head stability is not there yet", "Volley contact drops behind the body", "Trying to hit through the volley before mastering the block-and-push rhythm"],
    fixes: ["拍头保持在身体前面", "先练挡和送，不急着加速", "把截击触球点放在身体前侧"],
    fixes_en: ["Keep the racquet head out in front", "Practice blocking and guiding the volley before adding pace", "Move the volley contact point farther ahead of the body"],
    drills: ["近网挡球 20 次", "正反手截击过网练习各 15 球", "双打反应截击 10 组"],
    drills_en: ["20 short-court block volleys", "15 forehand and 15 backhand volleys focused on clearance", "10 doubles reaction-volley drills"],
    recommendedContentIds: ["content_rb_01", "content_cn_b_03", "content_cn_b_01"],
    searchQueries: searchQueriesByRule.rule_volley_into_net,
    fallbackLevel: ["3.0", "3.5"],
    environment: ["testing", "production"]
  },
  {
    id: "rule_overhead_timing",
    keywords: ["高压", "overhead", "timing"],
    synonyms: ["高压总打不到点", "高压球对不准球", "高压老打框", "高压球下来总找不准点", "杀高球总慢半拍", "高球来了不知道怎么调步", "my overhead timing is off", "I keep missing overheads", "I mistime my overheads"],
    category: ["net", "timing"],
    problemTag: "overhead-timing",
    causes: ["判断落点和调整步不够早", "引拍节奏太慢", "击球点掉到头后或身体后侧"],
    causes_en: ["Reading the ball and adjusting the feet too late", "Racquet preparation is too slow", "Contact drops behind or too far over the head"],
    fixes: ["先用交叉步把身体转到球后", "更早把拍子举起来", "把击球点留在头前上方"],
    fixes_en: ["Use crossover steps to get behind the ball earlier", "Set the racquet sooner", "Keep the contact point in front and above the head"],
    drills: ["高压调步 15 组", "高压定点击球 15 球", "高压后回位 10 组"],
    drills_en: ["15 overhead footwork sets", "15 fed overheads from a fixed spot", "10 overhead-plus-recovery reps"],
    recommendedContentIds: [
      "content_expanded_youtube_creator_patrick_mouratoglou_dkasdyrsseu",
      "content_expanded_youtube_creator_coach_ben_zink_9gx0iuhaivu",
      "content_expanded_youtube_creator_performance_plus_tennis_rynzrqflp94",
      "content_expanded_youtube_creator_2minute_tennis_rzggh0ynlzq",
      "content_expanded_youtube_creator_2minute_tennis_qenjamtncmc",
      "content_expanded_youtube_creator_top_tennis_training_pdm6cmb3ef4",
      "content_expanded_youtube_creator_iron_will_tennis_bzyp0kv8fjg"
    ],
    environment: ["testing", "production"],
    searchQueries: searchQueriesByRule.rule_overhead_timing,
    fallbackLevel: ["3.0", "3.5", "4.0"]
  },
  {
    id: "rule_match_anxiety",
    keywords: ["比赛", "紧张", "match", "nervous"],
    synonyms: ["一比赛就不敢打", "一记分就手硬", "平时能打比赛不行", "比赛手紧", "一到记分就乱", "match nerves", "I get tight in matches", "I play fine in practice but freeze in matches", "I get nervous when the score matters"],
    category: ["matchplay", "mental"],
    problemTag: "match-anxiety",
    causes: ["训练和比赛脱节", "没有固定发接发流程", "对失误容忍度过低"],
    causes_en: ["Training and match play are disconnected", "No fixed serve-and-return routine", "Too low a tolerance for errors"],
    fixes: ["给自己设定简化战术", "先稳定发接发流程", "把注意力放回每一分的执行"],
    fixes_en: ["Set a simplified game plan for yourself", "Stabilize your serve and return routine first", "Bring your focus back to executing each point"],
    drills: ["发球前固定节奏 10 次", "一发一接对抗 10 分钟", "只打高成功率落点的练习赛"],
    drills_en: ["10 pre-serve rhythm reps", "10 minutes of serve-and-return live points", "Practice set using only high-percentage targets"],
    recommendedContentIds: ["content_rb_03", "content_cn_f_01", "content_cn_e_02"],
    searchQueries: searchQueriesByRule.rule_match_anxiety,
    fallbackLevel: ["3.0", "3.5"],
    environment: ["testing", "production"]
  },
  {
    id: "rule_pressure_tightness",
    keywords: ["tight", "关键分", "手紧"],
    synonyms: ["关键分一紧张动作就变形", "压力一来手就紧", "关键球一到就缩手缩脚", "I get tight on big points", "pressure makes my swing tighten up", "I freeze on key points"],
    category: ["matchplay", "mental"],
    problemTag: "pressure-tightness",
    causes: ["关键分时注意力被结果牵走", "动作节奏被紧张打断", "没有固定的关键分执行口令"],
    causes_en: ["On big points, attention shifts to the outcome", "Tension disrupts the swing rhythm", "No fixed key-point execution cue or routine"],
    fixes: ["关键分先把注意力放回一个最稳的动作", "发接发前先做同一个放松流程", "把目标从赢分改成完成动作"],
    fixes_en: ["Keep just one execution cue on big points", "Use the same reset routine before serve and return", "Shift the goal from winning the point to completing the motion"],
    drills: ["关键分口令练习 10 次", "从 30-30 开始打 10 分", "每分前做一次呼吸重置"],
    drills_en: ["10 key-point cue rehearsals", "10 minutes starting every game at 30-30", "Take one reset breath before every point"],
    recommendedContentIds: ["content_cn_f_01", "content_cn_e_02", "content_rb_03"],
    searchQueries: searchQueriesByRule.rule_pressure_tightness,
    fallbackLevel: ["3.0", "3.5", "4.0"],
    environment: ["testing", "production"]
  },
  {
    id: "rule_forehand_no_power",
    keywords: ["正手", "没力量", "forehand", "no power"],
    synonyms: ["正手打不透", "正手很费劲但球不走", "怎么打都没穿透力", "正手怎么抡都不走球", "正手打不出去", "球不往前走", "forehand no power", "my forehand has no power", "my forehand feels weak", "I cannot hit through the court on my forehand"],
    category: ["forehand", "power"],
    problemTag: "forehand-no-power",
    causes: ["只用手臂打球", "重心转换不足", "击球点不稳定导致不敢加速"],
    causes_en: ["Hitting with the arm only", "Not enough weight transfer", "Unstable contact point makes you afraid to speed up"],
    fixes: ["先保证击球点稳定", "把力量来源放回身体和节奏", "先用七成力量打实再提速"],
    fixes_en: ["Lock in a stable contact point first", "Let the power come from body rotation and rhythm", "Hit solid at 70% power first, then add speed"],
    drills: ["无球转体挥拍 20 次", "定点正手七成力量 20 球", "正手击球后自然随挥 20 次"],
    drills_en: ["20 no-ball rotation swings", "20 fixed-target forehands at 70% power", "20 forehands with a natural follow-through"],
    recommendedContentIds: ["content_fr_03", "content_cn_d_02", "content_gaiao_01"],
    searchQueries: searchQueriesByRule.rule_forehand_no_power,
    fallbackLevel: ["3.0", "3.5"],
    environment: ["testing", "production"]
  },
  {
    id: "rule_running_forehand",
    keywords: ["跑动", "正手", "running"],
    synonyms: ["跑动中正手总赶不上点", "侧向追球时正手总乱", "跑着打正手就失误", "my running forehand falls apart", "I struggle on the forehand while moving", "wide-ball forehand feels rushed"],
    category: ["forehand", "movement"],
    problemTag: "running-forehand",
    causes: ["移动中准备太晚", "身体刹不住就急着出手", "跑动中的击球点没有留在前侧"],
    causes_en: ["Preparation starts too late on the run", "You hit before the body is balanced", "The contact point does not stay in front while moving"],
    fixes: ["先用更小的引拍接上跑动节奏", "最后两步先刹住再击球", "把击球点留在身体前侧"],
    fixes_en: ["Use a smaller take-back to match the running rhythm", "Stabilize with the last two steps before contact", "Keep the running-forehand contact point in front"],
    drills: ["侧向两点移动 15 组", "移动后正手 20 球", "跑动后正手回位 10 组"],
    drills_en: ["15 lateral two-point movement sets", "20 forehands after movement", "10 running-forehand plus recovery reps"],
    recommendedContentIds: ["content_cn_a_03", "content_cn_d_03", "content_fr_02"],
    searchQueries: searchQueriesByRule.rule_running_forehand,
    fallbackLevel: ["3.0", "3.5", "4.0"],
    environment: ["testing", "production"]
  },
  {
    id: "rule_running_backhand",
    keywords: ["跑动", "反手", "running"],
    synonyms: ["跑动中反手总赶不上点", "追到反手位就来不及", "跑着打反手总失误", "my running backhand falls apart", "I struggle on the backhand while moving", "wide-ball backhand feels rushed"],
    category: ["backhand", "movement"],
    problemTag: "running-backhand",
    causes: ["反手位移动中转肩太晚", "移动节奏和击球节奏脱节", "跑动中击球点掉到身体后侧"],
    causes_en: ["Shoulder turn is too late on the run to the backhand side", "Movement rhythm and swing rhythm disconnect", "Contact drops behind the body while moving"],
    fixes: ["更早转肩并缩小动作", "最后两步先找稳重心", "反手跑动时仍要把击球点留在前侧"],
    fixes_en: ["Turn the shoulders earlier and keep the swing compact", "Use the last two steps to regain balance", "Keep the running-backhand contact point in front"],
    drills: ["反手侧向移动 15 组", "移动后反手 20 球", "跑动后反手回位 10 组"],
    drills_en: ["15 backhand-side movement sets", "20 backhands after movement", "10 running-backhand plus recovery reps"],
    recommendedContentIds: ["content_cn_a_03", "content_cn_a_01", "content_fr_02"],
    searchQueries: searchQueriesByRule.rule_running_backhand,
    fallbackLevel: ["3.0", "3.5", "4.0"],
    environment: ["testing", "production"]
  },
  {
    id: "rule_balls_too_short",
    keywords: ["打得太浅", "球太浅", "too short", "not deep"],
    synonyms: ["打不深", "球总落在发球线附近", "对抗里总是短球", "老给短球", "总压不深", "球都落中场", "my shots keep landing short", "I cannot hit deep", "everything lands around the service line"],
    category: ["depth", "consistency"],
    problemTag: "balls-too-short",
    causes: ["挥拍向前延伸不足", "只顾过网，没有明确深度目标", "脚步没跟上导致击球质量差"],
    causes_en: ["Not enough forward extension on the swing", "Only aiming to clear the net without a depth target", "Feet are not in position, leading to poor shot quality"],
    fixes: ["先把目标区放到底线前 1 米", "击球后多想向前送拍", "不要站死，先到位再击球"],
    fixes_en: ["Set your target zone 1 metre inside the baseline", "Think about extending forward after contact", "Move first, then hit — do not stay planted"],
    drills: ["底线前目标区击球 20 球", "正反手交替深度练习 20 球", "发球后第一拍送深练习 15 球"],
    drills_en: ["20 shots into a target zone inside the baseline", "20 alternating forehand-backhand depth drills", "15 first-ball-after-serve depth drills"],
    recommendedContentIds: ["content_cn_c_01", "content_cn_e_03", "content_et_01"],
    searchQueries: searchQueriesByRule.rule_balls_too_short,
    fallbackLevel: ["3.0", "3.5"],
    environment: ["testing", "production"]
  },
  {
    id: "rule_return_under_pressure",
    keywords: ["接发球", "被压制", "return", "jammed"],
    synonyms: ["接发球总慢半拍", "接发球被顶住", "接发一上来就被顶回去", "发接发总先丢分", "接发总是被压", "接发回球太短", "return gets jammed", "my return gets jammed", "I keep getting rushed on the return", "my return lands too short"],
    category: ["return", "matchplay"],
    problemTag: "return-under-pressure",
    causes: ["站位不合适", "准备过慢", "接发想太多，动作过大"],
    causes_en: ["Return position is not right", "Preparation is too slow", "Overthinking the return — swing is too big"],
    fixes: ["先把目标设为送深", "缩小动作，早点准备", "固定自己的接发站位和流程"],
    fixes_en: ["Set the goal to just return deep", "Shorten the motion and prepare earlier", "Lock in a consistent return position and routine"],
    drills: ["接发简化挥拍 20 球", "接发只打中路深区 20 球", "发接发一分起打 10 组"],
    drills_en: ["20 compact-swing returns", "20 returns aimed deep down the middle", "10 serve-and-return live points"],
    recommendedContentIds: ["content_rb_02", "content_cn_e_01", "content_cn_e_03"],
    searchQueries: searchQueriesByRule.rule_return_under_pressure,
    fallbackLevel: ["3.0", "3.5", "4.0"],
    environment: ["testing", "production"]
  },
  {
    id: "rule_slice_too_high",
    keywords: ["切削", "太高", "slice", "floating"],
    synonyms: ["切削飘起来", "切削没有压低", "反手切削总浮", "切削总飘", "切削球飞起来", "slice floats", "my slice floats", "my backhand slice sits up", "I cannot keep the slice low"],
    category: ["backhand", "slice"],
    problemTag: "backhand-slice-floating",
    causes: ["拍面太开", "切球方向过于向上", "击球点不在身体前侧"],
    causes_en: ["Racquet face is too open", "Slicing upward instead of forward", "Contact point is not in front of the body"],
    fixes: ["先控制拍面角度", "切球方向更向前", "把击球点放在身体前侧"],
    fixes_en: ["Control the racquet face angle first", "Push the slice forward more, not up", "Make contact in front of the body"],
    drills: ["无球切削挥拍 20 次", "中慢球切削送深 20 球", "切削落点控制底线前 2 米"],
    drills_en: ["20 no-ball slice shadow swings", "20 medium-pace slices aimed deep", "Slice target practice — land within 2 metres of the baseline"],
    recommendedContentIds: ["content_common_03", "content_zlx_03", "content_it_01"],
    searchQueries: searchQueriesByRule.rule_slice_too_high,
    fallbackLevel: ["3.0", "3.5", "4.0"],
    environment: ["testing", "production"]
  },
  {
    id: "rule_topspin_low",
    keywords: ["上旋", "旋转", "弧线", "topspin"],
    synonyms: ["正手没有旋转", "正手球太平", "拉不出上旋", "正手弧线不够", "正手过网太低", "forehand lacks topspin"],
    category: ["forehand", "topspin"],
    problemTag: "topspin-low",
    causes: ["挥拍路径太平，从下往上的分量不够", "只想着往前推球，没有把弧线拉起来", "击球后收拍太早，旋转感没有建立"],
    causes_en: ["Swing path is too flat — not enough low-to-high", "Pushing the ball forward instead of lifting the arc", "Follow-through cuts off too early, spin never builds"],
    fixes: ["先把结束位置收到肩膀以上", "先接受更高的过网弧线，再谈球速", "多感受向上刷球，而不是平推出去"],
    fixes_en: ["Finish with the racquet above the shoulder", "Accept a higher arc over the net before worrying about speed", "Feel the upward brush rather than a flat push"],
    drills: ["无球刷拍 20 次，感受从下往上", "高弧线正手 20 球，只求过网高度", "底线前 1 米目标区正手 20 球"],
    drills_en: ["20 no-ball brush swings — feel the low-to-high", "20 high-arc forehands — just aim for net clearance", "20 forehands landing 1 metre inside the baseline"],
    recommendedContentIds: ["content_cn_d_03", "content_cn_d_01", "content_fr_03"],
    searchQueries: searchQueriesByRule.rule_topspin_low,
    fallbackLevel: ["3.0", "3.5", "4.0"],
    environment: ["testing", "production"]
  },
  {
    id: "rule_serve_accuracy",
    keywords: ["发球", "发不进", "落点", "serve", "placement"],
    synonyms: ["发球老出界", "发球总进不了区", "发球落点不稳", "一发进区率太低", "发球想发哪发不到", "serve accuracy problem", "my serve will not go in", "my serve placement is inconsistent", "I cannot aim my serve"],
    category: ["serve", "control"],
    problemTag: "serve-accuracy",
    causes: ["抛球和挥拍节奏不一致", "目标区意识不清楚，发球只是大概往前打", "一上来就追求力量，控制先散掉了"],
    causes_en: ["Toss and swing rhythm are out of sync", "No clear target zone — just hitting it roughly forward", "Chasing power too early, losing control first"],
    fixes: ["先只盯一个发球目标区", "发力降到七成，先把进区率做出来", "把发球拆成抛球、节奏、落点三个单项分别练"],
    fixes_en: ["Focus on just one service box target", "Serve at 70% power — build your make rate first", "Break the serve into three drills: toss, rhythm, placement"],
    drills: ["半动作发球 20 次，只求进区", "一区或二区单目标区发球 20 球", "连续 10 个进区后再换边"],
    drills_en: ["20 half-motion serves — just get them in", "20 serves to a single target zone", "10 in a row before switching sides"],
    recommendedContentIds: ["content_gaiao_02", "content_zlx_01", "content_ttt_01"],
    searchQueries: searchQueriesByRule.rule_serve_accuracy,
    fallbackLevel: ["2.5", "3.0", "3.5"],
    environment: ["testing", "production"]
  },
  {
    id: "rule_movement_slow",
    keywords: ["脚步", "移动", "来不及", "步伐", "footwork", "slow feet"],
    synonyms: ["脚步总慢半拍", "脚步老慢一拍", "左右移动时脚步总慢半拍", "移动跟不上", "球到了脚还没到", "跑不到位", "步伐太慢", "footwork too slow", "my footwork is too slow", "my footwork is always half a beat late", "my footwork is always half a beat late when I move wide", "I am late getting to the ball", "I cannot get into position fast enough"],
    category: ["movement", "footwork"],
    problemTag: "movement-slow",
    causes: ["分腿垫步缺失或时机偏晚", "第一步启动不够积极，重心起得太高", "只盯着挥拍，忽略了先到位"],
    causes_en: ["Split step is missing or mistimed", "First step is too passive — centre of gravity too high", "Focused on the swing instead of getting into position"],
    fixes: ["对方击球前先做一次分腿垫步", "把注意力先放到第一步启动", "先缩小挥拍动作，给脚步留时间"],
    fixes_en: ["Do a split step before the opponent makes contact", "Put your attention on the first explosive step", "Shorten the swing to give your feet more time"],
    drills: ["分腿垫步 20 组", "两点启动移动 15 组", "喂球后先到位再击球 20 球"],
    drills_en: ["20 split-step drills", "15 two-point first-step drills", "20 feed drills — get in position before you hit"],
    recommendedContentIds: ["content_cn_c_02", "content_cn_a_03", "content_fr_02"],
    searchQueries: searchQueriesByRule.rule_movement_slow,
    fallbackLevel: ["2.5", "3.0", "3.5"],
    environment: ["testing", "production"]
  },
  {
    id: "rule_mobility_limit",
    keywords: ["mobility_limit", "跑不太动", "跟不上"],
    synonyms: ["年纪大了跑不太动", "左右追球跟不上", "场地一拉开就跟不上", "I cannot move well anymore", "I cannot cover the court anymore", "my movement range feels limited"],
    category: ["movement", "physical"],
    problemTag: "mobility-limit",
    causes: ["启动偏慢", "恢复步不到位", "体能和移动范围限制了到位质量"],
    causes_en: ["The first step is too slow", "Recovery steps do not bring you back in time", "Mobility range and physical limits reduce your quality on arrival"],
    fixes: ["先缩小移动半径", "优先练恢复步和第一步", "把训练量放在可持续节奏上"],
    fixes_en: ["Shrink the movement radius first", "Prioritize the recovery step and first step", "Keep training volume inside a sustainable rhythm"],
    drills: ["左右两点启动 15 组", "恢复步 20 次", "短时高质量移动 10 组"],
    drills_en: ["15 left-right first-step sets", "20 recovery-step reps", "10 short high-quality movement intervals"],
    recommendedContentIds: ["content_cn_c_02", "content_fr_02", "content_cn_a_03"],
    searchQueries: searchQueriesByRule.rule_mobility_limit,
    fallbackLevel: ["2.5", "3.0", "3.5"],
    environment: ["testing", "production"]
  },
  {
    id: "rule_stamina_drop",
    keywords: ["体能", "后面", "stamina"],
    synonyms: ["打到后面就散了", "后半段腿就不动了", "体能一下来动作就垮", "my stamina drops late", "I fade badly later in matches", "I lose my legs after a while"],
    category: ["movement", "physical"],
    problemTag: "stamina-drop",
    causes: ["前半段节奏分配不合理", "移动和恢复效率偏低", "体能储备不足导致后段动作质量下降"],
    causes_en: ["Pacing early in the session or match is inefficient", "Movement and recovery are not economical", "Conditioning base is not strong enough to protect technique late"],
    fixes: ["先稳住每拍节奏，不要前半段过度发力", "把恢复步和呼吸放进每一分之间", "用短组高质量体能训练支撑动作稳定"],
    fixes_en: ["Settle the rally rhythm early instead of redlining", "Add recovery steps and breathing between points", "Use short high-quality conditioning blocks to support technique"],
    drills: ["20 秒移动 + 40 秒恢复 8 组", "相持后恢复步 15 组", "后半段只记录动作是否变形"],
    drills_en: ["8 sets of 20 seconds on, 40 seconds recovery", "15 rally-plus-recovery-step reps", "Track only whether technique breaks down late"],
    recommendedContentIds: ["content_cn_c_02", "content_fr_02", "content_cn_c_01"],
    searchQueries: searchQueriesByRule.rule_stamina_drop,
    fallbackLevel: ["3.0", "3.5", "4.0"],
    environment: ["testing", "production"]
  },
  {
    id: "rule_doubles_positioning",
    keywords: ["双打", "站位", "站哪", "doubles", "positioning"],
    synonyms: ["双打不知道怎么站", "双打总是站错位置", "接发后不知道往哪走", "双打轮转总乱", "双打配合老撞位", "doubles positioning confusion", "I do not know where to stand in doubles", "our doubles positioning is a mess", "I do not know where to move after the return"],
    category: ["doubles", "net"],
    problemTag: "doubles-positioning",
    causes: ["没有先建立最基础的一前一后站位逻辑", "击球后不知道自己该补哪一侧", "双打时只盯球，没有和搭档一起移动"],
    causes_en: ["No basic one-up-one-back positioning logic yet", "Do not know which side to recover to after a shot", "Only watching the ball, not moving with the partner"],
    fixes: ["先只记住最常见的一前一后站位", "每打一拍先想自己下一步往哪补位", "和搭档约定最基础的轮转规则"],
    fixes_en: ["Learn the basic one-up-one-back formation first", "After each shot, think about where to recover next", "Agree on simple rotation rules with your partner"],
    drills: ["双打空位走位 10 组", "接发后第一步站位练习 15 组", "双打练习赛只记录站位失误"],
    drills_en: ["10 doubles shadow movement drills", "15 post-return positioning drills", "Practice doubles set — only track positioning errors"],
    recommendedContentIds: ["content_cn_b_02", "content_rb_01", "content_rb_03"],
    searchQueries: searchQueriesByRule.rule_doubles_positioning,
    fallbackLevel: ["3.0", "3.5"],
    environment: ["testing", "production"]
  },
  {
    id: "rule_trouble_with_slice",
    keywords: ["下旋", "切球", "切过来", "低球", "slice", "low ball"],
    synonyms: ["遇到下旋就打不好", "对方切过来就失误", "低球总处理不好", "下旋来球不知道怎么打", "对方一切球我就乱", "struggle against slice", "I struggle against slice", "I cannot handle low skidding balls", "I keep missing when opponents slice"],
    category: ["backhand", "control"],
    problemTag: "incoming-slice-trouble",
    causes: ["没有提前判断来球旋转和落点", "击球点经常掉到身体后侧，来不及往上提拉", "面对低球还在用平击思路处理"],
    causes_en: ["Not reading the spin and landing spot early enough", "Contact drops behind the body — cannot lift in time", "Still using a flat-hit approach against low balls"],
    fixes: ["看到对方切球时先多给自己半拍时间", "尽量在前点往上提拉，不要等球掉太低", "先用高过网弧线把这一拍处理过去"],
    fixes_en: ["Give yourself an extra half-beat when you see a slice coming", "Lift from a forward contact point — do not let the ball drop too low", "Use a high net clearance to get this ball back safely"],
    drills: ["喂低球 20 球，只练前点击球", "低球上提 20 球，只记录过网高度", "切球来回 10 组，练判断和站位"],
    drills_en: ["20 low-ball feeds — practise hitting in front", "20 low-ball lifts — track net clearance height", "10 slice-exchange rallies — focus on reading and positioning"],
    recommendedContentIds: ["content_common_02", "content_cn_a_02", "content_fr_02"],
    searchQueries: searchQueriesByRule.rule_trouble_with_slice,
    fallbackLevel: ["3.0", "3.5", "4.0"],
    environment: ["testing", "production"]
  },
  {
    id: "rule_moonball_trouble",
    keywords: ["moonball", "别扭", "高吊球"],
    synonyms: ["月亮球一来我就很别扭", "月亮球一来我反手就很别扭", "高吊球一来节奏就乱", "moonballs make me uncomfortable", "I struggle when moonballs come in", "high looping balls throw off my timing"],
    category: ["timing", "high-ball"],
    problemTag: "moonball-trouble",
    causes: ["高弹跳来球的站位和击球点准备不足", "面对高吊球时节奏容易被拖慢", "不确定该上升期还是下降期处理"],
    causes_en: ["Court position and contact-point prep are unclear against high-bouncing balls", "Looping balls disrupt your timing rhythm", "You are unsure whether to take the ball on the rise or on the drop"],
    fixes: ["先提前判断落点和弹跳高度", "更早决定是后退让位还是上升期处理", "先用稳定弧线把这一拍处理过去"],
    fixes_en: ["Read the landing spot and bounce height earlier", "Decide sooner whether to back up or take the ball on the rise", "Use a safe arc first to handle the shot cleanly"],
    drills: ["高吊球调步 15 组", "高弹跳来球定点击球 20 球", "月亮球相持 10 组"],
    drills_en: ["15 moonball adjustment-step sets", "20 fed high-bounce contact drills", "10 moonball rally sets"],
    recommendedContentIds: ["content_fr_02", "content_cn_a_02", "content_cn_c_01"],
    searchQueries: searchQueriesByRule.rule_moonball_trouble,
    fallbackLevel: ["3.0", "3.5", "4.0"],
    environment: ["testing", "production"]
  },
  {
    id: "rule_cant_hit_lob",
    keywords: ["高球", "挑高", "lob", "defensive lob"],
    synonyms: ["不会打高球", "防守只会平打", "不会挑高球", "被压到底线不知道怎么办", "高球总打不深", "cannot hit a lob", "I cannot hit a lob", "I do not know how to lob on defense", "my lob never goes deep enough"],
    category: ["defense", "matchplay"],
    problemTag: "cant-hit-lob",
    causes: ["防守时没有先争取时间的意识", "面对高压球还想硬平打回去", "高球出手角度太低，给不到足够弧线和深度"],
    causes_en: ["No awareness of buying time when defending", "Still trying to hit flat against an overhead", "Launch angle is too low — not enough arc and depth"],
    fixes: ["被压住时默认先打一个高而深的高球", "别急着反攻，先把节奏拉回来", "出手时先想高度和深度，不要先想速度"],
    fixes_en: ["When pressed, default to a high and deep lob", "Do not counter-attack — reset the rally first", "Think height and depth first, not speed"],
    drills: ["底线防守高球 15 球", "被压到底线时只打高深球 10 组", "高球后恢复站位 10 组"],
    drills_en: ["15 defensive lobs from the baseline", "10 deep-lob-only drills when pushed back", "10 lob-and-recover drills"],
    recommendedContentIds: ["content_common_01", "content_cn_c_01", "content_rb_03"],
    searchQueries: searchQueriesByRule.rule_cant_hit_lob,
    fallbackLevel: ["3.0", "3.5", "4.0"],
    environment: ["testing", "production"]
  }
];
