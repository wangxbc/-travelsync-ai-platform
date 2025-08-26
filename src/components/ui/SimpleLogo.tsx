'use client'

import React from 'react'
import { motion } from 'framer-motion'

interface SimpleLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg'
  animated?: boolean
  className?: string
}

interface SimpleLogoWithTextProps {
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

const sizeMap = {
  xs: 24,
  sm: 32,
  md: 48,
  lg: 64
}

export function SimpleLogo({ size = 'md', animated = true, className = '' }: SimpleLogoProps) {
  const logoSize = sizeMap[size]
  
  const LogoComponent = animated ? motion.div : 'div'
  const animationProps = animated ? {
    animate: { rotate: [0, 360] },
    transition: { duration: 20, repeat: Infinity, ease: "linear" }
  } : {}

  return (
    <LogoComponent
      className={`relative ${className}`}
      style={{ width: logoSize, height: logoSize }}
      {...animationProps}
    >
     
    </LogoComponent>
  )
}

export function SimpleLogoWithText({ size = 'md', className = '' }: SimpleLogoWithTextProps) {
  const logoSize = size === 'sm' ? 32 : size === 'lg' ? 48 : 40
  const textSize = size === 'sm' ? 'text-lg' : size === 'lg' ? 'text-2xl' : 'text-xl'
  
  return (
    <div className={`flex items-center space-x-3 ${className}`}>
      <SimpleLogo size={size === 'sm' ? 'sm' : size === 'lg' ? 'md' : 'sm'} animated={false} />
      <span className={`font-bold text-gray-900 ${textSize}`}>
        TravelSync
      </span>
    </div>
  )
}