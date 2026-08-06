/** @type {import('next').NextConfig} */
const nextConfig = {
  // Allow the LAN Network URL (next dev prints e.g. http://10.0.0.14:3000)
  // so client JS/HMR work when testing from a tablet on the same Wi‑Fi.
  allowedDevOrigins: ["10.0.0.14", "127.0.0.1", "localhost"],
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

import('@opennextjs/cloudflare').then(m => m.initOpenNextCloudflareForDev());
