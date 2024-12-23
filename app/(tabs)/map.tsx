import React, { useState, useEffect } from 'react';
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
  Alert
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import { stations } from '@/constants/stations';
import { IconSymbol } from '@/components/ui/IconSymbol';

const INITIAL_REGION = {
  latitude: 18.5204,
  longitude: 73.8567,
  latitudeDelta: 0.1,
  longitudeDelta: 0.1,
};

export default function MapScreen() {
  const [location, setLocation] = useState(null);
  const [errorMsg, setErrorMsg] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedStation, setSelectedStation] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setIsLoading(true);
        let { status } = await Location.requestForegroundPermissionsAsync();
        if (status !== 'granted') {
          setErrorMsg('Location permission is required to show nearby CNG stations.');
          setIsLoading(false);
          return;
        }

        let location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        setLocation(location);
      } catch (error) {
        console.error('Error getting location:', error);
        setErrorMsg('Failed to get your location. Please check your GPS settings.');
      } finally {
        setIsLoading(false);
      }
    })();
  }, []);

  const handleStationPress = (station) => {
    setSelectedStation(station);
  };

  const closeModal = () => {
    setSelectedStation(null);
  };

  const openMapsNavigation = async (station) => {
    const { latitude, longitude } = station;
    const destination = `${latitude},${longitude}`;
    const label = encodeURIComponent(station.name);

    // Different URL schemes for iOS and Android
    const scheme = Platform.select({
      ios: `maps://app?saddr=Current%20Location&daddr=${destination}&dirflg=d`,
      android: `google.navigation:q=${destination}&mode=d&title=${label}`
    });

    const mapsUrl = Platform.select({
      ios: `http://maps.apple.com/?saddr=Current%20Location&daddr=${destination}&dirflg=d`,
      android: `https://www.google.com/maps/dir/?api=1&destination=${destination}&travelmode=driving`
    });

    try {
      // Check if the device can handle the direct maps scheme
      const canOpenMaps = await Linking.canOpenURL(scheme);

      if (canOpenMaps) {
        await Linking.openURL(scheme);
      } else {
        // If can't open directly in maps app, try opening in browser
        const canOpenBrowser = await Linking.canOpenURL(mapsUrl);
        if (canOpenBrowser) {
          await Linking.openURL(mapsUrl);
        } else {
          Alert.alert(
            'Navigation Error',
            'Could not open maps application. Please make sure you have a maps app installed.',
            [{ text: 'OK' }]
          );
        }
      }
    } catch (error) {
      console.error('Error opening maps:', error);
      Alert.alert(
        'Navigation Error',
        'There was an error opening navigation. Please try again.',
        [{ text: 'OK' }]
      );
    }
  };

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Getting your location...</Text>
      </View>
    );
  }

  const mapRegion = location ? {
    latitude: location.coords.latitude,
    longitude: location.coords.longitude,
    latitudeDelta: 0.1,
    longitudeDelta: 0.1,
  } : INITIAL_REGION;

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" />
      <MapView
        style={styles.map}
        initialRegion={mapRegion}
        showsUserLocation
        showsMyLocationButton
      >
        {stations.map((station) => (
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

      <Modal
        animationType="slide"
        transparent={true}
        visible={selectedStation !== null}
        onRequestClose={closeModal}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedStation && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>{selectedStation.name}</Text>
                  <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
                    <IconSymbol name="xmark" size={24} color="#666" />
                  </TouchableOpacity>
                </View>

                <View style={styles.modalBody}>
                  <View style={styles.infoRow}>
                    <IconSymbol name="indianrupeesign" size={20} color="#4CAF50" />
                    <Text style={styles.infoText}>₹{selectedStation.price}/kg</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <IconSymbol name="star.fill" size={20} color="#FFD700" />
                    <Text style={styles.infoText}>{selectedStation.rating} Rating</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <IconSymbol name="clock.fill" size={20} color="#666" />
                    <Text style={styles.infoText}>{selectedStation.operatingHours}</Text>
                  </View>

                  <View style={styles.infoRow}>
                    <IconSymbol name="mappin.circle.fill" size={20} color="#FF5252" />
                    <Text style={styles.infoText}>{selectedStation.address}</Text>
                  </View>

                  <TouchableOpacity 
                    style={styles.navigationButton}
                    onPress={() => openMapsNavigation(selectedStation)}
                  >
                    <IconSymbol name="arrow.triangle.turn.up.right.circle.fill" size={20} color="#FFF" />
                    <Text style={styles.navigationButtonText}>Navigate</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>

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
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  map: {
    width: Dimensions.get('window').width,
    height: Dimensions.get('window').height,
  },
  modalOverlay: {
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
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#000',
    flex: 1,
  },
  closeButton: {
    padding: 8,
  },
  modalBody: {
    gap: 16,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  infoText: {
    fontSize: 16,
    color: '#333',
    flex: 1,
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
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
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
});
