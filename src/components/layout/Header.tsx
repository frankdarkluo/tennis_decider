"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";
import { useAuthModal } from "@/components/auth/AuthModalProvider";
import { logEvent } from "@/lib/eventLogger";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "首页" },
  { href: "/assessment", label: "水平评估" },
  { href: "/diagnose", label: "问题诊断" },
  { href: "/library", label: "内容库" },
  { href: "/rankings", label: "博主榜" },
  { href: "/plan", label: "训练计划" }
];

export function Header() {
  const pathname = usePathname();
  const { user, loading } = useAuth();
  const { openLoginModal } = useAuthModal();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3 md:px-6">
        <Link href="/" className="text-lg font-black tracking-tight text-slate-900">TennisLevel</Link>
        <nav className="hidden gap-1 md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "rounded-lg px-3 py-2 text-sm font-medium transition",
                pathname === item.href ? "bg-brand-50 text-brand-700" : "text-slate-700 hover:bg-slate-100"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="hidden items-center gap-2 md:flex">
          {user?.email ? (
            <>
              <span className="hidden max-w-[160px] truncate text-sm text-slate-500 lg:inline">
                {user.email}
              </span>
              <Link
                href="/profile"
                className="rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
              >
                我的记录
              </Link>
            </>
          ) : (
            <Button variant="ghost" onClick={() => openLoginModal(undefined, "header")}>
              {loading ? "账号" : "登录"}
            </Button>
          )}
          <Link
            href="/assessment"
            onClick={() => logEvent("cta_click", { ctaLabel: "免费开始", ctaLocation: "header", targetPage: "/assessment" })}
          >
            <Button>免费开始</Button>
          </Link>
        </div>

        <div className="flex items-center gap-2 md:hidden">
          <Link
            href="/assessment"
            onClick={() => logEvent("cta_click", { ctaLabel: "开始", ctaLocation: "header_mobile", targetPage: "/assessment" })}
          >
            <Button className="px-4">开始</Button>
          </Link>
          <Button
            type="button"
            variant="ghost"
            className="min-h-11 px-3"
            aria-expanded={mobileNavOpen}
            aria-label={mobileNavOpen ? "关闭导航菜单" : "打开导航菜单"}
            onClick={() => setMobileNavOpen((prev) => !prev)}
          >
            <svg aria-hidden="true" viewBox="0 0 20 20" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
              {mobileNavOpen ? (
                <path d="M5 5l10 10M15 5 5 15" strokeLinecap="round" />
              ) : (
                <path d="M3.5 5.5h13M3.5 10h13M3.5 14.5h13" strokeLinecap="round" />
              )}
            </svg>
          </Button>
        </div>
      </div>

      {mobileNavOpen ? (
        <div className="border-t border-[var(--line)] bg-white md:hidden">
          <div className="mx-auto w-full max-w-6xl space-y-3 px-4 py-4">
            <nav className="grid gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex min-h-11 items-center rounded-xl px-4 text-sm font-medium transition",
                    pathname === item.href ? "bg-brand-50 text-brand-700" : "text-slate-700 hover:bg-slate-100"
                  )}
                >
                  {item.label}
                </Link>
              ))}
            </nav>
            <div className="border-t border-[var(--line)] pt-3">
              {user?.email ? (
                <div className="space-y-2">
                  <p className="text-sm text-slate-500">{user.email}</p>
                  <Link
                    href="/profile"
                    className="flex min-h-11 items-center rounded-xl px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                  >
                    我的记录
                  </Link>
                </div>
              ) : (
                <Button variant="ghost" className="w-full justify-start px-4" onClick={() => openLoginModal(undefined, "header")}>
                  {loading ? "账号" : "登录"}
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
