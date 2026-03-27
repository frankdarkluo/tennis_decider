import { contents } from "@/data/contents";
import { Creator, CreatorFeaturedVideo } from "@/types/creator";
import { ContentItem } from "@/types/content";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { CreatorAvatar } from "@/components/ui/CreatorAvatar";
import { PlatformBadge } from "@/components/ui/PlatformBadge";
import { logEvent } from "@/lib/eventLogger";

type CreatorModalItem = {
  id: string;
  title: string;
  levels: string[];
  summary: string;
  url: string;
  platform: "Bilibili" | "YouTube";
  contentId?: string;
  logSource?: string;
};

const SKILL_CARD_MAP: Record<string, { title: string; summary: string; query: string }> = {
  basics: { title: "基础框架：先把动作理顺", summary: "先把基础框架理顺", query: "基础 动作" },
  forehand: { title: "正手基础：先把挥拍做顺", summary: "正手框架先稳定", query: "正手" },
  backhand: { title: "反手基础：先把击球做实", summary: "反手击球先稳定", query: "反手" },
  serve: { title: "发球节奏：先别急着发力", summary: "先把发球节奏理顺", query: "发球" },
  movement: { title: "脚步移动：先学会提前到位", summary: "先把脚步节奏理顺", query: "脚步 移动" },
  footwork: { title: "脚步移动：先学会提前到位", summary: "先把脚步节奏理顺", query: "脚步 移动" },
  matchplay: { title: "比赛思路：先学会打深", summary: "比赛执行先清晰", query: "比赛 实战" },
  doubles: { title: "双打站位：先看基础配合", summary: "双打配合先清楚", query: "双打 站位" },
  net: { title: "网前处理：先缩小动作", summary: "网前动作先稳住", query: "网前 截击" },
  return: { title: "接发准备：先稳住第一拍", summary: "接发第一拍先稳", query: "接发球" },
  consistency: { title: "稳定性：先把球送深", summary: "先把相持稳定住", query: "稳定性" },
  training: { title: "训练结构：先把内容排顺", summary: "练习结构先理顺", query: "训练" },
  grip: { title: "握拍调整：先找到顺手感觉", summary: "握拍感觉先顺住", query: "握拍" },
  slice: { title: "切削处理：先控住拍面", summary: "切削拍面先稳住", query: "切削" },
  topspin: { title: "上旋感觉：先把弧线拉起", summary: "上旋弧线先打出", query: "上旋" },
  mental: { title: "比赛心态：先盯下一拍", summary: "比赛注意力拉回", query: "比赛 心态" },
  defense: { title: "防守处理：先把高球送回", summary: "防守选择先清楚", query: "防守 高球" }
};

const TAG_TO_SKILL_MAP: Record<string, string[]> = {
  新手友好: ["basics"],
  细节导向: ["grip", "backhand"],
  讲解清晰: ["basics"],
  实战导向: ["matchplay"],
  基础导向: ["basics"],
  进阶提升: ["topspin", "matchplay"],
  双打专项: ["doubles"],
  节奏训练: ["serve"],
  发球专项: ["serve"],
  正手专项: ["forehand"],
  反手专项: ["backhand"],
  脚步移动: ["movement"]
};

function clampText(value: string, maxLength = 12) {
  if (value.length <= maxLength) {
    return value;
  }

  return `${value.slice(0, maxLength)}…`;
}

function getConciseDescription(item: ContentItem) {
  const source = item.useCases[0] || item.summary || item.reason;
  return clampText(source.replace(/\s+/g, " ").trim(), 12);
}

function formatTargetSummary(summary: string) {
  const normalized = summary.replace(/^针对：/, "").trim();
  return `针对：${normalized}`;
}

function buildSearchUrl(creator: Creator, query: string) {
  const fullQuery = `${creator.name} ${query}`.trim();

  if (creator.platforms.includes("Bilibili")) {
    return `https://search.bilibili.com/all?keyword=${encodeURIComponent(fullQuery)}`;
  }

  return `https://www.youtube.com/results?search_query=${encodeURIComponent(fullQuery)}`;
}

function buildFallbackItems(creator: Creator, existingIds: Set<string>) {
  const topics = [
    ...creator.specialties,
    ...creator.tags.flatMap((tag) => TAG_TO_SKILL_MAP[tag] ?? [])
  ].filter((topic, index, array) => array.indexOf(topic) === index);

  return topics
    .map((topic) => {
      const template = SKILL_CARD_MAP[topic];

      if (!template) {
        return null;
      }

      return {
        id: `fallback_${creator.id}_${topic}`,
        title: template.title,
        levels: creator.levels.slice(0, 3),
        summary: template.summary,
        url: buildSearchUrl(creator, template.query),
        platform: creator.platforms.includes("Bilibili") ? "Bilibili" : "YouTube"
      } satisfies CreatorModalItem;
    })
    .filter((item): item is CreatorModalItem => Boolean(item) && !existingIds.has(item!.id))
    .slice(0, 5);
}

export function CreatorDetailModal({ creator, open, onClose }: { creator: Creator | null; open: boolean; onClose: () => void }) {
  const creatorContents: CreatorModalItem[] = creator
    ? (creator.featuredContentIds.length > 0
      ? creator.featuredContentIds
        .map((id) => contents.find((item) => item.id === id))
        .filter((item): item is ContentItem => Boolean(item))
      : contents.filter((item) => item.creatorId === creator.id))
        .slice(0, 5)
        .map((item) => ({
          id: item.id,
          title: item.sourceTitle || item.title,
          levels: item.levels,
          summary: getConciseDescription(item),
          url: item.url,
          platform: item.platform === "Bilibili" ? "Bilibili" : "YouTube",
          contentId: item.id,
          logSource: "creator_modal_content"
        }))
    : [];
  const creatorFeaturedVideos: CreatorModalItem[] = creator
    ? (creator.featuredVideos ?? []).slice(0, 5).map((item: CreatorFeaturedVideo) => ({
      id: item.id,
      title: item.title,
      levels: item.levels,
      summary: item.target,
      url: item.url,
      platform: item.platform,
      logSource: "creator_modal_featured_video"
    }))
    : [];
  const fallbackItems = creator ? buildFallbackItems(creator, new Set(creatorContents.map((item) => item.id))) : [];
  const modalItems = creatorFeaturedVideos.length > 0
    ? creatorFeaturedVideos
    : [...creatorContents, ...fallbackItems].slice(0, 5);

  return (
    <Modal open={open} onClose={onClose} title={creator?.name ?? "博主详情"}>
      {creator ? (
        <>
          <div className="flex items-start gap-3">
            <CreatorAvatar name={creator.name} avatarUrl={creator.avatar} />
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap gap-2">
                {creator.platforms.map((platform) => {
                  const href = creator.platformLinks?.[platform] ?? (platform === creator.platforms[0] ? creator.profileUrl : undefined);

                  if (!href) {
                    return <PlatformBadge key={platform} platform={platform} size="md" />;
                  }

                  return (
                    <a
                      key={platform}
                      href={href}
                      target="_blank"
                      rel="noreferrer"
                      aria-label={`前往 ${creator.name} 的${platform}主页`}
                      className="platform-link-wiggle inline-flex rounded-full transition-transform duration-200 hover:scale-[1.04] focus-visible:scale-[1.04]"
                      onClick={() => logEvent("creator_click", { creatorId: creator.id, source: "creator_modal_platform_badge", platform, targetUrl: href })}
                    >
                      <PlatformBadge platform={platform} size="md" />
                    </a>
                  );
                })}
              </div>
            </div>
          </div>
          <p className="text-sm text-slate-700">{creator.bio}</p>
          <div>
            <p className="text-sm font-semibold text-slate-900">适合谁</p>
            <p className="text-sm text-slate-700">{creator.suitableFor.join(" / ")}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">ta 的内容</p>
          </div>
          <div className="space-y-3">
            {modalItems.length > 0 ? (
              modalItems.map((item) => (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  className="block rounded-xl border border-[var(--line)] px-4 py-3 transition hover:border-brand-200 hover:bg-brand-50/30"
                  onClick={() => {
                    if (item.contentId) {
                      logEvent("content_click", { contentId: item.contentId, source: "creator_modal" });
                      logEvent("content_external", { contentId: item.contentId, platform: item.platform, url: item.url });
                    } else {
                      logEvent("creator_click", { creatorId: creator.id, source: item.logSource ?? "creator_modal_fallback_search", targetUrl: item.url });
                    }
                  }}
                >
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="font-semibold text-slate-900">{item.title}</p>
                    <Badge className="bg-slate-100 px-3.5 py-1.5 text-sm text-slate-700">{item.levels.join("/")}</Badge>
                  </div>
                  <p className="mt-2 text-sm text-slate-600">{formatTargetSummary(item.summary)}</p>
                </a>
              ))
            ) : (
              <p className="text-sm text-slate-600">暂无收录内容</p>
            )}
          </div>
          <a href={creator.profileUrl} target="_blank" rel="noreferrer"><Button>前往主页</Button></a>
        </>
      ) : null}
    </Modal>
  );
}
