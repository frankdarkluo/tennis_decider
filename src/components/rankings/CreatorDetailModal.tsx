import { contents } from "@/data/contents";
import { Creator } from "@/types/creator";
import { Modal } from "@/components/ui/Modal";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";

export function CreatorDetailModal({ creator, open, onClose }: { creator: Creator | null; open: boolean; onClose: () => void }) {
  const creatorContents = creator ? contents.filter((item) => item.creatorId === creator.id) : [];

  return (
    <Modal open={open} onClose={onClose} title={creator?.name ?? "博主详情"}>
      {creator ? (
        <>
          <p className="text-sm text-slate-700">{creator.bio}</p>
          <div>
            <p className="text-sm font-semibold text-slate-900">适合谁</p>
            <p className="text-sm text-slate-700">{creator.suitableFor.join(" / ")}</p>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-900">推荐先看</p>
            <p className="text-sm text-slate-700">可在内容库筛选博主后按推荐理由优先观看。</p>
          </div>
          <div className="space-y-3">
            <p className="text-sm font-semibold text-slate-900">ta 的内容</p>
            {creatorContents.length > 0 ? (
              <div className="space-y-3">
                {creatorContents.map((item) => (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    className="block rounded-xl border border-[var(--line)] px-4 py-3 transition hover:border-brand-200 hover:bg-brand-50/30"
                  >
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="font-semibold text-slate-900">{item.title}</p>
                      <Badge className="bg-slate-100 text-slate-700">{item.levels.join("/")}</Badge>
                    </div>
                    <p className="mt-1 text-sm text-slate-600">{item.useCases.slice(0, 2).join(" / ") || item.summary}</p>
                  </a>
                ))}
              </div>
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
