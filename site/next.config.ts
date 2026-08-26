import type { NextConfig } from "next";
import { fileURLToPath } from "node:url";
import { dirname } from "node:path";

const nextConfig: NextConfig = {
  // The app lives in site/, not the repo root; pin it so Turbopack doesn't
  // guess the workspace root from a stray lockfile further up the tree.
  turbopack: { root: dirname(fileURLToPath(import.meta.url)) },
  output: "export",
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || "",
  images: { unoptimized: true },
};

export default nextConfig;
