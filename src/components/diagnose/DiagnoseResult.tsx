import { DiagnosisResult as DiagnosisResultType } from "@/types/diagnosis";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";

export function DiagnoseResult({ result }: { result: DiagnosisResultType }) {

  return (
    <Card className="space-y-4">
      <div className="space-y-2">
        <p className="text-sm font-semibold text-brand-700">诊断结果</p>
        <h2 className="text-xl font-bold text-slate-900">{result.title}</h2>
        <p className="text-sm text-slate-600">{result.summary}</p>
        <div className="flex flex-wrap gap-2">
          {result.category.map((category) => (
            <Badge key={category}>{category}</Badge>
          ))}
          <Badge>置信度：{result.confidence}</Badge>
        </div>
        {result.matchedKeywords.length > 0 || result.matchedSynonyms.length > 0 ? (
          <p className="text-xs text-slate-500">
            命中：{[...result.matchedKeywords, ...result.matchedSynonyms].join(" / ")}
          </p>
        ) : null}
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
          {result.recommendedContents.map((item) => (
            <div key={item.id} className="rounded-xl border border-[var(--line)] p-3 text-sm">
              <p className="font-semibold text-slate-900">{item.title}</p>
              <p className="text-slate-600">{item.reason}</p>
              {item.coachReason ? <p className="mt-1 text-xs text-slate-500">教练视角：{item.coachReason}</p> : null}
            </div>
          ))}
        </div>
      </div>
    </Card>
  );
}
