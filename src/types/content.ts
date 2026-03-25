export type ContentType = "video" | "article" | "post";
export type ContentPlatform = "Bilibili" | "Xiaohongshu" | "Zhihu" | "YouTube" | "Instagram";

export type ContentItem = {
  id: string;
  title: string;
  creatorId: string;
  platform: ContentPlatform;
  type: ContentType;
  levels: string[];
  skills: string[];
  problemTags: string[];
  language: "zh" | "en";
  summary: string;
  reason: string;
  useCases: string[];
  coachReason: string;
  duration?: string;
  url: string;
  cover?: string;
};
