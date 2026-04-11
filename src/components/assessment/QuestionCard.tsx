import { AssessmentQuestion } from "@/types/assessment";
import { Card } from "@/components/ui/Card";
import { useI18n } from "@/lib/i18n/config";
import {
  getAssessmentOptionDescription,
  getAssessmentOptionLabel,
  getAssessmentQuestionText
} from "@/lib/i18n/assessmentCopy";

type QuestionCardProps = {
  question: AssessmentQuestion;
  selectedValue?: string;
  disabled?: boolean;
  onSelect?: (value: string) => void;
};

export function QuestionCard({
  question,
  selectedValue,
  disabled = false,
  onSelect
}: QuestionCardProps) {
  const { language } = useI18n();
  const isCardGrid = question.uiVariant === "card-grid";

  return (
    <Card className="space-y-5">
      <div className="space-y-2">
        <h2 className="text-2xl font-black text-slate-900">{getAssessmentQuestionText(question, language)}</h2>
      </div>

      <div className={isCardGrid ? "grid gap-3 sm:grid-cols-2" : "space-y-3"}>
        {question.options.map((option) => {
          const label = getAssessmentOptionLabel(question.id, option.value, option.label, language);
          const description = getAssessmentOptionDescription(question.id, option.value, option.description, language);

          return (
            <button
              key={option.id}
              type="button"
              disabled={disabled}
              onClick={() => onSelect?.(option.value)}
              className={[
                "w-full rounded-2xl border px-4 py-4 text-left transition",
                "disabled:cursor-not-allowed disabled:opacity-60",
                isCardGrid ? "min-h-[124px]" : "min-h-14",
                selectedValue === option.value
                  ? "scale-[1.01] border-brand-500 bg-brand-50 text-brand-700"
                  : "border-[var(--line)] bg-white text-slate-700 hover:border-brand-300 hover:text-brand-700"
              ].join(" ")}
            >
              <div className="space-y-2">
                <p className="text-base font-semibold">{label}</p>
                {description ? (
                  <p className="text-sm leading-6 text-slate-500">{description}</p>
                ) : null}
              </div>
            </button>
          );
        })}
      </div>
    </Card>
  );
}
