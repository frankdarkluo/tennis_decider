import { creators } from "@/data/creators";
import { ContentItem } from "@/types/content";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { toChineseSkill } from "@/lib/utils";

export function ContentCard({ item }: { item: ContentItem }) {
  const creator = creators.find((c) => c.id === item.creatorId);

  return (
    <Card className="space-y-3">
      <div className="flex flex-wrap gap-2">
        <Badge>{item.platform}</Badge>
        <Badge>{item.language === "zh" ? "中文" : "英文"}</Badge>
        <Badge>{item.type}</Badge>
      </div>
      <h3 className="text-lg font-bold text-slate-900">{item.title}</h3>
      <p className="text-sm text-slate-600">{item.summary}</p>
      <p className="text-sm text-slate-600">博主：{creator?.name ?? "未知"}</p>
      <p className="text-sm text-slate-600">技术标签：{item.skills.map((skill) => toChineseSkill(skill)).join(" / ")}</p>
      <p className="text-sm text-slate-700">推荐理由：{item.reason}</p>
      <div className="flex flex-wrap gap-2">
        <a href={item.url} target="_blank" rel="noreferrer"><Button>查看</Button></a>
        <Button variant="secondary">收藏</Button>
      </div>
    </Card>
  );
}
