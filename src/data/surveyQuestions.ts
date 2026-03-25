export type SurveySingleChoiceQuestion = {
  id: string;
  part: "basic" | "sus" | "product" | "open";
  prompt: string;
  type: "single" | "likert" | "text";
  options?: string[];
};

export const surveyQuestions: SurveySingleChoiceQuestion[] = [
  {
    id: "q1",
    part: "basic",
    prompt: "你打网球多长时间了？",
    type: "single",
    options: ["不到 6 个月", "6 个月到 1 年", "1-2 年", "2-5 年", "5 年以上"]
  },
  {
    id: "q2",
    part: "basic",
    prompt: "你大概每周打几次球？",
    type: "single",
    options: ["不到 1 次", "1-2 次", "3-4 次", "5 次以上"]
  },
  {
    id: "q3",
    part: "basic",
    prompt: "你有没有请过教练？",
    type: "single",
    options: ["没有", "偶尔请", "固定在上课"]
  },
  {
    id: "q4",
    part: "basic",
    prompt: "你觉得自己大概是什么水平？（可以不确定）",
    type: "single",
    options: ["2.5 或以下（刚入门）", "3.0（能打起来但不稳定）", "3.5（相对稳定但变化有限）", "4.0 或以上", "不确定"]
  },
  {
    id: "q5",
    part: "basic",
    prompt: "你平时会通过看视频来学网球吗？",
    type: "single",
    options: ["经常看", "偶尔看", "很少看", "从来不看"]
  },
  { id: "q6", part: "sus", prompt: "我觉得我会愿意经常使用这个系统", type: "likert" },
  { id: "q7", part: "sus", prompt: "我觉得这个系统不必要地复杂", type: "likert" },
  { id: "q8", part: "sus", prompt: "我觉得这个系统很容易使用", type: "likert" },
  { id: "q9", part: "sus", prompt: "我觉得我需要技术人员的帮助才能使用这个系统", type: "likert" },
  { id: "q10", part: "sus", prompt: "我觉得这个系统的各项功能整合得很好", type: "likert" },
  { id: "q11", part: "sus", prompt: "我觉得这个系统有太多不一致的地方", type: "likert" },
  { id: "q12", part: "sus", prompt: "我觉得大多数人能很快学会使用这个系统", type: "likert" },
  { id: "q13", part: "sus", prompt: "我觉得这个系统使用起来很不方便", type: "likert" },
  { id: "q14", part: "sus", prompt: "我觉得使用这个系统时我很有信心", type: "likert" },
  { id: "q15", part: "sus", prompt: "我需要先学很多东西才能开始使用这个系统", type: "likert" },
  { id: "q16", part: "product", prompt: "水平评估的结果基本符合我对自己的判断", type: "likert" },
  { id: "q17", part: "product", prompt: "问题诊断能理解我想表达的意思", type: "likert" },
  { id: "q18", part: "product", prompt: "推荐的内容确实跟我的问题有关", type: "likert" },
  { id: "q19", part: "product", prompt: "教练推荐理由让我更想点进去看", type: "likert" },
  { id: "q20", part: "product", prompt: "训练计划的建议是我能实际去练的", type: "likert" },
  { id: "q21", part: "product", prompt: "整体体验让我觉得像在跟一个懂球的教练对话", type: "likert" },
  { id: "q22", part: "product", prompt: "我愿意把这个工具推荐给我的球友", type: "likert" },
  { id: "q23", part: "open", prompt: "在使用过程中，哪个环节让你觉得最有帮助？为什么？", type: "text" },
  { id: "q24", part: "open", prompt: "有没有哪个环节让你觉得不准、不对、或者不够用？", type: "text" },
  { id: "q25", part: "open", prompt: "如果你可以给这个产品提一个改进建议，你会说什么？", type: "text" }
];

export const susLikertLabels = ["1", "2", "3", "4", "5"];
