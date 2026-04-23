import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@resvg/resvg-js", "@react-pdf/renderer"],
};

export default nextConfig;
