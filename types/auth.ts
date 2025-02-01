// This file shows the user name on the UI
export interface User {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: number;
  preferences: UserPreferences;
  statistics: UserStatistics;
}

export interface UserPreferences {
  defaultMapView: {
    latitude: number;
    longitude: number;
    latitudeDelta: number;
    longitudeDelta: number;
  };
  darkMode: boolean;
  notificationsEnabled: boolean;
  priceAlerts: boolean;
}

export interface UserStatistics {
  totalRefills: number;
  totalSpent: number;
  averagePricePerRefill: number;
}

export interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
}
