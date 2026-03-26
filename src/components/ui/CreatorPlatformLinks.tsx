"use client";

import { Creator } from "@/types/creator";
import { logEvent } from "@/lib/eventLogger";
import { cn } from "@/lib/utils";
import { PlatformIcon } from "@/components/ui/PlatformBadge";

type CreatorPlatformLinksProps = {
  creator: Creator;
  source: string;
  className?: string;
};

export function CreatorPlatformLinks({ creator, source, className }: CreatorPlatformLinksProps) {
  const platforms = creator.platforms
    .map((platform) => ({
      platform,
      href: creator.platformLinks?.[platform] ?? (platform === creator.platforms[0] ? creator.profileUrl : undefined)
    }))
    .filter((item): item is { platform: Creator["platforms"][number]; href: string } => Boolean(item.href));

  if (platforms.length === 0) {
    return null;
  }

  return (
    <div className={cn("flex flex-wrap items-center gap-2", className)}>
      {platforms.map(({ platform, href }) => (
        <a
          key={`${creator.id}-${platform}`}
          href={href}
          target="_blank"
          rel="noreferrer"
          aria-label={`前往 ${creator.name} 的${platform}主页`}
          className={cn(
            "platform-link-wiggle inline-flex h-10 w-10 items-center justify-center rounded-full border border-[var(--line)] bg-white text-slate-600 shadow-sm transition hover:border-brand-200 hover:text-brand-700"
          )}
          onClick={() => logEvent("creator_click", { creatorId: creator.id, source, platform, targetUrl: href })}
        >
          <PlatformIcon platform={platform} className="h-[18px] w-[18px]" />
        </a>
      ))}
    </div>
  );
}
