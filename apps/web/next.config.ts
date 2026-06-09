import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@ecotrack/api"],
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
