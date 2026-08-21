import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Soft site-wide allowlist (UI + authenticated APIs). `SITE_ACCESS_EMAILS` is
 * a comma-separated list of Firebase-verified emails. Missing/empty means the
 * site is open (no gate). When set, only those emails may pass
 * `requireFirebaseClaims` and the client `SiteAccessGate`.
 */
export function parseEmailAllowlist(raw: string | undefined | null): string[] {
  if (!raw) return [];
  return raw
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
}

export function emailInAllowlist(
  email: string | null | undefined,
  allowlist: string[],
): boolean {
  if (!email || allowlist.length === 0) return false;
  return allowlist.includes(email.trim().toLowerCase());
}

async function readSiteAccessEmailsRaw(): Promise<string | undefined> {
  try {
    const { env } = await getCloudflareContext({ async: true });
    return env.SITE_ACCESS_EMAILS;
  } catch (error) {
    console.error(
      "Failed to resolve Cloudflare context for SITE_ACCESS_EMAILS:",
      error,
    );
    return undefined;
  }
}

/** True when a non-empty SITE_ACCESS_EMAILS list is configured. */
export async function isSiteAccessRestricted(): Promise<boolean> {
  return parseEmailAllowlist(await readSiteAccessEmailsRaw()).length > 0;
}

/** When unrestricted, every email is allowed. When restricted, must match list. */
export async function isAllowedSiteAccessEmail(
  email: string | null | undefined,
): Promise<boolean> {
  const allowlist = parseEmailAllowlist(await readSiteAccessEmailsRaw());
  if (allowlist.length === 0) return true;
  return emailInAllowlist(email, allowlist);
}
