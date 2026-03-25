import Link from "next/link";
import { DiagnosisResult as DiagnosisResultType } from "@/types/diagnosis";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { logEvent } from "@/lib/eventLogger";

export function DiagnoseResult({ result }: { result: DiagnosisResultType }) {
  const planHref = `/plan?problemTag=${encodeURIComponent(result.problemTag)}${result.level ? `&level=${encodeURIComponent(result.level)}` : ""}`;
  const canGeneratePlan = Boolean(result.input.trim());

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
        {result.fallbackUsed && result.fallbackMode ? (
          <div className="rounded-xl border border-brand-100 bg-brand-50/70 p-3 text-sm text-slate-700">
            <p>
              {result.fallbackMode === "assessment"
                ? "这次先按你评估里最需要补的环节给你一组方向，后面你再把问题描述得更具体一点，我们会更准。"
                : "这次先给你一组通用提升内容。做完 1 分钟评估后，我们能把推荐收得更准。"}
            </p>
            {result.fallbackMode === "no-assessment" ? (
              <div className="mt-3">
                <Link href="/assessment">
                  <Button variant="secondary">先去做评估</Button>
                </Link>
              </div>
            ) : null}
          </div>
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
              {item.coachReason && !item.coachReason.includes("[待填写") ? (
                <p className="mt-1 text-xs text-slate-500">教练视角：{item.coachReason}</p>
              ) : null}
              <div className="mt-3">
                <a
                  href={item.url}
                  target="_blank"
                  rel="noreferrer"
                  onClick={() => {
                    logEvent("content_click", { contentId: item.id, source: "diagnosis" });
                    logEvent("content_external", { contentId: item.id, platform: item.platform, url: item.url });
                  }}
                >
                  <Button variant="secondary">去看这条内容</Button>
                </a>
              </div>
            </div>
          ))}
        </div>
        {canGeneratePlan ? (
          <div className="mt-4">
            <Link
              href={planHref}
              onClick={() => logEvent("cta_click", { ctaLabel: "根据这个问题生成 7 天训练计划", ctaLocation: "diagnosis_result", targetPage: "/plan" })}
            >
              <Button>根据这个问题生成 7 天训练计划</Button>
            </Link>
          </div>
        ) : null}
      </div>
    </Card>
  );
}
