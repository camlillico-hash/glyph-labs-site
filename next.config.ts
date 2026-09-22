import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: "/coaching",
        destination: "/",
        permanent: true,
      },
      {
        source: "/coaching/",
        destination: "/",
        permanent: true,
      },
      {
        source: "/bos360",
        destination: "/",
        permanent: true,
      },
      {
        source: "/bos360-v3",
        destination: "/",
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
