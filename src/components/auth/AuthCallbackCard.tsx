"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { EmailOtpType } from "@supabase/supabase-js";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { useI18n } from "@/lib/i18n/config";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export function AuthCallbackCard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t } = useI18n();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState(t("auth.callback.confirming"));

  useEffect(() => {
    async function resolveAuth() {
      const supabase = getSupabaseBrowserClient();

      if (!supabase) {
        setStatus("error");
        setMessage(t("auth.callback.missingSupabase"));
        return;
      }

      const code = searchParams.get("code");
      const tokenHash = searchParams.get("token_hash");
      const type = searchParams.get("type");

      if (code) {
        const { error } = await supabase.auth.exchangeCodeForSession(code);
        if (error) {
          setStatus("error");
          setMessage(error.message);
          return;
        }
      } else if (tokenHash && type) {
        const { error } = await supabase.auth.verifyOtp({
          token_hash: tokenHash,
          type: type as EmailOtpType
        });

        if (error) {
          setStatus("error");
          setMessage(error.message);
          return;
        }
      }

      setStatus("success");
      setMessage(t("auth.callback.successBody"));
      window.setTimeout(() => {
        router.replace("/");
      }, 900);
    }

    resolveAuth();
  }, [router, searchParams, t]);

  return (
    <Card className="mx-auto max-w-xl space-y-4">
      <p className="text-sm font-semibold text-brand-700">{t("auth.callback.badge")}</p>
      <h1 className="text-2xl font-bold text-slate-900">
        {status === "loading" ? t("auth.callback.loadingTitle") : status === "success" ? t("auth.callback.successTitle") : t("auth.callback.errorTitle")}
      </h1>
      <p className="text-sm leading-6 text-slate-600">{message}</p>
      {status === "error" ? (
        <Link href="/">
          <Button variant="secondary">{t("auth.callback.backHome")}</Button>
        </Link>
      ) : null}
    </Card>
  );
}
