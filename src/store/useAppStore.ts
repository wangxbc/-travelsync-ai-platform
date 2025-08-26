// 这是应用的全局状态管理
// 作为应届生，我会使用Zustand创建一个简单的状态管理

import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { User, Itinerary, TravelInput } from '@/types'

// 应用状态接口
interface AppState {
  // 用户相关状态
  user: User | null
  isAuthenticated: boolean
  
  // 行程相关状态
  currentItinerary: Itinerary | null
  itineraries: Itinerary[]
  
  // AI生成相关状态
  isGenerating: boolean
  generationProgress: number
  
  // 地图相关状态
  mapCenter: [number, number]
  mapZoom: number
  selectedLocation: string | null
  
  // UI相关状态
  sidebarOpen: boolean
  theme: 'light' | 'dark'
  
  // 操作方法
  setUser: (user: User | null) => void
  setAuthenticated: (authenticated: boolean) => void
  setCurrentItinerary: (itinerary: Itinerary | null) => void
  setItineraries: (itineraries: Itinerary[]) => void
  addItinerary: (itinerary: Itinerary) => void
  updateItinerary: (id: string, updates: Partial<Itinerary>) => void
  removeItinerary: (id: string) => void
  setGenerating: (generating: boolean) => void
  setGenerationProgress: (progress: number) => void
  setMapCenter: (center: [number, number]) => void
  setMapZoom: (zoom: number) => void
  setSelectedLocation: (locationId: string | null) => void
  setSidebarOpen: (open: boolean) => void
  setTheme: (theme: 'light' | 'dark') => void
  reset: () => void
}

// 初始状态
const initialState = {
  user: null,
  isAuthenticated: false,
  currentItinerary: null,
  itineraries: [],
  isGenerating: false,
  generationProgress: 0,
  mapCenter: [116.4074, 39.9042] as [number, number], // 默认北京
  mapZoom: 10,
  selectedLocation: null,
  sidebarOpen: true,
  theme: 'light' as const
}

// 创建状态管理store
export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        // 用户相关操作
        setUser: (user) => set({ user }, false, 'setUser'),
        
        setAuthenticated: (authenticated) => set({ isAuthenticated: authenticated }, false, 'setAuthenticated'),

        // 行程相关操作
        setCurrentItinerary: (itinerary) => set({ currentItinerary: itinerary }, false, 'setCurrentItinerary'),
        
        setItineraries: (itineraries) => set({ itineraries }, false, 'setItineraries'),
        
        addItinerary: (itinerary) => set(
          (state) => ({ itineraries: [itinerary, ...state.itineraries] }),
          false,
          'addItinerary'
        ),
        
        updateItinerary: (id, updates) => set(
          (state) => ({
            itineraries: state.itineraries.map(item => 
              item.id === id ? { ...item, ...updates } : item
            ),
            currentItinerary: state.currentItinerary?.id === id 
              ? { ...state.currentItinerary, ...updates }
              : state.currentItinerary
          }),
          false,
          'updateItinerary'
        ),
        
        removeItinerary: (id) => set(
          (state) => ({
            itineraries: state.itineraries.filter(item => item.id !== id),
            currentItinerary: state.currentItinerary?.id === id ? null : state.currentItinerary
          }),
          false,
          'removeItinerary'
        ),

        // AI生成相关操作
        setGenerating: (generating) => set({ isGenerating: generating }, false, 'setGenerating'),
        
        setGenerationProgress: (progress) => set({ generationProgress: progress }, false, 'setGenerationProgress'),

        // 地图相关操作
        setMapCenter: (center) => set({ mapCenter: center }, false, 'setMapCenter'),
        
        setMapZoom: (zoom) => set({ mapZoom: zoom }, false, 'setMapZoom'),
        
        setSelectedLocation: (locationId) => set({ selectedLocation: locationId }, false, 'setSelectedLocation'),

        // UI相关操作
        setSidebarOpen: (open) => set({ sidebarOpen: open }, false, 'setSidebarOpen'),
        
        setTheme: (theme) => set({ theme }, false, 'setTheme'),

        // 重置状态
        reset: () => set(initialState, false, 'reset')
      }),
      {
        name: 'travelsync-app-store', // 本地存储的键名
        partialize: (state) => ({
          // 只持久化部分状态
          theme: state.theme,
          sidebarOpen: state.sidebarOpen,
          mapCenter: state.mapCenter,
          mapZoom: state.mapZoom
        })
      }
    ),
    {
      name: 'TravelSync App Store' // DevTools中显示的名称
    }
  )
)

// 选择器Hook（用于性能优化）
export const useUser = () => useAppStore((state) => state.user)
export const useIsAuthenticated = () => useAppStore((state) => state.isAuthenticated)
export const useCurrentItinerary = () => useAppStore((state) => state.currentItinerary)
export const useItineraries = () => useAppStore((state) => state.itineraries)
export const useIsGenerating = () => useAppStore((state) => state.isGenerating)
export const useMapState = () => useAppStore((state) => ({
  center: state.mapCenter,
  zoom: state.mapZoom,
  selectedLocation: state.selectedLocation
}))
export const useUIState = () => useAppStore((state) => ({
  sidebarOpen: state.sidebarOpen,
  theme: state.theme
}))