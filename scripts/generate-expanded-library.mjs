import crypto from "node:crypto";
import fs from "node:fs/promises";
import path from "node:path";
import { createRequire } from "node:module";
import vm from "node:vm";
import ts from "typescript";

const projectRoot = process.cwd();
const creatorsPath = path.join(projectRoot, "src", "data", "creators.ts");
const contentsPath = path.join(projectRoot, "src", "data", "contents.ts");
const outputPath = path.join(projectRoot, "src", "data", "expandedContents.ts");
const envPath = path.join(projectRoot, ".env.local");
const BILIBILI_MIN_COUNT = 200;
const YOUTUBE_MIN_COUNT = 200;
const TARGET_PER_CREATOR = 20;
const require = createRequire(import.meta.url);

const zhIncludeKeywords = [
  "教学",
  "技巧",
  "如何",
  "发球",
  "正手",
  "反手",
  "截击",
  "网前",
  "双打",
  "接发",
  "步伐",
  "脚步",
  "切削",
  "上旋",
  "平击",
  "战术",
  "握拍",
  "击球",
  "训练",
  "练习",
  "热身",
  "底线",
  "高球",
  "放小球",
  "心理",
  "自习",
  "垫步",
  "单反",
  "双反",
  "落点",
  "稳定",
  "节奏"
];

const zhExcludeKeywords = [
  "球拍",
  "测评",
  "评测",
  "穿线",
  "拉线",
  "装备",
  "开箱",
  "vcore",
  "ezone",
  "pro staff",
  "clash",
  "wilson",
  "yonex",
  "海德",
  "head",
  "babolat",
  "鞋",
  "包",
  "直播",
  "福利视频",
  "抽奖"
];

const enIncludeKeywords = [
  "how to",
  "lesson",
  "drill",
  "training",
  "technique",
  "tactic",
  "strategy",
  "serve",
  "forehand",
  "backhand",
  "volley",
  "slice",
  "return",
  "footwork",
  "movement",
  "doubles",
  "topspin",
  "kick serve",
  "second serve",
  "split step",
  "grip",
  "approach shot",
  "drop shot",
  "lob",
  "depth",
  "consistency",
  "match play",
  "net play",
  "mental"
];

const enExcludeKeywords = [
  "review",
  "racquet",
  "racket",
  "string",
  "strings",
  "shoe",
  "shoes",
  "bag",
  "gear",
  "vlog",
  "podcast",
  "live stream",
  "livestream",
  "reaction",
  "highlights",
  "unboxing",
  "travel",
  "behind the scenes"
];

const skillRules = [
  { skill: "serve", zh: ["发球", "二发", "一发", "抛球", "侧旋", "平击", "kick serve", "serve"], en: ["serve", "kick serve", "second serve", "slice serve"] },
  { skill: "return", zh: ["接发", "接发球", "return"], en: ["return", "return of serve"] },
  { skill: "forehand", zh: ["正手", "forehand"], en: ["forehand"] },
  { skill: "backhand", zh: ["反手", "单反", "双反", "backhand"], en: ["backhand", "one-handed", "two-handed"] },
  { skill: "net", zh: ["截击", "网前", "volley", "半截击"], en: ["volley", "net", "approach shot", "half volley"] },
  { skill: "doubles", zh: ["双打"], en: ["doubles"] },
  { skill: "movement", zh: ["步伐", "脚步", "垫步", "移动", "到位"], en: ["footwork", "movement", "split step", "recover"] },
  { skill: "footwork", zh: ["步伐", "脚步", "垫步"], en: ["footwork", "split step"] },
  { skill: "slice", zh: ["切削", "slice"], en: ["slice"] },
  { skill: "topspin", zh: ["上旋", "topspin"], en: ["topspin"] },
  { skill: "grip", zh: ["握拍", "拍握"], en: ["grip"] },
  { skill: "training", zh: ["训练", "练习", "热身", "计划", "drill"], en: ["drill", "training", "practice plan", "warm up", "workout"] },
  { skill: "matchplay", zh: ["战术", "比赛", "实战", "套路"], en: ["tactic", "strategy", "match play", "point construction"] },
  { skill: "mental", zh: ["心理", "心态", "紧张"], en: ["mental", "confidence", "mindset", "pressure"] },
  { skill: "defense", zh: ["高球", "防守", "救球"], en: ["lob", "defense", "defensive"] },
  { skill: "consistency", zh: ["稳定", "对拉", "节奏"], en: ["consistency", "depth", "rally"] },
  { skill: "basics", zh: ["教学", "如何", "基础", "自习"], en: ["how to", "beginner", "basics", "fundamentals"] }
];

const reasonBySkill = {
  serve: "发球动作总不顺",
  return: "接发总被对手压住",
  forehand: "正手总发不上力",
  backhand: "反手总打不扎实",
  net: "网前总不敢主动上",
  doubles: "双打站位总发乱",
  movement: "脚步启动总慢半拍",
  footwork: "分腿垫步总踩不准",
  slice: "切削总飘不压低",
  topspin: "上旋总转不起来",
  grip: "握拍总不稳定",
  training: "练球总没结构",
  matchplay: "比赛思路总不够清楚",
  mental: "比赛里总容易紧",
  defense: "高球和防守总处理不好",
  consistency: "相持球总不够稳",
  basics: "基础动作总立不住"
};

const problemTagsBySkill = {
  serve: ["serve-basics", "serve-rhythm"],
  return: ["return-under-pressure", "late-contact"],
  forehand: ["forehand-no-power", "forehand-out"],
  backhand: ["backhand-into-net", "late-contact"],
  net: ["net-confidence", "volley-errors"],
  doubles: ["doubles-positioning", "doubles-net-fear"],
  movement: ["movement-slow", "late-contact"],
  footwork: ["movement-slow", "late-contact"],
  slice: ["slice-too-high", "trouble-with-slice"],
  topspin: ["topspin-low", "forehand-out"],
  grip: ["no-clear-technique", "forehand-no-power"],
  training: ["cant-self-practice", "no-clear-technique"],
  matchplay: ["match-anxiety", "cant-self-practice"],
  mental: ["match-anxiety"],
  defense: ["cant-hit-lob", "balls-too-short"],
  consistency: ["balls-too-short", "no-clear-technique"],
  basics: ["no-clear-technique", "late-contact"]
};

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function loadLocalEnv() {
  try {
    const raw = await fs.readFile(envPath, "utf8");
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith("#")) {
        continue;
      }

      const separatorIndex = trimmed.indexOf("=");
      if (separatorIndex <= 0) {
        continue;
      }

      const key = trimmed.slice(0, separatorIndex).trim();
      let value = trimmed.slice(separatorIndex + 1).trim();
      if (
        (value.startsWith("\"") && value.endsWith("\"")) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      if (!(key in process.env)) {
        process.env[key] = value;
      }
    }
  } catch {
    // ignore missing env
  }
}

async function loadTsExport(filePath, exportName) {
  const source = await fs.readFile(filePath, "utf8");
  const stripped = source.replace(/^import\s+.*?;\s*$/gm, "");
  const transpiled = ts.transpileModule(stripped, {
    compilerOptions: {
      module: ts.ModuleKind.CommonJS,
      target: ts.ScriptTarget.ES2020
    },
    fileName: filePath
  });

  const module = { exports: {} };
  const context = vm.createContext({
    module,
    exports: module.exports,
    require,
    console,
    process,
    __dirname: path.dirname(filePath),
    __filename: filePath
  });

  vm.runInContext(transpiled.outputText, context, { filename: filePath });
  return module.exports[exportName];
}

function normalizeUrl(url) {
  return url.replace(/\/+$/, "");
}

function htmlDecode(value) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, "\"")
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function formatSecondsAsDuration(totalSeconds) {
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }

  return `${minutes}:${String(seconds).padStart(2, "0")}`;
}

function parseIsoDuration(iso) {
  const match = iso.match(/PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/);
  if (!match) {
    return null;
  }

  const hours = match[1] ? Number.parseInt(match[1], 10) : 0;
  const minutes = match[2] ? Number.parseInt(match[2], 10) : 0;
  const seconds = match[3] ? Number.parseInt(match[3], 10) : 0;
  return formatSecondsAsDuration(hours * 3600 + minutes * 60 + seconds);
}

function scoreByStats(plays, comments) {
  return plays + comments * 80;
}

function getTextByLanguage(title, language) {
  return language === "zh" ? title : title.toLowerCase();
}

function matchesAny(text, keywords) {
  return keywords.some((keyword) => text.includes(keyword));
}

function detectSkills(title, creator) {
  const lower = title.toLowerCase();
  const detected = [];

  for (const rule of skillRules) {
    const keywords = [...rule.zh, ...rule.en];
    if (keywords.some((keyword) => lower.includes(keyword.toLowerCase()))) {
      detected.push(rule.skill);
    }
  }

  if (detected.length === 0) {
    detected.push(...creator.specialties.slice(0, 3));
  }

  const unique = [...new Set(detected.filter(Boolean))];
  return unique.length > 0 ? unique : ["basics"];
}

function classifyBilibiliTitle(title) {
  const normalized = title.toLowerCase();
  const includeScore = zhIncludeKeywords.filter((keyword) => normalized.includes(keyword.toLowerCase())).length;
  const excluded = zhExcludeKeywords.some((keyword) => normalized.includes(keyword.toLowerCase()));
  const strong = includeScore > 0 && !excluded;
  const weak = !excluded;
  return { strong, weak };
}

function classifyYouTubeTitle(title) {
  const normalized = title.toLowerCase();
  const includeScore = enIncludeKeywords.filter((keyword) => normalized.includes(keyword)).length;
  const excluded = enExcludeKeywords.some((keyword) => normalized.includes(keyword));
  const strong = includeScore > 0 && !excluded;
  const weak = !excluded;
  return { strong, weak };
}

function buildReason(title, creator) {
  const detectedSkills = detectSkills(title, creator);
  for (const skill of detectedSkills) {
    if (reasonBySkill[skill]) {
      return reasonBySkill[skill];
    }
  }
  return creator.region === "domestic" ? "动作总没有抓手" : "动作问题总找不到重点";
}

function buildProblemTags(title, creator) {
  const tags = [];
  for (const skill of detectSkills(title, creator)) {
    tags.push(...(problemTagsBySkill[skill] ?? []));
  }
  return [...new Set(tags)].slice(0, 3);
}

function getPrimarySkill(title, creator) {
  return detectSkills(title, creator)[0] ?? creator.specialties[0] ?? "basics";
}

function diversifySelection(candidates, limit) {
  const grouped = new Map();
  for (const candidate of candidates) {
    const key = candidate.primarySkill;
    if (!grouped.has(key)) {
      grouped.set(key, []);
    }
    grouped.get(key).push(candidate);
  }

  for (const group of grouped.values()) {
    group.sort((a, b) => b.score - a.score);
  }

  const groupKeys = [...grouped.entries()]
    .sort((a, b) => b[1][0].score - a[1][0].score)
    .map(([key]) => key);

  const selected = [];
  while (selected.length < limit) {
    let madeProgress = false;
    for (const key of groupKeys) {
      const group = grouped.get(key);
      if (!group || group.length === 0) {
        continue;
      }
      selected.push(group.shift());
      madeProgress = true;
      if (selected.length >= limit) {
        break;
      }
    }
    if (!madeProgress) {
      break;
    }
  }

  return selected;
}

async function fetchBilibiliSeasonSeries(mid) {
  const response = await fetch(
    `https://api.bilibili.com/x/polymer/web-space/home/seasons_series?mid=${mid}&page_num=1&page_size=20`,
    {
      headers: {
        "user-agent": "Mozilla/5.0"
      }
    }
  );

  if (!response.ok) {
    throw new Error(`Bilibili seasons API failed for ${mid}: ${response.status}`);
  }

  const payload = await response.json();
  if (payload?.code !== 0) {
    throw new Error(`Bilibili seasons API error ${payload.code}: ${payload.message}`);
  }

  return payload?.data?.items_lists ?? { seasons_list: [], series_list: [] };
}

async function getYouTubeChannelInfo(handle) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  if (!apiKey) {
    throw new Error("YOUTUBE_API_KEY is required to generate expanded YouTube contents.");
  }

  const normalizedHandle = handle.replace(/^@/, "");
  const response = await fetch(
    `https://www.googleapis.com/youtube/v3/channels?part=contentDetails,snippet&forHandle=${encodeURIComponent(normalizedHandle)}&key=${apiKey}`
  );

  if (!response.ok) {
    throw new Error(`YouTube channels API failed for ${handle}: ${response.status}`);
  }

  const payload = await response.json();
  const item = payload?.items?.[0];
  if (!item) {
    throw new Error(`Could not resolve channel for ${handle}`);
  }

  return {
    channelId: item.id,
    uploadsPlaylistId: item.contentDetails.relatedPlaylists.uploads
  };
}

async function fetchYouTubeUploads(playlistId, maxItems = 120) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const uploads = [];
  let pageToken = "";

  while (uploads.length < maxItems) {
    const params = new URLSearchParams({
      part: "snippet,contentDetails",
      playlistId,
      maxResults: "50",
      key: apiKey
    });
    if (pageToken) {
      params.set("pageToken", pageToken);
    }

    const response = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`YouTube playlistItems API failed: ${response.status}`);
    }

    const payload = await response.json();
    for (const item of payload.items ?? []) {
      const videoId = item.contentDetails?.videoId;
      const title = item.snippet?.title;
      if (videoId && title) {
        uploads.push({
          id: videoId,
          title,
          publishedAt: item.snippet?.publishedAt ?? ""
        });
      }
      if (uploads.length >= maxItems) {
        break;
      }
    }

    if (!payload.nextPageToken || uploads.length >= maxItems) {
      break;
    }

    pageToken = payload.nextPageToken;
  }

  return uploads;
}

async function fetchYouTubeVideoDetails(videoIds) {
  const apiKey = process.env.YOUTUBE_API_KEY;
  const details = [];

  for (let index = 0; index < videoIds.length; index += 50) {
    const batch = videoIds.slice(index, index + 50);
    const params = new URLSearchParams({
      part: "snippet,contentDetails,statistics",
      id: batch.join(","),
      key: apiKey
    });

    const response = await fetch(`https://www.googleapis.com/youtube/v3/videos?${params.toString()}`);
    if (!response.ok) {
      throw new Error(`YouTube videos API failed: ${response.status}`);
    }

    const payload = await response.json();
    details.push(...(payload.items ?? []));
  }

  return details;
}

function buildBilibiliContentItem(creator, video) {
  const primarySkill = getPrimarySkill(video.title, creator);
  const reason = buildReason(video.title, creator);

  return {
    id: `content_expanded_bilibili_${creator.id}_${video.id.toLowerCase()}`,
    title: htmlDecode(video.title),
    sourceTitle: htmlDecode(video.title),
    creatorId: creator.id,
    platform: "Bilibili",
    type: "video",
    levels: creator.levels,
    skills: detectSkills(video.title, creator),
    problemTags: buildProblemTags(video.title, creator),
    language: "zh",
    summary: creator.shortDescription,
    reason,
    useCases: [reason],
    coachReason: creator.bio,
    thumbnail: video.thumbnail,
    duration: video.duration,
    viewCount: video.viewCount,
    url: video.url,
    __meta: {
      score: video.score,
      primarySkill
    }
  };
}

function buildYouTubeContentItem(creator, video) {
  const primarySkill = getPrimarySkill(video.title, creator);
  const reason = buildReason(video.title, creator);

  return {
    id: `content_expanded_youtube_${creator.id}_${video.id.toLowerCase()}`,
    title: video.title,
    sourceTitle: video.title,
    creatorId: creator.id,
    platform: "YouTube",
    type: "video",
    levels: creator.levels,
    skills: detectSkills(video.title, creator),
    problemTags: buildProblemTags(video.title, creator),
    language: "en",
    summary: creator.shortDescription,
    reason,
    useCases: [reason],
    coachReason: creator.bio,
    thumbnail: video.thumbnail,
    duration: video.duration,
    viewCount: video.viewCount,
    url: video.url,
    __meta: {
      score: video.score,
      primarySkill
    }
  };
}

function stripMeta(items) {
  return items.map(({ __meta, ...item }) => item);
}

async function main() {
  await loadLocalEnv();

  const creators = await loadTsExport(creatorsPath, "creators");
  const contents = await loadTsExport(contentsPath, "contents");
  const derivedFeaturedItems = creators.flatMap((creator, index) =>
    (creator.featuredVideos ?? []).map((video, videoIndex) => ({
      id: `featured_${index}_${videoIndex}`,
      creatorId: creator.id,
      platform: video.platform,
      url: video.url
    }))
  );
  const baseLibraryItems = [...contents, ...derivedFeaturedItems].filter((item, index, array) => {
    const normalized = normalizeUrl(item.url);
    return array.findIndex((candidate) => normalizeUrl(candidate.url) === normalized) === index;
  });
  const existingUrls = new Set(baseLibraryItems.map((item) => normalizeUrl(item.url)));

  const bilibiliCreators = creators.filter((creator) => Boolean(creator.platformLinks?.Bilibili));
  const youtubeCreators = creators.filter((creator) => Boolean(creator.platformLinks?.YouTube));

  const bilibiliItems = [];
  const bilibiliSeenUrls = new Set(existingUrls);

  for (const creator of bilibiliCreators) {
    const profileUrl = creator.platformLinks.Bilibili;
    const mid = profileUrl.match(/space\.bilibili\.com\/(\d+)/)?.[1];
    if (!mid) {
      continue;
    }

    const seasonSeries = await fetchBilibiliSeasonSeries(mid);
    await sleep(220);

    const roughCandidates = [...(seasonSeries.seasons_list ?? []), ...(seasonSeries.series_list ?? [])]
      .flatMap((group) => group.archives ?? [])
      .filter((item) => item?.bvid && item?.pic)
      .map((item) => {
        const title = htmlDecode(item.title ?? "");
        const { strong, weak } = classifyBilibiliTitle(title);
        const viewCount = Number(item.stat?.view) || 0;
        return {
          id: item.bvid,
          title,
          strong,
          weak,
          score: scoreByStats(viewCount, Number(item.stat?.danmaku) || 0),
          viewCount,
          url: `https://www.bilibili.com/video/${item.bvid}/`,
          thumbnail: String(item.pic).startsWith("//")
            ? `https:${item.pic}`
            : String(item.pic).replace(/^http:\/\//, "https://"),
          duration: typeof item.duration === "number" ? formatSecondsAsDuration(item.duration) : null
        };
      })
      .filter((item) => item.weak);

    const verified = [];
    const roughSeen = new Set();
    for (const item of roughCandidates.sort((a, b) => Number(b.strong) - Number(a.strong) || b.score - a.score)) {
      const key = normalizeUrl(item.url);
      if (roughSeen.has(key) || bilibiliSeenUrls.has(key)) {
        continue;
      }
      roughSeen.add(key);
      verified.push(item);
    }

    const primarySelected = diversifySelection(
      verified
        .filter((item) => item.strong)
        .map((item) => ({ ...item, primarySkill: getPrimarySkill(item.title, creator) })),
      TARGET_PER_CREATOR
    );

    const selectedUrls = new Set(primarySelected.map((item) => normalizeUrl(item.url)));
    const fallbackSelected = diversifySelection(
      verified
        .filter((item) => !selectedUrls.has(normalizeUrl(item.url)))
        .map((item) => ({ ...item, primarySkill: getPrimarySkill(item.title, creator) })),
      TARGET_PER_CREATOR - primarySelected.length
    );

    for (const item of [...primarySelected, ...fallbackSelected]) {
      const libraryItem = buildBilibiliContentItem(creator, item);
      bilibiliItems.push(libraryItem);
      bilibiliSeenUrls.add(normalizeUrl(item.url));
    }
  }

  const youtubeItems = [];
  const youtubeSeenUrls = new Set(existingUrls);

  for (const creator of youtubeCreators) {
    const profileUrl = creator.platformLinks.YouTube;
    const handle = profileUrl.match(/youtube\.com\/(@[^/?]+)/)?.[1];
    if (!handle) {
      continue;
    }

    const channelInfo = await getYouTubeChannelInfo(handle);
    const uploads = await fetchYouTubeUploads(channelInfo.uploadsPlaylistId, 140);
    const details = await fetchYouTubeVideoDetails(uploads.map((item) => item.id));

    const detailMap = new Map(details.map((item) => [item.id, item]));
    const candidates = [];

    for (const upload of uploads) {
      const detail = detailMap.get(upload.id);
      if (!detail) {
        continue;
      }

      const title = detail.snippet?.title?.trim();
      if (!title) {
        continue;
      }

      const { strong, weak } = classifyYouTubeTitle(title);
      if (!weak) {
        continue;
      }

      const viewCount = Number(detail.statistics?.viewCount) || 0;
      const commentCount = Number(detail.statistics?.commentCount) || 0;
      const thumbnail = detail.snippet?.thumbnails?.medium?.url
        ?? detail.snippet?.thumbnails?.high?.url
        ?? detail.snippet?.thumbnails?.default?.url
        ?? null;

      if (!thumbnail) {
        continue;
      }

      const duration = parseIsoDuration(detail.contentDetails?.duration ?? "");
      if (!duration) {
        continue;
      }

      const url = `https://www.youtube.com/watch?v=${upload.id}`;
      if (youtubeSeenUrls.has(normalizeUrl(url))) {
        continue;
      }

      candidates.push({
        id: upload.id,
        title,
        strong,
        score: scoreByStats(viewCount, commentCount),
        viewCount,
        url,
        thumbnail,
        duration,
        primarySkill: getPrimarySkill(title, creator)
      });
    }

    candidates.sort((a, b) => Number(b.strong) - Number(a.strong) || b.score - a.score);

    const primarySelected = diversifySelection(candidates.filter((item) => item.strong), TARGET_PER_CREATOR);
    const selectedUrls = new Set(primarySelected.map((item) => normalizeUrl(item.url)));
    const fallbackSelected = diversifySelection(
      candidates.filter((item) => !selectedUrls.has(normalizeUrl(item.url))),
      TARGET_PER_CREATOR - primarySelected.length
    );

    for (const item of [...primarySelected, ...fallbackSelected]) {
      const libraryItem = buildYouTubeContentItem(creator, item);
      youtubeItems.push(libraryItem);
      youtubeSeenUrls.add(normalizeUrl(item.url));
    }
  }

  const bilibiliCount = bilibiliItems.length;
  const youtubeCount = youtubeItems.length;
  const baseBilibiliCount = baseLibraryItems.filter((item) => item.platform === "Bilibili").length;
  const baseYouTubeCount = baseLibraryItems.filter((item) => item.platform === "YouTube").length;
  const totalBilibiliCount = baseBilibiliCount + bilibiliCount;
  const totalYouTubeCount = baseYouTubeCount + youtubeCount;
  const allItems = [...stripMeta(bilibiliItems), ...stripMeta(youtubeItems)].sort((a, b) => a.id.localeCompare(b.id));

  if (totalBilibiliCount < BILIBILI_MIN_COUNT || totalYouTubeCount < YOUTUBE_MIN_COUNT) {
    throw new Error(
      `Library totals did not reach target counts. Bilibili=${totalBilibiliCount}, YouTube=${totalYouTubeCount}.`
    );
  }

  const fileContents = `import type { ContentItem } from "@/types/content";\n\nexport const expandedContents: ContentItem[] = ${JSON.stringify(allItems, null, 2)};\n`;
  await fs.writeFile(outputPath, fileContents, "utf8");

  console.log(`Expanded content file written to ${path.relative(projectRoot, outputPath)}.`);
  console.log(`Base Bilibili items: ${baseBilibiliCount}`);
  console.log(`Base YouTube items: ${baseYouTubeCount}`);
  console.log(`Expanded Bilibili items: ${bilibiliCount}`);
  console.log(`Expanded YouTube items: ${youtubeCount}`);
  console.log(`Total Bilibili items: ${totalBilibiliCount}`);
  console.log(`Total YouTube items: ${totalYouTubeCount}`);
  console.log(`Total expanded items: ${allItems.length}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
