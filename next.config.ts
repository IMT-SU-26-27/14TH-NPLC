import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  // Minimal runtime bundle for the Docker image built by .github/workflows/deploy.yml.
  output: "standalone",
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
      { protocol: "https", hostname: "api.cloudinary.com" },
    ],
  },
  partialPrefetching: true,
  // The Rally slug changed from "category-2" (its placeholder) to "logic-rally-games"; old links keep working.
  async redirects() {
    return [
      { source: "/:lang(id|en)/register/category-2", destination: "/:lang/register/logic-rally-games", permanent: true },
      { source: "/register/category-2", destination: "/register/logic-rally-games", permanent: true },
    ];
  },
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          { key: "X-Content-Type-Options", value: "nosniff" },
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
        ],
      },
      // The push service worker must never be served stale.
      {
        source: "/sw.js",
        headers: [
          { key: "Content-Type", value: "application/javascript; charset=utf-8" },
          { key: "Cache-Control", value: "no-cache, no-store, must-revalidate" },
          { key: "Content-Security-Policy", value: "default-src 'self'; script-src 'self'" },
        ],
      },
    ];
  },
  reactCompiler: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
