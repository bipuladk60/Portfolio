import type { NextConfig } from "next";

// GitHub Pages build: STATIC_EXPORT=1 writes a static site to out/, and PAGES_BASE_PATH
// serves it from a repo subpath. Local `pnpm build && pnpm start` is unaffected.
const staticExport = process.env.STATIC_EXPORT === "1";
const basePath = process.env.PAGES_BASE_PATH ?? "";

const nextConfig: NextConfig = staticExport
  ? { output: "export", basePath, trailingSlash: true, images: { unoptimized: true } }
  : {};

export default nextConfig;
