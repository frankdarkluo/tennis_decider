"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { contents } from "@/data/contents";
import { logEvent } from "@/lib/eventLogger";
import {
  getBookmarkedContentIds,
  getDiagnosisHistory,
  getLatestAssessmentResult,
  getSavedPlans,
  removeBookmark
} from "@/lib/userData";
import { AssessmentResult } from "@/types/assessment";
import { ContentItem } from "@/types/content";
import { DiagnosisHistoryRow, SavedPlanRow } from "@/types/userData";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageBreadcrumbs } from "@/components/layout/PageBreadcrumbs";
import { useAuth } from "@/components/auth/AuthProvider";
import { useAuthModal } from "@/components/auth/AuthModalProvider";
import { ContentCard } from "@/components/library/ContentCard";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";

function SectionSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <Card className="space-y-3">
      <div className="h-5 w-28 animate-pulse rounded-full bg-slate-100" />
      {Array.from({ length: lines }).map((_, index) => (
        <div key={index} className="h-4 animate-pulse rounded-full bg-slate-100" />
      ))}
    </Card>
  );
}

function EmptyState({
  title,
  description,
  href,
  actionLabel
}: {
  title: string;
  description: string;
  href: string;
  actionLabel: string;
}) {
  return (
    <Card className="space-y-3">
      <div>
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
        <p className="mt-1 text-sm text-slate-600">{description}</p>
      </div>
      <Link href={href}>
        <Button variant="secondary">{actionLabel}</Button>
      </Link>
    </Card>
  );
}

function formatDateTime(value: string) {
  return new Date(value).toLocaleString("zh-CN", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

function toPlanSourceLabel(sourceType: SavedPlanRow["source_type"]) {
  if (sourceType === "diagnosis") return "来自问题诊断";
  if (sourceType === "assessment") return "来自水平评估";
  return "通用生成";
}

export default function ProfilePage() {
  const { user, loading, configured } = useAuth();
  const { openLoginModal } = useAuthModal();

  const [assessmentLoading, setAssessmentLoading] = useState(true);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [bookmarksLoading, setBookmarksLoading] = useState(true);
  const [plansLoading, setPlansLoading] = useState(true);

  const [assessmentResult, setAssessmentResult] = useState<AssessmentResult | null>(null);
  const [diagnosisHistory, setDiagnosisHistory] = useState<DiagnosisHistoryRow[]>([]);
  const [bookmarkedItems, setBookmarkedItems] = useState<ContentItem[]>([]);
  const [savedPlans, setSavedPlans] = useState<SavedPlanRow[]>([]);
  const [expandedPlanId, setExpandedPlanId] = useState<string | null>(null);
  const [bookmarkPendingId, setBookmarkPendingId] = useState<string | null>(null);

  useEffect(() => {
    if (loading || !user?.id || !configured) {
      setAssessmentLoading(false);
      setHistoryLoading(false);
      setBookmarksLoading(false);
      setPlansLoading(false);
      return;
    }

    let active = true;
    const userId = user.id;

    async function loadAssessment() {
      setAssessmentLoading(true);
      const response = await getLatestAssessmentResult(userId);

      if (!active) {
        return;
      }

      if (response.error) {
        console.error("[profile] failed to load assessment result", response.error);
      }

      setAssessmentResult(response.data);
      setAssessmentLoading(false);
    }

    async function loadHistory() {
      setHistoryLoading(true);
      const response = await getDiagnosisHistory(userId, 5);

      if (!active) {
        return;
      }

      if (response.error) {
        console.error("[profile] failed to load diagnosis history", response.error);
      }

      setDiagnosisHistory(response.data);
      setHistoryLoading(false);
    }

    async function loadBookmarks() {
      setBookmarksLoading(true);
      const response = await getBookmarkedContentIds(userId);

      if (!active) {
        return;
      }

      if (response.error) {
        console.error("[profile] failed to load bookmarks", response.error);
      }

      const items = response.data
        .map((id) => contents.find((item) => item.id === id))
        .filter((item): item is ContentItem => Boolean(item));

      setBookmarkedItems(items);
      setBookmarksLoading(false);
    }

    async function loadPlans() {
      setPlansLoading(true);
      const response = await getSavedPlans(userId, 10);

      if (!active) {
        return;
      }

      if (response.error) {
        console.error("[profile] failed to load saved plans", response.error);
      }

      setSavedPlans(response.data);
      setPlansLoading(false);
    }

    void loadAssessment();
    void loadHistory();
    void loadBookmarks();
    void loadPlans();

    return () => {
      active = false;
    };
  }, [configured, loading, user?.id]);

  const weakestSummary = useMemo(() => {
    if (!assessmentResult?.dimensions.length) {
      return [];
    }

    return [...assessmentResult.dimensions]
      .filter((dimension) => dimension.answeredCount > 0)
      .sort((a, b) => a.average - b.average)
      .slice(0, 3);
  }, [assessmentResult]);

  const handleRemoveBookmark = async (contentId: string) => {
    if (!user?.id || !configured) {
      openLoginModal("登录后可管理收藏内容", "bookmark");
      return;
    }

    setBookmarkPendingId(contentId);
    const response = await removeBookmark(user.id, contentId);

    if (response.error) {
      console.error("[profile] failed to remove bookmark", response.error);
      setBookmarkPendingId(null);
      return;
    }

    setBookmarkedItems((prev) => prev.filter((item) => item.id !== contentId));
    logEvent("content_bookmark", { contentId, action: "remove" });
    setBookmarkPendingId(null);
  };

  if (loading) {
    return (
      <PageContainer>
        <div className="space-y-4">
          <SectionSkeleton lines={2} />
          <SectionSkeleton lines={4} />
          <SectionSkeleton lines={4} />
        </div>
      </PageContainer>
    );
  }

  if (!user) {
    return (
      <PageContainer>
        <Card className="mx-auto max-w-2xl space-y-4 text-center">
          <PageBreadcrumbs items={[{ href: "/", label: "← 回到首页" }]} />
          <div>
            <p className="text-sm font-semibold text-brand-700">我的记录</p>
            <h1 className="mt-2 text-2xl font-black text-slate-900">登录后查看你的评估、诊断、收藏和训练计划</h1>
            <p className="mt-3 text-sm leading-6 text-slate-600">
              你已经有评估、诊断和保存能力了，登录之后这些记录会集中展示在这里，方便随时回看。
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-2">
            <Button onClick={() => openLoginModal("登录后查看我的记录", "profile")}>立即登录</Button>
            <Link href="/"><Button variant="secondary">回到首页</Button></Link>
          </div>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-5">
        <PageBreadcrumbs items={[{ href: "/", label: "← 回到首页" }]} />
        <div className="rounded-3xl border border-[var(--line)] bg-white p-6 shadow-soft">
          <div className="flex flex-wrap items-center gap-3">
            <div>
              <p className="text-sm font-semibold text-brand-700">我的记录</p>
              <h1 className="mt-1 text-2xl font-black text-slate-900">{user.email}</h1>
            </div>
            {assessmentResult?.level ? (
              <Badge className="h-fit">参考等级：{assessmentResult.level}</Badge>
            ) : (
              <Badge className="h-fit bg-slate-100 text-slate-700">还未评估</Badge>
            )}
          </div>
          <p className="mt-3 text-sm text-slate-600">这里集中查看你最近的评估、诊断、收藏内容和已保存训练计划。</p>
        </div>

        <div className="grid gap-5 xl:grid-cols-2">
          {assessmentLoading ? (
            <SectionSkeleton lines={4} />
          ) : assessmentResult ? (
            <Card className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">最近评估结果</h2>
                  <p className="mt-1 text-sm text-slate-600">{assessmentResult.summary}</p>
                </div>
                <Badge>等级：{assessmentResult.level}</Badge>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <div>
                  <p className="text-sm font-semibold text-slate-900">相对强项</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {assessmentResult.strengths.length > 0 ? assessmentResult.strengths.join(" / ") : "暂无"}
                  </p>
                </div>
                <div>
                  <p className="text-sm font-semibold text-slate-900">优先补强</p>
                  <p className="mt-1 text-sm text-slate-600">
                    {assessmentResult.weaknesses.length > 0 ? assessmentResult.weaknesses.join(" / ") : "暂无"}
                  </p>
                </div>
              </div>
              <div className="grid gap-2 sm:grid-cols-3">
                {weakestSummary.map((dimension) => (
                  <div key={dimension.key} className="rounded-xl bg-slate-50 px-3 py-2">
                    <p className="text-xs font-medium text-slate-500">{dimension.label}</p>
                    <p className="mt-1 text-sm font-semibold text-slate-900">
                      {dimension.score} / {dimension.maxScore}
                    </p>
                  </div>
                ))}
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href="/assessment"><Button variant="secondary">重新评估</Button></Link>
                <Link href={`/library?level=${assessmentResult.level}`}><Button variant="ghost">去看推荐内容</Button></Link>
              </div>
            </Card>
          ) : (
            <EmptyState
              title="最近评估结果"
              description="还没有评估记录，先做一次 1 分钟评估，我们才能更准确地推荐内容和训练方向。"
              href="/assessment"
              actionLabel="去评估"
            />
          )}

          {historyLoading ? (
            <SectionSkeleton lines={5} />
          ) : diagnosisHistory.length > 0 ? (
            <Card className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">诊断历史</h2>
                <p className="mt-1 text-sm text-slate-600">最近 5 条问题记录，点开后会带着原问题回到诊断页。</p>
              </div>
              <div className="space-y-3">
                {diagnosisHistory.map((item) => (
                  <Link
                    key={item.id}
                    href={`/diagnose?q=${encodeURIComponent(item.input_text)}`}
                    className="block rounded-xl border border-[var(--line)] px-4 py-3 transition hover:border-brand-200 hover:bg-brand-50/40"
                  >
                    <p className="font-semibold text-slate-900">{item.input_text}</p>
                    <p className="mt-1 text-sm text-slate-600">{item.problem_label ?? "暂未匹配到明确标签"}</p>
                    <p className="mt-2 text-xs text-slate-500">{formatDateTime(item.created_at)}</p>
                  </Link>
                ))}
              </div>
            </Card>
          ) : (
            <EmptyState
              title="诊断历史"
              description="还没有诊断记录。先把你最近最困扰的一个问题说出来，我们会帮你拆原因。"
              href="/diagnose"
              actionLabel="去诊断"
            />
          )}

          {bookmarksLoading ? (
            <SectionSkeleton lines={5} />
          ) : bookmarkedItems.length > 0 ? (
            <Card className="space-y-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">收藏内容</h2>
                  <p className="mt-1 text-sm text-slate-600">你收藏过的内容会保留在这里，方便回头继续看。</p>
                </div>
                <Link href="/library" className="text-sm font-medium text-slate-500 transition hover:text-slate-700">
                  去内容库 →
                </Link>
              </div>
              <div className="space-y-4">
                {bookmarkedItems.map((item) => (
                  <ContentCard
                    key={item.id}
                    item={item}
                    viewerLevel={assessmentResult?.level}
                    source="profile"
                    bookmarked
                    bookmarkLoading={bookmarkPendingId === item.id}
                    onToggleBookmark={() => void handleRemoveBookmark(item.id)}
                  />
                ))}
              </div>
            </Card>
          ) : (
            <EmptyState
              title="收藏内容"
              description="还没有收藏内容。看到适合你的内容时先收藏，后面会更容易形成自己的训练路径。"
              href="/library"
              actionLabel="去内容库"
            />
          )}

          {plansLoading ? (
            <SectionSkeleton lines={5} />
          ) : savedPlans.length > 0 ? (
            <Card className="space-y-4">
              <div>
                <h2 className="text-lg font-bold text-slate-900">已保存的训练计划</h2>
                <p className="mt-1 text-sm text-slate-600">最近保存的计划都会留在这里，展开后可以直接查看 7 天安排。</p>
              </div>
              <div className="space-y-3">
                {savedPlans.map((item) => {
                  const expanded = expandedPlanId === item.id;

                  return (
                    <div key={item.id} className="rounded-xl border border-[var(--line)] p-4">
                      <div className="flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-semibold text-slate-900">{item.plan_data.title}</p>
                          <p className="mt-1 text-sm text-slate-600">{toPlanSourceLabel(item.source_type)}</p>
                          <p className="mt-1 text-xs text-slate-500">{formatDateTime(item.created_at)}</p>
                        </div>
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => setExpandedPlanId(expanded ? null : item.id)}
                        >
                          {expanded ? "收起" : "查看计划"}
                        </Button>
                      </div>
                      {expanded ? (
                        <div className="mt-4 space-y-3">
                          {item.plan_data.days.map((day) => (
                            <div key={day.day} className="rounded-xl bg-slate-50 px-3 py-3">
                              <p className="text-sm font-semibold text-slate-900">Day {day.day} · {day.focus}</p>
                              <p className="mt-1 text-sm text-slate-600">时长：{day.duration}</p>
                              <p className="mt-1 text-sm text-slate-600">练习：{day.drills.join(" / ")}</p>
                            </div>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </Card>
          ) : (
            <EmptyState
              title="已保存的训练计划"
              description="还没有训练计划。做完评估或诊断后生成一份计划，后面会在这里集中保留。"
              href="/diagnose"
              actionLabel="去生成"
            />
          )}
        </div>
      </div>
    </PageContainer>
  );
}
