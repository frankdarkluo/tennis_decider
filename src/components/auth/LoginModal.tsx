"use client";

import { FormEvent, useMemo, useState } from "react";
import { Modal } from "@/components/ui/Modal";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";

type LoginModalProps = {
  open: boolean;
  onClose: () => void;
  contextMessage?: string;
};

export function LoginModal({ open, onClose, contextMessage }: LoginModalProps) {
  const { user, sendMagicLink, signOut } = useAuth();
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const [message, setMessage] = useState("");

  const helperText = useMemo(() => {
    if (user?.email) {
      return `当前已登录：${user.email}`;
    }
    return "输入邮箱后，我们会给你发登录链接。";
  }, [user?.email]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setMessage("");

    const result = await sendMagicLink(email);

    if (result.error) {
      setStatus("error");
      setMessage(result.error);
      return;
    }

    setStatus("sent");
    setMessage("登录链接已经发出，去邮箱里点开就能完成登录。");
  }

  async function handleSignOut() {
    await signOut();
    setStatus("idle");
    setMessage("你已经退出登录。");
  }

  return (
    <Modal open={open} onClose={onClose} title={user ? "账号信息" : "邮箱登录"}>
      <div className="space-y-4">
        {contextMessage && !user ? (
          <div className="rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-700">
            {contextMessage}
          </div>
        ) : null}
        <p className="text-sm leading-6 text-slate-600">{helperText}</p>

        {user ? (
          <div className="flex flex-wrap gap-2">
            <Button onClick={handleSignOut}>退出登录</Button>
          </div>
        ) : (
          <form className="space-y-3" onSubmit={handleSubmit}>
            <Input
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={status === "sending"}
            />
            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={!email || status === "sending"}>
                {status === "sending" ? "发送中..." : "发送登录链接"}
              </Button>
            </div>
          </form>
        )}

        {message ? (
          <div
            className={status === "error"
              ? "rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700"
              : "rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm text-brand-700"}
          >
            {message}
          </div>
        ) : null}
      </div>
    </Modal>
  );
}
