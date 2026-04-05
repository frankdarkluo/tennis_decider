import { AssessmentQuestion } from "@/types/assessment";
import { Card } from "@/components/ui/Card";
import { useI18n } from "@/lib/i18n/config";
import {
  formatAssessmentYearsLabel,
  getAssessmentOptionLabel,
  getAssessmentQuestionText
} from "@/lib/i18n/assessmentCopy";

type QuestionCardProps = {
  question: AssessmentQuestion;
  selectedValue?: number;
  disabled?: boolean;
  onSelect?: (value: number) => void;
  onSliderChange?: (value: number) => void;
  onSliderCommit?: () => void;
  onSliderBeginInteract?: () => void;
};

export function QuestionCard({
  question,
  selectedValue,
  disabled = false,
  onSelect,
  onSliderChange,
  onSliderCommit,
  onSliderBeginInteract
}: QuestionCardProps) {
  const { language, t } = useI18n();

  if (question.type === "slider") {
    const sliderValue = typeof selectedValue === "number" ? selectedValue : question.sliderConfig.default;

    return (
      <Card className="space-y-5">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-brand-700">{t("assessment.question.slider")}</p>
          <h2 className="text-2xl font-black text-slate-900">{getAssessmentQuestionText(question, language)}</h2>
        </div>
        <div className="rounded-2xl bg-slate-50 px-4 py-5 text-center">
          <p className="text-3xl font-black text-slate-900">{formatAssessmentYearsLabel(sliderValue, language)}</p>
        </div>
        <div className="space-y-3">
          <input
            aria-label={getAssessmentQuestionText(question, language)}
            type="range"
            min={question.sliderConfig.min}
            max={question.sliderConfig.max}
            step={question.sliderConfig.step}
            value={sliderValue}
            disabled={disabled}
            onChange={(event) => onSliderChange?.(Number(event.target.value))}
            onPointerDown={onSliderBeginInteract}
            onMouseDown={onSliderBeginInteract}
            onTouchStart={onSliderBeginInteract}
            onPointerUp={onSliderCommit}
            onMouseUp={onSliderCommit}
            onTouchEnd={onSliderCommit}
            onKeyUp={onSliderCommit}
            onBlur={onSliderCommit}
            className="h-2 w-full cursor-pointer accent-brand-500"
          />
          <div className="relative h-5 text-[11px] text-slate-400">
            {question.sliderConfig.displayLabels.map((mark) => {
              const left = `${((mark.value - question.sliderConfig.min) / (question.sliderConfig.max - question.sliderConfig.min)) * 100}%`;
              const isFirst = mark.value === question.sliderConfig.min;
              const isLast = mark.value === question.sliderConfig.max;
              const className = isFirst
                ? "absolute left-0 top-0"
                : isLast
                  ? "absolute right-0 top-0"
                  : "absolute top-0 -translate-x-1/2";

              return (
                <span
                  key={`${question.id}_${mark.label}`}
                  className={className}
                  style={!isFirst && !isLast ? { left } : undefined}
                >
                  {language === "en"
                    ? formatAssessmentYearsLabel(mark.value, language).replace(" years", "y").replace(" year", "y")
                    : mark.label}
                </span>
              );
            })}
          </div>
        </div>
      </Card>
    );
  }

  const titleTone = question.phase === "coarse"
    ? t("assessment.question.coarse")
    : question.phase === "fine"
      ? t("assessment.question.fine")
      : t("assessment.question.profile");

  return (
    <Card className="space-y-4">
      <div className="space-y-2">
        {titleTone ? <p className="text-sm font-semibold text-brand-700">{titleTone}</p> : null}
        <h2 className="text-2xl font-black text-slate-900">{getAssessmentQuestionText(question, language)}</h2>
      </div>
      <div className="space-y-3">
        {question.options.map((option) => (
          <button
            key={option.label}
            type="button"
            disabled={disabled}
            onClick={() => onSelect?.(option.value)}
            className={[
              "min-h-14 w-full rounded-2xl border px-4 py-4 text-left text-base font-medium",
              "transition disabled:cursor-not-allowed disabled:opacity-60",
              selectedValue === option.value
                ? "scale-[1.01] border-brand-500 bg-brand-50 text-brand-700"
                : "border-[var(--line)] bg-white text-slate-700 hover:border-brand-300 hover:text-brand-700"
            ].join(" ")}
          >
            {getAssessmentOptionLabel(question.id, option.value, option.label, language)}
          </button>
        ))}
      </div>
    </Card>
  );
}
