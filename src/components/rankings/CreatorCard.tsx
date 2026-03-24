import { Creator } from "@/types/creator";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { toChineseSkill } from "@/lib/utils";

type CreatorCardProps = {
  creator: Creator;
  onDetail: () => void;
  onViewLibrary: () => void;
};

export function CreatorCard({ creator, onDetail, onViewLibrary }: CreatorCardProps) {
  const recommendedCount = creator.recommendedCount ?? creator.featuredContentIds.length;

  return (
    <Card className="space-y-3">
      <div className="flex items-center gap-3">
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-100 text-brand-700">
          {creator.name.slice(0, 1)}
        </div>
        <div>
          <h3 className="font-bold text-slate-900">{creator.name}</h3>
          <p className="text-xs text-slate-500">{creator.platforms.join(" / ")}</p>
        </div>
      </div>
      <p className="text-sm text-slate-600">{creator.bio}</p>
      <p className="text-xs text-slate-600">擅长：{creator.specialties.map((item) => toChineseSkill(item)).join(" / ")}</p>
      <p className="text-xs text-slate-600">适合等级：{creator.levels.join(" / ")}</p>
      <p className="text-xs text-slate-600">推荐内容数量：{recommendedCount}</p>
      <div className="flex flex-wrap gap-2">
        <Button onClick={onDetail}>查看详情</Button>
        <Button variant="secondary" onClick={onViewLibrary}>查看推荐内容</Button>
      </div>
    </Card>
  );
}
