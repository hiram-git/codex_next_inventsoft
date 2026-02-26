import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverComponentsExternalPackages: ["@prisma/client", "@prisma/adapter-pg", "pg"],
  },
  images: {
    remotePatterns: [],
  },
};

export default nextConfig;
