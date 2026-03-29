"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/components/auth/AuthProvider";
import { useAuthModal } from "@/components/auth/AuthModalProvider";
import { logEvent } from "@/lib/eventLogger";
import { useI18n } from "@/lib/i18n/config";
import { cn } from "@/lib/utils";
import { useStudy } from "@/components/study/StudyProvider";
import { StudyLanguage } from "@/types/study";

type NavKey = "nav.home" | "nav.assessment" | "nav.diagnose" | "nav.videoDiagnose" | "nav.library" | "nav.rankings" | "nav.plan";

const navItemDefs: { href: string; labelKey: NavKey }[] = [
  { href: "/", labelKey: "nav.home" },
  { href: "/assessment", labelKey: "nav.assessment" },
  { href: "/diagnose", labelKey: "nav.diagnose" },
  { href: "/video-diagnose", labelKey: "nav.videoDiagnose" },
  { href: "/library", labelKey: "nav.library" },
  { href: "/rankings", labelKey: "nav.rankings" },
  { href: "/plan", labelKey: "nav.plan" }
];

export function Header() {
  const pathname = usePathname();
  const { user, loading, signOut } = useAuth();
  const { openLoginModal } = useAuthModal();
  const { language, t, setLanguage, canChangeLanguage } = useI18n();
  const { studyMode } = useStudy();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const visibleNavItems = studyMode
    ? navItemDefs.filter((item) => item.href !== "/video-diagnose")
    : navItemDefs;

  useEffect(() => {
    setMobileNavOpen(false);
  }, [pathname]);

  async function handleSignOut(source: "header" | "header_mobile") {
    logEvent("logout_click", { source });
    await signOut();
    if (source === "header_mobile") {
      setMobileNavOpen(false);
    }
  }

  function handleLanguageChange(nextLanguage: StudyLanguage) {
    if (language === nextLanguage || !canChangeLanguage) {
      return;
    }

    logEvent("language_switch", { from: language, to: nextLanguage });
    setLanguage(nextLanguage);
    setMobileNavOpen(false);
  }

  const languageToggle = (
    <div
      className="inline-flex items-center gap-0.5"
      role="group"
      aria-label={t("nav.languageLabel")}
      title={canChangeLanguage ? undefined : t("nav.languageLocked")}
    >
      {(["zh", "en"] as const).map((option, index) => (
        <div key={option} className="flex items-center">
          {index > 0 ? <span className="text-[11px] text-slate-300">/</span> : null}
          <button
            type="button"
            className={cn(
              "rounded-md px-1.5 py-1 text-xs font-medium uppercase transition",
              language === option ? "text-brand-600" : "text-slate-400 hover:text-slate-600",
              !canChangeLanguage && "cursor-not-allowed opacity-50"
            )}
            aria-pressed={language === option}
            aria-label={option === "zh" ? t("nav.languageOptionZh") : t("nav.languageOptionEn")}
            disabled={!canChangeLanguage}
            onClick={() => handleLanguageChange(option)}
          >
            {option}
          </button>
        </div>
      ))}
    </div>
  );

  return (
    <header className="sticky top-0 z-40 border-b border-[var(--line)] bg-white/80 shadow-sm backdrop-blur-md">
      <div className="mx-auto flex w-full max-w-[1480px] items-center justify-between gap-2 px-4 py-2.5 md:px-6 lg:gap-3">
        <Link
          href="/"
          aria-label={t("nav.logoAria")}
          className="inline-flex min-h-14 shrink-0 items-center justify-start px-2 py-1.5 transition hover:opacity-80"
        >
          <Image
            src="/brand/tennislevel-logo-header.png"
            alt="TennisLevel"
            width={994}
            height={256}
            priority
            className="h-[2rem] w-auto max-w-full object-contain mix-blend-multiply md:h-[2.4rem] lg:h-[2.8rem]"
          />
        </Link>
        <nav className="hidden min-w-0 items-center gap-0.5 md:flex md:ml-4 lg:ml-6 lg:gap-1">
          {visibleNavItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "relative whitespace-nowrap rounded-lg px-2.5 py-1.5 text-[13px] transition lg:px-3 lg:py-2 lg:text-sm",
                pathname === item.href
                  ? "font-semibold text-brand-700 after:absolute after:bottom-0 after:left-1/2 after:h-[2px] after:w-3/5 after:-translate-x-1/2 after:rounded-full after:bg-brand-400 after:content-['']"
                  : "font-medium text-slate-500 hover:text-slate-800 hover:bg-slate-50"
              )}
            >
              {t(item.labelKey)}
            </Link>
          ))}
          {studyMode ? (
            <>
              <div className="mx-1 h-4 w-px bg-slate-200" />
              <Link
                href="/study/start"
                className={cn(
                  "relative whitespace-nowrap rounded-lg px-2.5 py-1.5 text-[13px] transition lg:px-3 lg:py-2 lg:text-sm",
                  pathname.startsWith("/study")
                    ? "font-semibold text-amber-600 after:absolute after:bottom-0 after:left-1/2 after:h-[2px] after:w-3/5 after:-translate-x-1/2 after:rounded-full after:bg-amber-400 after:content-['']"
                    : "font-medium text-amber-500 hover:text-amber-700 hover:bg-amber-50"
                )}
              >
                {t("nav.study")}
              </Link>
            </>
          ) : null}
        </nav>
        <div className="hidden shrink-0 items-center gap-1 md:flex lg:gap-1.5">
          {languageToggle}
          <div className="mx-1 h-4 w-px bg-slate-200" />
          {user?.email ? (
            <>
              <Link
                href="/profile"
                className="rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-slate-500 transition hover:text-slate-800 hover:bg-slate-50 lg:text-sm"
              >
                {t("nav.profile")}
              </Link>
              <button
                type="button"
                className="rounded-lg px-2 py-1.5 text-[13px] text-slate-400 transition hover:text-slate-600 lg:text-sm"
                onClick={() => handleSignOut("header")}
              >
                {t("nav.logout")}
              </button>
            </>
          ) : (
            <button
              type="button"
              className="rounded-lg px-2.5 py-1.5 text-[13px] font-medium text-slate-500 transition hover:text-slate-800 hover:bg-slate-50 lg:text-sm"
              onClick={() => openLoginModal(undefined, "header")}
            >
              {loading ? t("nav.account") : t("nav.login")}
            </button>
          )}
          <Link
            href="/assessment"
            className="ml-1"
            onClick={() => logEvent("cta_click", { ctaLabel: t("cta.headerFree"), ctaLocation: "header", targetPage: "/assessment" })}
          >
            <Button className="rounded-full bg-brand-500 px-5 shadow-sm hover:bg-brand-600 hover:shadow-md">{t("nav.ctaFree")}</Button>
          </Link>
        </div>

        <div className="flex items-center gap-1.5 md:hidden">
          {languageToggle}
          <Link
            href="/assessment"
            onClick={() => logEvent("cta_click", { ctaLabel: t("cta.headerMobile"), ctaLocation: "header_mobile", targetPage: "/assessment" })}
          >
            <Button className="rounded-full px-4 shadow-sm">{t("nav.ctaMobile")}</Button>
          </Link>
          <Button
            type="button"
            variant="ghost"
            className="min-h-11 px-3"
            aria-expanded={mobileNavOpen}
            aria-label={mobileNavOpen ? t("nav.menuClose") : t("nav.menuOpen")}
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
              {visibleNavItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex min-h-11 items-center rounded-xl px-4 text-base font-semibold transition",
                    pathname === item.href ? "bg-brand-50 text-brand-700" : "text-slate-700 hover:bg-slate-100"
                  )}
                >
                  {t(item.labelKey)}
                </Link>
              ))}
              {studyMode ? (
                <Link
                  href="/study/start"
                  className={cn(
                    "flex min-h-11 items-center rounded-xl px-4 text-base font-semibold transition",
                    pathname.startsWith("/study") ? "bg-amber-50 text-amber-700" : "text-amber-600 hover:bg-amber-50"
                  )}
                >
                  {t("nav.study")}
                </Link>
              ) : null}
            </nav>
            <div className="border-t border-[var(--line)] pt-3">
              {user?.email ? (
                <div className="space-y-2">
                  <p className="text-sm text-slate-500">{user.email}</p>
                  <Link
                    href="/profile"
                    className="flex min-h-11 items-center rounded-xl px-4 text-sm font-medium text-slate-700 transition hover:bg-slate-100"
                  >
                    {t("nav.profile")}
                  </Link>
                  <Button
                    variant="ghost"
                    className="w-full justify-start px-4"
                    onClick={() => handleSignOut("header_mobile")}
                  >
                    {t("nav.logout")}
                  </Button>
                </div>
              ) : (
                <Button variant="ghost" className="w-full justify-start px-4" onClick={() => openLoginModal(undefined, "header")}>
                  {loading ? t("nav.account") : t("nav.login")}
                </Button>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </header>
  );
}
