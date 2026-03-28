"use client";

import { Suspense } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { AuthCallbackCard } from "@/components/auth/AuthCallbackCard";
import { Card } from "@/components/ui/Card";
import { useI18n } from "@/lib/i18n/config";

function AuthCallbackFallback() {
  const { t } = useI18n();

  return (
    <Card className="mx-auto max-w-xl space-y-4">
      <p className="text-sm font-semibold text-brand-700">{t("auth.callback.badge")}</p>
      <h1 className="text-2xl font-bold text-slate-900">{t("auth.callback.loadingTitle")}</h1>
      <p className="text-sm leading-6 text-slate-600">{t("auth.callback.confirming")}</p>
    </Card>
  );
}

export default function AuthCallbackPage() {
  return (
    <PageContainer>
      <div className="py-12">
        <Suspense fallback={<AuthCallbackFallback />}>
          <AuthCallbackCard />
        </Suspense>
      </div>
    </PageContainer>
  );
}
