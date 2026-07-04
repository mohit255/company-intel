import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  // the pulsing dev indicator sits bottom-left, next to the filter sidebar,
  // and animates on every infinite-scroll fetch — reads as "filter flicker"
  devIndicators: false,
};

export default nextConfig;
