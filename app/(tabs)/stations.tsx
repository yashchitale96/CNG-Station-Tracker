// This is used for the stations option which shown on UI which shows the list of stations available for the verification

import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, View, RefreshControl, Alert, Platform, StatusBar, SafeAreaView } from 'react-native';
import { useRouter } from 'expo-router';
import { collection, getDocs, getFirestore, orderBy, query } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';
import Colors from '@/constants/Colors';
import { useColorScheme } from 'react-native';

interface Station {
  id: string;
  name: string;
  address: string;
  status: 'pending' | 'verified' | 'rejected';
  verificationCount: number;
  upvotes: number;
  downvotes: number;
  lastUpdated: string;
}

export default function StationsScreen() {
  const [stations, setStations] = useState<Station[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [lastRefreshed, setLastRefreshed] = useState<Date | null>(null);
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  useEffect(() => {
    loadStations();
  }, []);

  const showToast = (message: string, isError = false) => {
    Alert.alert(
      isError ? 'Error' : 'Success',
      message,
      [{ text: 'OK', style: 'default' }],
      { cancelable: true }
    );
  };

  const loadStations = async () => {
    try {
      const db = getFirestore();
      const stationsRef = collection(db, 'stations');
      const q = query(stationsRef, orderBy('lastUpdated', 'desc'));
      const querySnapshot = await getDocs(q);
      
      const stationsList = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      })) as Station[];

      setStations(stationsList);
      setLastRefreshed(new Date());
      if (refreshing) {
        showToast('Stations list updated successfully');
      }
    } catch (error) {
      console.error('Error loading stations:', error);
      if (refreshing) {
        showToast('Failed to update stations list', true);
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadStations();
  }, []);

  const renderStationItem = ({ item }: { item: Station }) => (
    <TouchableOpacity
      style={styles.stationItem}
      onPress={() => router.push(`/station/${item.id}`)}
    >
      <ThemedView style={styles.stationContent}>
        <ThemedView style={styles.stationHeader}>
          <ThemedText type="title" style={styles.stationName}>
            {item.name}
          </ThemedText>
          {item.status === 'verified' && (
            <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
          )}
        </ThemedView>

        <ThemedText type="subtitle" style={styles.address}>
          {item.address}
        </ThemedText>

        <ThemedView style={styles.statsContainer}>
          <ThemedView style={styles.stat}>
            <Ionicons name="shield-checkmark-outline" size={16} color="#666" />
            <ThemedText type="subtitle">
              {item.verificationCount} verifications
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.stat}>
            <Ionicons name="thumbs-up-outline" size={16} color="#666" />
            <ThemedText type="subtitle">
              {item.upvotes || 0}
            </ThemedText>
          </ThemedView>

          <ThemedView style={styles.stat}>
            <Ionicons name="thumbs-down-outline" size={16} color="#666" />
            <ThemedText type="subtitle">
              {item.downvotes || 0}
            </ThemedText>
          </ThemedView>
        </ThemedView>
      </ThemedView>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <ThemedView style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.tint} />
        </ThemedView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ThemedView style={styles.container}>
        <FlatList
          data={stations}
          renderItem={renderStationItem}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.listContainer}
          ItemSeparatorComponent={() => <ThemedView style={styles.separator} />}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.tint]} // Android
              tintColor={colors.tint} // iOS
              progressViewOffset={10}
              progressBackgroundColor="#ffffff"
            />
          }
          ListHeaderComponent={() => (
            lastRefreshed && (
              <ThemedText type="subtitle" style={styles.lastRefreshed}>
                Last updated: {lastRefreshed.toLocaleTimeString()}
              </ThemedText>
            )
          )}
          ListEmptyComponent={() => (
            <ThemedView style={styles.emptyContainer}>
              <ThemedText type="subtitle">No stations found</ThemedText>
              <ThemedText type="subtitle" style={styles.pullToRefresh}>
                Pull down to refresh
              </ThemedText>
            </ThemedView>
          )}
        />
      </ThemedView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
  },
  lastRefreshed: {
    fontSize: 12,
    opacity: 0.7,
    textAlign: 'center',
    marginBottom: 16,
  },
  pullToRefresh: {
    marginTop: 8,
    opacity: 0.5,
  },
  stationItem: {
    borderRadius: 8,
    overflow: 'hidden',
  },
  stationContent: {
    padding: 16,
  },
  stationHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  stationName: {
    flex: 1,
  },
  address: {
    marginBottom: 12,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: 16,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  separator: {
    height: 1,
    backgroundColor: '#ddd',
    marginVertical: 8,
  },
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
  },
});
