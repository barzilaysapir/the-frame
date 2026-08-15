import { networkInterfaces } from "node:os";

/** Local IPv4 addresses so tablets on the same Wi‑Fi can load Next.js client JS. */
function getLanDevOrigins() {
  const origins = new Set(["localhost", "127.0.0.1"]);
  for (const adapters of Object.values(networkInterfaces())) {
    for (const adapter of adapters ?? []) {
      if (adapter.family === "IPv4" && !adapter.internal) {
        origins.add(adapter.address);
      }
    }
  }
  return [...origins];
}

// Firebase Auth's popup sign-in flow (`signInWithPopup`) posts messages back
// to the opener through a hidden iframe served from the project's authDomain,
// and talks to Google's identity REST APIs directly from the browser — both
// need explicit CSP allowances or sign-in breaks silently.
const firebaseAuthDomain = process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN?.trim();
console.log(
  "DEBUG_ENV_CHECK NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN =",
  JSON.stringify(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
);
console.log(
  "DEBUG_ENV_CHECK all NEXT_PUBLIC_ keys =",
  Object.keys(process.env).filter((k) => k.startsWith("NEXT_PUBLIC_")),
);

/**
 * No nonce/strict-dynamic here: that requires threading a per-request nonce
 * from middleware into every rendered <script>/<style>, which the current
 * Edge middleware (locale routing only, see middleware.ts) doesn't do. This
 * is the pragmatic middle ground — real restrictions on the risky sinks
 * (object-src, base-uri, form-action, frame-ancestors, connect-src, frame-src)
 * without breaking Next.js's own inline hydration scripts.
 */
function buildCsp() {
  // React's dev-mode debugging (component stack reconstruction) calls eval()
  // directly — never in production builds, so this is dev-only.
  const scriptSrc =
    process.env.NODE_ENV === "development"
      ? `script-src 'self' 'unsafe-inline' 'unsafe-eval' https://apis.google.com https://www.gstatic.com https://www.google.com https://accounts.google.com`
      : `script-src 'self' 'unsafe-inline' https://apis.google.com https://www.gstatic.com https://www.google.com https://accounts.google.com`;
  const authFrame = firebaseAuthDomain ? ` https://${firebaseAuthDomain}` : "";
  const directives = [
    `default-src 'self'`,
    scriptSrc,
    `style-src 'self' 'unsafe-inline'`,
    `img-src 'self' data: https:`,
    `font-src 'self' data:`,
    `media-src 'self' https:`,
    `connect-src 'self' https://identitytoolkit.googleapis.com https://securetoken.googleapis.com https://www.googleapis.com https://apis.google.com https://www.google.com https://accounts.google.com${authFrame}`,
    `frame-src 'self' https://accounts.google.com https://www.google.com${authFrame}`,
    `object-src 'none'`,
    `base-uri 'self'`,
    `form-action 'self'`,
    `frame-ancestors 'self'`,
  ];
  // Rewrites every http:// sub-resource request on the page to https:// before
  // it's sent. The real site is HTTPS-only (Cloudflare) so this is a safe
  // no-op there — but in dev the server only speaks plain HTTP, and browsers
  // exempt `localhost` from the rewrite (treated as secure regardless of
  // scheme) while NOT exempting a LAN IP (e.g. testing on a phone via
  // `http://10.0.0.14:3000`). There, every CSS/JS/font/image request got
  // silently rewritten to https:// and failed at the TLS handshake — the
  // page loaded but rendered as unstyled raw HTML, with the failed requests
  // never even reaching Node's HTTP parser (so nothing showed in server logs).
  if (process.env.NODE_ENV !== "development") {
    directives.push(`upgrade-insecure-requests`);
  }
  return directives.join("; ");
}

/** @type {import('next').NextConfig} */
const nextConfig = {
  allowedDevOrigins: getLanDevOrigins(),
  images: {
    // Cloudflare Workers can't run the default sharp-based optimizer, so
    // skip optimization rather than wiring up a custom loader.
    unoptimized: true,
  },
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          {
            key: "Cross-Origin-Opener-Policy",
            value: "same-origin-allow-popups",
          },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Content-Security-Policy", value: buildCsp() },
          {
            key: "Strict-Transport-Security",
            value: "max-age=63072000; includeSubDomains; preload",
          },
          {
            key: "Permissions-Policy",
            value:
              "camera=(), microphone=(), geolocation=(), payment=(), usb=(), interest-cohort=()",
          },
        ],
      },
    ];
  },
};

export default nextConfig;

import("@opennextjs/cloudflare").then((m) => m.initOpenNextCloudflareForDev());
