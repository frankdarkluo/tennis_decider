import en from "./dictionaries/en";
import zh from "./dictionaries/zh";
import { StudyLanguage } from "@/types/study";

export type I18nKey = keyof typeof zh | keyof typeof en;
export type I18nDictionary = Record<I18nKey, string>;
export type LocaleValue = StudyLanguage;

export { I18nProvider, useI18n } from "./provider";
