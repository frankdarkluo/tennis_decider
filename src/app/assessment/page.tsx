"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { assessmentQuestions } from "@/data/assessmentQuestions";
import { calculateAssessmentResult } from "@/lib/assessment";
import { writeAssessmentResultToStorage } from "@/lib/assessmentStorage";
import { saveAssessmentResult } from "@/lib/userData";
import { PageContainer } from "@/components/layout/PageContainer";
import { AssessmentProgress } from "@/components/assessment/AssessmentProgress";
import { QuestionCard } from "@/components/assessment/QuestionCard";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";

export default function AssessmentPage() {
  const router = useRouter();
  const { user, configured } = useAuth();
  const [index, setIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, number>>({});
  const [submitting, setSubmitting] = useState(false);

  const total = assessmentQuestions.length;
  const question = assessmentQuestions[index];
  const selectedScore = answers[question.id];
  const isLast = index === total - 1;

  const canNext = useMemo(() => selectedScore !== undefined, [selectedScore]);

  const onSubmit = async () => {
    if (!canNext || submitting) {
      return;
    }

    setSubmitting(true);
    const result = calculateAssessmentResult(answers);
    writeAssessmentResultToStorage(result);

    if (user?.id && configured) {
      const saveResult = await saveAssessmentResult(user.id, result);
      if (saveResult.error) {
        console.error("[assessment] failed to save result", saveResult.error);
      }
    }

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
            <Button disabled={!canNext || submitting} onClick={() => setIndex((v) => Math.min(total - 1, v + 1))}>下一题</Button>
          ) : (
            <Button disabled={!canNext || submitting} onClick={onSubmit}>
              {submitting ? "保存中..." : "提交评估"}
            </Button>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
