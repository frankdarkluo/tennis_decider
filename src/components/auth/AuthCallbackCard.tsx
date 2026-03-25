"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { EmailOtpType } from "@supabase/supabase-js";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { getSupabaseBrowserClient } from "@/lib/supabase";

export function AuthCallbackCard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("正在确认你的登录链接...");

  useEffect(() => {
    async function resolveAuth() {
      const supabase = getSupabaseBrowserClient();

      if (!supabase) {
        setStatus("error");
        setMessage("还没配置 Supabase 环境变量，所以暂时无法完成登录。");
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
      setMessage("登录成功，正在回到首页...");
      window.setTimeout(() => {
        router.replace("/");
      }, 900);
    }

    resolveAuth();
  }, [router, searchParams]);

  return (
    <Card className="mx-auto max-w-xl space-y-4">
      <p className="text-sm font-semibold text-brand-700">邮箱登录</p>
      <h1 className="text-2xl font-bold text-slate-900">
        {status === "loading" ? "正在验证登录" : status === "success" ? "登录完成" : "登录失败"}
      </h1>
      <p className="text-sm leading-6 text-slate-600">{message}</p>
      {status === "error" ? (
        <Link href="/">
          <Button variant="secondary">返回首页</Button>
        </Link>
      ) : null}
    </Card>
  );
}
