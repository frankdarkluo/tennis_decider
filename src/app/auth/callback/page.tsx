import { Suspense } from "react";
import { PageContainer } from "@/components/layout/PageContainer";
import { AuthCallbackCard } from "@/components/auth/AuthCallbackCard";
import { Card } from "@/components/ui/Card";

function AuthCallbackFallback() {
  return (
    <Card className="mx-auto max-w-xl space-y-4">
      <p className="text-sm font-semibold text-brand-700">邮箱登录</p>
      <h1 className="text-2xl font-bold text-slate-900">正在验证登录</h1>
      <p className="text-sm leading-6 text-slate-600">正在确认你的登录链接...</p>
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
