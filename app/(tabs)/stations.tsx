import React, { useEffect, useState } from 'react';
import { FlatList, StyleSheet, TouchableOpacity, ActivityIndicator, View } from 'react-native';
import { useRouter } from 'expo-router';
import { collection, getDocs, getFirestore, orderBy, query } from 'firebase/firestore';
import { Ionicons } from '@expo/vector-icons';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

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
  const router = useRouter();

  useEffect(() => {
    loadStations();
  }, []);

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
    } catch (error) {
      console.error('Error loading stations:', error);
    } finally {
      setLoading(false);
    }
  };

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
      <ThemedView style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
      </View>
      <FlatList
        data={stations}
        renderItem={renderStationItem}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.listContainer}
        ItemSeparatorComponent={() => <ThemedView style={styles.separator} />}
        ListEmptyComponent={() => (
          <ThemedView style={styles.emptyContainer}>
            <ThemedText type="subtitle">No stations found</ThemedText>
          </ThemedView>
        )}
      />
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContainer: {
    padding: 16,
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
