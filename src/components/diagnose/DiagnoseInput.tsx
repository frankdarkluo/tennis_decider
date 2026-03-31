import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { useI18n } from "@/lib/i18n/config";
import { DiagnosisEffortMode } from "@/types/diagnosis";

type DiagnoseInputProps = {
  value: string;
  quickTags: string[];
  quickTagsLabel?: string;
  variant?: "default" | "compact";
  effortMode?: DiagnosisEffortMode;
  onChange: (value: string) => void;
  onDiagnose: () => void;
  onClear: () => void;
  onEffortModeChange?: (mode: DiagnosisEffortMode) => void;
  onQuickTagClick?: (tag: string) => void;
};

export function DiagnoseInput({
  value,
  quickTags,
  quickTagsLabel = "也可以直接点：",
  variant = "default",
  effortMode = "standard",
  onChange,
  onDiagnose,
  onClear,
  onEffortModeChange,
  onQuickTagClick
}: DiagnoseInputProps) {
  const { t } = useI18n();
  const effortModes: Array<{ key: DiagnosisEffortMode; label: string }> = [
    { key: "quick", label: t("diagnose.mode.quick") },
    { key: "standard", label: t("diagnose.mode.standard") },
    { key: "deep", label: t("diagnose.mode.deep") }
  ];

  return (
    <div className="space-y-4 rounded-2xl border border-[var(--line)] bg-white p-5 shadow-soft">
      <Textarea
        rows={variant === "compact" ? 3 : 5}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={variant === "compact" ? "min-h-[120px]" : undefined}
        placeholder={t("diagnose.placeholder")}
      />
      <div className="space-y-2">
        <p className="text-sm text-slate-500">{t("diagnose.mode.label")}</p>
        <div className="flex flex-wrap gap-2">
          {effortModes.map((mode) => (
            <button
              key={mode.key}
              type="button"
              onClick={() => onEffortModeChange?.(mode.key)}
              className={`min-h-11 rounded-full border px-4 py-2 text-sm transition ${
                effortMode === mode.key
                  ? "border-brand-500 bg-brand-50 text-brand-700"
                  : "border-[var(--line)] text-slate-700 hover:border-brand-300 hover:text-brand-700"
              }`}
            >
              {mode.label}
            </button>
          ))}
        </div>
      </div>
      {quickTagsLabel ? <p className="text-sm text-slate-500">{quickTagsLabel}</p> : null}
      <div className="flex flex-wrap gap-2">
        {quickTags.map((tag) => (
          <button
            key={tag}
            type="button"
            className="min-h-11 rounded-full border border-[var(--line)] px-4 py-2 text-sm text-slate-700 transition hover:border-brand-300 hover:text-brand-700"
            onClick={() => {
              if (onQuickTagClick) {
                onQuickTagClick(tag);
                return;
              }

              onChange(tag);
            }}
          >
            {tag}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <Button onClick={onDiagnose}>{t("diagnose.button.start")}</Button>
        <Button variant="secondary" onClick={onClear}>{t("diagnose.button.clear")}</Button>
      </div>
    </div>
  );
}
