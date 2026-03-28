import fs from "node:fs";
import path from "node:path";

import { contents } from "../src/data/contents";
import { creators } from "../src/data/creators";
import { CREATOR_FEATURED_VIDEO_CHINESE_SUBTITLE_OVERRIDES } from "../src/lib/content/chineseSubtitleOverrides";

type SuggestionSource = "title_template" | "target" | "generic_skill";

const englishNameReplacements: Record<string, string> = {
  "venus williams": "维纳斯·威廉姆斯",
  "patrick mouratoglou": "莫拉托格鲁",
  "roger federer": "费德勒",
  "novak djokovic": "德约科维奇",
  "rafael nadal": "纳达尔",
  "andy murray": "安迪·穆雷",
  "carlos alcaraz": "阿尔卡拉斯",
  "andrey rublev": "卢布列夫",
  "medvedev": "梅德韦杰夫",
  "alex eala": "阿莱克斯·伊埃拉",
  "anna": "Anna"
};

const topicReplacements: Array<{ pattern: RegExp; replacement: string }> = [
  { pattern: /groundstroke depth/i, replacement: "底线球深度控制" },
  { pattern: /backhand slice/i, replacement: "反手切削" },
  { pattern: /2nd serve|second serve/i, replacement: "二发" },
  { pattern: /kick serve/i, replacement: "上旋发球" },
  { pattern: /slice serve/i, replacement: "切削发球" },
  { pattern: /basic tennis serve|basic serve/i, replacement: "基础发球" },
  { pattern: /tennis serve|serve technique|serve/i, replacement: "网球发球" },
  { pattern: /return of serve|serve return/i, replacement: "接发球" },
  { pattern: /drop shot/i, replacement: "放短球" },
  { pattern: /volley/i, replacement: "截击" },
  { pattern: /footwork/i, replacement: "步法" },
  { pattern: /forehand/i, replacement: "正手" },
  { pattern: /backhand/i, replacement: "反手" },
  { pattern: /slice/i, replacement: "切削" },
  { pattern: /topspin/i, replacement: "上旋" },
  { pattern: /overhead/i, replacement: "高压球" },
  { pattern: /doubles/i, replacement: "双打站位" },
  { pattern: /return/i, replacement: "接发球" }
];

function normalizeText(value: string) {
  return value.replace(/\s+/g, " ").trim();
}

function normalizeChineseSentence(value: string) {
  return normalizeText(value)
    .replace(/^适合作为/, "")
    .replace(/^适合/, "")
    .replace(/^针对[:：]\s*/, "")
    .replace(/。/g, "")
    .trim();
}

function chineseSkillLabel(skill?: string) {
  const map: Record<string, string> = {
    forehand: "正手技术",
    backhand: "反手技术",
    serve: "发球技术",
    movement: "步法训练",
    footwork: "步法训练",
    net: "网前技术",
    doubles: "双打战术",
    return: "接发球",
    topspin: "上旋技术",
    slice: "切球技术",
    consistency: "稳定性训练"
  };

  return skill ? map[skill] ?? "网球教学" : "网球教学";
}

function cleanTitle(title: string) {
  return normalizeText(title)
    .replace(/\s*[|｜]\s*[^|｜]+$/g, "")
    .replace(/[🎾🚀💪🔨✨🧐🐐🇪🇸🤔🔥✅❗️‼️]+/g, "")
    .trim();
}

function findKnownChineseNameInText(value?: string | null) {
  const normalized = normalizeText(value ?? "").toLowerCase();
  for (const [english, chinese] of Object.entries(englishNameReplacements)) {
    if (normalized.includes(english)) {
      return chinese;
    }
  }
  return null;
}

function getChineseTopicFromEnglishTitle(title: string, skillHints: string[]) {
  for (const { pattern, replacement } of topicReplacements) {
    if (pattern.test(title)) {
      return replacement;
    }
  }

  return chineseSkillLabel(skillHints[0]).replace(/技术|训练$/, "");
}

function getSkillHints(title: string, target: string, creatorSpecialties: string[]) {
  const hints = [...creatorSpecialties];
  const original = cleanTitle(title).toLowerCase();
  if (/forehand/.test(original) && !hints.includes("forehand")) hints.unshift("forehand");
  if (/backhand/.test(original) && !hints.includes("backhand")) hints.unshift("backhand");
  if (/serve|kick serve|slice serve|2nd serve|second serve/.test(original) && !hints.includes("serve")) hints.unshift("serve");
  if (/footwork|split step/.test(original) && !hints.includes("footwork")) hints.unshift("footwork");
  if (/return/.test(original) && !hints.includes("return")) hints.unshift("return");
  if (/volley|net/.test(original) && !hints.includes("net")) hints.unshift("net");
  if (/doubles/.test(original) && !hints.includes("doubles")) hints.unshift("doubles");
  if (/slice/.test(original) && !hints.includes("slice")) hints.unshift("slice");
  if (/topspin/.test(original) && !hints.includes("topspin")) hints.unshift("topspin");
  if (/发球|一发|二发|抛球/.test(target) && !hints.includes("serve")) hints.unshift("serve");
  if (/正手/.test(target) && !hints.includes("forehand")) hints.unshift("forehand");
  if (/反手/.test(target) && !hints.includes("backhand")) hints.unshift("backhand");
  if (/切削/.test(target) && !hints.includes("slice")) hints.unshift("slice");
  if (/脚步|步法/.test(target) && !hints.includes("footwork")) hints.unshift("footwork");
  if (/双打/.test(target) && !hints.includes("doubles")) hints.unshift("doubles");
  if (/接发/.test(target) && !hints.includes("return")) hints.unshift("return");
  if (/截击|网前/.test(target) && !hints.includes("net")) hints.unshift("net");
  return Array.from(new Set(hints));
}

function suggestFromTitle(
  originalTitle: string,
  creatorName: string,
  creatorSpecialties: string[]
) {
  const title = cleanTitle(originalTitle);
  const topic = getChineseTopicFromEnglishTitle(title, creatorSpecialties);
  const creatorNameZh = findKnownChineseNameInText(title) || findKnownChineseNameInText(creatorName);
  const episode = title.match(/\bepisode\s*(\d+)\b/i)?.[1];
  const minute = title.match(/\b(\d+)[-\s]*minute\b/i)?.[1];
  const stepCount = title.match(/\b(\d+)\s*(?:simple\s*)?steps?\b/i)?.[1]
    || title.match(/\b(\d+)\s*step guide\b/i)?.[1];
  const topCount = title.match(/\btop\s*(\d+)\b/i)?.[1];
  const versus = title.match(/\b([A-Za-z]+)\s+vs\s+([A-Za-z]+)\b/i);
  const left = findKnownChineseNameInText(versus?.[1]);
  const right = findKnownChineseNameInText(versus?.[2]);

  if (/^how to hit a basic .* with /i.test(title) && creatorNameZh) return `跟${creatorNameZh}学网球基础发球`;
  if (/^how to hit a 2nd serve/i.test(title) && creatorNameZh) return `跟${creatorNameZh}学网球二发`;
  if (/^how to hit forehand/i.test(title) && creatorNameZh) return `跟${creatorNameZh}学网球正手`;
  if (/^how to hit a tennis backhand/i.test(title) && creatorNameZh) return `跟${creatorNameZh}学网球反手`;
  if (/^how to improve your footwork/i.test(title) && creatorNameZh) return `跟${creatorNameZh}提升场上步法`;
  if (/let.?s level up your serve/i.test(title)) return "让你的发球整体升级";
  if (/stop over-rotating your forehand/i.test(title)) return "正手别再过度转体";
  if (/avoid late contact when hitting/i.test(title)) return "避免击球点过晚";
  if (/return of serve:.*masterclass/i.test(title)) return `接发球精讲：莫拉托格鲁大师课${episode ? `第${episode}集` : ""}`;
  if (/serve and volley:.*masterclass/i.test(title)) return `发球上网精讲：莫拉托格鲁大师课${episode ? `第${episode}集` : ""}`;
  if (/get rid of double faults/i.test(title)) return "摆脱双误：发球纠正课";
  if (minute && /slice serve/i.test(title)) return `${minute}分钟学会切削发球`;
  if (/serve more accurately/i.test(title)) return "提升发球落点准确性";
  if (/powerful kick serve/i.test(title) && stepCount) return `大力上旋发球：${stepCount}步完整指南`;
  if (/master your tennis serve/i.test(title) && topCount) return `让发球动作更流畅：${topCount}个必练动作`;
  if (/drop shot/i.test(title)) return "放短球技巧讲解";
  if (/carlos alcaraz forehand analysis/i.test(title)) return "阿尔卡拉斯正手解析";
  if (/forehand transformation of us college player/i.test(title)) return "美国大学球员正手改造案例";
  if (/forehand power unlocked/i.test(title)) return "解锁正手力量：这样打出球速";
  if (/hammer your serve for more power/i.test(title)) return "增强发球力量：关键动作讲解";
  if (/real serve improvement/i.test(title)) return "真正提升发球，而不只是小修小补";
  if (/how to control groundstroke depth/i.test(title)) return "如何把底线球打得更深：深度控制讲解";
  if (/hit up on kick with bent arm/i.test(title)) return "4.5学员上旋发球发力路径纠正";
  if (/kick serve vs slice serve/i.test(title)) return "上旋发球和切削发球区别讲解";
  if (/wrong place/i.test(title) && /doubles/i.test(title)) return "双打站位别再站错：实战站位策略";
  if (/flat and slice serves/i.test(title)) return "平击发球和切削发球提升讲解";
  if (/bad tennis habits/i.test(title)) return "为什么你总改不掉坏习惯";
  if (/andrey rublev/i.test(title) && /forehand/i.test(title)) return "像卢布列夫那样打出有冲击力的正手";
  if (/roger federer/i.test(title) && /forehand/i.test(title)) return "解锁费德勒正手的关键秘诀";
  if (/pro forehand/i.test(title) && stepCount) return `职业级正手：${stepCount}步讲清动作要点`;
  if (/professional volley technique explained/i.test(title)) return "截击技术详解：职业级网前动作课";
  if (/serve pronation/i.test(title) && topCount) return `${topCount}个练习学会轻松发球内旋`;
  if (/master the kick serve/i.test(title)) return "上旋发球精讲：职业示范版";
  if (/spanish drill/i.test(title)) return "提升稳定性的经典西班牙训练";
  if (/open vs closed/i.test(title) && /forehand stance/i.test(title)) return "正手站位别再用错：开放式与关闭式讲解";
  if (/learning lag/i.test(title)) return "学会拍头滞后：轻松加速的关键";
  if (/perfect return/i.test(title)) return "接发球关键动作讲解";
  if (/5 biggest forehand mistakes/i.test(title)) return "正手最常见的5个错误";
  if (/3 return tips/i.test(title)) return "安迪·穆雷的3个接发建议";
  if (/open stance backhand/i.test(title)) return "开放式反手教学";
  if (/5 footwork fundamentals/i.test(title)) return "每个网球选手都该掌握的5个步法基础";
  if (/singles tennis strategy and shot selection - the four zones/i.test(title)) return "单打选球与战术：四个分区思路";
  if (/why you trust your backhand more than your forehand/i.test(title)) return "为什么你更信任反手而不是正手";
  if (/evolution of the split step/i.test(title)) return "分腿垫步的演变：为什么职业球员会做二次分腿";
  if (/hidden detail in tennis: 3 different ready positions/i.test(title)) return "准备姿势的隐藏细节：3种 ready position";
  if (/why pros have effortless power/i.test(title)) return "为什么职业球员能轻松发力：拍头滞后测试";
  if (/forehand - topspin and flat swing path/i.test(title)) return "正手上旋与平击挥拍路径讲解";
  if (/burst and glide/i.test(title)) return "启动与滑步衔接讲解";
  if (/subscriber serve vs federer/i.test(title)) return "业余发球 vs 费德勒发球：差别在哪";
  if (/this point is a perfect example of how (.+) broke (.+)'s game/i.test(title)) {
    const match = title.match(/this point is a perfect example of how (.+) broke (.+)'s game/i);
    const winner = findKnownChineseNameInText(match?.[1]) || match?.[1];
    const loser = findKnownChineseNameInText(match?.[2]) || match?.[2];
    return `${winner}如何破解${loser}打法：经典回合解析`;
  }
  if (/the weirdest (.+) vs (.+) rally you missed/i.test(title) && left && right) return `你可能错过的${left} vs ${right}神奇回合`;
  if (/did this play make (.+) the goat/i.test(title)) return `这一分让${findKnownChineseNameInText(title) || "这位球员"}更像GOAT吗`;
  if (/beat (.+) with a shot pros almost never hit/i.test(title)) return `少见却高效的得分回合解析`;
  if (left && right) return `${left} vs ${right}回合解析`;
  if (/top\s*(\d+)\s+beginner tennis drills/i.test(title)) return `新手最值得练的${title.match(/top\s*(\d+)/i)?.[1] ?? "10"}个网球训练`;
  if (/expectation vs reality/i.test(title)) return "理想与现实：动作效果对比";
  if (/overhead/i.test(title) && /mistakes/i.test(title) && topCount) return `高压球最常见的${topCount}个错误`;
  if (/bounce vs out of the air/i.test(title)) return "高压球该等落地还是直接截击";
  if (/overhead technique/i.test(title)) return "高压球技术详解";
  if (/overhead positioning/i.test(title)) return "高压球站位讲解";
  if (/overhead prep/i.test(title)) return "高压球准备动作讲解";
  if (/swing volley/i.test(title)) return "挥拍截击讲解";
  if (/drop shot/i.test(title) && /punish slow balls/i.test(title)) return "慢球处理：放短球得分思路";
  if (/volley/i.test(title) && /punish slow balls/i.test(title)) return "慢球处理：截击得分思路";
  if (/serve return/i.test(title) && /punish slow balls/i.test(title)) return "慢球处理：接发抢攻思路";
  if (/beat left-handed tennis players/i.test(title)) return "如何应对左手球员：赢球套路";
  if (/attack deep balls/i.test(title)) return "如何进攻深球";
  if (/become one with the ball/i.test(title)) return "提升球感：让击球更顺";
  if (/analysis/i.test(title) && topic) return `${topic}解析`;
  if (/masterclass/i.test(title) && topic) return `${topic}精讲${episode ? `：大师课第${episode}集` : ""}`;
  if (/explained/i.test(title) && topic) return `${topic}详解`;
  if (/tips?/i.test(title) && topic) return `${topic}技巧讲解`;
  if (/drills?/i.test(title) && topic) return `${topic}训练方法`;
  if ((/strategy|strategies|tactics|patterns/i.test(title)) && topic) return `${topic}实战套路`;
  if (/fundamentals/i.test(title) && topic) return `${topic}基础要点`;
  if (/demo/i.test(title) && topic) return `${topic}示范讲解`;
  if ((stepCount || topCount) && topic) return `${topic}${stepCount || topCount}个重点讲解`;
  if (/lesson/i.test(title) && topic) return `${topic}教学课`;
  if (/how to |how /i.test(title) && topic) {
    if (/improve|better|level up|make /i.test(title)) return `${topic}提升讲解`;
    if (/fix|avoid|prevent|stop|get rid/i.test(title)) return `${topic}纠正讲解`;
    if (/control/i.test(title)) return topic.endsWith("控制") ? `${topic}讲解` : `${topic}控制讲解`;
    return `${topic}讲解`;
  }
  if (/mistakes?|myths?/i.test(title) && topic) return `${topic}常见误区解析`;
  if (/why/i.test(title) && topic) return `${topic}问题解析`;
  return null;
}

function suggestFromTarget(target: string, creatorSpecialties: string[]) {
  const topic = chineseSkillLabel(creatorSpecialties[0]).replace(/技术|训练$/, "") || "网球";
  const normalized = normalizeChineseSentence(target);
  if (!normalized) return null;
  if (normalized.startsWith("为何") || normalized.startsWith("怎么")) return `${topic}：${normalized}`;
  return `${topic}：重点解决${normalized}`;
}

function resolveFeaturedSuggestion(title: string, target: string, creatorName: string, creatorSpecialties: string[]) {
  const skillHints = getSkillHints(title, target, creatorSpecialties);
  const titleSuggestion = suggestFromTitle(title, creatorName, skillHints);
  if (titleSuggestion) {
    return { title: titleSuggestion, source: "title_template" as SuggestionSource };
  }

  const targetSuggestion = suggestFromTarget(target, skillHints);
  if (targetSuggestion) {
    return { title: targetSuggestion, source: "target" as SuggestionSource };
  }

  return {
    title: chineseSkillLabel(skillHints[0]),
    source: "generic_skill" as SuggestionSource
  };
}

const outputPath = path.join(process.cwd(), "CONTENT_TRANSLATION_BACKLOG.md");

const contentBacklog = contents.filter((item) => item.language === "en" && !item.secondaryTitleZh?.trim());

const featuredBacklog = creators.flatMap((creator) => {
  const pending = (creator.featuredVideos ?? []).flatMap((video) => {
    const originalTitle = video.originalTitle?.trim() || video.sourceTitle?.trim() || video.title?.trim() || "";
    const hasLatin = /[A-Za-z]/.test(originalTitle);
    const hasCJK = /[\u3400-\u9fff]/.test(originalTitle);

    if (!hasLatin || hasCJK || video.displayTitleZh?.trim() || CREATOR_FEATURED_VIDEO_CHINESE_SUBTITLE_OVERRIDES[video.id]?.trim()) {
      return [];
    }

    const suggestion = resolveFeaturedSuggestion(originalTitle, video.target, creator.name, creator.specialties);
    return [{
      creatorId: creator.id,
      creatorName: creator.name,
      videoId: video.id,
      title: originalTitle,
      target: video.target,
      url: video.url,
      suggestedTitleZh: suggestion.title,
      suggestionSource: suggestion.source
    }];
  });

  if (pending.length === 0) {
    return [];
  }

  return [{
    creatorId: creator.id,
    creatorName: creator.name,
    entries: pending
  }];
});

const lines: string[] = [
  "# Content Translation Backlog",
  "",
  "Tracks English-language videos that still need hand-polished Chinese subtitles. Suggested subtitles below are the second-pass drafts for manual review.",
  "",
  "## Summary",
  "",
  `- Content items pending manual subtitles: ${contentBacklog.length}`,
  `- Creator featured videos pending manual subtitles: ${featuredBacklog.reduce((total, group) => total + group.entries.length, 0)}`,
  `- Total pending entries: ${contentBacklog.length + featuredBacklog.reduce((total, group) => total + group.entries.length, 0)}`,
  "",
  "## Review Notes",
  "",
  "- If a title already has a hand-polished Chinese subtitle in data, it should not stay on this list.",
  "- `ContentItem` entries use `secondaryTitleZh`.",
  "- `CreatorFeaturedVideo` entries can use `displayTitleZh` or the curated Chinese subtitle override map.",
  "- `suggestion source: title_template` is usually the most review-ready.",
  "- If you approve a suggested subtitle, move it into the corresponding data field and regenerate this file.",
  "",
  "## Content Items Still Needing Manual Polish",
  ""
];

if (contentBacklog.length === 0) {
  lines.push("_None right now._", "");
} else {
  for (const item of contentBacklog) {
    lines.push(
      `- \`${item.id}\` | \`${item.title}\` | creator: \`${item.creatorId}\` | url: ${item.url}`,
      ""
    );
  }
}

lines.push("## Creator Featured Videos Still Needing Manual Polish", "");

if (featuredBacklog.length === 0) {
  lines.push("_None right now._", "");
} else {
  for (const group of featuredBacklog) {
    lines.push(`### ${group.creatorName} (${group.entries.length})`, "");

    for (const entry of group.entries) {
      const target = entry.target?.trim() ? ` | target: \`${entry.target.trim()}\`` : "";
      lines.push(
        `- \`${entry.videoId}\` | \`${entry.title}\` | 建议：\`${entry.suggestedTitleZh}\` | source: \`${entry.suggestionSource}\`${target} | url: ${entry.url}`
      );
    }

    lines.push("");
  }
}

fs.writeFileSync(outputPath, `${lines.join("\n").trimEnd()}\n`, "utf8");

console.log(`Wrote ${path.relative(process.cwd(), outputPath)}`);
console.log(`- Pending content items: ${contentBacklog.length}`);
console.log(`- Pending creator featured videos: ${featuredBacklog.reduce((total, group) => total + group.entries.length, 0)}`);
