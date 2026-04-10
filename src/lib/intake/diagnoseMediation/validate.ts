import type {
  DiagnoseMediationRejectionReason,
  DiagnoseMediationResult
} from "./types";

type ValidationResult =
  | { ok: true; value: DiagnoseMediationResult }
  | { ok: false; rejectionReason: DiagnoseMediationRejectionReason };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function isNullableString(value: unknown): value is string | null {
  return value === null || typeof value === "string";
}

function hasAnyQuestionMark(text: string) {
  return (text.match(/[?？]/g) ?? []).length;
}

function hasMarkdownOrBullets(text: string) {
  return (
    /\n/.test(text) ||
    /(^|\s)(?:[-*+]\s|\d+[.)]\s|#\s|>\s)/m.test(text) ||
    /[*_`]{2,}/.test(text) ||
    /\[[^\]]+\]\([^)]+\)/.test(text)
  );
}

function hasAdviceOrDiagnosisLanguage(text: string) {
  return /(?:建议|应该|计划|训练方案|drill|plan|recommend|suggest|because|therefore|focus on|work on|fix your|you should|need to|must|should)/i.test(text);
}

function hasDiagnosisConclusionLanguage(text: string) {
  return /(?:the problem is|this means|you need to|your issue is|结论|说明|所以你|你这是|原因是)/i.test(text);
}

function buildCombinedText(input: Pick<DiagnoseMediationResult, "displayText" | "normalizedComplaint" | "clarificationQuestion">) {
  return [input.displayText, input.normalizedComplaint, input.clarificationQuestion]
    .filter((value): value is string => typeof value === "string")
    .join(" ");
}

function isGateReason(reason: DiagnoseMediationResult["reason"]) {
  return reason === "clear_enough" || reason === "ambiguous" || reason === "too_vague" || reason === "transcript_noise";
}

function isFallbackReason(reason: DiagnoseMediationResult["reason"]) {
  return reason === "model_unavailable" || reason === "low_confidence";
}

function validateText(text: string) {
  const trimmed = text.trim();

  if (!trimmed || trimmed.length > 180) {
    return { ok: false as const, rejectionReason: "empty_or_overlong" as const };
  }

  if (hasMarkdownOrBullets(trimmed)) {
    return { ok: false as const, rejectionReason: "contains_advice_or_chatty_text" as const };
  }

  if (hasAnyQuestionMark(trimmed) > 1) {
    return { ok: false as const, rejectionReason: "contains_multiple_questions" as const };
  }

  if (hasDiagnosisConclusionLanguage(trimmed)) {
    return { ok: false as const, rejectionReason: "contains_diagnosis_or_plan" as const };
  }

  if (hasAdviceOrDiagnosisLanguage(trimmed)) {
    return { ok: false as const, rejectionReason: "contains_advice_or_chatty_text" as const };
  }

  return { ok: true as const };
}

export function validateDiagnoseMediationResult(input: unknown): ValidationResult {
  if (!isRecord(input)) {
    return { ok: false, rejectionReason: "invalid_shape" };
  }

  const mode = input.mode;
  const reason = input.reason;
  const displayText = input.displayText;
  const normalizedComplaint = input.normalizedComplaint;
  const clarificationQuestion = input.clarificationQuestion;

  if (
    (mode !== "skip" && mode !== "paraphrase" && mode !== "clarify" && mode !== "fallback") ||
    (reason !== "clear_enough" &&
      reason !== "ambiguous" &&
      reason !== "too_vague" &&
      reason !== "transcript_noise" &&
      reason !== "model_unavailable" &&
      reason !== "low_confidence") ||
    !isNullableString(displayText) ||
    !isNullableString(normalizedComplaint) ||
    !isNullableString(clarificationQuestion)
  ) {
    return { ok: false, rejectionReason: "invalid_shape" };
  }

  const allFieldsNull = displayText === null && normalizedComplaint === null && clarificationQuestion === null;

  if (mode === "skip" || mode === "fallback") {
    if (!allFieldsNull) {
      return { ok: false, rejectionReason: "missing_required_fields" };
    }

    if ((mode === "skip" && reason !== "clear_enough") || (mode === "fallback" && !isFallbackReason(reason))) {
      return { ok: false, rejectionReason: "invalid_shape" };
    }

    return { ok: true, value: input as DiagnoseMediationResult };
  }

  if (mode === "paraphrase") {
    if (displayText === null || normalizedComplaint === null || clarificationQuestion !== null) {
      return { ok: false, rejectionReason: "missing_required_fields" };
    }

    if (!isGateReason(reason)) {
      return { ok: false, rejectionReason: "invalid_shape" };
    }
  }

  if (mode === "clarify") {
    if (clarificationQuestion === null || displayText !== null || normalizedComplaint !== null) {
      return { ok: false, rejectionReason: "missing_required_fields" };
    }

    if (!isGateReason(reason)) {
      return { ok: false, rejectionReason: "invalid_shape" };
    }
  }

  const combinedText = buildCombinedText({ displayText, normalizedComplaint, clarificationQuestion });
  const textCheck = validateText(combinedText);

  if (!textCheck.ok) {
    return textCheck;
  }

  return { ok: true, value: input as DiagnoseMediationResult };
}
