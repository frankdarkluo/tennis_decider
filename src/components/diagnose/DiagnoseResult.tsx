import { contents } from "@/data/contents";
import { DiagnosisResult as DiagnosisResultType } from "@/types/diagnosis";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export function DiagnoseResult({ result }: { result: DiagnosisResultType | null }) {
  if (!result) {
    return (
      <Card>
        <p className="text-slate-600">输入你的问题后点击“开始诊断”，这里会显示问题分类、原因和推荐内容。</p>
      </Card>
    );
  }

  const matchedContents = contents.filter((item) => result.recommendedContentIds.includes(item.id)).slice(0, 3);

  return (
    <Card className="space-y-4">
      <div className="space-y-2">
        <p className="text-sm font-semibold text-brand-700">问题分类</p>
        <div className="flex flex-wrap gap-2">
          {result.categories.map((category) => (
            <Badge key={category}>{category}</Badge>
          ))}
        </div>
      </div>

      <div>
        <p className="mb-1 text-sm font-semibold text-slate-900">可能原因</p>
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
          {result.causes.map((cause) => (
            <li key={cause}>{cause}</li>
          ))}
        </ul>
      </div>

      <div>
        <p className="mb-1 text-sm font-semibold text-slate-900">优先修正点</p>
        <ul className="list-disc space-y-1 pl-5 text-sm text-slate-700">
          {result.fixes.slice(0, 2).map((fix) => (
            <li key={fix}>{fix}</li>
          ))}
        </ul>
      </div>

      <div>
        <p className="mb-2 text-sm font-semibold text-slate-900">推荐内容</p>
        <div className="space-y-2">
          {matchedContents.map((item) => (
            <div key={item.id} className="rounded-xl border border-[var(--line)] p-3 text-sm">
              <p className="font-semibold text-slate-900">{item.title}</p>
              <p className="text-slate-600">{item.reason}</p>
            </div>
          ))}
        </div>
      </div>

      {result.fallbackText ? <p className="text-sm text-slate-500">{result.fallbackText}</p> : null}
    </Card>
  );
}
