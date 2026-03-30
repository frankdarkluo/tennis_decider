"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { exportLocalLogs, logEvent } from "@/lib/eventLogger";
import { buildStudyExportBundle, downloadJsonFile, fetchAllExportRows } from "@/lib/researchData";
import { ADMIN_EMAILS, isAdminEmail } from "@/lib/researchConfig";
import { ResearchExportTable } from "@/types/research";
import { getStudySnapshot } from "@/lib/study/snapshot";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageBreadcrumbs } from "@/components/layout/PageBreadcrumbs";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { useAuth } from "@/components/auth/AuthProvider";

function getExportFileName(type: string) {
  const today = new Date().toISOString().slice(0, 10);
  return `tennislevel_${type}_${today}.json`;
}

export default function AdminExportPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [statusMessage, setStatusMessage] = useState("");
  const [pendingKey, setPendingKey] = useState<string | null>(null);
  const [participantId, setParticipantId] = useState("");
  const [sessionId, setSessionId] = useState("");
  const [snapshotId, setSnapshotId] = useState(getStudySnapshot().id);

  const allowed = isAdminEmail(user?.email ?? null);

  useEffect(() => {
    if (loading) {
      return;
    }

    if (!allowed) {
      router.replace("/");
    }
  }, [allowed, loading, router]);

  const handleRemoteExport = async (table: ResearchExportTable) => {
    setPendingKey(table);
    setStatusMessage("");

    const result = await fetchAllExportRows(table);

    if (result.error) {
      setPendingKey(null);
      setStatusMessage(result.error);
      return;
    }

    downloadJsonFile(getExportFileName(table), JSON.stringify(result.data, null, 2));
    logEvent("cta_click", { ctaLabel: `导出 ${table}`, ctaLocation: "admin_export", targetPage: `/admin/export#${table}` });
    setPendingKey(null);
    setStatusMessage(`${table} 已导出。`);
  };

  const handleLocalExport = () => {
    downloadJsonFile(getExportFileName("local_events"), exportLocalLogs());
    logEvent("cta_click", { ctaLabel: "导出本地日志", ctaLocation: "admin_export", targetPage: "/admin/export#local_events" });
    setStatusMessage("本地日志已导出。");
  };

  const handleStudyBundleExport = async () => {
    setPendingKey("study_bundle");
    setStatusMessage("");

    const [participants, sessions, artifacts, taskRatings, events] = await Promise.all([
      fetchAllExportRows("study_participants"),
      fetchAllExportRows("study_sessions"),
      fetchAllExportRows("study_artifacts"),
      fetchAllExportRows("study_task_ratings"),
      fetchAllExportRows("event_logs")
    ]);

    const failed = [participants, sessions, artifacts, taskRatings, events].find((result) => result.error);
    if (failed?.error) {
      setPendingKey(null);
      setStatusMessage(failed.error);
      return;
    }

    const bundle = buildStudyExportBundle({
      snapshot: getStudySnapshot(),
      participants: participants.data,
      sessions: sessions.data,
      artifacts: artifacts.data,
      taskRatings: taskRatings.data,
      events: events.data,
      participantId,
      sessionId,
      snapshotId
    });

    downloadJsonFile(
      getExportFileName("study_bundle"),
      JSON.stringify(bundle, null, 2)
    );
    setPendingKey(null);
    setStatusMessage("study bundle 已导出。");
  };

  if (loading || !allowed) {
    return (
      <PageContainer>
        <Card className="mx-auto max-w-2xl space-y-3 text-center">
          <h1 className="text-2xl font-black text-slate-900">正在检查导出权限</h1>
          <p className="text-sm text-slate-600">只有管理员邮箱可以访问研究导出页。</p>
        </Card>
      </PageContainer>
    );
  }

  return (
    <PageContainer>
      <div className="space-y-5">
        <PageBreadcrumbs items={[{ href: "/", label: "← 回到首页" }]} />
        <Card className="space-y-3">
          <p className="text-sm font-semibold text-brand-700">研究数据导出</p>
          <h1 className="text-3xl font-black text-slate-900">管理员导出面板</h1>
          <p className="text-sm leading-6 text-slate-600">
            当前登录邮箱：{user?.email}。允许访问的管理员邮箱可通过 `NEXT_PUBLIC_ADMIN_EMAILS` 配置，当前默认列表：{ADMIN_EMAILS.join(", ")}
          </p>
        </Card>

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">远程数据</h2>
            <div className="flex flex-wrap gap-2">
              <Button onClick={() => void handleRemoteExport("event_logs")} disabled={pendingKey !== null}>
                {pendingKey === "event_logs" ? "导出中..." : "导出事件日志"}
              </Button>
              <Button variant="secondary" onClick={() => void handleRemoteExport("survey_responses")} disabled={pendingKey !== null}>
                {pendingKey === "survey_responses" ? "导出中..." : "导出问卷结果"}
              </Button>
              <Button variant="secondary" onClick={() => void handleRemoteExport("assessment_results")} disabled={pendingKey !== null}>
                {pendingKey === "assessment_results" ? "导出中..." : "导出评估记录"}
              </Button>
              <Button variant="secondary" onClick={() => void handleRemoteExport("diagnosis_history")} disabled={pendingKey !== null}>
                {pendingKey === "diagnosis_history" ? "导出中..." : "导出诊断历史"}
              </Button>
              <Button variant="secondary" onClick={() => void handleRemoteExport("video_diagnosis_history")} disabled={pendingKey !== null}>
                {pendingKey === "video_diagnosis_history" ? "导出中..." : "导出视频诊断"}
              </Button>
              <Button variant="secondary" onClick={() => void handleRemoteExport("study_sessions")} disabled={pendingKey !== null}>
                {pendingKey === "study_sessions" ? "导出中..." : "导出 study sessions"}
              </Button>
              <Button variant="secondary" onClick={() => void handleRemoteExport("study_participants")} disabled={pendingKey !== null}>
                {pendingKey === "study_participants" ? "导出中..." : "导出 study participants"}
              </Button>
              <Button variant="secondary" onClick={() => void handleRemoteExport("study_artifacts")} disabled={pendingKey !== null}>
                {pendingKey === "study_artifacts" ? "导出中..." : "导出 study artifacts"}
              </Button>
              <Button variant="secondary" onClick={() => void handleRemoteExport("study_task_ratings")} disabled={pendingKey !== null}>
                {pendingKey === "study_task_ratings" ? "导出中..." : "导出 study task ratings"}
              </Button>
            </div>
          </Card>

          <Card className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900">本地研究数据</h2>
            <p className="text-sm text-slate-600">用于下载当前浏览器里缓存的匿名事件日志。</p>
            <div>
              <Button variant="secondary" onClick={handleLocalExport}>导出本地日志</Button>
            </div>
          </Card>
        </div>

        <Card className="space-y-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900">研究 bundle 导出</h2>
            <p className="mt-1 text-sm text-slate-600">按 participant/session/snapshot 聚合导出 participant registry、study sessions、artifacts、task ratings、events、open feedback rows，以及 actionability 汇总。</p>
          </div>
          <div className="grid gap-3 md:grid-cols-3">
            <Input placeholder="participantId（可选）" value={participantId} onChange={(event) => setParticipantId(event.target.value)} />
            <Input placeholder="sessionId（可选）" value={sessionId} onChange={(event) => setSessionId(event.target.value)} />
            <Input placeholder="snapshotId（可选）" value={snapshotId} onChange={(event) => setSnapshotId(event.target.value)} />
          </div>
          <div>
            <Button variant="secondary" onClick={() => void handleStudyBundleExport()} disabled={pendingKey !== null}>
              {pendingKey === "study_bundle" ? "导出中..." : "导出 study bundle"}
            </Button>
          </div>
        </Card>

        {statusMessage ? (
          <div className="rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-700">
            {statusMessage}
          </div>
        ) : null}
      </div>
    </PageContainer>
  );
}
