"use client";

import { motion } from "framer-motion";

interface AnimatedLogoProps {
  className?: string;
  size?: number;
  text?: string;
  colors?: {
    primary?: string;
    secondary?: string;
    accent?: string;
  };
}

export function AnimatedLogo({
  className = "",
  size = 60,
  text = "TS",
  colors = {
    primary: "from-blue-500 via-indigo-600 to-purple-600",
    secondary: "border-indigo-400/30",
    accent: "bg-yellow-400",
  },
}: AnimatedLogoProps) {
  return (
    <motion.div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
      initial={{ scale: 0, rotate: -180 }}
      animate={{ scale: 1, rotate: 0 }}
      transition={{
        duration: 1.2,
        ease: "easeOut",
        delay: 0.5,
      }}
    >
      {/* 外圈光环 - 呼吸效果 */}
      <motion.div
        className={`absolute inset-0 rounded-full border-2 ${colors.secondary}`}
        animate={{
          scale: [1, 1.3, 1],
          opacity: [0.2, 0.8, 0.2],
          rotate: [0, 360],
        }}
        transition={{
          scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
          opacity: { duration: 4, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 15, repeat: Infinity, ease: "linear" },
        }}
      />

      {/* 中圈光环 - 脉冲效果 */}
      <motion.div
        className="absolute inset-1 rounded-full border border-indigo-400/40"
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.4, 0.9, 0.4],
          rotate: [360, 0],
        }}
        transition={{
          scale: { duration: 3, repeat: Infinity, ease: "easeInOut" },
          opacity: { duration: 3, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 12, repeat: Infinity, ease: "linear" },
        }}
      />

      {/* 主体LOGO - 渐变圆形 */}
      <motion.div
        className={`absolute inset-2 rounded-full bg-gradient-to-br ${colors.primary} shadow-2xl flex items-center justify-center overflow-hidden`}
        animate={{
          boxShadow: [
            "0 10px 30px rgba(79, 70, 229, 0.3)",
            "0 15px 40px rgba(79, 70, 229, 0.6)",
            "0 20px 50px rgba(79, 70, 229, 0.4)",
            "0 10px 30px rgba(79, 70, 229, 0.3)",
          ],
        }}
        transition={{
          boxShadow: {
            duration: 3,
            repeat: Infinity,
            ease: "easeInOut",
          },
        }}
      >
        {/* 内部光效 */}
        <div className="absolute inset-1 rounded-full bg-gradient-to-br from-white/20 to-transparent" />

        {/* 主要图标 - 旅行主题的几何设计 */}
        <div className="absolute inset-0 flex items-center justify-center">
          {/* 中心圆点 - 代表目的地 */}
          <motion.div
            className="absolute w-3 h-3 bg-white rounded-full shadow-sm"
            style={{
              top: "50%",
              left: "50%",
              transform: "translate(-50%, -50%)",
            }}
            animate={{
              scale: [1, 1.2, 1],
              opacity: [0.8, 1, 0.8],
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />

          {/* 连接线 - 代表旅行路线 */}
          <svg
            width={size * 0.6}
            height={size * 0.6}
            viewBox="0 0 100 100"
            className="absolute"
          >
            {/* 主要路线 */}
            <motion.path
              d="M20,50 Q50,20 80,50"
              stroke="white"
              strokeWidth="2"
              fill="none"
              strokeLinecap="round"
              opacity="0.9"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                duration: 2,
                ease: "easeInOut",
                delay: 0.5,
              }}
            />

            {/* 次要路线 */}
            <motion.path
              d="M25,60 Q50,80 75,60"
              stroke="white"
              strokeWidth="1.5"
              fill="none"
              strokeLinecap="round"
              opacity="0.7"
              initial={{ pathLength: 0 }}
              animate={{ pathLength: 1 }}
              transition={{
                duration: 2,
                ease: "easeInOut",
                delay: 1,
              }}
            />

            {/* 装饰点 */}
            <motion.circle
              cx="35"
              cy="45"
              r="1.5"
              fill="white"
              opacity="0.8"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 1.5,
              }}
            />
            <motion.circle
              cx="65"
              cy="55"
              r="1.5"
              fill="white"
              opacity="0.8"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.8, 1, 0.8],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 2,
              }}
            />
          </svg>
        </div>
      </motion.div>

      {/* 顶部装饰 - 代表同步 */}
      <motion.div
        className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full"
        animate={{
          scale: [0, 1.2, 0],
          opacity: [0, 1, 0],
          rotate: [0, 180],
        }}
        transition={{
          duration: 2,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      />

      {/* 底部装饰 - 代表连接 */}
      <motion.div
        className="absolute -bottom-1 -left-1 w-2 h-2 bg-green-400 rounded-full"
        animate={{
          scale: [0, 1, 0],
          opacity: [0, 1, 0],
          rotate: [180, 0],
        }}
        transition={{
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 2,
        }}
      />
    </motion.div>
  );
}
