import { Creator } from "@/types/creator";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

export function CreatorDetailModal({ creator, open, onClose }: { creator: Creator | null; open: boolean; onClose: () => void }) {
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
          <a href={creator.profileUrl} target="_blank" rel="noreferrer"><Button>前往主页</Button></a>
        </>
      ) : null}
    </Modal>
  );
}
