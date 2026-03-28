export type SurveySingleChoiceQuestion = {
  id: string;
  part: "basic" | "sus" | "product" | "open";
  prompt: string;
  prompt_en?: string;
  type: "single" | "likert" | "text";
  options?: string[];
  options_en?: string[];
};

export const surveyQuestions: SurveySingleChoiceQuestion[] = [
  {
    id: "q1",
    part: "basic",
    prompt: "你打网球多长时间了？",
    prompt_en: "How long have you been playing tennis?",
    type: "single",
    options: ["不到 6 个月", "6 个月到 1 年", "1-2 年", "2-5 年", "5 年以上"],
    options_en: ["Less than 6 months", "6 months to 1 year", "1–2 years", "2–5 years", "More than 5 years"]
  },
  {
    id: "q2",
    part: "basic",
    prompt: "你大概每周打几次球？",
    prompt_en: "About how many times per week do you play?",
    type: "single",
    options: ["不到 1 次", "1-2 次", "3-4 次", "5 次以上"],
    options_en: ["Less than once", "1–2 times", "3–4 times", "5 or more"]
  },
  {
    id: "q3",
    part: "basic",
    prompt: "你有没有请过教练？",
    prompt_en: "Have you ever taken lessons with a coach?",
    type: "single",
    options: ["没有", "偶尔请", "固定在上课"],
    options_en: ["No", "Occasionally", "Taking regular lessons"]
  },
  {
    id: "q4",
    part: "basic",
    prompt: "你觉得自己大概是什么水平？（可以不确定）",
    prompt_en: "What level do you think you are at? (It is okay to be unsure)",
    type: "single",
    options: ["2.5 或以下（刚入门）", "3.0（能打起来但不稳定）", "3.5（相对稳定但变化有限）", "4.0 或以上", "不确定"],
    options_en: ["2.5 or below (beginner)", "3.0 (can rally but inconsistent)", "3.5 (fairly steady but limited variety)", "4.0 or above", "Not sure"]
  },
  {
    id: "q5",
    part: "basic",
    prompt: "你平时会通过看视频来学网球吗？",
    prompt_en: "Do you watch videos to learn tennis?",
    type: "single",
    options: ["经常看", "偶尔看", "很少看", "从来不看"],
    options_en: ["Often", "Sometimes", "Rarely", "Never"]
  },
  { id: "q6", part: "sus", prompt: "我觉得我会愿意经常使用这个系统", prompt_en: "I think that I would like to use this system frequently", type: "likert" },
  { id: "q7", part: "sus", prompt: "我觉得这个系统不必要地复杂", prompt_en: "I found the system unnecessarily complex", type: "likert" },
  { id: "q8", part: "sus", prompt: "我觉得这个系统很容易使用", prompt_en: "I thought the system was easy to use", type: "likert" },
  { id: "q9", part: "sus", prompt: "我觉得我需要技术人员的帮助才能使用这个系统", prompt_en: "I think that I would need the support of a technical person to be able to use this system", type: "likert" },
  { id: "q10", part: "sus", prompt: "我觉得这个系统的各项功能整合得很好", prompt_en: "I found the various functions in this system were well integrated", type: "likert" },
  { id: "q11", part: "sus", prompt: "我觉得这个系统有太多不一致的地方", prompt_en: "I thought there was too much inconsistency in this system", type: "likert" },
  { id: "q12", part: "sus", prompt: "我觉得大多数人能很快学会使用这个系统", prompt_en: "I would imagine that most people would learn to use this system very quickly", type: "likert" },
  { id: "q13", part: "sus", prompt: "我觉得这个系统使用起来很不方便", prompt_en: "I found the system very cumbersome to use", type: "likert" },
  { id: "q14", part: "sus", prompt: "我觉得使用这个系统时我很有信心", prompt_en: "I felt very confident using the system", type: "likert" },
  { id: "q15", part: "sus", prompt: "我需要先学很多东西才能开始使用这个系统", prompt_en: "I needed to learn a lot of things before I could get going with this system", type: "likert" },
  { id: "q16", part: "product", prompt: "水平评估的结果基本符合我对自己的判断", prompt_en: "The level assessment result matched my own judgment", type: "likert" },
  { id: "q17", part: "product", prompt: "问题诊断能理解我想表达的意思", prompt_en: "The problem diagnosis understood what I was trying to say", type: "likert" },
  { id: "q18", part: "product", prompt: "推荐的内容确实跟我的问题有关", prompt_en: "The recommended content was relevant to my problem", type: "likert" },
  { id: "q19", part: "product", prompt: "教练推荐理由让我更想点进去看", prompt_en: "The coach's reasoning made me want to watch the recommended content", type: "likert" },
  { id: "q20", part: "product", prompt: "训练计划的建议是我能实际去练的", prompt_en: "The training plan suggestions are things I could actually practise", type: "likert" },
  { id: "q21", part: "product", prompt: "整体体验让我觉得像在跟一个懂球的教练对话", prompt_en: "The overall experience felt like talking to a knowledgeable coach", type: "likert" },
  { id: "q22", part: "product", prompt: "我愿意把这个工具推荐给我的球友", prompt_en: "I would recommend this tool to my tennis friends", type: "likert" },
  { id: "q23", part: "open", prompt: "在使用过程中，哪个环节让你觉得最有帮助？为什么？", prompt_en: "Which part of the experience felt most helpful to you? Why?", type: "text" },
  { id: "q24", part: "open", prompt: "有没有哪个环节让你觉得不准、不对、或者不够用？", prompt_en: "Was there any part that felt inaccurate, off, or not enough?", type: "text" },
  { id: "q25", part: "open", prompt: "如果你可以给这个产品提一个改进建议，你会说什么？", prompt_en: "If you could suggest one improvement, what would it be?", type: "text" }
];

export const susLikertLabels = ["1", "2", "3", "4", "5"];
