import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/bos360",
        destination: "/coaching",
        permanent: true,
      },
      {
        source: "/bos360/:path*",
        destination: "/coaching/:path*",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
