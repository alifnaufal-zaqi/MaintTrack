import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      new URL("https://psnafcolefplgepexstn.supabase.co/storage/**"),
      new URL(
        "https://i.pinimg.com/736x/1a/e7/c2/1ae7c220332d0c8feb5d71d072353199.jpg"
      ),
    ],
  },
};

export default nextConfig;
