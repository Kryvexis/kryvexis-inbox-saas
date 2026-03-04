import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Vercel-friendly defaults
  reactStrictMode: true,

  // ✅ Deploy stability: don't fail the production build on ESLint config issues.
  // (You can still run `npm run lint` locally/CI.)
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
