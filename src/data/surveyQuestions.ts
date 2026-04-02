export type SurveySingleChoiceQuestion = {
  id: string;
  part: "sus" | "product" | "open";
  prompt: string;
  prompt_en?: string;
  type: "single" | "likert" | "text";
  options?: string[];
  options_en?: string[];
};

export const surveyQuestions: SurveySingleChoiceQuestion[] = [
  { id: "q6", part: "sus", prompt: "我觉得我会愿意经常使用这个系统", prompt_en: "I think that I would like to use this system frequently", type: "likert" },
  { id: "q7", part: "sus", prompt: "这个系统的功能过于复杂", prompt_en: "I found the system unnecessarily complex", type: "likert" },
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
  { id: "q19", part: "product", prompt: "推荐理由让我更相信这些推荐是适合我的", prompt_en: "The coach's reasoning made me more confident these recommendations were suitable for me", type: "likert" },
  { id: "q23", part: "open", prompt: "在使用过程中，哪个环节让你觉得最有帮助？为什么？", prompt_en: "Which part of the experience felt most helpful to you? Why?", type: "text" },
  { id: "q24", part: "open", prompt: "有没有哪个环节让你觉得不准、困惑、或者不可信？", prompt_en: "Was there any part that felt inaccurate, confusing, or untrustworthy?", type: "text" },
  { id: "q25", part: "open", prompt: "什么信息或功能最影响你对推荐结果的相信程度？", prompt_en: "What information or feature most influences your confidence in the recommendations?", type: "text" }
];

export const susLikertLabels = ["1", "2", "3", "4", "5"];
