import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/coaching",
        destination: "/bos360",
        permanent: true,
      },
      {
        source: "/coaching/",
        destination: "/bos360",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
