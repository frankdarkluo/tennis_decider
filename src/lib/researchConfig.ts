const envAdminEmails = process.env.NEXT_PUBLIC_ADMIN_EMAILS
  ?.split(",")
  .map((item) => item.trim().toLowerCase())
  .filter(Boolean);

export const ADMIN_EMAILS =
  envAdminEmails && envAdminEmails.length > 0
    ? envAdminEmails
    : ["your-email@example.com"];

export const RESEARCH_CONTACT_EMAIL =
  process.env.NEXT_PUBLIC_RESEARCH_CONTACT_EMAIL?.trim() || ADMIN_EMAILS[0] || "researcher@example.com";

export function isAdminEmail(email?: string | null) {
  if (!email) {
    return false;
  }

  return ADMIN_EMAILS.includes(email.toLowerCase());
}
