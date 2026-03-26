import Link from "next/link";
import { CreatorAvatar } from "@/components/ui/CreatorAvatar";
import { PlatformBadge } from "@/components/ui/PlatformBadge";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { logEvent } from "@/lib/eventLogger";
import { VideoDiagnosisResult } from "@/types/videoDiagnosis";

function getConfidenceTone(confidence: VideoDiagnosisResult["confidenceBand"]) {
  if (confidence === "较高") {
    return "bg-emerald-50 text-emerald-700";
  }
  if (confidence === "中等") {
    return "bg-amber-50 text-amber-700";
  }
  return "bg-rose-50 text-rose-700";
}

export function VideoAnalysisResult({ result }: { result: VideoDiagnosisResult }) {
  const planHref = `/plan?problemTag=${encodeURIComponent(result.trainingPlan.problemTag)}&level=${encodeURIComponent(result.trainingPlan.level)}`;

  return (
    <div className="space-y-5">
      <Card className="space-y-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-brand-700">视频诊断结果</p>
            <h2 className="mt-1 text-2xl font-black text-slate-900">先改这一个：{result.primaryProblem.label}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-slate-600">{result.primaryProblem.description}</p>
          </div>
          <Badge className={getConfidenceTone(result.confidenceBand)}>
            置信度：{result.confidenceBand}（{Math.round(result.confidence * 100)}%）
          </Badge>
        </div>

        {!result.chargeable && result.fallbackReason ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-4 text-sm text-amber-800">
            <p className="font-semibold">这次先不给你太强的动作结论</p>
            <p className="mt-1 leading-6">{result.fallbackReason}</p>
          </div>
        ) : null}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-2xl bg-slate-50 px-4 py-4">
            <p className="text-sm font-semibold text-slate-900">AI 观察到了什么</p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-slate-600">
              <li>身体姿态：{result.observation.bodyPosture}</li>
              <li>击球点：{result.observation.contactPoint}</li>
              <li>脚步：{result.observation.footwork}</li>
              <li>挥拍路径：{result.observation.swingPath}</li>
            </ul>
          </div>

          <div className="rounded-2xl bg-slate-50 px-4 py-4">
            <p className="text-sm font-semibold text-slate-900">为什么会这样</p>
            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-6 text-slate-600">
              <li>{result.primaryProblem.cause}</li>
              {result.secondaryProblems.map((item) => (
                <li key={item.label}>{item.description}</li>
              ))}
            </ul>
          </div>
        </div>

        <div>
          <p className="text-sm font-semibold text-slate-900">关键问题</p>
          <div className="mt-2 flex flex-wrap gap-2">
            {result.observation.keyIssues.map((issue) => (
              <Badge key={issue}>{issue}</Badge>
            ))}
          </div>
        </div>
      </Card>

      <div className="grid gap-5 xl:grid-cols-[1.2fr_0.8fr]">
        <Card className="space-y-4">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-brand-700">推荐内容</p>
              <h3 className="mt-1 text-lg font-bold text-slate-900">先看这几条，更像是在对症补问题</h3>
            </div>
            <Link href="/library" className="text-sm font-medium text-slate-500 transition hover:text-slate-700">
              去内容库 →
            </Link>
          </div>

          <div className="space-y-3">
            {result.recommendedContents.map((item) => (
              <div key={item.id} className="rounded-2xl border border-[var(--line)] p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <PlatformBadge platform={item.platform} />
                  <Badge className="bg-slate-100 text-slate-700">{item.levels.join("/")}</Badge>
                </div>
                <p className="mt-3 text-lg font-bold text-slate-900">{item.title}</p>
                <p className="mt-2 text-sm leading-6 text-slate-600">{item.reason}</p>
                {item.coachReason ? (
                  <p className="mt-2 text-xs leading-5 text-slate-500">教练视角：{item.coachReason}</p>
                ) : null}
                <div className="mt-3">
                  <a
                    href={item.url}
                    target="_blank"
                    rel="noreferrer"
                    onClick={() => {
                      logEvent("content_click", { contentId: item.id, source: "video_diagnosis" });
                      logEvent("content_external", { contentId: item.id, platform: item.platform, url: item.url });
                    }}
                  >
                    <Button variant="secondary">去看这条内容</Button>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="space-y-5">
          <Card className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-brand-700">推荐博主</p>
              <h3 className="mt-1 text-lg font-bold text-slate-900">先看这几位，更适合你现在的问题</h3>
            </div>
            <div className="space-y-3">
              {result.recommendedCreators.map((creator) => (
                <div key={creator.id} className="rounded-2xl border border-[var(--line)] p-4">
                  <div className="flex items-start gap-3">
                    <CreatorAvatar name={creator.name} avatarUrl={creator.avatar} />
                    <div className="min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <p className="text-lg font-bold text-slate-900">{creator.name}</p>
                        {creator.platforms.slice(0, 1).map((platform) => (
                          <PlatformBadge key={platform} platform={platform} />
                        ))}
                      </div>
                      <p className="mt-2 text-sm leading-6 text-slate-600">{creator.bio}</p>
                      <div className="mt-3 flex flex-wrap gap-2">
                        {creator.styleTags.slice(0, 2).map((tag) => (
                          <Badge key={tag}>{tag}</Badge>
                        ))}
                      </div>
                      {creator.profileUrl ? (
                        <div className="mt-3">
                          <a
                            href={creator.profileUrl}
                            target="_blank"
                            rel="noreferrer"
                            onClick={() => logEvent("creator_click", { creatorId: creator.id, source: "video_diagnosis" })}
                          >
                            <Button variant="ghost">去看这位博主</Button>
                          </a>
                        </div>
                      ) : null}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-brand-700">下一步练什么</p>
              <h3 className="mt-1 text-lg font-bold text-slate-900">
                {result.chargeable ? "先按这份 7 天小计划走" : "先别急着生成完整计划"}
              </h3>
            </div>

            {result.chargeable ? (
              <>
                <p className="text-sm leading-6 text-slate-600">{result.trainingPlan.summary ?? result.trainingPlan.target}</p>
                <div className="space-y-3">
                  {result.trainingPlan.days.slice(0, 3).map((day) => (
                    <div key={day.day} className="rounded-2xl bg-slate-50 px-4 py-3">
                      <p className="text-sm font-semibold text-slate-900">Day {day.day} · {day.focus}</p>
                      <p className="mt-1 text-sm text-slate-600">练习：{day.drills.join(" / ")}</p>
                    </div>
                  ))}
                </div>
                <Link
                  href={planHref}
                  onClick={() => logEvent("video_plan_generate", { problemTag: result.trainingPlan.problemTag, level: result.trainingPlan.level })}
                >
                  <Button>查看完整 7 天计划</Button>
                </Link>
              </>
            ) : (
              <p className="text-sm leading-6 text-slate-600">
                这次先建议你重新录一段更清晰的视频，或者先走文字诊断。等系统看得更清楚，再给完整计划会更稳。
              </p>
            )}
          </Card>

          <Card className="space-y-3">
            <p className="text-sm font-semibold text-brand-700">你还可以这样搜</p>
            <div className="space-y-2">
              {result.searchSuggestions.map((item) => (
                <div key={`${item.platform}-${item.keyword}`} className="rounded-2xl border border-[var(--line)] px-4 py-3">
                  <div className="flex flex-wrap items-center gap-2">
                    <PlatformBadge platform={item.platform} />
                    <span className="text-sm font-medium text-slate-900">{item.keyword}</span>
                  </div>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
