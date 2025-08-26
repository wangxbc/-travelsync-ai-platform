"use client";

import { motion } from "framer-motion";

interface TravelSyncLogoProps {
  className?: string;
  size?: number;
}

export function TravelSyncLogo({
  className = "",
  size = 60,
}: TravelSyncLogoProps) {
  return (
    <div
      className={`relative ${className}`}
      style={{ width: size, height: size }}
    >
      {/* 主体 - 卡通地球 */}
      <motion.div
        className="absolute inset-0 rounded-full"
        style={{
          background: "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
          boxShadow: `0 ${size * 0.08}px ${
            size * 0.2
          }px rgba(79, 172, 254, 0.4)`,
        }}
        animate={{
          scale: [1, 1.05, 1],
          rotate: [0, 5, 0],
        }}
        transition={{
          scale: { duration: 4, repeat: Infinity, ease: "easeInOut" },
          rotate: { duration: 6, repeat: Infinity, ease: "easeInOut" },
        }}
      >
        {/* 地球内部光效 */}
        <div className="absolute inset-2 rounded-full bg-gradient-to-br from-blue-400/30 to-transparent" />

        {/* 卡通大陆 */}
        <div
          className="absolute w-6 h-4 bg-green-400 rounded-full"
          style={{
            top: "30%",
            left: "25%",
            transform: "rotate(-15deg)",
          }}
        />

        <div
          className="absolute w-4 h-3 bg-green-500 rounded-full"
          style={{
            bottom: "35%",
            right: "20%",
            transform: "rotate(20deg)",
          }}
        />
      </motion.div>

      {/* 卡通眼睛 */}
      <motion.div
        className="absolute w-3 h-3 bg-white rounded-full"
        style={{
          top: "25%",
          left: "35%",
        }}
        animate={{
          scaleY: [1, 0.1, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1,
        }}
      >
        <div
          className="absolute w-1.5 h-1.5 bg-black rounded-full"
          style={{ top: "25%", left: "25%" }}
        />
      </motion.div>

      <motion.div
        className="absolute w-3 h-3 bg-white rounded-full"
        style={{
          top: "25%",
          right: "35%",
        }}
        animate={{
          scaleY: [1, 0.1, 1],
        }}
        transition={{
          duration: 3,
          repeat: Infinity,
          ease: "easeInOut",
          delay: 1.2,
        }}
      >
        <div
          className="absolute w-1.5 h-1.5 bg-black rounded-full"
          style={{ top: "25%", left: "25%" }}
        />
      </motion.div>

      {/* 卡通微笑 */}
      <motion.div
        className="absolute w-4 h-2 border-2 border-white rounded-full"
        style={{
          bottom: "30%",
          left: "50%",
          transform: "translateX(-50%)",
          borderTop: "none",
        }}
        animate={{
          scaleX: [1, 1.1, 1],
        }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: "easeInOut",
        }}
      />
    </div>
  );
}
