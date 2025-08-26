// 地图选择组件
// 让用户在不同地图提供商之间切换

// 'use client'

// import { useState } from 'react'
// import { MapComponent } from './MapComponent'
// import { LeafletMap } from './LeafletMap'
// import { ChinaMapComponent } from './ChinaMapComponent'

// interface MapSelectorProps {
//   center: [number, number]
//   zoom: number
//   onCenterChange?: (center: [number, number]) => void
//   onZoomChange?: (zoom: number) => void
//   selectedItinerary?: string | null
// }

// type MapProvider = 'leaflet' | 'mapbox' | 'china'

// export function MapSelector(props: MapSelectorProps) {
//   const [selectedProvider, setSelectedProvider] = useState<MapProvider>('leaflet')

//   return (
//     <div className="w-full h-full relative" style={{ minHeight: '400px' }}>
//       {/* 地图提供商选择器 */}
//       <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 bg-white rounded-lg shadow-md p-1 flex">
//         <button
//           onClick={() => setSelectedProvider('leaflet')}
//           className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
//             selectedProvider === 'leaflet'
//               ? 'bg-green-600 text-white'
//               : 'text-gray-700 hover:bg-gray-100'
//           }`}
//         >
//           🆓 免费地图
//         </button>
//         <button
//           onClick={() => setSelectedProvider('china')}
//           className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
//             selectedProvider === 'china'
//               ? 'bg-red-600 text-white'
//               : 'text-gray-700 hover:bg-gray-100'
//           }`}
//         >
//           🇨🇳 中国地图
//         </button>
//         <button
//           onClick={() => setSelectedProvider('mapbox')}
//           className={`px-3 py-2 text-sm font-medium rounded-md transition-colors ${
//             selectedProvider === 'mapbox'
//               ? 'bg-blue-600 text-white'
//               : 'text-gray-700 hover:bg-gray-100'
//           }`}
//         >
//           🌟 国际3D
//         </button>
//       </div>

//       {/* 地图组件 */}
//       <div className="w-full h-full">
//         {selectedProvider === 'leaflet' ? (
//           <LeafletMap {...props} />
//         ) : selectedProvider === 'china' ? (
//           <ChinaMapComponent {...props} />
//         ) : (
//           <MapComponent {...props} />
//         )}
//       </div>

//       {/* 地图信息 */}
//       <div className="absolute bottom-4 right-4 bg-white rounded-lg shadow-md p-3 max-w-xs">
//         {selectedProvider === 'leaflet' ? (
//           <div>
//             <h4 className="text-sm font-semibold text-green-700 mb-1">免费开源地图</h4>
//             <p className="text-xs text-gray-600">
//               基于OpenStreetMap，完全免费使用，无需API密钥
//             </p>
//           </div>
//         ) : selectedProvider === 'china' ? (
//           <div>
//             <h4 className="text-sm font-semibold text-red-700 mb-1">中国3D地图</h4>
//             <p className="text-xs text-gray-600">
//               基于高德/百度地图，中国地区数据完整，支持3D建筑
//             </p>
//           </div>
//         ) : (
//           <div>
//             <h4 className="text-sm font-semibold text-blue-700 mb-1">国际3D地图</h4>
//             <p className="text-xs text-gray-600">
//               基于Mapbox，需要配置API密钥，支持全球3D建筑
//             </p>
//           </div>
//         )}
//       </div>
//     </div>
//   )
// }

"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { MapComponent } from "./MapComponent";
import { LeafletMap } from "./LeafletMap";
import { ChinaMapComponent } from "./ChinaMapComponent";

interface MapSelectorProps {
  center: [number, number];
  zoom: number;
  onCenterChange?: (center: [number, number]) => void;
  onZoomChange?: (zoom: number) => void;
  selectedItinerary?: string | null;
  itineraryData?: any;
  viewMode?: "satellite" | "street" | "terrain";
  showRoutes?: boolean;
  show3D?: boolean;
}

type MapProvider = "leaflet" | "mapbox" | "china";

export function MapSelector(props: MapSelectorProps) {
  const [selectedProvider, setSelectedProvider] =
    useState<MapProvider>("leaflet");
  const [isLoading, setIsLoading] = useState(false);

  // 根据地理位置智能选择地图提供商
  useEffect(() => {
    const [lat, lng] = props.center;
    // 如果是中国境内，优先使用中国地图
    if (lat >= 18 && lat <= 54 && lng >= 73 && lng <= 135) {
      setSelectedProvider("china");
    } else {
      setSelectedProvider("leaflet");
    }
  }, [props.center]);

  const handleProviderChange = async (provider: MapProvider) => {
    setIsLoading(true);
    await new Promise((resolve) => setTimeout(resolve, 500)); // 模拟加载
    setSelectedProvider(provider);
    setIsLoading(false);
  };

  return (
    <div className="w-full h-full relative rounded-2xl overflow-hidden shadow-2xl">
      {/* 地图提供商选择器 - 重新设计 */}
      <motion.div
        initial={{ y: -50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.5 }}
        className="absolute top-6 left-6 z-20 bg-white/10 backdrop-blur-xl rounded-2xl p-2 border border-white/20"
      >
        <div className="flex space-x-1">
          {[
            {
              provider: "leaflet" as const,
              label: "开源地图",
              icon: "开源",
              color: "from-green-500 to-emerald-500",
            },
            {
              provider: "china" as const,
              label: "中国3D",
              icon: "中国",
              color: "from-red-500 to-rose-500",
            },
            {
              provider: "mapbox" as const,
              label: "全球3D",
              icon: "全球",
              color: "from-blue-500 to-cyan-500",
            },
          ].map(({ provider, label, icon, color }) => (
            <motion.button
              key={provider}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => handleProviderChange(provider)}
              disabled={isLoading}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-300 ${
                selectedProvider === provider
                  ? `bg-gradient-to-r ${color} text-white shadow-lg`
                  : "text-white/80 hover:text-white hover:bg-white/10"
              }`}
            >
              <div className="flex items-center space-x-2">
                <span>{icon}</span>
                <span>{label}</span>
              </div>
            </motion.button>
          ))}
        </div>
      </motion.div>

      {/* 地图控制按钮 */}
      <motion.div
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ delay: 0.7 }}
        className="absolute top-6 right-6 z-20 flex flex-col space-y-2"
      >
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() =>
            props.onZoomChange?.(Math.min((props.zoom || 10) + 1, 18))
          }
          className="w-10 h-10 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 text-white hover:bg-white/20 transition-all duration-200 flex items-center justify-center"
        >
          <span className="text-lg font-bold">+</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() =>
            props.onZoomChange?.(Math.max((props.zoom || 10) - 1, 1))
          }
          className="w-10 h-10 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 text-white hover:bg-white/20 transition-all duration-200 flex items-center justify-center"
        >
          <span className="text-lg font-bold">-</span>
        </motion.button>
        <motion.button
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.9 }}
          onClick={() => {
            props.onCenterChange?.([34.2583, 108.9486]);
            props.onZoomChange?.(12);
          }}
          className="w-10 h-10 bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 text-white hover:bg-white/20 transition-all duration-200 flex items-center justify-center"
        >
          <span className="text-sm">目标</span>
        </motion.button>
      </motion.div>

      {/* 加载状态 */}
      {isLoading && (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm z-30 flex items-center justify-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bg-white/90 backdrop-blur-xl rounded-2xl p-6 text-center"
          >
            <div className="w-8 h-8 border-3 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mx-auto mb-3"></div>
            <p className="text-gray-700 font-medium">切换地图中...</p>
          </motion.div>
        </div>
      )}

      {/* 地图组件 */}
      <div className="w-full h-full">
        {selectedProvider === "leaflet" ? (
          <LeafletMap {...props} />
        ) : selectedProvider === "china" ? (
          <ChinaMapComponent {...props} />
        ) : (
          <MapComponent {...props} />
        )}
      </div>

      {/* 地图信息卡片 - 重新设计 */}
      <motion.div
        initial={{ y: 50, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ delay: 0.9 }}
        className="absolute bottom-6 left-6 bg-white/10 backdrop-blur-xl rounded-2xl p-4 max-w-xs border border-white/20 z-20"
      >
        {selectedProvider === "leaflet" ? (
          <div>
            <div className="flex items-center mb-2">
              <span className="text-lg mr-2">开源</span>
              <h4 className="text-sm font-semibold text-white">开源地图</h4>
            </div>
            <p className="text-xs text-white/80">
              基于OpenStreetMap，全球覆盖，完全免费
            </p>
          </div>
        ) : selectedProvider === "china" ? (
          <div>
            <div className="flex items-center mb-2">
              <span className="text-lg mr-2">中国</span>
              <h4 className="text-sm font-semibold text-white">中国3D地图</h4>
            </div>
            <p className="text-xs text-white/80">
              高德地图数据，中国地区精准，支持3D建筑
            </p>
          </div>
        ) : (
          <div>
            <div className="flex items-center mb-2">
              <span className="text-lg mr-2">全球</span>
              <h4 className="text-sm font-semibold text-white">全球3D地图</h4>
            </div>
            <p className="text-xs text-white/80">
              Mapbox卫星数据，全球3D建筑，专业级体验
            </p>
          </div>
        )}
      </motion.div>
    </div>
  );
}
