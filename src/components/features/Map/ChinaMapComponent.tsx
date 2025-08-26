'use client'

import { useEffect, useRef, useState } from 'react'

interface ChinaMapComponentProps {
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

declare global {
  interface Window {
    AMap: any
    _AMapSecurityConfig: any
  }
}

export function ChinaMapComponent({
  center,
  zoom,
  onCenterChange,
  onZoomChange,
  selectedItinerary,
  itineraryData,
  viewMode = "street",
  showRoutes = true,
  show3D = false
}: ChinaMapComponentProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [markers, setMarkers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 初始化地图
  useEffect(() => {
    if (!mapRef.current) return

    const initMap = () => {
      // 设置安全密钥
      window._AMapSecurityConfig = {
        securityJsCode: '7d683e8072a40ff63a014471fbef5b93'
      }

      const mapInstance = new window.AMap.Map(mapRef.current, {
        zoom: zoom || 12,
        center: [center[1], center[0]], // 高德地图使用 [lng, lat] 格式
        viewMode: '3D',
        pitch: show3D ? 45 : 0,
        mapStyle: getMapStyle(viewMode),
        features: ['bg', 'road', 'building', 'point'],
        showBuildingBlock: show3D,
        resizeEnable: true,
        rotateEnable: true,
        pitchEnable: true,
        zoomEnable: true,
        dragEnable: true
      })

      // 添加控件
      mapInstance.addControl(new window.AMap.Scale())
      mapInstance.addControl(new window.AMap.ToolBar({
        visible: true,
        onlyVisible: false,
        liteStyle: true
      }))

      // 监听地图事件
      mapInstance.on('moveend', () => {
        const center = mapInstance.getCenter()
        onCenterChange?.([center.lat, center.lng])
      })

      mapInstance.on('zoomend', () => {
        const zoom = mapInstance.getZoom()
        onZoomChange?.(zoom)
      })

      setMap(mapInstance)
      setIsLoading(false)
    }

    // 检查高德地图API是否已加载
    if (window.AMap) {
      initMap()
    } else {
      // 动态加载高德地图API
      const script = document.createElement('script')
      script.src = `https://webapi.amap.com/maps?v=2.0&key=7d683e8072a40ff63a014471fbef5b93&plugin=AMap.Scale,AMap.ToolBar,AMap.ControlBar,AMap.MapType,AMap.Geolocation`
      script.onload = initMap
      script.onerror = () => {
        console.error('高德地图API加载失败')
        setIsLoading(false)
      }
      document.head.appendChild(script)
    }

    return () => {
      if (map) {
        map.destroy()
      }
    }
  }, [])

  // 获取地图样式
  const getMapStyle = (mode: string) => {
    switch (mode) {
      case 'satellite':
        return 'amap://styles/satellite'
      case 'terrain':
        return 'amap://styles/whitesmoke'
      default:
        return 'amap://styles/normal'
    }
  }

  // 更新地图样式和3D效果
  useEffect(() => {
    if (map) {
      map.setMapStyle(getMapStyle(viewMode))
      map.setPitch(show3D ? 45 : 0)
    }
  }, [map, viewMode, show3D])

  // 更新地图中心和缩放
  useEffect(() => {
    if (map && center) {
      map.setCenter([center[1], center[0]])
      map.setZoom(zoom || 12)
    }
  }, [map, center, zoom])

  // 更新标记和路线
  useEffect(() => {
    if (!map || !selectedItinerary || !itineraryData) {
      // 清除所有标记
      markers.forEach(marker => {
        if (marker.remove) {
          marker.remove()
        } else {
          map?.remove(marker)
        }
      })
      setMarkers([])
      return
    }

    const itinerary = itineraryData.find((i: any) => i.id === selectedItinerary)
    if (!itinerary || !itinerary.activities) return

    // 清除旧标记
    markers.forEach(marker => {
      if (marker.remove) {
        marker.remove()
      } else {
        map.remove(marker)
      }
    })

    const newMarkers: any[] = []
    const routePoints: any[] = []

    // 创建标记
    itinerary.activities.forEach((activity: any, index: number) => {
      const [lng, lat] = activity.coordinates
      routePoints.push([lng, lat])

      // 根据活动类型选择颜色
      const markerColor = getActivityColor(activity.type)

      // 创建自定义标记
      const marker = new window.AMap.Marker({
        position: [lng, lat],
        title: activity.name,
        content: createMarkerContent(activity.name, markerColor),
        offset: new window.AMap.Pixel(-25, -30)
      })

      // 添加点击事件
      marker.on('click', () => {
        const infoWindow = new window.AMap.InfoWindow({
          content: createInfoWindowContent(activity),
          offset: new window.AMap.Pixel(0, -30)
        })
        infoWindow.open(map, [lng, lat])
      })

      map.add(marker)
      newMarkers.push(marker)
    })

    // 绘制路线
    if (showRoutes && routePoints.length > 1) {
      const polyline = new window.AMap.Polyline({
        path: routePoints,
        strokeColor: '#4f46e5',
        strokeWeight: 6,
        strokeOpacity: 0.8,
        strokeStyle: 'solid',
        strokeDasharray: [20, 10],
        lineJoin: 'round',
        lineCap: 'round'
      })
      
      map.add(polyline)
      newMarkers.push(polyline)
    }

    setMarkers(newMarkers)

    // 调整视野
    if (routePoints.length > 1) {
      map.setFitView(newMarkers, false, [50, 50, 50, 50])
    } else if (routePoints.length === 1) {
      map.setCenter(routePoints[0])
      map.setZoom(14)
    }
  }, [map, selectedItinerary, itineraryData, showRoutes])

  // 获取活动类型对应的颜色
  const getActivityColor = (type: string) => {
    switch (type) {
      case 'attraction':
        return '#4f46e5' // indigo
      case 'restaurant':
        return '#059669' // emerald
      case 'shopping':
        return '#7c3aed' // violet
      case 'hotel':
        return '#0ea5e9' // sky
      default:
        return '#6b7280' // gray
    }
  }

  // 创建标记内容
  const createMarkerContent = (name: string, color: string) => {
    return `
      <div style="
        background: linear-gradient(135deg, ${color} 0%, ${color}ee 50%, ${color}dd 100%); 
        color: white; 
        padding: 8px 12px; 
        border-radius: 16px; 
        font-size: 12px; 
        font-weight: 600;
        box-shadow: 0 8px 25px rgba(79, 70, 229, 0.3), 0 3px 10px rgba(0, 0, 0, 0.1);
        border: 2px solid white;
        position: relative;
        backdrop-filter: blur(10px);
        max-width: 120px;
        text-align: center;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
      ">
        ${name}
        <div style="
          position: absolute;
          bottom: -6px;
          left: 50%;
          transform: translateX(-50%);
          width: 0;
          height: 0;
          border-left: 6px solid transparent;
          border-right: 6px solid transparent;
          border-top: 6px solid ${color};
        "></div>
      </div>
    `
  }

  // 创建信息窗口内容
  const createInfoWindowContent = (activity: any) => {
    const typeNames = {
      attraction: '景点',
      restaurant: '餐厅',
      shopping: '购物',
      hotel: '酒店'
    }

    return `
      <div style="padding: 12px; min-width: 200px; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <h3 style="margin: 0 0 8px 0; color: #1f2937; font-size: 16px; font-weight: 600;">${activity.name}</h3>
        <p style="margin: 4px 0; color: #6b7280; font-size: 14px;">
          <strong>时间:</strong> 第${activity.day}天 ${activity.time || '全天'}
        </p>
        <p style="margin: 4px 0; color: #6b7280; font-size: 14px;">
          <strong>类型:</strong> ${typeNames[activity.type as keyof typeof typeNames] || '其他'}
        </p>
        ${activity.description ? `
          <p style="margin: 8px 0 4px 0; color: #4b5563; font-size: 13px; line-height: 1.4;">
            ${activity.description}
          </p>
        ` : ''}
        ${activity.cost ? `
          <p style="margin: 4px 0; color: #059669; font-size: 14px; font-weight: 500;">
            <strong>费用:</strong> ¥${activity.cost}
          </p>
        ` : ''}
      </div>
    `
  }

  if (isLoading) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-2xl">
        <div className="text-center">
          <div className="w-8 h-8 border-3 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">正在加载高德地图...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full h-full relative">
      <div 
        ref={mapRef} 
        className="w-full h-full rounded-2xl overflow-hidden"
        style={{ minHeight: '400px' }}
      />
      
      {/* 地图加载失败提示 */}
      {!map && !isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-2xl">
          <div className="text-center">
            <div className="text-4xl mb-4">🗺️</div>
            <p className="text-gray-600 mb-2">地图加载失败</p>
            <p className="text-gray-500 text-sm">请检查网络连接或刷新页面重试</p>
          </div>
        </div>
      )}
    </div>
  )
}