import { SITE_URL, WORKER_HOSTNAME } from "@/lib/site";

/**
 * Casual hotlink / "open the mp4 URL in a new tab" guard for `/stream`.
 * Not DRM: a page-level download extension can still capture the in-page
 * Range requests. Blocks curl and paste-into-a-new-tab for most browsers.
 */
export function isTrustedPlaybackHost(host: string): boolean {
  const hostname = host.split(":")[0]?.toLowerCase() ?? "";
  if (
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname === "::1"
  ) {
    return true;
  }
  if (hostname === WORKER_HOSTNAME) return true;
  if (hostname.endsWith(".barzilaysapir.workers.dev")) return true;
  try {
    if (new URL(SITE_URL).hostname.toLowerCase() === hostname) return true;
  } catch {
    // SITE_URL is a compile-time constant and always a valid URL.
  }
  return false;
}

export function isInPageMediaRequest(headers: {
  origin?: string | null;
  referer?: string | null;
  secFetchSite?: string | null;
}): boolean {
  const site = headers.secFetchSite?.toLowerCase();
  if (site === "same-origin") return true;

  if (headers.origin) {
    try {
      if (isTrustedPlaybackHost(new URL(headers.origin).host)) return true;
    } catch {
      // ignore malformed Origin
    }
  }

  if (headers.referer) {
    try {
      if (isTrustedPlaybackHost(new URL(headers.referer).host)) return true;
    } catch {
      // ignore malformed Referer
    }
  }

  return false;
}

export function mediaRequestFromNext(request: {
  headers: { get(name: string): string | null };
}): boolean {
  return isInPageMediaRequest({
    origin: request.headers.get("origin"),
    referer: request.headers.get("referer"),
    secFetchSite: request.headers.get("sec-fetch-site"),
  });
}
