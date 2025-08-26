'use client'

import { useEffect, useRef, useState } from 'react'

interface MapComponentProps {
  center: [number, number]
  zoom: number
  onCenterChange?: (center: [number, number]) => void
  onZoomChange?: (zoom: number) => void
  selectedItinerary?: string | null
  itineraryData?: any
  viewMode?: "satellite" | "street" | "terrain"
  showRoutes?: boolean
  show3D?: boolean
}

export function MapComponent({
  center,
  zoom,
  onCenterChange,
  onZoomChange,
  selectedItinerary,
  itineraryData,
  viewMode = "street",
  showRoutes = true,
  show3D = false
}: MapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // 模拟加载时间
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    return () => clearTimeout(timer)
  }, [])

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-2xl">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">正在加载Mapbox地图...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full relative">
      <div 
        ref={mapRef} 
        className="w-full h-full rounded-2xl overflow-hidden bg-gradient-to-br from-blue-100 to-indigo-200 flex items-center justify-center"
        style={{ minHeight: '400px' }}
      >
        <div className="text-center">
          <div className="text-6xl mb-4">🗺️</div>
          <h3 className="text-xl font-bold text-gray-700 mb-2">Mapbox 3D地图</h3>
          <p className="text-gray-600 mb-4">需要配置Mapbox API密钥</p>
          <div className="bg-white/80 backdrop-blur-sm rounded-lg p-4 max-w-md">
            <p className="text-sm text-gray-600 mb-2">
              要使用Mapbox地图，请在环境变量中配置：
            </p>
            <code className="text-xs bg-gray-100 px-2 py-1 rounded">
              NEXT_PUBLIC_MAPBOX_TOKEN=your_token_here
            </code>
          </div>
        </div>
      </div>
    </div>
  )
}