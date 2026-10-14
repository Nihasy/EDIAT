import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Embedded Postgres used for local development only.
  serverExternalPackages: ["@electric-sql/pglite"],
  // This app lives in a sub-folder of the repository, next to another app:
  // build from here, not from the repository root.
  turbopack: { root: path.join(__dirname) },
  outputFileTracingRoot: path.join(__dirname),
};

export default nextConfig;
