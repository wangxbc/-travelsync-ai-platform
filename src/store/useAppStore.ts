import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import type { User, Itinerary, TravelInput } from '@/types'

interface AppState {
  user: User | null
  isAuthenticated: boolean
  
  currentItinerary: Itinerary | null
  itineraries: Itinerary[]
  
  isGenerating: boolean
  generationProgress: number
  
  mapCenter: [number, number]
  mapZoom: number
  selectedLocation: string | null
  
  sidebarOpen: boolean
  theme: 'light' | 'dark'
  
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

const initialState = {
  user: null,
  isAuthenticated: false,
  currentItinerary: null,
  itineraries: [],
  isGenerating: false,
  generationProgress: 0,
  mapCenter: [116.4074, 39.9042] as [number, number],
  mapZoom: 10,
  selectedLocation: null,
  sidebarOpen: true,
  theme: 'light' as const
}

export const useAppStore = create<AppState>()(
  devtools(
    persist(
      (set, get) => ({
        ...initialState,

        setUser: (user) => set({ user }, false, 'setUser'),
        
        setAuthenticated: (authenticated) => set({ isAuthenticated: authenticated }, false, 'setAuthenticated'),

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

        setGenerating: (generating) => set({ isGenerating: generating }, false, 'setGenerating'),
        
        setGenerationProgress: (progress) => set({ generationProgress: progress }, false, 'setGenerationProgress'),

        setMapCenter: (center) => set({ mapCenter: center }, false, 'setMapCenter'),
        
        setMapZoom: (zoom) => set({ mapZoom: zoom }, false, 'setMapZoom'),
        
        setSelectedLocation: (locationId) => set({ selectedLocation: locationId }, false, 'setSelectedLocation'),

        setSidebarOpen: (open) => set({ sidebarOpen: open }, false, 'setSidebarOpen'),
        
        setTheme: (theme) => set({ theme }, false, 'setTheme'),

        reset: () => set(initialState, false, 'reset')
      }),
      {
        name: 'travelsync-app-store',
        partialize: (state) => ({
          theme: state.theme,
          sidebarOpen: state.sidebarOpen,
          mapCenter: state.mapCenter,
          mapZoom: state.mapZoom
        })
      }
    ),
    {
      name: 'TravelSync App Store'
    }
  )
)

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