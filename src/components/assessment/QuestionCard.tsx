import { AssessmentQuestion } from "@/types/assessment";
import { Card } from "@/components/ui/Card";

function formatSliderValue(value: number) {
  if (value === 0.5) {
    return "半年";
  }

  if (value >= 10) {
    return "10年+";
  }

  return `${value} 年`;
}

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
  if (question.type === "slider") {
    const sliderValue = typeof selectedValue === "number" ? selectedValue : question.sliderConfig.default;

    return (
      <Card className="space-y-5">
        <div className="space-y-2">
          <p className="text-sm font-semibold text-brand-700">再补一个背景信息</p>
          <h2 className="text-2xl font-black text-slate-900">{question.question}</h2>
        </div>
        <div className="rounded-2xl bg-slate-50 px-4 py-5 text-center">
          <p className="text-3xl font-black text-slate-900">{formatSliderValue(sliderValue)}</p>
        </div>
        <div className="space-y-3">
          <input
            aria-label={question.question}
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
                  {mark.label}
                </span>
              );
            })}
          </div>
        </div>
      </Card>
    );
  }

  const isGender = question.type === "gender";
  const titleTone = question.phase === "coarse" ? "核心评估" : question.phase === "fine" ? "继续了解一下" : "先从两个小问题开始";

  return (
    <Card className="space-y-5">
      <div className="space-y-2">
        <p className="text-sm font-semibold text-brand-700">{titleTone}</p>
        <h2 className="text-2xl font-black text-slate-900">{question.question}</h2>
      </div>
      <div className={isGender ? "grid gap-3 sm:grid-cols-2" : "space-y-3"}>
        {question.options.map((option) => (
          <button
            key={option.label}
            type="button"
            disabled={disabled}
            onClick={() => onSelect?.(option.value)}
            className={[
              isGender
                ? "min-h-14 rounded-2xl border px-6 text-lg font-semibold"
                : "min-h-14 w-full rounded-2xl border px-4 py-4 text-left text-base font-medium",
              "transition disabled:cursor-not-allowed disabled:opacity-60",
              selectedValue === option.value
                ? "scale-[1.01] border-brand-500 bg-brand-50 text-brand-700"
                : "border-[var(--line)] bg-white text-slate-700 hover:border-brand-300 hover:text-brand-700"
            ].join(" ")}
          >
            {option.label}
          </button>
        ))}
      </div>
    </Card>
  );
}
