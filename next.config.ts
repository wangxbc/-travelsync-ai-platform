import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  typescript: {
    // 忽略构建时的TypeScript错误
    ignoreBuildErrors: true,
  },
  eslint: {
    // 忽略构建时的ESLint错误
    ignoreDuringBuilds: true,
  },
  // 确保静态文件服务正常工作
  experimental: {
    // 其他实验性功能可以在这里添加
  },
  // 配置静态文件服务
  async headers() {
    return [
      {
        source: "/uploads/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, max-age=31536000, immutable",
          },
        ],
      },
    ];
  },
};

export default nextConfig;
