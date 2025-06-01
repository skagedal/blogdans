import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
  output: "standalone",
  experimental: {
    nodeMiddleware: true,
  }
};

export default nextConfig;
