import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";

type UsageMeterProps = {
  successCount: number;
  maxFree: number;
  isPro: boolean;
};

export function UsageMeter({ successCount, maxFree, isPro }: UsageMeterProps) {
  const remaining = isPro ? "无限" : Math.max(0, maxFree - successCount);

  return (
    <Card className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-brand-700">视频诊断额度</p>
          <h2 className="mt-1 text-lg font-bold text-slate-900">
            {isPro ? "你当前是 Pro，可无限次使用" : `你还剩 ${remaining} 次免费视频诊断`}
          </h2>
        </div>
        <Badge className={isPro ? "" : remaining === 0 ? "bg-amber-50 text-amber-700" : ""}>
          {isPro ? "Pro" : `已成功使用 ${successCount}/${maxFree}`}
        </Badge>
      </div>
      <p className="text-sm leading-6 text-slate-600">
        只有当系统成功完成分析并给出有效结果时，才会算作一次使用。分析失败或建议重拍时不会扣次数。
      </p>
    </Card>
  );
}

