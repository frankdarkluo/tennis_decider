import { AssessmentQuestion } from "@/types/assessment";
import { Card } from "@/components/ui/Card";

type QuestionCardProps = {
  question: AssessmentQuestion;
  selectedScore?: number;
  onSelect: (score: number) => void;
};

export function QuestionCard({ question, selectedScore, onSelect }: QuestionCardProps) {
  return (
    <Card className="space-y-4">
      <h2 className="text-xl font-bold text-slate-900">{question.question}</h2>
      <div className="space-y-2">
        {question.options.map((option) => (
          <button
            key={option.label}
            onClick={() => onSelect(option.score)}
            className={[
              "w-full rounded-xl border px-4 py-3 text-left text-sm transition",
              selectedScore === option.score
                ? "border-brand-500 bg-brand-50 text-brand-700"
                : "border-[var(--line)] bg-white text-slate-700 hover:border-brand-300"
            ].join(" ")}
          >
            {option.label}
          </button>
        ))}
      </div>
    </Card>
  );
}
