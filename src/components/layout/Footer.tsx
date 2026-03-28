"use client";

import { useI18n } from "@/lib/i18n/config";

export function Footer() {
  const { t } = useI18n();

  return (
    <footer className="border-t border-[var(--line)] bg-white/70">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-4 py-8 text-sm text-slate-600 md:px-6 md:flex-row md:items-center md:justify-between">
        <div>{t("footer.brand")}</div>
        <div className="flex flex-wrap items-center gap-4">
          <span>{t("footer.about")}</span>
          <span>{t("footer.how")}</span>
          <span>{t("footer.contact")}</span>
          <span>{t("footer.privacy")}</span>
        </div>
      </div>
    </footer>
  );
}
