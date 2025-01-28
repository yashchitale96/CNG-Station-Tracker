import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, AuthState, UserPreferences, UserStatistics } from '@/types/auth';
import { router } from 'expo-router';
import { 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  updateProfile,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser
} from 'firebase/auth';
import { auth } from '../firebaseConfig';

interface AuthContextType extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string, displayName: string) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (updates: Partial<User>) => Promise<void>;
  updatePreferences: (updates: Partial<UserPreferences>) => Promise<void>;
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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        // Convert Firebase user to your app's user format
        const appUser: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email || '',
          displayName: firebaseUser.displayName || '',
          preferences: defaultPreferences,
          statistics: defaultStatistics,
          createdAt: firebaseUser.metadata?.creationTime 
            ? new Date(firebaseUser.metadata.creationTime).getTime()
            : Date.now(),
        };
        setState({ user: appUser, isLoading: false, error: null });
        await AsyncStorage.setItem('user', JSON.stringify(appUser));
      } else {
        setState({ user: null, isLoading: false, error: null });
        await AsyncStorage.removeItem('user');
      }
    });

    return () => unsubscribe();
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      router.replace('/(tabs)');
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error.message || 'Failed to sign in' 
      }));
    }
  };

  const signUp = async (email: string, password: string, displayName: string) => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      
      // Update profile with display name
      if (userCredential.user) {
        await updateProfile(userCredential.user, { displayName });
      }
      
      router.replace('/(tabs)');
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error.message || 'Failed to sign up' 
      }));
    }
  };

  const handleSignOut = async () => {
    try {
      setState(prev => ({ ...prev, isLoading: true, error: null }));
      await signOut(auth);
      await AsyncStorage.removeItem('user');
      setState({ user: null, isLoading: false, error: null });
      router.replace('/sign-in');
    } catch (error: any) {
      setState(prev => ({ 
        ...prev, 
        isLoading: false, 
        error: error.message || 'Failed to sign out' 
      }));
    }
  };

  const updateUserProfile = async (updates: Partial<User>) => {
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

  return (
    <AuthContext.Provider
      value={{
        signIn,
        signUp,
        signOut: handleSignOut,
        updateUserProfile,
        updatePreferences,
        user: state.user,
        isLoading: state.isLoading,
        error: state.error,
      }}>
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
