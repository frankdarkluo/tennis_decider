import en from "@/lib/i18n/dictionaries/en";
import zh from "@/lib/i18n/dictionaries/zh";

export type I18nKey = keyof typeof zh | keyof typeof en;
export type I18nDictionary = Record<I18nKey, string>;
export type LocaleValue = "zh" | "en";

export { I18nProvider, useI18n } from "@/lib/i18n/provider";
