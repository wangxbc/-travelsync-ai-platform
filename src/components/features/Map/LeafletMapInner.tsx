'use client'

import { useEffect, useRef, useState, useMemo, useCallback } from 'react'
import L from 'leaflet'
import 'leaflet/dist/leaflet.css'

// 修复Leaflet图标问题
if (typeof window !== 'undefined') {
  delete (L.Icon.Default.prototype as any)._getIconUrl
  L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
  })
}

interface LeafletMapInnerProps {
  center: [number, number]
  zoom: number
  onCenterChange?: (center: [number, number]) => void
  onZoomChange?: (zoom: number) => void
  selectedItinerary?: string | null
}

export default function LeafletMapInner({
  center,
  zoom,
  onCenterChange,
  onZoomChange,
  selectedItinerary
}: LeafletMapInnerProps) {
  if (selectedItinerary) {
    // 未来可以根据选中的行程显示不同的标记和路线
  }
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<L.Map | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  // 重置视图的回调函数
  const handleResetView = useCallback(() => {
    if (map.current) {
      try {
        map.current.setView([39.9042, 116.4074], 10, { animate: true })
      } catch (error) {
        console.warn('重置地图视图时出现错误:', error)
      }
    }
  }, [])

  // 添加示例标记的函数
  const addSampleMarkers = useCallback(() => {
    if (!map.current) {
      console.warn('地图实例不存在，无法添加标记')
      return
    }

    try {
      // 示例景点数据
      const sampleLocations = [
        {
          name: '天安门广场',
          coordinates: [39.9042, 116.4074] as [number, number],
          type: 'attraction',
          description: '中国的象征性地标'
        },
        {
          name: '故宫博物院',
          coordinates: [39.9163, 116.3972] as [number, number],
          type: 'attraction',
          description: '明清两朝的皇家宫殿'
        },
        {
          name: '北京饭店',
          coordinates: [39.9097, 116.4109] as [number, number],
          type: 'hotel',
          description: '位于市中心的豪华酒店'
        }
      ]

      // 创建不同颜色的图标
      const attractionIcon = L.divIcon({
        className: 'custom-marker',
        html: '<div style="background-color: #ef4444; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      })

      const hotelIcon = L.divIcon({
        className: 'custom-marker',
        html: '<div style="background-color: #3b82f6; width: 20px; height: 20px; border-radius: 50%; border: 2px solid white; box-shadow: 0 2px 4px rgba(0,0,0,0.3);"></div>',
        iconSize: [20, 20],
        iconAnchor: [10, 10]
      })

      // 添加标记
      sampleLocations.forEach(location => {
        try {
          const marker = L.marker(location.coordinates, {
            icon: location.type === 'attraction' ? attractionIcon : hotelIcon
          })

          // 添加弹窗
          marker.bindPopup(`
            <div style="padding: 8px;">
              <h3 style="margin: 0 0 4px 0; font-weight: bold; color: #1f2937;">${location.name}</h3>
              <p style="margin: 0; font-size: 12px; color: #6b7280;">${location.description}</p>
              <p style="margin: 4px 0 0 0; font-size: 11px; color: #9ca3af;">类型: ${location.type === 'attraction' ? '景点' : '酒店'}</p>
            </div>
          `)

          marker.addTo(map.current!)
        } catch (error) {
          console.warn(`添加标记 ${location.name} 时出现错误:`, error)
        }
      })

      // 添加路线
      try {
        const routeCoordinates: [number, number][] = [
          [39.9042, 116.4074], // 天安门
          [39.9163, 116.3972], // 故宫
          [39.9097, 116.4109]  // 酒店
        ]

        L.polyline(routeCoordinates, {
          color: '#3b82f6',
          weight: 4,
          opacity: 0.8
        }).addTo(map.current!)
      } catch (error) {
        console.warn('添加路线时出现错误:', error)
      }
    } catch (error) {
      console.error('添加示例标记时出现错误:', error)
    }
  }, [])

  useEffect(() => {
    if (typeof window === 'undefined') return

    if (mapContainer.current && !map.current) {
      try {
        // 确保容器有尺寸
        if (mapContainer.current.offsetWidth === 0 || mapContainer.current.offsetHeight === 0) {
          console.warn('地图容器尺寸为0，延迟初始化')
          setTimeout(() => {
            if (mapContainer.current && !map.current) {
              initializeMap()
            }
          }, 100)
          return
        }

        initializeMap()
      } catch (error) {
        console.error('地图初始化失败:', error)
        setIsLoading(false)
      }
    }

    function initializeMap() {
      if (!mapContainer.current || map.current) return

      // 创建地图实例
      map.current = L.map(mapContainer.current, {
        preferCanvas: true, // 使用 Canvas 渲染以提高性能
        zoomControl: true,
        attributionControl: true
      }).setView(center, zoom)

      // 添加中国友好的地图图层
      const chinaLayer = L.tileLayer('https://webrd0{s}.is.autonavi.com/appmaptile?lang=zh_cn&size=1&scale=1&style=8&x={x}&y={y}&z={z}', {
        attribution: '© 高德地图',
        maxZoom: 18,
        subdomains: ['1', '2', '3', '4']
      })
      
      const osmLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      })

      // 默认使用中国地图
      chinaLayer.addTo(map.current)

      // 添加图层控制
      const baseLayers = {
        '高德地图': chinaLayer,
        'OpenStreetMap': osmLayer
      }
      
      L.control.layers(baseLayers).addTo(map.current)

      // 等待地图完全加载后再添加标记
      map.current.whenReady(() => {
        addSampleMarkers()
        setIsLoading(false)
      })

      // 监听地图事件
      const handleMoveEnd = () => {
        if (map.current && onCenterChange) {
          const center = map.current.getCenter()
          onCenterChange([center.lat, center.lng])
        }
      }

      const handleZoomEnd = () => {
        if (map.current && onZoomChange) {
          onZoomChange(map.current.getZoom())
        }
      }

      map.current.on('moveend', handleMoveEnd)
      map.current.on('zoomend', handleZoomEnd)

      // 处理地图尺寸变化
      map.current.on('resize', () => {
        if (map.current) {
          map.current.invalidateSize()
        }
      })
    }

    return () => {
      if (map.current) {
        try {
          map.current.off()
          map.current.remove()
        } catch (error) {
          console.warn('地图清理时出现错误:', error)
        } finally {
          map.current = null
        }
      }
    }
  }, []) // 移除依赖项，只在组件挂载时初始化一次



  // 使用 useMemo 来避免 center 数组的重复创建
  const memoizedCenter = useMemo(() => center, [center[0], center[1]])

  // 更新地图中心和缩放
  useEffect(() => {
    if (map.current) {
      try {
        const currentCenter = map.current.getCenter()
        const currentZoom = map.current.getZoom()
        
        // 只有当中心点或缩放级别真正改变时才更新
        if (
          Math.abs(currentCenter.lat - memoizedCenter[0]) > 0.0001 ||
          Math.abs(currentCenter.lng - memoizedCenter[1]) > 0.0001 ||
          Math.abs(currentZoom - zoom) > 0.1
        ) {
          map.current.setView(memoizedCenter, zoom, { animate: true })
        }
      } catch (error) {
        console.warn('更新地图视图时出现错误:', error)
      }
    }
  }, [memoizedCenter, zoom])

  // 处理容器尺寸变化
  useEffect(() => {
    const handleResize = () => {
      if (map.current) {
        try {
          // 延迟调用 invalidateSize 以确保容器尺寸已更新
          setTimeout(() => {
            if (map.current) {
              map.current.invalidateSize()
            }
          }, 100)
        } catch (error) {
          console.warn('调整地图尺寸时出现错误:', error)
        }
      }
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  return (
    <div className="relative w-full h-full">
      {/* 地图容器 */}
      <div 
        ref={mapContainer} 
        className="w-full h-full"
        style={{ minHeight: '400px' }} // 确保容器有最小高度
      />
      
      {/* 加载状态 */}
      {isLoading && (
        <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-2 text-gray-600">加载地图中...</p>
          </div>
        </div>
      )}

      {/* 地图控制按钮 */}
      <div className="absolute top-4 left-4 bg-white rounded-lg shadow-md">
        <button
          onClick={handleResetView}
          className="px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg"
        >
          重置视图
        </button>
      </div>

      {/* 地图信息 */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-md p-2">
        <div className="text-xs text-gray-600">
          免费开源地图 | 基于OpenStreetMap
        </div>
      </div>

      {/* 功能说明 */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-md p-3 max-w-xs">
        <h4 className="text-sm font-semibold text-gray-900 mb-2">地图功能</h4>
        <ul className="text-xs text-gray-600 space-y-1">
          <li>• 🔴 红色标记：景点</li>
          <li>• 🔵 蓝色标记：酒店</li>
          <li>• 🔗 蓝色线条：旅行路线</li>
          <li>• 点击标记查看详情</li>
        </ul>
      </div>
    </div>
  )
}