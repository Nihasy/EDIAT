import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Embedded Postgres used for local development only.
  serverExternalPackages: ["@electric-sql/pglite"],
  // Basic hardening for every page: no MIME sniffing, no embedding by other
  // sites (clickjacking on the back-office), no full URL leaked to other sites,
  // and no access to camera, microphone or location.
  async headers() {
    return [
      {
        source: "/(.*)",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "SAMEORIGIN" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'self'" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
};

export default nextConfig;
