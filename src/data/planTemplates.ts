import { PlanTemplate } from "@/types/plan";

export const planTemplates: PlanTemplate[] = [
  {
    problemTag: "second-serve-confidence",
    level: "3.5",
    title: "二发稳定性 7 天重建计划",
    titleEn: "7-Day Second-Serve Confidence Reset",
    target: "先建立安全二发的节奏、抛球和信心",
    targetEn: "Build a safe second-serve rhythm, toss, and confidence first.",
    days: [
      { day: 1, focus: "稳定抛球", focusEn: "Stabilize the toss", contentIds: ["content_gaiao_02"], drills: ["抛球 30 次", "空挥发球 20 次"], drillsEn: ["30 toss reps", "20 shadow serve reps"], duration: "20 分钟", durationEn: "20 min" },
      { day: 2, focus: "建立二发节奏", focusEn: "Build a second-serve rhythm", contentIds: ["content_zlx_01"], drills: ["半动作二发 20 次", "二区慢发 20 球"], drillsEn: ["20 half-motion second serves", "20 slow second serves to the deuce court"], duration: "25 分钟", durationEn: "25 min" },
      { day: 3, focus: "上旋安全感", focusEn: "Build topspin trust", contentIds: ["content_zlx_02"], drills: ["上旋感觉练习 20 次", "一区二区交替二发 20 球"], drillsEn: ["20 topspin-feel reps", "20 alternating second serves to both service boxes"], duration: "25 分钟", durationEn: "25 min" },
      { day: 4, focus: "节奏复盘", focusEn: "Review the rhythm", contentIds: ["content_zlx_01"], drills: ["录像 10 球", "记录抛球稳定性"], drillsEn: ["Record 10 serves", "Note toss consistency"], duration: "20 分钟", durationEn: "20 min" },
      { day: 5, focus: "在疲劳下保持动作", focusEn: "Hold the motion under fatigue", contentIds: ["content_gaiao_02"], drills: ["慢跑后发二发 15 球", "发球前固定流程 10 次"], drillsEn: ["15 second serves after a light jog", "10 reps of the pre-serve routine"], duration: "20 分钟", durationEn: "20 min" },
      { day: 6, focus: "带目标区发球", focusEn: "Serve to target zones", contentIds: ["content_zlx_02"], drills: ["二区目标区 15 球", "一区目标区 15 球"], drillsEn: ["15 serves to the deuce-court target", "15 serves to the ad-court target"], duration: "25 分钟", durationEn: "25 min" },
      { day: 7, focus: "模拟比赛发球", focusEn: "Simulate match serving", contentIds: ["content_zlx_01"], drills: ["每分只发一次二发 20 球", "记录成功率"], drillsEn: ["20 points using second serve only", "Track the make percentage"], duration: "30 分钟", durationEn: "30 min" }
    ]
  },
  {
    problemTag: "backhand-into-net",
    level: "3.0",
    title: "反手过网稳定性 7 天计划",
    titleEn: "7-Day Backhand Net-Clearance Plan",
    target: "先解决反手总下网的问题，建立稳定前点击球",
    targetEn: "Fix the backhand net error first by building earlier, more forward contact.",
    days: [
      { day: 1, focus: "更早准备", focusEn: "Prepare earlier", contentIds: ["content_cn_a_02"], drills: ["转肩准备 20 次", "不击球准备动作 15 次"], drillsEn: ["20 shoulder-turn prep reps", "15 no-ball preparation reps"], duration: "20 分钟", durationEn: "20 min" },
      { day: 2, focus: "前点击球", focusEn: "Meet the ball farther in front", contentIds: ["content_cn_a_01"], drills: ["影子挥拍 20 次", "定点前点击球 20 球"], drillsEn: ["20 shadow swings", "20 feeds with contact out front"], duration: "25 分钟", durationEn: "25 min" },
      { day: 3, focus: "慢节奏稳定过网", focusEn: "Clear the net at a slow pace", contentIds: ["content_gaiao_03"], drills: ["反手过网 30 球", "反手只求高过网 20 球"], drillsEn: ["30 backhands over the net", "20 backhands focused only on higher net clearance"], duration: "25 分钟", durationEn: "25 min" },
      { day: 4, focus: "脚步配合", focusEn: "Match the footwork to the swing", contentIds: ["content_cn_a_03"], drills: ["两点移动 15 组", "移动后反手 20 球"], drillsEn: ["15 two-point movement sets", "20 backhands after movement"], duration: "20 分钟", durationEn: "20 min" },
      { day: 5, focus: "反手直线控制", focusEn: "Control the down-the-line backhand", contentIds: ["content_zlx_03"], drills: ["反手直线 20 球", "反手中路深球 20 球"], drillsEn: ["20 down-the-line backhands", "20 deep backhands through the middle"], duration: "25 分钟", durationEn: "25 min" },
      { day: 6, focus: "录像复盘", focusEn: "Review on video", contentIds: ["content_cn_a_01"], drills: ["录 10 个反手", "记录击球点是否在前"], drillsEn: ["Record 10 backhands", "Note whether contact stays in front"], duration: "20 分钟", durationEn: "20 min" },
      { day: 7, focus: "带相持的反手练习", focusEn: "Add rally pressure to the backhand", contentIds: ["content_cn_a_02"], drills: ["反手相持 5 组", "失误只记录是否晚点"], drillsEn: ["5 backhand rally sets", "Only track whether misses came from late contact"], duration: "30 分钟", durationEn: "30 min" }
    ]
  },
  {
    problemTag: "forehand-out",
    level: "3.5",
    title: "正手控制与上旋 7 天计划",
    titleEn: "7-Day Forehand Control and Topspin Plan",
    target: "减少正手出界，先拉起弧线和控制",
    targetEn: "Reduce forehand misses long by rebuilding shape, arc, and control first.",
    days: [
      { day: 1, focus: "降低发力欲望", focusEn: "Take the edge off the swing", contentIds: ["content_cn_d_01"], drills: ["七成力正手 20 球", "只求高过网 20 球"], drillsEn: ["20 forehands at 70% pace", "20 forehands focused only on clearing the net"], duration: "20 分钟", durationEn: "20 min" },
      { day: 2, focus: "建立上旋意识", focusEn: "Build topspin awareness", contentIds: ["content_cn_d_03"], drills: ["上旋无球挥拍 20 次", "高弧线正手 20 球"], drillsEn: ["20 topspin shadow swings", "20 forehands with a higher arc"], duration: "25 分钟", durationEn: "25 min" },
      { day: 3, focus: "击球点和拍面", focusEn: "Clean up contact and racquet face", contentIds: ["content_gaiao_01"], drills: ["固定点击球 20 球", "击球后停住检查拍面 10 次"], drillsEn: ["20 fixed-feed forehands", "10 pause-and-check reps after contact"], duration: "25 分钟", durationEn: "25 min" },
      { day: 4, focus: "深度控制", focusEn: "Control depth", contentIds: ["content_cn_c_01"], drills: ["底线前 1 米目标区 20 球", "正手中路深球 20 球"], drillsEn: ["20 forehands to a target one meter inside the baseline", "20 deep forehands through the middle"], duration: "20 分钟", durationEn: "20 min" },
      { day: 5, focus: "移动中保持控制", focusEn: "Keep control while moving", contentIds: ["content_cn_a_03"], drills: ["两点移动后正手 20 球", "只记录弧线和深度"], drillsEn: ["20 forehands after two-point movement", "Track only arc and depth"], duration: "25 分钟", durationEn: "25 min" },
      { day: 6, focus: "对拉验证", focusEn: "Test it in a rally", contentIds: ["content_cn_d_03"], drills: ["连续对拉 30 球", "失误只记是否出界"], drillsEn: ["30 rally balls in a row", "Only track whether misses go long"], duration: "25 分钟", durationEn: "25 min" },
      { day: 7, focus: "半比赛应用", focusEn: "Apply it in point play", contentIds: ["content_cn_d_01"], drills: ["发球后第一拍正手 15 分", "正手限定高弧线比赛 10 分"], drillsEn: ["15 minutes of serve-plus-one forehands", "10 minutes of forehand points with a high-arc rule"], duration: "30 分钟", durationEn: "30 min" }
    ]
  },
  {
    problemTag: "match-anxiety",
    level: "3.5",
    title: "比赛紧张应对 7 天计划",
    titleEn: "7-Day Match-Nerves Reset Plan",
    target: "建立固定流程，把注意力从结果拉回执行",
    targetEn: "Build repeatable routines so your attention returns to execution instead of the score.",
    days: [
      { day: 1, focus: "定义自己的比赛流程", focusEn: "Define your match routine", contentIds: ["content_cn_f_01"], drills: ["写下发球前流程", "写下接发前流程"], drillsEn: ["Write down your pre-serve routine", "Write down your return routine"], duration: "15 分钟", durationEn: "15 min" },
      { day: 2, focus: "发球前固定节奏", focusEn: "Fix the pre-serve rhythm", contentIds: ["content_cn_e_02"], drills: ["发球前重复流程 10 次", "空拍演练 10 次"], drillsEn: ["Repeat the pre-serve routine 10 times", "10 shadow reps"], duration: "20 分钟", durationEn: "20 min" },
      { day: 3, focus: "接发只做一件事", focusEn: "Simplify the return task", contentIds: ["content_cn_e_03"], drills: ["接发只打中路深区 20 球", "接发简化挥拍 20 球"], drillsEn: ["20 returns deep through the middle", "20 returns with a simplified swing"], duration: "20 分钟", durationEn: "20 min" },
      { day: 4, focus: "练习赛只设一个目标", focusEn: "Play practice points with one goal", contentIds: ["content_cn_f_03"], drills: ["只记录一发流程是否完成", "不记录输赢"], drillsEn: ["Only track whether the routine was completed", "Do not track wins and losses"], duration: "30 分钟", durationEn: "30 min" },
      { day: 5, focus: "失败容忍度练习", focusEn: "Build tolerance for mistakes", contentIds: ["content_cn_f_01"], drills: ["每失误后重复关键词", "记录下一个动作执行情况"], drillsEn: ["Repeat a reset cue after each error", "Track whether the next action was executed"], duration: "15 分钟", durationEn: "15 min" },
      { day: 6, focus: "发接发一分起打", focusEn: "Start points from serve and return", contentIds: ["content_cn_e_01"], drills: ["一发一接 10 组", "每分开始前先做固定流程"], drillsEn: ["10 serve-and-return point starts", "Do the routine before every point"], duration: "25 分钟", durationEn: "25 min" },
      { day: 7, focus: "完整模拟比赛", focusEn: "Run a full match simulation", contentIds: ["content_cn_e_02"], drills: ["打一盘抢七", "赛后只复盘流程完成率"], drillsEn: ["Play one tiebreak set", "Review only how often the routine was completed"], duration: "35 分钟", durationEn: "35 min" }
    ]
  },
  {
    problemTag: "cant-self-practice",
    level: "3.0",
    title: "不会自己练 7 天入门计划",
    titleEn: "7-Day Self-Practice Starter Plan",
    target: "建立最简单可执行的自练结构",
    targetEn: "Build the simplest self-practice structure you can actually follow alone.",
    days: [
      { day: 1, focus: "只选一个主问题", focusEn: "Pick just one main problem", contentIds: ["content_cn_f_02"], drills: ["列出本周唯一主问题", "写 1 个练习目标"], drillsEn: ["List your one main issue for the week", "Write down 1 practice goal"], duration: "15 分钟", durationEn: "15 min" },
      { day: 2, focus: "正手/反手基础自练", focusEn: "Run a simple groundstroke session", contentIds: ["content_cn_c_03"], drills: ["影子挥拍各 20 次", "定点慢打 20 球"], drillsEn: ["20 forehand and 20 backhand shadow swings", "20 controlled balls from one spot"], duration: "20 分钟", durationEn: "20 min" },
      { day: 3, focus: "发球自练模版", focusEn: "Use a solo serve template", contentIds: ["content_gaiao_02"], drills: ["抛球 20 次", "半动作发球 20 次"], drillsEn: ["20 toss reps", "20 half-motion serves"], duration: "20 分钟", durationEn: "20 min" },
      { day: 4, focus: "步伐自练模版", focusEn: "Use a solo footwork template", contentIds: ["content_cn_c_02"], drills: ["分腿垫步 20 组", "两点移动 15 组"], drillsEn: ["20 split-step sets", "15 two-point movement sets"], duration: "15 分钟", durationEn: "15 min" },
      { day: 5, focus: "记录和复盘", focusEn: "Track and review", contentIds: ["content_cn_f_03"], drills: ["写 3 条今天感觉", "记录成功率 1 项"], drillsEn: ["Write 3 notes about today", "Track 1 success-rate metric"], duration: "15 分钟", durationEn: "15 min" },
      { day: 6, focus: "组合一次 30 分钟训练", focusEn: "Build one 30-minute session", contentIds: ["content_cn_f_02"], drills: ["5 分钟热身", "10 分钟主问题", "10 分钟发球", "5 分钟记录"], drillsEn: ["5-minute warm-up", "10 minutes on the main issue", "10 minutes of serves", "5 minutes of notes"], duration: "30 分钟", durationEn: "30 min" },
      { day: 7, focus: "形成每周固定模版", focusEn: "Create a weekly template", contentIds: ["content_cn_c_03"], drills: ["写下下周 3 次训练安排", "每次只保留 1 个重点"], drillsEn: ["Schedule 3 sessions for next week", "Keep only 1 priority for each session"], duration: "20 分钟", durationEn: "20 min" }
    ]
  },
  {
    problemTag: "topspin-low",
    level: "3.0",
    title: "正手稳定性 7 天计划",
    titleEn: "7-Day Forehand Stability Plan",
    target: "先把正手弧线、深度和稳定性建立起来",
    targetEn: "Build forehand arc, depth, and consistency before chasing pace.",
    days: [
      { day: 1, focus: "正手定点击球与目标区", focusEn: "Set up forehand contact and targets", contentIds: ["content_cn_d_01"], drills: ["底线深区正手 20 球", "只记录过网高度 20 球"], drillsEn: ["20 forehands to a deep baseline target", "20 reps tracking only net clearance"], duration: "20 分钟", durationEn: "20 min" },
      { day: 2, focus: "移动中正手稳定击球", focusEn: "Stabilize the forehand while moving", contentIds: ["content_cn_a_03"], drills: ["侧向两点移动 15 组", "移动后正手 20 球"], drillsEn: ["15 lateral two-point movement sets", "20 forehands after movement"], duration: "25 分钟", durationEn: "25 min" },
      { day: 3, focus: "正手连续对拉稳定性", focusEn: "Hold the forehand in rallies", contentIds: ["content_cn_d_03"], drills: ["正手连续 10 拍 5 组", "失误只记弧线是否太低"], drillsEn: ["5 sets of 10 forehands in a row", "Track only whether misses came from a low arc"], duration: "25 分钟", durationEn: "25 min" },
      { day: 4, focus: "休息与内容复盘", focusEn: "Rest and review the content", contentIds: ["content_cn_d_03"], drills: ["看一条推荐内容", "写 2 条正手体感"], drillsEn: ["Watch one recommended video", "Write 2 notes about your forehand feel"], duration: "15 分钟", durationEn: "15 min" },
      { day: 5, focus: "正手变线控制", focusEn: "Control forehand direction changes", contentIds: ["content_fr_03"], drills: ["直线和斜线交替 20 球", "只求路线清楚不求球速"], drillsEn: ["20 forehands alternating line and crosscourt", "Focus on clear direction, not speed"], duration: "25 分钟", durationEn: "25 min" },
      { day: 6, focus: "分腿垫步接正手", focusEn: "Add the split step to the forehand", contentIds: ["content_cn_a_03"], drills: ["分腿垫步 + 正手 20 球", "移动后停住检查站位 10 次"], drillsEn: ["20 split-step plus forehand reps", "10 stop-and-check positioning reps after movement"], duration: "20 分钟", durationEn: "20 min" },
      { day: 7, focus: "模拟比赛只关注正手深度", focusEn: "Play points and watch forehand depth", contentIds: ["content_cn_c_01"], drills: ["半场对抗 15 分钟", "每拍只记是否打进深区"], drillsEn: ["15 minutes of half-court points", "Track only whether the ball reaches the deep zone"], duration: "30 分钟", durationEn: "30 min" }
    ]
  },
  {
    problemTag: "serve-accuracy",
    level: "3.0",
    title: "发球建立信心 7 天计划",
    titleEn: "7-Day Serve Confidence Plan",
    target: "先建立稳定抛球和可重复的发球节奏",
    targetEn: "Build a steady toss and a repeatable serve rhythm before adding pressure.",
    days: [
      { day: 1, focus: "只练抛球", focusEn: "Practice only the toss", contentIds: ["content_gaiao_02"], drills: ["抛球 50 次不挥拍", "记录落点 20 次"], drillsEn: ["50 tosses with no swing", "Record the landing spot 20 times"], duration: "15 分钟", durationEn: "15 min" },
      { day: 2, focus: "半挥拍发球", focusEn: "Use a half swing on the serve", contentIds: ["content_zlx_01"], drills: ["半动作发球 20 次", "只求过网进区 20 球"], drillsEn: ["20 half-motion serves", "20 serves focused only on clearing the net and landing in"], duration: "20 分钟", durationEn: "20 min" },
      { day: 3, focus: "完整动作慢速发球", focusEn: "Use the full motion slowly", contentIds: ["content_ttt_01"], drills: ["慢速完整动作 20 球", "目标 70% 进区率"], drillsEn: ["20 slow full-motion serves", "Aim for a 70% make rate"], duration: "25 分钟", durationEn: "25 min" },
      { day: 4, focus: "休息与节奏复盘", focusEn: "Rest and review the rhythm", contentIds: ["content_zlx_01"], drills: ["看推荐内容", "写下自己的发球节奏口令"], drillsEn: ["Watch one recommended video", "Write down your serve rhythm cue"], duration: "15 分钟", durationEn: "15 min" },
      { day: 5, focus: "二发连续进区", focusEn: "Make second serves in a row", contentIds: ["content_gaiao_02"], drills: ["连续 10 个二发进区 3 组", "失败后重新开始"], drillsEn: ["3 sets of 10 second serves in a row", "Restart the set after a miss"], duration: "20 分钟", durationEn: "20 min" },
      { day: 6, focus: "一发二发交替流程", focusEn: "Alternate first- and second-serve routines", contentIds: ["content_zlx_02"], drills: ["一发 + 二发交替 20 组", "每次都保持同样准备"], drillsEn: ["20 first-serve plus second-serve sequences", "Keep the same preparation every time"], duration: "25 分钟", durationEn: "25 min" },
      { day: 7, focus: "模拟比赛发球局", focusEn: "Play a simulated service game", contentIds: ["content_ttt_01"], drills: ["和朋友打发球局", "只记录节奏完成度"], drillsEn: ["Play a service game with a friend", "Track only how well you kept the rhythm"], duration: "30 分钟", durationEn: "30 min" }
    ]
  },
  {
    problemTag: "doubles-positioning",
    level: "3.0",
    title: "双打基础配合 7 天计划",
    titleEn: "7-Day Doubles Positioning Basics Plan",
    target: "先把双打站位、轮转和网前基础处理理顺",
    targetEn: "Sort out doubles positioning, rotations, and basic net play before adding complexity.",
    days: [
      { day: 1, focus: "理解一前一后站位", focusEn: "Understand one-up one-back positioning", contentIds: ["content_cn_b_02"], drills: ["口头复述 3 种基础站位", "和搭档空位走位 10 组"], drillsEn: ["Recite 3 basic doubles formations", "10 shadow-positioning sets with a partner"], duration: "20 分钟", durationEn: "20 min" },
      { day: 2, focus: "网前截击基础", focusEn: "Build basic net volleys", contentIds: ["content_cn_b_03"], drills: ["缩小动作截击 20 球", "近网挡球 20 次"], drillsEn: ["20 compact-motion volleys", "20 soft block volleys near the net"], duration: "20 分钟", durationEn: "20 min" },
      { day: 3, focus: "前后轮转移动", focusEn: "Practice front-back rotation", contentIds: ["content_rb_01"], drills: ["一人底线一人网前轮换 10 组", "搭档交叉补位练习"], drillsEn: ["10 rotation sets with one player back and one up", "Practice partner cross-cover movement"], duration: "25 分钟", durationEn: "25 min" },
      { day: 4, focus: "休息与站位复盘", focusEn: "Rest and review positioning", contentIds: ["content_cn_b_02"], drills: ["看推荐内容", "写下最不熟的双打场景"], drillsEn: ["Watch one recommended video", "Write down the doubles pattern you know least well"], duration: "15 分钟", durationEn: "15 min" },
      { day: 5, focus: "双打接发后的站位选择", focusEn: "Choose the right spot after the return", contentIds: ["content_rb_02"], drills: ["接发后第一步移动 15 组", "接发后是否上网判断"], drillsEn: ["15 first-step reps after the return", "Decide whether to move forward after the return"], duration: "25 分钟", durationEn: "25 min" },
      { day: 6, focus: "双打模拟比赛只看站位", focusEn: "Play doubles and track positioning only", contentIds: ["content_rb_03"], drills: ["双打练习赛 20 分钟", "不记比分只记站位失误"], drillsEn: ["20 minutes of doubles practice play", "Ignore the score and track only positioning mistakes"], duration: "30 分钟", durationEn: "30 min" },
      { day: 7, focus: "总结本周最不熟的轮转", focusEn: "Review the hardest rotation", contentIds: ["content_cn_b_02"], drills: ["记录 3 个常错站位", "下周保留 1 个重点"], drillsEn: ["List 3 positioning mistakes you made most often", "Keep 1 priority for next week"], duration: "15 分钟", durationEn: "15 min" }
    ]
  },
  {
    problemTag: "match-anxiety",
    level: "4.0",
    title: "比赛心态与执行 7 天计划",
    titleEn: "7-Day Match Execution Under Pressure Plan",
    target: "在比赛压力下仍然保持清楚的执行和复盘节奏",
    targetEn: "Stay clear on execution and review even when match pressure rises.",
    days: [
      { day: 1, focus: "每分只保留一个执行关键词", focusEn: "Keep one execution cue per point", contentIds: ["content_cn_f_01"], drills: ["一分只想一个关键词", "记录关键词是否执行"], drillsEn: ["Use only one cue word per point", "Track whether you executed that cue"], duration: "15 分钟", durationEn: "15 min" },
      { day: 2, focus: "模拟落后时的执行专注", focusEn: "Stay on task while trailing", contentIds: ["content_cn_e_02"], drills: ["从 2-4 落后开始打 3 组", "每分前重复执行口令"], drillsEn: ["Play 3 sets starting from 2-4 down", "Repeat the execution cue before every point"], duration: "25 分钟", durationEn: "25 min" },
      { day: 3, focus: "发接发流程固定化", focusEn: "Lock in the serve-return routine", contentIds: ["content_cn_e_01"], drills: ["发球前流程 10 次", "接发前流程 10 次"], drillsEn: ["10 pre-serve routine reps", "10 pre-return routine reps"], duration: "20 分钟", durationEn: "20 min" },
      { day: 4, focus: "休息与心态复盘", focusEn: "Rest and review your mindset", contentIds: ["content_cn_f_01"], drills: ["看推荐内容", "写下最容易乱的比分场景"], drillsEn: ["Watch one recommended video", "Write down the score situations that scramble you most"], duration: "15 分钟", durationEn: "15 min" },
      { day: 5, focus: "只记录非受迫性失误", focusEn: "Track only unforced errors", contentIds: ["content_cn_f_03"], drills: ["打一盘只记非受迫失误", "每局结束写一句提醒"], drillsEn: ["Play one set and track only unforced errors", "Write one reminder at the end of each game"], duration: "30 分钟", durationEn: "30 min" },
      { day: 6, focus: "每局结束做一句执行复盘", focusEn: "Review execution after every game", contentIds: ["content_rb_03"], drills: ["和朋友打一盘", "每局结束写一句执行复盘"], drillsEn: ["Play one set with a friend", "Write one execution note after every game"], duration: "35 分钟", durationEn: "35 min" },
      { day: 7, focus: "总结最常丢分的模式", focusEn: "Summarize the pattern behind lost points", contentIds: ["content_cn_f_03"], drills: ["整理本周记录", "选出下周唯一重点"], drillsEn: ["Review this week's notes", "Choose one priority for next week"], duration: "20 分钟", durationEn: "20 min" }
    ]
  }
];
