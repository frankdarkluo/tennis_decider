export type ConsumerNavLabelKey =
  | "nav.diagnose"
  | "nav.plan"
  | "nav.library"
  | "nav.profile";

export const consumerNavItems: ReadonlyArray<{ href: string; labelKey: ConsumerNavLabelKey }> = [
  { href: "/diagnose", labelKey: "nav.diagnose" },
  { href: "/plan", labelKey: "nav.plan" },
  { href: "/library", labelKey: "nav.library" },
  { href: "/profile", labelKey: "nav.profile" }
];

const researchPathPrefixes = ["/admin/export"];

export function isResearchPath(pathname: string | null | undefined) {
  return Boolean(pathname && researchPathPrefixes.some((prefix) => pathname.startsWith(prefix)));
}

export function shouldShowConsumerShell(pathname: string | null | undefined) {
  if (!pathname) {
    return true;
  }

  return !isResearchPath(pathname);
}
