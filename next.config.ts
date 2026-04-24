import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ["@resvg/resvg-js", "@react-pdf/renderer"],
  // Ensure font + grain assets are bundled into the serverless functions that
  // render PDFs / carousels. Without this, Vercel's file-tracer misses files
  // loaded dynamically (e.g. Font.register paths, grain PNG reads) and the
  // function throws ENOENT at /var/task/public/...
  outputFileTracingIncludes: {
    "/api/companion-pdf": ["./public/fonts/**/*", "./public/grain/**/*"],
    "/api/carousel": ["./public/fonts/**/*", "./public/grain/**/*"],
    "/api/carousel/upload-background": ["./public/fonts/**/*", "./public/grain/**/*"],
  },
};

export default nextConfig;
