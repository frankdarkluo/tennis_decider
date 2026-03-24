import { contents } from "@/data/contents";
import { DayPlan } from "@/types/plan";
import { Card } from "@/components/ui/Card";

export function DayPlanCard({ day }: { day: DayPlan }) {
  const relatedContents = contents.filter((content) => day.contentIds.includes(content.id)).slice(0, 2);

  return (
    <Card className="space-y-3">
      <h3 className="text-lg font-bold text-slate-900">Day {day.day} · {day.focus}</h3>
      <p className="text-sm text-slate-600">建议时长：{day.duration}</p>
      <div>
        <p className="mb-1 text-sm font-semibold text-slate-900">练习动作</p>
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
          {day.drills.map((drill) => (
            <li key={drill}>{drill}</li>
          ))}
        </ul>
      </div>
      <div>
        <p className="mb-1 text-sm font-semibold text-slate-900">推荐内容</p>
        {relatedContents.length > 0 ? (
          <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
            {relatedContents.map((item) => (
              <li key={item.id}>{item.title}</li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-600">今日以基础训练为主，可按需在内容库补充学习。</p>
        )}
      </div>
    </Card>
  );
}
