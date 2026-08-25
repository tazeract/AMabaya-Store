import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Removed "output: export" — Supabase SSR requires dynamic rendering (server components + cookies)
  // Deploy to Vercel, Railway, or any Node.js host instead of static hosting
  trailingSlash: true,
  images: {
    // Allow Supabase Storage image domains
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
    // Keep unoptimized for any local images in /public
    unoptimized: true,
  },
  transpilePackages: [],
};

export default nextConfig;
