import "server-only";
import { getCloudflareContext } from "@opennextjs/cloudflare";

/**
 * Site-owner allowlist for the admin surface (currently just
 * `/admin/purchases`). Checked against the verified Firebase ID token's
 * `email` claim — never a client-supplied value. `ADMIN_EMAILS` is a
 * comma-separated list of emails (see `.dev.vars.example`); missing/empty
 * means nobody is an admin, not "allow everyone".
 */
export async function isAdminEmail(email: string | null): Promise<boolean> {
  if (!email) return false;
  let raw: string | undefined;
  try {
    const { env } = await getCloudflareContext({ async: true });
    raw = env.ADMIN_EMAILS;
  } catch (error) {
    console.error("Failed to resolve Cloudflare context for ADMIN_EMAILS:", error);
    return false;
  }
  if (!raw) return false;

  const allowlist = raw
    .split(",")
    .map((entry) => entry.trim().toLowerCase())
    .filter(Boolean);
  return allowlist.includes(email.trim().toLowerCase());
}
