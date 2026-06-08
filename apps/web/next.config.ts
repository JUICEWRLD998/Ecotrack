import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@ecotrack/shared", "@ecotrack/api"],
  experimental: {
    externalDir: true
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com"
      }
    ]
  }
};

export default nextConfig;
