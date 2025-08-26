'use client'

import { motion } from 'framer-motion'
import { useState } from 'react'

interface SuperCuteLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'xxl'
  animated?: boolean
  showText?: boolean
  className?: string
  variant?: 'default' | 'compact' | 'festival'
}

export function SuperCuteLogo({ 
  size = 'md', 
  animated = true, 
  showText = true,
  className = '',
  variant = 'default'
}: SuperCuteLogoProps) {
  const [isHovered, setIsHovered] = useState(false)

  const sizeConfig = {
    xs: { container: 'w-8 h-8', text: 'text-sm', icon: 'w-6 h-6' },
    sm: { container: 'w-12 h-12', text: 'text-base', icon: 'w-8 h-8' },
    md: { container: 'w-16 h-16', text: 'text-lg', icon: 'w-12 h-12' },
    lg: { container: 'w-20 h-20', text: 'text-xl', icon: 'w-16 h-16' },
    xl: { container: 'w-28 h-28', text: 'text-3xl', icon: 'w-20 h-20' },
    xxl: { container: 'w-36 h-36', text: 'text-4xl', icon: 'w-28 h-28' }
  }

  const config = sizeConfig[size]

  return (
    <motion.div 
      className={`flex items-center ${showText ? 'space-x-3' : ''} ${className}`}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      whileHover={animated ? { scale: 1.05 } : {}}
      transition={{ type: "spring", stiffness: 400, damping: 17 }}
    >
      {/* 主Logo图标 */}
      <div className={`relative ${config.container} flex-shrink-0`}>
        {/* 外层魔法光环 */}
        {variant === 'festival' && (
          <motion.div
            className="absolute -inset-3 rounded-full"
            style={{
              background: 'conic-gradient(from 0deg, #ff6b6b, #4ecdc4, #45b7d1, #96ceb4, #ffeaa7, #dda0dd, #ff6b6b)'
            }}
            animate={animated ? {
              rotate: 360,
              scale: isHovered ? 1.1 : 1
            } : {}}
            transition={{ 
              rotate: { duration: 8, repeat: Infinity, ease: "linear" },
              scale: { duration: 0.3 }
            }}
          />
        )}
        
        {/* 主体背景 - 可爱的圆形 */}
        <motion.div
          className="relative w-full h-full rounded-full overflow-hidden"
          style={{
            background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
            boxShadow: '0 8px 32px rgba(102, 126, 234, 0.3)'
          }}
          animate={animated ? {
            rotate: isHovered ? [0, 10, -10, 0] : 0,
            scale: isHovered ? 1.1 : 1
          } : {}}
          transition={{ duration: 0.6 }}
        >
          {/* 内层白色背景 */}
          <div className="absolute inset-1 bg-white rounded-full flex items-center justify-center overflow-hidden">
            
            {/* 可爱的地球仪 */}
            <motion.div
              className="relative w-3/4 h-3/4 rounded-full"
              style={{
                background: 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)'
              }}
              animate={animated ? {
                rotate: isHovered ? 360 : 0
              } : {}}
              transition={{ duration: 2, ease: "easeInOut" }}
            >
              {/* 可爱的大陆 */}
              <div className="absolute top-1/4 left-1/4 w-1/3 h-1/4 bg-green-400 rounded-full opacity-80" />
              <div className="absolute bottom-1/3 right-1/4 w-1/4 h-1/3 bg-green-500 rounded-lg opacity-70" />
              <div className="absolute top-1/2 left-1/2 w-1/5 h-1/5 bg-green-600 rounded-full opacity-60" />
              
              {/* 超可爱的表情 */}
              {/* 眼睛 */}
              <motion.div
                className="absolute top-1/4 left-1/3 w-1/6 h-1/6 bg-white rounded-full flex items-center justify-center"
                animate={animated ? {
                  scaleY: isHovered ? [1, 0.1, 1] : 1
                } : {}}
                transition={{ duration: 0.3, repeat: isHovered ? 3 : 0 }}
              >
                <div className="w-1/2 h-1/2 bg-black rounded-full" />
              </motion.div>
              
              <motion.div
                className="absolute top-1/4 right-1/3 w-1/6 h-1/6 bg-white rounded-full flex items-center justify-center"
                animate={animated ? {
                  scaleY: isHovered ? [1, 0.1, 1] : 1
                } : {}}
                transition={{ duration: 0.3, repeat: isHovered ? 3 : 0, delay: 0.1 }}
              >
                <div className="w-1/2 h-1/2 bg-black rounded-full" />
              </motion.div>
              
              {/* 可爱的笑脸 */}
              <motion.div
                className="absolute bottom-1/3 left-1/2 transform -translate-x-1/2 w-1/3 h-1/6 border-2 border-white rounded-full"
                style={{ borderTop: 'none' }}
                animate={animated ? {
                  scaleY: isHovered ? 1.5 : 1
                } : {}}
                transition={{ duration: 0.3 }}
              />
              
              {/* 腮红 */}
              <div className="absolute top-1/2 left-1/6 w-1/8 h-1/8 bg-pink-300 rounded-full opacity-60" />
              <div className="absolute top-1/2 right-1/6 w-1/8 h-1/8 bg-pink-300 rounded-full opacity-60" />
            </motion.div>
            
            {/* 飞行的小飞机 */}
            <motion.div
              className="absolute -top-1 -right-1 w-1/4 h-1/4 bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full flex items-center justify-center shadow-lg"
              animate={animated ? {
                rotate: isHovered ? 360 : 0,
                x: isHovered ? [0, 4, -4, 0] : 0,
                y: isHovered ? [0, -2, 2, 0] : 0
              } : {}}
              transition={{ duration: 2, repeat: isHovered ? Infinity : 0 }}
            >
              <span className="text-xs">✈️</span>
            </motion.div>
            
            {/* AI芯片装饰 */}
            <motion.div
              className="absolute -bottom-1 -left-1 w-1/4 h-1/4 bg-gradient-to-r from-purple-400 to-pink-400 rounded-lg flex items-center justify-center shadow-lg"
              animate={animated ? {
                scale: isHovered ? [1, 1.2, 1] : 1,
                rotate: isHovered ? [0, 180, 360] : 0
              } : {}}
              transition={{ duration: 1.5, repeat: isHovered ? Infinity : 0 }}
            >
              <span className="text-xs">🤖</span>
            </motion.div>
            
            {/* 魔法星星 */}
            <motion.div
              className="absolute top-0 right-0 w-1/5 h-1/5 flex items-center justify-center"
              animate={animated ? {
                rotate: isHovered ? 360 : 0,
                scale: isHovered ? [1, 1.3, 1] : 1
              } : {}}
              transition={{ duration: 1, repeat: isHovered ? Infinity : 0 }}
            >
              <span className="text-yellow-400 text-xs">⭐</span>
            </motion.div>
            
            {/* 爱心装饰 */}
            <motion.div
              className="absolute bottom-0 left-0 w-1/5 h-1/5 flex items-center justify-center"
              animate={animated ? {
                y: isHovered ? [0, -4, 0] : 0,
                scale: isHovered ? [1, 1.2, 1] : 1
              } : {}}
              transition={{ duration: 1.2, repeat: isHovered ? Infinity : 0 }}
            >
              <span className="text-pink-400 text-xs">💕</span>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Logo文字 */}
      {showText && (
        <motion.div 
          className="flex flex-col"
          animate={animated ? {
            x: isHovered ? 2 : 0
          } : {}}
          transition={{ duration: 0.3 }}
        >
          <motion.h1 
            className={`font-bold bg-gradient-to-r from-purple-600 via-blue-600 to-cyan-500 bg-clip-text text-transparent ${config.text} leading-tight`}
            animate={animated ? {
              scale: isHovered ? 1.05 : 1
            } : {}}
            transition={{ duration: 0.3 }}
          >
            TravelSync
          </motion.h1>
          <motion.div
            className="flex items-center space-x-1 -mt-1"
            animate={animated ? {
              y: isHovered ? -1 : 0
            } : {}}
            transition={{ duration: 0.3 }}
          >
            <span className="text-xs">🌟</span>
            <p className={`text-gray-600 font-medium ${size === 'xs' ? 'text-xs' : size === 'sm' ? 'text-xs' : 'text-sm'}`}>
              AI智能旅行
            </p>
            <motion.span 
              className="text-xs"
              animate={animated ? {
                rotate: isHovered ? [0, 360] : 0
              } : {}}
              transition={{ duration: 1, repeat: isHovered ? Infinity : 0 }}
            >
              ✨
            </motion.span>
          </motion.div>
        </motion.div>
      )}
    </motion.div>
  )
}

// 纯图标版本
export function SuperCuteIcon({ size = 'md', animated = true, className = '', variant = 'default' }: Omit<SuperCuteLogoProps, 'showText'>) {
  return (
    <SuperCuteLogo 
      size={size} 
      animated={animated} 
      showText={false} 
      className={className}
      variant={variant}
    />
  )
}

// 加载动画版本
export function SuperCuteLoading({ size = 'lg' }: { size?: 'md' | 'lg' | 'xl' }) {
  return (
    <motion.div className="flex flex-col items-center space-y-6">
      <motion.div
        animate={{
          rotate: 360,
          scale: [1, 1.1, 1]
        }}
        transition={{
          rotate: { duration: 2, repeat: Infinity, ease: "linear" },
          scale: { duration: 1.5, repeat: Infinity, ease: "easeInOut" }
        }}
      >
        <SuperCuteIcon size={size} animated={false} variant="festival" />
      </motion.div>
      
      <motion.div
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        className="text-center"
      >
        <p className="text-gray-700 font-semibold text-lg mb-3">正在为您规划完美旅程...</p>
        <div className="flex justify-center space-x-2">
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-3 h-3 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full"
              animate={{ 
                y: [0, -12, 0],
                scale: [1, 1.2, 1]
              }}
              transition={{
                duration: 0.8,
                repeat: Infinity,
                delay: i * 0.2,
                ease: "easeInOut"
              }}
            />
          ))}
        </div>
      </motion.div>
    </motion.div>
  )
}

// 节日庆祝版本
export function FestivalLogo({ size = 'xl', className = '' }: { size?: 'lg' | 'xl' | 'xxl', className?: string }) {
  return (
    <motion.div className={`relative ${className}`}>
      {/* 庆祝装饰 */}
      {[...Array(8)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute text-lg"
          style={{
            left: `${15 + i * 12}%`,
            top: `${10 + (i % 4) * 25}%`
          }}
          animate={{
            y: [0, -15, 0],
            rotate: [0, 360],
            scale: [1, 1.3, 1],
            opacity: [0.7, 1, 0.7]
          }}
          transition={{
            duration: 3 + i * 0.2,
            repeat: Infinity,
            delay: i * 0.3,
            ease: "easeInOut"
          }}
        >
          {['🎉', '🎊', '🌟', '✨', '🎈', '🎁', '💫', '🌈'][i]}
        </motion.div>
      ))}
      
      <SuperCuteLogo size={size} animated={true} variant="festival" />
    </motion.div>
  )
}