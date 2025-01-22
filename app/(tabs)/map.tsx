import React, { useState, useEffect, useMemo } from 'react';
import { 
  StyleSheet, 
  View, 
  Dimensions, 
  Text, 
  ActivityIndicator, 
  Modal, 
  TouchableOpacity,
  Platform,
  StatusBar,
  Linking,
  Alert,
  Keyboard
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { IconSymbol } from '@/components/ui/IconSymbol';
import { SearchFilters } from '@/components/SearchFilters';
import { useFavorites } from '@/context/FavoritesContext';
import { priceUpdateService } from '@/services/priceUpdates';
import { Ionicons } from '@expo/vector-icons';
import { useDebounce } from '@/hooks/useDebounce';
import { FilterModal, FilterOptions } from '@/components/FilterModal';
import { collection, query, where, getDocs, getFirestore } from 'firebase/firestore';

interface Station {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
  operatingHours: string;
  price: number;
  rating: number;
  status: 'pending' | 'verified' | 'rejected';
  verificationCount: number;
}

const INITIAL_REGION = {
  latitude: 18.5204,
  longitude: 73.8567,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

export default function MapScreen() {
  const [location, setLocation] = useState<Location.LocationObject | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStation, setSelectedStation] = useState<Station | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [stations, setStations] = useState<Station[]>([]);
  const [filterOptions, setFilterOptions] = useState<FilterOptions>({
    priceRange: { min: 80, max: 90 },
    onlyOpen: false,
    onlyFavorites: false,
    rating: 0,
    sortBy: 'distance'
  });
  const [stationPrices, setStationPrices] = useState<Record<string, number>>({});
  const [priceUpdates, setPriceUpdates] = useState<Record<string, { timestamp: number; change: number }>>({});
  const [noResults, setNoResults] = useState(false);
  const [mapReady, setMapReady] = useState(false);
  const { favorites, addFavorite, removeFavorite, isFavorite } = useFavorites();

  const debouncedSearchQuery = useDebounce(searchQuery, 300);

  useEffect(() => {
    let mounted = true;

    const fetchStations = async () => {
      try {
        const db = getFirestore();
        const stationsRef = collection(db, 'stations');
        
        // Query for verified stations
        const verifiedStationsQuery = query(
          stationsRef,
          where('status', '==', 'verified')
        );
        
        const querySnapshot = await getDocs(verifiedStationsQuery);
        const fetchedStations: Station[] = [];
        
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          fetchedStations.push({
            id: doc.id,
            name: data.name,
            latitude: parseFloat(data.latitude),
            longitude: parseFloat(data.longitude),
            address: data.address,
            operatingHours: data.operatingHours,
            price: data.price || 85.50, // Default price if not set
            rating: data.rating || 4.0,  // Default rating if not set
            status: data.status,
            verificationCount: data.verificationCount || 0
          });
        });
        
        if (mounted) {
          setStations(fetchedStations);
        }
      } catch (error) {
        console.error('Error fetching stations:', error);
        Alert.alert('Error', 'Failed to load CNG stations');
      }
    };

    const initializeApp = async () => {
      try {
        setIsLoading(true);
        const { status } = await Location.requestForegroundPermissionsAsync();
        
        if (status !== 'granted') {
          setErrorMsg('Location permission is required to show nearby CNG stations.');
          return;
        }

        const userLocation = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        if (mounted) {
          setLocation(userLocation);
          await fetchStations(); // Fetch stations after getting location
          setIsLoading(false);
        }
      } catch (error) {
        console.error('Error getting location:', error);
        if (mounted) {
          setErrorMsg('Failed to get your location. Please check your GPS settings.');
          setIsLoading(false);
        }
      }
    };

    initializeApp();
    
    const unsubscribe = priceUpdateService.subscribe((updates) => {
      if (!mounted) return;
      
      setStationPrices(prev => {
        const newPrices = { ...prev };
        updates.forEach(update => {
          newPrices[update.stationId] = update.newPrice;
        });
        return newPrices;
      });

      setPriceUpdates(prev => {
        const newUpdates = { ...prev };
        updates.forEach(update => {
          newUpdates[update.stationId] = {
            timestamp: update.timestamp,
            change: update.change
          };
        });
        return newUpdates;
      });
    });

    priceUpdateService.connect();

    return () => {
      mounted = false;
      unsubscribe();
      priceUpdateService.disconnect();
    };
  }, []);

  const isStationOpen = (station: Station) => {
    if (!station.operatingHours) return true;
    if (station.operatingHours === '24/7') return true;

    const now = new Date();
    const [start, end] = station.operatingHours.split(' - ');
    const [startHour, startMinute] = start.split(':').map(Number);
    const [endHour, endMinute] = end.split(':').map(Number);
    
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    
    const currentTime = currentHour * 60 + currentMinute;
    const startTime = startHour * 60 + startMinute;
    const endTime = endHour * 60 + endMinute;
    
    if (endTime < startTime) {
      return currentTime >= startTime || currentTime <= endTime;
    }
    
    return currentTime >= startTime && currentTime <= endTime;
  };

  const calculateDistance = (station: Station) => {
    if (!location) return Infinity;
    
    const R = 6371; 
    const lat1 = location.coords.latitude * Math.PI / 180;
    const lat2 = station.latitude * Math.PI / 180;
    const dLat = (station.latitude - location.coords.latitude) * Math.PI / 180;
    const dLon = (station.longitude - location.coords.longitude) * Math.PI / 180;
    
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
             Math.cos(lat1) * Math.cos(lat2) *
             Math.sin(dLon/2) * Math.sin(dLon/2);
    
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const filteredStations = useMemo(() => {
    const query = debouncedSearchQuery.toLowerCase().trim();
    let filtered = stations;

    if (query) {
      filtered = stations.filter(station => 
        station.name.toLowerCase().includes(query) ||
        station.address.toLowerCase().includes(query)
      );
    }

    if (filterOptions.onlyOpen) {
      filtered = filtered.filter(isStationOpen);
    }

    if (filterOptions.onlyFavorites) {
      filtered = filtered.filter(station => isFavorite(station.id));
    }

    if (filterOptions.rating > 0) {
      filtered = filtered.filter(station => station.rating >= filterOptions.rating);
    }

    const minPrice = filterOptions.priceRange.min;
    const maxPrice = filterOptions.priceRange.max;
    filtered = filtered.filter(station => {
      const price = stationPrices[station.id] || station.price;
      return price >= minPrice && price <= maxPrice;
    });

    if (location && filterOptions.sortBy === 'distance') {
      filtered.sort((a, b) => calculateDistance(a) - calculateDistance(b));
    } else if (filterOptions.sortBy === 'price') {
      filtered.sort((a, b) => {
        const priceA = stationPrices[a.id] || a.price;
        const priceB = stationPrices[b.id] || b.price;
        return priceA - priceB;
      });
    }

    return filtered;
  }, [debouncedSearchQuery, filterOptions, location, stationPrices, isFavorite, stations]);

  useEffect(() => {
    setNoResults(filteredStations.length === 0);
  }, [filteredStations]);

  const handleMapReady = () => {
    setMapReady(true);
  };

  const handleStationPress = (station: Station) => {
    setSelectedStation(station);
  };

  const closeModal = () => {
    setSelectedStation(null);
  };

  const handleOpenNavigation = (address: string | undefined) => {
    if (!address) return;
    
    const encodedAddress = encodeURIComponent(address);
    if (Platform.OS === 'ios') {
      Linking.openURL(`maps://0,0?q=${encodedAddress}`);
    } else {
      Linking.openURL(`https://www.google.com/maps/search/?api=1&query=${encodedAddress}`);
    }
  };

  const toggleFavorite = (station: Station) => {
    if (isFavorite(station.id)) {
      removeFavorite(station.id);
    } else {
      addFavorite(station.id);
    }
  };

  const handleSearchChange = (text: string) => {
    setSearchQuery(text);
    if (text === '') {
      setNoResults(false);
    }
  };

  const getPriceChangeIndicator = (stationId: string) => {
    const update = priceUpdates[stationId];
    if (!update) return null;

    const isRecent = Date.now() - update.timestamp < 60000; 
    if (!isRecent) return null;

    return (
      <View style={[
        styles.priceChangeIndicator,
        { backgroundColor: update.change > 0 ? '#ff4444' : '#44bb44' }
      ]}>
        <Text style={styles.priceChangeText}>
          {update.change > 0 ? '↑' : '↓'} ₹{Math.abs(update.change).toFixed(2)}
        </Text>
      </View>
    );
  };

  const resetFilters = () => {
    setFilterOptions({
      priceRange: { min: 80, max: 90 },
      onlyOpen: false,
      onlyFavorites: false,
      rating: 0,
      sortBy: 'distance'
    });
  };

  if (isLoading && !mapReady) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading map...</Text>
      </View>
    );
  }

  const mapRegion = location?.coords ? {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  } : INITIAL_REGION;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <SearchFilters
        searchQuery={searchQuery}
        onSearchChange={handleSearchChange}
        onFilterPress={() => {
          Keyboard.dismiss();
          setShowFilters(true);
        }}
      />

      <FilterModal
        visible={showFilters}
        onClose={() => setShowFilters(false)}
        options={filterOptions}
        onChange={setFilterOptions}
        onReset={resetFilters}
      />

      {noResults && (
        <View style={styles.noResultsContainer}>
          <Text style={styles.noResultsText}>No stations found matching "{searchQuery}"</Text>
        </View>
      )}

      <MapView
        style={styles.map}
        initialRegion={mapRegion}
        showsUserLocation
        showsMyLocationButton
        onMapReady={handleMapReady}
      >
        {filteredStations.map((station) => (
          <Marker
            key={station.id}
            coordinate={{
              latitude: station.latitude,
              longitude: station.longitude,
            }}
            onPress={() => handleStationPress(station)}
            pinColor="#4CAF50"
          />
        ))}
      </MapView>

      {selectedStation && (
        <Modal
          animationType="slide"
          transparent={true}
          visible={!!selectedStation}
          onRequestClose={closeModal}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.stationName}>{selectedStation.name}</Text>
                <TouchableOpacity
                  onPress={() => toggleFavorite(selectedStation)}
                  style={styles.favoriteButton}
                >
                  <Ionicons
                    name={isFavorite(selectedStation.id) ? "heart" : "heart-outline"}
                    size={24}
                    color={isFavorite(selectedStation.id) ? "#FF0000" : "#000"}
                  />
                </TouchableOpacity>
              </View>
              <Text style={styles.stationAddress}>{selectedStation.address}</Text>
              <View style={styles.priceContainer}>
                <Text style={styles.stationPrice}>
                  Price: ₹{(stationPrices[selectedStation.id] || selectedStation.price).toFixed(2)}/kg
                </Text>
                {getPriceChangeIndicator(selectedStation.id)}
              </View>
              <Text style={styles.operatingHours}>Hours: {selectedStation.operatingHours}</Text>
              <TouchableOpacity 
                style={styles.navigationButton}
                onPress={() => handleOpenNavigation(selectedStation.address)}
              >
                <IconSymbol name="arrow.triangle.turn.up.right.circle.fill" size={20} color="#FFF" />
                <Text style={styles.navigationButtonText}>Navigate</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      )}

      {errorMsg && (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{errorMsg}</Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  loadingText: {
    marginTop: 10,
    color: '#666',
    fontSize: 16,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    maxHeight: '70%',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: -2 },
        shadowOpacity: 0.25,
        shadowRadius: 5,
      },
      android: {
        elevation: 5,
      },
    }),
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  stationName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
  },
  favoriteButton: {
    padding: 8,
  },
  stationAddress: {
    fontSize: 16,
    color: '#333',
    marginBottom: 10,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  stationPrice: {
    fontSize: 16,
    color: '#333',
  },
  priceChangeIndicator: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  priceChangeText: {
    color: 'white',
    fontSize: 12,
    fontWeight: 'bold',
  },
  operatingHours: {
    fontSize: 16,
    color: '#333',
    marginBottom: 20,
  },
  navigationButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 12,
    marginTop: 20,
    gap: 8,
  },
  navigationButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  errorContainer: {
    position: 'absolute',
    top: 50,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(255, 82, 82, 0.9)',
    padding: 10,
    borderRadius: 5,
  },
  errorText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 14,
  },
  noResultsContainer: {
    position: 'absolute',
    top: 70,
    left: 20,
    right: 20,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    padding: 10,
    borderRadius: 8,
    zIndex: 1,
  },
  noResultsText: {
    color: 'white',
    textAlign: 'center',
    fontSize: 14,
  },
});
