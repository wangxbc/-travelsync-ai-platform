"use client";

import Link from "next/link";
import { motion } from "framer-motion";

const features = [
  {
    title: "AI智能行程规划",
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="20" fill="url(#ai-gradient)" />
        <path
          d="M13 27c0-4.418 3.582-8 8-8s8 3.582 8 8"
          stroke="#fff"
          strokeWidth="2"
          strokeLinecap="round"
        />
        <circle cx="21" cy="16" r="4" fill="#fff" />
        <defs>
          <linearGradient
            id="ai-gradient"
            x1="0"
            y1="0"
            x2="40"
            y2="40"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#6366F1" />
            <stop offset="1" stopColor="#06B6D4" />
          </linearGradient>
        </defs>
      </svg>
    ),
    slogan: "一键生成专属旅行计划",
    highlights: ["AI深度理解偏好", "自动多日路线", "实时预算与时间平衡"],
  },
  {
    title: "3D交互地图",
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="20" fill="url(#map-gradient)" />
        <rect x="10" y="18" width="20" height="10" rx="3" fill="#fff" />
        <rect x="15" y="12" width="10" height="8" rx="2" fill="#c7d2fe" />
        <defs>
          <linearGradient
            id="map-gradient"
            x1="0"
            y1="0"
            x2="40"
            y2="40"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#06B6D4" />
            <stop offset="1" stopColor="#6366F1" />
          </linearGradient>
        </defs>
      </svg>
    ),
    slogan: "沉浸式探索目的地",
    highlights: ["3D地形与景点", "智能路线可视化", "地图与行程联动"],
  },
  {
    title: "多人实时协作",
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="20" fill="url(#collab-gradient)" />
        <path d="M13 25a4 4 0 1 1 8 0v2a4 4 0 1 1-8 0v-2z" fill="#fff" />
        <circle cx="27" cy="19" r="3" fill="#c7d2fe" />
        <defs>
          <linearGradient
            id="collab-gradient"
            x1="0"
            y1="0"
            x2="40"
            y2="40"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#818CF8" />
            <stop offset="1" stopColor="#06B6D4" />
          </linearGradient>
        </defs>
      </svg>
    ),
    slogan: "和朋友一起规划每一步",
    highlights: ["多人同步编辑", "评论与建议", "冲突检测与合并"],
  },
  {
    title: "智能数据分析",
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
        <circle cx="20" cy="20" r="20" fill="url(#data-gradient)" />
        <rect x="12" y="22" width="4" height="6" rx="2" fill="#fff" />
        <rect x="18" y="16" width="4" height="12" rx="2" fill="#c7d2fe" />
        <rect x="24" y="12" width="4" height="16" rx="2" fill="#fff" />
        <defs>
          <linearGradient
            id="data-gradient"
            x1="0"
            y1="0"
            x2="40"
            y2="40"
            gradientUnits="userSpaceOnUse"
          >
            <stop stopColor="#06B6D4" />
            <stop offset="1" stopColor="#818CF8" />
          </linearGradient>
        </defs>
      </svg>
    ),
    slogan: "用数据优化每一次出行",
    highlights: ["预算分布图", "时间利用率", "AI推荐优化建议"],
  },
];

export default function DemoPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 py-0">
      {/* 顶部标题 */}
      <div className="relative pt-20 pb-10 text-center">
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-indigo-600 to-cyan-500 bg-clip-text text-transparent mb-4 tracking-tight drop-shadow-lg">
            功能介绍
          </h1>
          <p className="text-lg text-slate-600 font-medium mb-2">
            体验TravelSync的AI智能规划、3D地图、协作与数据分析
          </p>
        </motion.div>
      </div>

      {/* 功能卡片区 */}
      <div className="max-w-6xl mx-auto px-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 pb-20">
        {features.map((feature, idx) => (
          <motion.div
            key={feature.title}
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 * idx, duration: 0.7, type: "spring" }}
            whileHover={{
              y: -8,
              scale: 1.04,
              boxShadow: "0 8px 32px rgba(80,80,200,0.10)",
            }}
            className="bg-white/80 rounded-3xl shadow-xl p-7 flex flex-col items-center text-center border border-slate-100 hover:border-cyan-300 transition-all duration-300 group"
          >
            <div className="mb-4">{feature.icon}</div>
            <h2 className="text-xl font-bold text-slate-800 mb-2 group-hover:text-cyan-600 transition-colors">
              {feature.title}
            </h2>
            <div className="text-cyan-600 font-semibold mb-3 text-sm">
              {feature.slogan}
            </div>
            <ul className="text-slate-600 text-sm space-y-1">
              {feature.highlights.map((h, i) => (
                <li key={i} className="flex items-center justify-center gap-2">
                  <span className="inline-block w-2 h-2 rounded-full bg-gradient-to-br from-indigo-400 to-cyan-400"></span>
                  {h}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>

      {/* CTA按钮 */}
      <div className="text-center pb-16">
        <Link href="/planning">
          <motion.button
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.97 }}
            className="px-10 py-4 rounded-full bg-gradient-to-r from-indigo-500 to-cyan-500 text-white text-lg font-bold shadow-lg hover:from-indigo-600 hover:to-cyan-600 transition-all duration-300"
          >
            立即体验AI智能规划
          </motion.button>
        </Link>
      </div>
    </div>
  );
}
