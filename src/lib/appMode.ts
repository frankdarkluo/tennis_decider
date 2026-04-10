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

export function shouldShowConsumerShell(pathname: string | null | undefined) {
  void pathname;
  return true;
}
