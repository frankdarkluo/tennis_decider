import { Button } from "@/components/ui/Button";
import { Textarea } from "@/components/ui/Textarea";
import { useI18n } from "@/lib/i18n/config";
import type { DiagnosisEffortMode } from "@/types/diagnosis";

type DiagnoseInputProps = {
  value: string;
  quickTags: string[];
  quickTagsLabel?: string;
  locale?: "zh" | "en";
  effortMode?: DiagnosisEffortMode;
  variant?: "default" | "compact";
  onChange: (value: string) => void;
  onEffortModeChange?: (mode: DiagnosisEffortMode) => void;
  onDiagnose: () => void;
  onClear: () => void;
  onQuickTagClick?: (tag: string) => void;
};

export function DiagnoseInput({
  value,
  quickTags,
  quickTagsLabel = "也可以直接点：",
  locale = "zh",
  effortMode = "standard",
  variant = "default",
  onChange,
  onEffortModeChange,
  onDiagnose,
  onClear,
  onQuickTagClick
}: DiagnoseInputProps) {
  const { t } = useI18n();
  const modeOptions: Array<{
    value: DiagnosisEffortMode;
    label: string;
    description: string;
  }> = locale === "en"
    ? [
        { value: "standard", label: "Standard", description: "Fast direct diagnosis" },
        { value: "deep", label: "Deep", description: "Reconstruct the scene before diagnosis" }
      ]
    : [
        { value: "standard", label: "标准", description: "直接进入快速诊断" },
        { value: "deep", label: "深入", description: "先还原场景，再进入诊断" }
      ];
  const selectedMode = modeOptions.find((option) => option.value === effortMode) ?? modeOptions[0];

  return (
    <div className="space-y-4 rounded-2xl border border-[var(--line)] bg-white p-5 shadow-soft">
      {onEffortModeChange ? (
        <div className="space-y-2">
          <p className="text-sm font-semibold text-slate-900">
            {locale === "en" ? "Diagnosis depth" : "诊断深度"}
          </p>
          <div className="inline-flex rounded-2xl border border-[var(--line)] bg-slate-50 p-1">
            {modeOptions.map((option) => {
              const active = option.value === selectedMode.value;

              return (
                <button
                  key={option.value}
                  type="button"
                  className={[
                    "min-h-11 rounded-xl px-4 py-2 text-sm font-semibold transition",
                    active
                      ? "bg-white text-slate-900 shadow-sm"
                      : "text-slate-600 hover:text-slate-900"
                  ].join(" ")}
                  onClick={() => onEffortModeChange(option.value)}
                >
                  {option.label}
                </button>
              );
            })}
          </div>
          <p className="text-sm text-slate-500">{selectedMode.description}</p>
        </div>
      ) : null}
      <Textarea
        rows={variant === "compact" ? 3 : 5}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className={variant === "compact" ? "min-h-[120px]" : undefined}
        placeholder={t("diagnose.placeholder")}
      />
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
