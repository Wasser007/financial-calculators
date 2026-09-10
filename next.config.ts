import path from "node:path";
import type { NextConfig } from "next";

// 自动感知部署环境：CI/生产构建或显式指定时，自动切为静态导出到 out 目录
const isStaticExport = process.env.NODE_ENV === "production" || process.env.NEXT_EXPORT === "true";

const nextConfig: NextConfig = {
  output: isStaticExport ? "export" : "standalone",
  ...(isStaticExport ? {} : { outputFileTracingRoot: path.resolve(process.cwd()) }),
  poweredByHeader: false,
  typescript: {
    tsconfigPath: "tsconfig.app.json",
  },
  webpack(config) {
    config.cache = false;
    config.resolve.extensionAlias = {
      ".js": [".ts", ".tsx", ".js"],
    };
    return config;
  },
  // 静态导出时不配置内置 headers，由静态平台的 _headers 统一承载
  ...(isStaticExport ? {} : {
    async headers() {
      return [
        {
          source: "/:path*",
          headers: [
            { key: "X-Content-Type-Options", value: "nosniff" },
            { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
            { key: "X-Frame-Options", value: "DENY" },
            { key: "Permissions-Policy", value: "accelerometer=(), browsing-topics=(), camera=(), geolocation=(), gyroscope=(), microphone=(), payment=(), usb=()" },
            { key: "Cross-Origin-Opener-Policy", value: "same-origin" },
          ],
        },
      ];
    },
  }),
};

export default nextConfig;
