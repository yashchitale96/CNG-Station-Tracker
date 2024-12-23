import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { CNGStation } from '@/constants/stations';

interface FavoritesContextType {
  favorites: string[];
  addFavorite: (stationId: string) => void;
  removeFavorite: (stationId: string) => void;
  isFavorite: (stationId: string) => boolean;
}

const FavoritesContext = createContext<FavoritesContextType | undefined>(undefined);

export function FavoritesProvider({ children }: { children: React.ReactNode }) {
  const [favorites, setFavorites] = useState<string[]>([]);

  useEffect(() => {
    loadFavorites();
  }, []);

  const loadFavorites = async () => {
    try {
      const storedFavorites = await AsyncStorage.getItem('favorites');
      if (storedFavorites) {
        setFavorites(JSON.parse(storedFavorites));
      }
    } catch (error) {
      console.error('Error loading favorites:', error);
    }
  };

  const saveFavorites = async (newFavorites: string[]) => {
    try {
      await AsyncStorage.setItem('favorites', JSON.stringify(newFavorites));
    } catch (error) {
      console.error('Error saving favorites:', error);
    }
  };

  const addFavorite = (stationId: string) => {
    const newFavorites = [...favorites, stationId];
    setFavorites(newFavorites);
    saveFavorites(newFavorites);
  };

  const removeFavorite = (stationId: string) => {
    const newFavorites = favorites.filter(id => id !== stationId);
    setFavorites(newFavorites);
    saveFavorites(newFavorites);
  };

  const isFavorite = (stationId: string) => favorites.includes(stationId);

  return (
    <FavoritesContext.Provider value={{ favorites, addFavorite, removeFavorite, isFavorite }}>
      {children}
    </FavoritesContext.Provider>
  );
}

export function useFavorites() {
  const context = useContext(FavoritesContext);
  if (context === undefined) {
    throw new Error('useFavorites must be used within a FavoritesProvider');
  }
  return context;
}
