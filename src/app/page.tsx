"use client";

import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { HeroSection } from "@/components/home/HeroSection";
import { HotContentSection } from "@/components/home/HotContentSection";
import { HotCreatorsSection } from "@/components/home/HotCreatorsSection";
import { Card } from "@/components/ui/Card";
import { logEvent } from "@/lib/eventLogger";
import { useI18n } from "@/lib/i18n/config";

export default function HomePage() {
  const { t } = useI18n();

  return (
    <PageContainer>
      <div className="space-y-8">
        <HeroSection />

        <div className="grid gap-5 md:grid-cols-2">
          <HotContentSection />
          <HotCreatorsSection />
        </div>

        <Link
          href="/assessment"
          className="group block"
          onClick={() => logEvent("cta_click", { ctaLabel: t("cta.assessmentCTA"), ctaLocation: "home_bottom_cta", targetPage: "/assessment" })}
        >
          <Card className="flex cursor-pointer flex-col items-start justify-between gap-4 transition-shadow group-hover:shadow-md md:flex-row md:items-center">
            <div>
              <p className="text-sm font-semibold text-brand-700">{t("home.assessment.ctaHint")}</p>
              <h3 className="mt-1 text-lg font-bold text-slate-900">{t("home.assessment.ctaTitle")}</h3>
            </div>
            <span className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[var(--line)] bg-white px-6 py-2.5 text-sm font-semibold text-slate-800 transition group-hover:bg-slate-50">
              {t("home.assessment.ctaButton")}
            </span>
          </Card>
        </Link>
      </div>
    </PageContainer>
  );
}
