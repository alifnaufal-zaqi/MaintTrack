import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      new URL("https://psnafcolefplgepexstn.supabase.co/storage/**"),
    ],
  },
};

export default nextConfig;
