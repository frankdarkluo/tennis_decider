import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { useI18n } from "@/lib/i18n/config";

type UsageMeterProps = {
  successCount: number;
  maxFree: number;
  isPro: boolean;
};

export function UsageMeter({ successCount, maxFree, isPro }: UsageMeterProps) {
  const { t } = useI18n();
  const remaining = isPro ? t("video.usage.unlimited") : Math.max(0, maxFree - successCount);

  return (
    <Card className="space-y-3">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-brand-700">{t("video.usage.title")}</p>
          <h2 className="mt-1 text-lg font-bold text-slate-900">
            {isPro ? t("video.usage.proHeadline") : t("video.usage.remainingHeadline", { remaining })}
          </h2>
        </div>
        <Badge className={isPro ? "" : remaining === 0 ? "bg-amber-50 text-amber-700" : ""}>
          {isPro ? "Pro" : t("video.usage.used", { used: successCount, max: maxFree })}
        </Badge>
      </div>
      <p className="text-sm leading-6 text-slate-600">
        {t("video.usage.note")}
      </p>
    </Card>
  );
}
