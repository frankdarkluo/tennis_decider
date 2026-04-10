"use client";

import Link from "next/link";
import { PageContainer } from "@/components/layout/PageContainer";
import { PageBreadcrumbs } from "@/components/layout/PageBreadcrumbs";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useI18n } from "@/lib/i18n/config";

export default function RankingsPage() {
  const { t } = useI18n();

  return (
    <PageContainer>
      <div className="space-y-5">
        <PageBreadcrumbs items={[{ href: "/", label: t("profile.backHome") }]} />
        <Card className="mx-auto max-w-3xl space-y-4 text-center">
          <h1 className="text-3xl font-black text-slate-900">{t("rankings.deprecated.title")}</h1>
          <p className="text-sm leading-6 text-slate-600">{t("rankings.deprecated.body")}</p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/library">
              <Button>{t("rankings.deprecated.cta")}</Button>
            </Link>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
}
