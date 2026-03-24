"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { assessmentQuestions } from "@/data/assessmentQuestions";
import { calculateAssessmentResult } from "@/lib/assessment";
import { PageContainer } from "@/components/layout/PageContainer";
import { AssessmentProgress } from "@/components/assessment/AssessmentProgress";
import { QuestionCard } from "@/components/assessment/QuestionCard";
import { Button } from "@/components/ui/Button";

export default function AssessmentPage() {
  const router = useRouter();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});

  const total = assessmentQuestions.length;
  const question = assessmentQuestions[index];
  const selectedScore = answers[question.id];
  const isLast = index === total - 1;

  const canNext = useMemo(() => selectedScore !== undefined, [selectedScore]);

  const onSubmit = () => {
    if (!canNext) {
      return;
    }
    const result = calculateAssessmentResult(answers);
    localStorage.setItem("assessmentResult", JSON.stringify(result));
    router.push("/assessment/result");
  };

  return (
    <PageContainer>
      <div className="space-y-5">
        <div>
          <h1 className="text-3xl font-black text-slate-900">1 分钟快速了解你的网球能力区间</h1>
          <p className="mt-2 text-slate-600">回答 8 个问题，获取参考水平与提升建议</p>
        </div>
        <AssessmentProgress current={index + 1} total={total} />
        <QuestionCard
          question={question}
          selectedScore={selectedScore}
          onSelect={(score) => setAnswers((prev) => ({ ...prev, [question.id]: score }))}
        />
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" disabled={index === 0} onClick={() => setIndex((v) => Math.max(0, v - 1))}>上一题</Button>
          {!isLast ? (
            <Button disabled={!canNext} onClick={() => setIndex((v) => Math.min(total - 1, v + 1))}>下一题</Button>
          ) : (
            <Button disabled={!canNext} onClick={onSubmit}>提交评估</Button>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
