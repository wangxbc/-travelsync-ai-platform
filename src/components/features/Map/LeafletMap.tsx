'use client'

import { useEffect, useRef, useState } from 'react'

interface LeafletMapProps {
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
    L: any
  }
}

export function LeafletMap({
  center,
  zoom,
  onCenterChange,
  onZoomChange,
  selectedItinerary,
  itineraryData,
  viewMode = "street",
  showRoutes = true,
  show3D = false
}: LeafletMapProps) {
  const mapRef = useRef<HTMLDivElement>(null)
  const [map, setMap] = useState<any>(null)
  const [markers, setMarkers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  // 初始化地图
  useEffect(() => {
    if (!mapRef.current) return

    const initMap = () => {
      const mapInstance = window.L.map(mapRef.current, {
        center: center,
        zoom: zoom || 12,
        zoomControl: true,
        scrollWheelZoom: true,
        doubleClickZoom: true,
        boxZoom: true,
        keyboard: true,
        dragging: true,
        touchZoom: true
      })

      // 添加图层
      const tileLayer = getTileLayer(viewMode)
      tileLayer.addTo(mapInstance)

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

    // 检查Leaflet是否已加载
    if (window.L) {
      initMap()
    } else {
      // 动态加载Leaflet
      const link = document.createElement('link')
      link.rel = 'stylesheet'
      link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css'
      document.head.appendChild(link)

      const script = document.createElement('script')
      script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js'
      script.onload = initMap
      script.onerror = () => {
        console.error('Leaflet加载失败')
        setIsLoading(false)
      }
      document.head.appendChild(script)
    }

    return () => {
      if (map) {
        map.remove()
      }
    }
  }, [])

  // 获取瓦片图层
  const getTileLayer = (mode: string) => {
    switch (mode) {
      case 'satellite':
        return window.L.tileLayer('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}', {
          attribution: '&copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
        })
      case 'terrain':
        return window.L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
          attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
        })
      default:
        return window.L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        })
    }
  }

  // 更新地图图层
  useEffect(() => {
    if (map) {
      // 移除当前图层
      map.eachLayer((layer: any) => {
        if (layer._url) {
          map.removeLayer(layer)
        }
      })
      
      // 添加新图层
      const tileLayer = getTileLayer(viewMode)
      tileLayer.addTo(map)
    }
  }, [map, viewMode])

  // 更新地图中心和缩放
  useEffect(() => {
    if (map && center) {
      map.setView(center, zoom || 12)
    }
  }, [map, center, zoom])

  // 更新标记和路线
  useEffect(() => {
    if (!map || !selectedItinerary || !itineraryData) {
      // 清除所有标记
      markers.forEach(marker => {
        map?.removeLayer(marker)
      })
      setMarkers([])
      return
    }

    const itinerary = itineraryData.find((i: any) => i.id === selectedItinerary)
    if (!itinerary || !itinerary.activities) return

    // 清除旧标记
    markers.forEach(marker => {
      map.removeLayer(marker)
    })

    const newMarkers: any[] = []
    const routePoints: any[] = []

    // 创建标记
    itinerary.activities.forEach((activity: any, index: number) => {
      const [lng, lat] = activity.coordinates
      routePoints.push([lat, lng]) 

      // 根据活动类型选择颜色
      const markerColor = getActivityColor(activity.type)

      // 创建自定义图标
      const customIcon = window.L.divIcon({
        html: createMarkerHTML(activity.name, markerColor),
        className: 'custom-marker',
        iconSize: [120, 40],
        iconAnchor: [60, 40],
        popupAnchor: [0, -40]
      })

      // 创建标记
      const marker = window.L.marker([lat, lng], { icon: customIcon })
      
      // 添加弹窗
      const popupContent = createPopupContent(activity)
      marker.bindPopup(popupContent)

      marker.addTo(map)
      newMarkers.push(marker)
    })

    // 绘制路线
    if (showRoutes && routePoints.length > 1) {
      const polyline = window.L.polyline(routePoints, {
        color: '#4f46e5',
        weight: 6,
        opacity: 0.8,
        dashArray: '20, 10',
        lineJoin: 'round',
        lineCap: 'round'
      })
      
      polyline.addTo(map)
      newMarkers.push(polyline)
    }

    setMarkers(newMarkers)

    // 调整视野
    if (routePoints.length > 1) {
      const group = window.L.featureGroup(newMarkers)
      map.fitBounds(group.getBounds(), { padding: [20, 20] })
    } else if (routePoints.length === 1) {
      map.setView(routePoints[0], 14)
    }
  }, [map, selectedItinerary, itineraryData, showRoutes])

  // 获取活动类型对应的颜色
  const getActivityColor = (type: string) => {
    switch (type) {
      case 'attraction':
        return '#4f46e5' 
      case 'restaurant':
        return '#059669' 
      case 'shopping':
        return '#7c3aed' 
      case 'hotel':
        return '#0ea5e9' 
      default:
        return '#6b7280' 
    }
  }

  // 创建标记HTML
  const createMarkerHTML = (name: string, color: string) => {
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
        transform: translateY(-100%);
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

  // 创建弹窗内容
  const createPopupContent = (activity: any) => {
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
          <div className="w-8 h-8 border-3 border-green-200 border-t-green-600 rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-gray-600 text-sm">正在加载开源地图...</p>
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
            <p className="text-gray-600 mb-2">地图加载失败</p>
            <p className="text-gray-500 text-sm">请检查网络连接或刷新页面重试</p>
          </div>
        </div>
      )}
    </div>
  )
}