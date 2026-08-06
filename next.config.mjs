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
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
    ];
  },
};

export default nextConfig;

import("@opennextjs/cloudflare").then((m) => m.initOpenNextCloudflareForDev());
