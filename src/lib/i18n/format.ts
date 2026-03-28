export type AppLocale = "zh" | "en";

function getLocaleCode(locale: AppLocale) {
  return locale === "en" ? "en-US" : "zh-CN";
}

export function formatLocalizedDateTime(value: string, locale: AppLocale) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return value;
  }

  if (locale === "en") {
    return date.toLocaleString(getLocaleCode(locale), {
      dateStyle: "medium",
      timeStyle: "short"
    });
  }

  return date.toLocaleString(getLocaleCode(locale), {
    year: "numeric",
    month: "numeric",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export function formatLocalizedDate(value: string, locale: AppLocale) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  if (locale === "en") {
    return date.toLocaleDateString(getLocaleCode(locale), {
      dateStyle: "medium"
    });
  }

  return date.toLocaleDateString(getLocaleCode(locale), {
    year: "numeric",
    month: "numeric",
    day: "numeric"
  });
}
