"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@/components/ui/Button";
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
        <div className="flex items-center gap-2">
          <Button variant="ghost">登录</Button>
          <Link href="/assessment"><Button>免费开始</Button></Link>
        </div>
      </div>
    </header>
  );
}
