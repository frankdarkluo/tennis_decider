"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

type DiagnoseMediationInlineProps = {
  language: "zh" | "en";
  mode: "paraphrase" | "clarify";
  displayText?: string | null;
  question?: string | null;
  submitting?: boolean;
  error?: string | null;
  onSubmit?: (answer: string) => void;
};

export function DiagnoseMediationInline({
  language,
  mode,
  displayText,
  question,
  submitting = false,
  error,
  onSubmit
}: DiagnoseMediationInlineProps) {
  const [answer, setAnswer] = useState("");

  useEffect(() => {
    setAnswer("");
  }, [mode, question]);

  if (mode === "paraphrase") {
    const copy = language === "en"
      ? {
        badge: "Quick read",
        lead: "I’ll read it as:",
        detail: "The diagnosis continues from that normalized version."
      }
      : {
        badge: "先按这个理解",
        lead: "我先按这个理解：",
        detail: "下面直接按这个版本继续。"
      };

    return (
      <div className="space-y-2 rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
          {copy.badge}
        </p>
        <p className="text-sm leading-6 text-slate-800">
          {copy.lead}
          <span className="font-medium text-slate-900">{displayText ?? ""}</span>
        </p>
        <p className="text-xs leading-5 text-slate-500">{copy.detail}</p>
      </div>
    );
  }

  const copy = language === "en"
    ? {
      badge: "One quick check",
      title: "One short clarification before I continue:",
      detail: "Reply in one sentence and I’ll rerun the intake once.",
      placeholder: "Add one short detail",
      button: "Continue",
      submitting: "Checking..."
    }
    : {
      badge: "先确认一句",
      title: "我先确认一下：",
      detail: "补一句就行，我只会再跑一次。",
      placeholder: "补充一句即可",
      button: "继续",
      submitting: "确认中..."
    };

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3">
      <p className="text-xs font-semibold uppercase tracking-[0.08em] text-slate-500">
        {copy.badge}
      </p>
      <p className="text-sm leading-6 text-slate-900">
        {copy.title}
        <span className="font-medium">{question ?? ""}</span>
      </p>
      <p className="text-xs leading-5 text-slate-500">{copy.detail}</p>
      {error ? <p className="text-sm text-rose-600">{error}</p> : null}
      <form
        className="space-y-2"
        onSubmit={(event) => {
          event.preventDefault();
          const trimmedAnswer = answer.trim();
          if (!trimmedAnswer || !onSubmit) {
            return;
          }

          onSubmit(trimmedAnswer);
        }}
      >
        <Input
          value={answer}
          onChange={(event) => setAnswer(event.target.value)}
          placeholder={copy.placeholder}
          disabled={submitting}
        />
        <div className="flex justify-end">
          <Button
            type="submit"
            variant="secondary"
            disabled={submitting || !answer.trim()}
          >
            {submitting ? copy.submitting : copy.button}
          </Button>
        </div>
      </form>
    </div>
  );
}
