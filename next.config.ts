import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Static export for GitHub Pages / Vercel
  output: "export",
  trailingSlash: true,
  // Required for static export — no image optimization
  images: {
    unoptimized: true,
  },
  // Allow @google/model-viewer as external package
  transpilePackages: [],
};

export default nextConfig;
