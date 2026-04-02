import { AppEnvironment, EnvironmentValue } from "@/types/environment";

type EnvironmentScoped = {
  environment?: EnvironmentValue;
};

export function resolveAppEnvironment(input: {
  studyMode: boolean;
  hasSession: boolean;
}): AppEnvironment {
  return input.studyMode && input.hasSession ? "testing" : "production";
}

export function matchesEnvironment(
  value: EnvironmentValue | undefined,
  environment: AppEnvironment
): boolean {
  if (!value) {
    return true;
  }

  const allowed = Array.isArray(value) ? value : [value];
  return allowed.includes(environment);
}

export function filterByEnvironment<T extends EnvironmentScoped>(
  items: T[],
  environment: AppEnvironment
): T[] {
  return items.filter((item) => matchesEnvironment(item.environment, environment));
}

export function getPostAssessmentHref(_environment: AppEnvironment): string {
  return "/assessment/result";
}
