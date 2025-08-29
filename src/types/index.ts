export interface User {
  id: string; 
  email: string; 
  name: string; 
  avatar?: string; 
  createdAt: Date;
  updatedAt: Date;
}

export interface TravelInput {
  departure?: string;
  destination: string;
  budget: number;
  days: number;
  interests: string[];
  travelStyle: 'budget' | 'comfort' | 'luxury';
  lockedActivities?: string[];
  existingItinerary?: Itinerary;
}

export interface DayPlan {
  day: number;
  date: string;
  activities: Activity[];
  totalBudget: number;
}

export interface Activity {
  id: string;
  name: string;
  description: string;
  location: Location;
  startTime: string;
  endTime: string;
  cost: number;
  category: 'attraction' | 'restaurant' | 'hotel' | 'transport' | 'shopping' | 'leisure';
  matchedInterests?: string[];
  recommendationReason?: string;
  intelligentScore?: number;
  tips?: string[];
  isLocked?: boolean;
}

export interface Location {
  id?: string;
  name: string;
  address: string;
  coordinates: [number, number];
  type?: 'attraction' | 'hotel' | 'restaurant' | 'transport' | 'shopping';
  description?: string;
  images?: string[];
  rating?: number;
}

export interface Itinerary {
  id: string;
  userId?: string;
  title: string;
  destination: string;
  totalBudget: number;
  days: DayPlan[];
  isPublic?: boolean;
  collaborators?: string[];
  data?: any;
  transportation?: {
    type: string;
    cost: number;
    details: any;
  };
  actualExpense?: {
    total: number;
    breakdown: {
      accommodation: number;
      food: number;
      activity: number;
      transportation?: number;
    };
  };
  budgetComparison?: {
    plannedBudget: number;
    actualExpense: number;
    difference: number;
    isOverBudget: boolean;
    utilizationRate: number;
  };
  createdAt: string | Date;
  updatedAt: string | Date;
}

export interface BudgetData {
  categories: BudgetCategory[];
  total: number;
  currency: string;
}

export interface BudgetCategory {
  name: string;
  amount: number;
  percentage: number;
  color: string;
}

export interface TimeData {
  categories: TimeCategory[];
  totalHours: number;
}

export interface TimeCategory {
  name: string;
  hours: number;
  percentage: number;
  color: string;
}

export interface SocketMessage {
  id: string;
  type: 'join' | 'leave' | 'edit' | 'delete' | 'add';
  userId: string;
  data: any;
  timestamp: Date;
}

export interface CollaborationChange {
  id: string;
  userId: string;
  type: 'add' | 'edit' | 'delete';
  target: string;
  data: any;
  timestamp: Date;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface Recommendation {
  id: string;
  type: 'destination' | 'activity' | 'itinerary';
  title: string;
  description: string;
  score: number;
  reason: string;
  data: any;
}

export interface MapRoute {
  id: string;
  coordinates: number[][];
  distance: number;
  duration: number;
  type: 'walking' | 'driving' | 'transit';
}

export interface ErrorLog {
  id: string;
  level: 'error' | 'warn' | 'info';
  message: string;
  stack?: string;
  userId?: string;
  timestamp: Date;
  context: any;
}