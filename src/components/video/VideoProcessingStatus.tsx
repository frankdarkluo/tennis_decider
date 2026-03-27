import { Card } from "@/components/ui/Card";

type VideoProcessingStep = "extracting" | "analyzing" | "matching";

const steps: Array<{ key: VideoProcessingStep; title: string; description: string }> = [
  {
    key: "extracting",
    title: "正在取关键帧",
    description: "先取几个关键动作。"
  },
  {
    key: "analyzing",
    title: "正在看动作",
    description: "重点看击球点、脚步和挥拍。"
  },
  {
    key: "matching",
    title: "正在配内容和计划",
    description: "把结果映射到内容和计划。"
  }
];

export function VideoProcessingStatus({ step }: { step: VideoProcessingStep }) {
  const currentIndex = steps.findIndex((item) => item.key === step);

  return (
    <Card className="space-y-4">
      <div>
        <p className="text-sm font-semibold text-brand-700">视频诊断中</p>
        <h2 className="mt-1 text-xl font-bold text-slate-900">大约 10-20 秒</h2>
      </div>

      <div className="space-y-3">
        {steps.map((item, index) => {
          const active = index === currentIndex;
          const completed = index < currentIndex;

          return (
            <div
              key={item.key}
              className={`rounded-2xl border px-4 py-3 ${
                active ? "border-brand-200 bg-brand-50/70" : completed ? "border-emerald-100 bg-emerald-50/60" : "border-[var(--line)] bg-white"
              }`}
            >
              <p className="text-sm font-semibold text-slate-900">
                {completed ? "已完成" : active ? "进行中" : "待执行"} · {item.title}
              </p>
              <p className="mt-1 text-sm text-slate-600">{item.description}</p>
            </div>
          );
        })}
      </div>
    </Card>
  );
}
