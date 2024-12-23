import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, AuthState, UserPreferences, UserStatistics } from '@/types/auth';
import { router } from 'expo-router';

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateProfile: (updates: Partial<User>) => Promise<void>;
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<void>;
  addVisitedStation: (stationId: string, amount: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const defaultPreferences: UserPreferences = {
  defaultMapView: {
    latitude: 18.5204,
    longitude: 73.8567,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  },
  darkMode: false,
  notificationsEnabled: true,
  priceAlerts: true,
};

const defaultStatistics: UserStatistics = {
  visitedStations: {},
  totalRefills: 0,
  totalSpent: 0,
  averagePricePerRefill: 0,
};

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    loadUser();
  }, []);

  const loadUser = async () => {
    try {
      const userJson = await AsyncStorage.getItem('user');
      if (userJson) {
        setState({ user: JSON.parse(userJson), isLoading: false, error: null });
      } else {
        setState({ user: null, isLoading: false, error: null });
      }
    } catch (error) {
      setState({ user: null, isLoading: false, error: 'Failed to load user data' });
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setState({ ...state, isLoading: true, error: null });
      
      // In a real app, you would validate credentials with a backend server
      // This is a mock implementation for demonstration
      const mockUser: User = {
        id: 'user_' + Math.random().toString(36).substr(2, 9),
        email,
        displayName: email.split('@')[0],
        createdAt: Date.now(),
        preferences: defaultPreferences,
        statistics: defaultStatistics,
      };

      await AsyncStorage.setItem('user', JSON.stringify(mockUser));
      setState({ user: mockUser, isLoading: false, error: null });
      router.replace('/(tabs)');
    } catch (error) {
      setState({ ...state, isLoading: false, error: 'Failed to sign in' });
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      setState({ ...state, isLoading: true, error: null });
      
      // Mock implementation
      const newUser: User = {
        id: 'user_' + Math.random().toString(36).substr(2, 9),
        email,
        displayName,
        createdAt: Date.now(),
        preferences: defaultPreferences,
        statistics: defaultStatistics,
      };

      await AsyncStorage.setItem('user', JSON.stringify(newUser));
      setState({ user: newUser, isLoading: false, error: null });
      router.replace('/(tabs)');
    } catch (error) {
      setState({ ...state, isLoading: false, error: 'Failed to create account' });
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem('user');
      setState({ user: null, isLoading: false, error: null });
      router.replace('/sign-in');
    } catch (error) {
      setState({ ...state, error: 'Failed to sign out' });
    }
  };

  const updateProfile = async (updates: Partial<User>) => {
    if (!state.user) return;

    try {
      const updatedUser = { ...state.user, ...updates };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setState({ ...state, user: updatedUser });
    } catch (error) {
      setState({ ...state, error: 'Failed to update profile' });
    }
  };

  const updatePreferences = async (updates: Partial<UserPreferences>) => {
    if (!state.user) return;

    try {
      const updatedUser = {
        ...state.user,
        preferences: { ...state.user.preferences, ...updates },
      };
      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setState({ ...state, user: updatedUser });
    } catch (error) {
      setState({ ...state, error: 'Failed to update preferences' });
    }
  };

  const addVisitedStation = async (stationId: string, amount: number) => {
    if (!state.user) return;

    try {
      const now = Date.now();
      const visitedStations = { ...state.user.statistics.visitedStations };
      const station = visitedStations[stationId] || { visitCount: 0, totalSpent: 0, lastVisit: 0 };

      visitedStations[stationId] = {
        lastVisit: now,
        visitCount: station.visitCount + 1,
        totalSpent: station.totalSpent + amount,
      };

      const totalRefills = state.user.statistics.totalRefills + 1;
      const totalSpent = state.user.statistics.totalSpent + amount;

      const updatedStatistics: UserStatistics = {
        visitedStations,
        totalRefills,
        totalSpent,
        averagePricePerRefill: totalSpent / totalRefills,
      };

      const updatedUser = {
        ...state.user,
        statistics: updatedStatistics,
      };

      await AsyncStorage.setItem('user', JSON.stringify(updatedUser));
      setState({ ...state, user: updatedUser });
    } catch (error) {
      setState({ ...state, error: 'Failed to update visit statistics' });
    }
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        signIn,
        signUp,
        signOut,
        updateProfile,
        updatePreferences,
        addVisitedStation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
