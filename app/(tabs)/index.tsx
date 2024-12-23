import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { useColorScheme } from 'react-native';

export default function HomeScreen() {
  const { user } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  if (!user) return null;

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.welcomeText, { color: colors.text }]}>
          Welcome back, {user.displayName}!
        </Text>
      </View>

      <View style={styles.statsContainer}>
        <View style={[styles.statCard, { backgroundColor: colors.tint }]}>
          <Ionicons name="car" size={24} color="#fff" />
          <Text style={styles.statNumber}>{user.statistics.totalRefills}</Text>
          <Text style={styles.statLabel}>Total Refills</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: colors.tint }]}>
          <Ionicons name="wallet" size={24} color="#fff" />
          <Text style={styles.statNumber}>
            ₹{user.statistics.totalSpent.toFixed(2)}
          </Text>
          <Text style={styles.statLabel}>Total Spent</Text>
        </View>

        <View style={[styles.statCard, { backgroundColor: colors.tint }]}>
          <Ionicons name="trending-up" size={24} color="#fff" />
          <Text style={styles.statNumber}>
            ₹{user.statistics.averagePricePerRefill.toFixed(2)}
          </Text>
          <Text style={styles.statLabel}>Avg. per Refill</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>
          Recent Activity
        </Text>
        {Object.entries(user.statistics.visitedStations).length > 0 ? (
          Object.entries(user.statistics.visitedStations)
            .sort(([, a], [, b]) => b.lastVisit - a.lastVisit)
            .slice(0, 5)
            .map(([stationId, stats]) => (
              <View
                key={stationId}
                style={[styles.activityCard, { backgroundColor: colors.background }]}
              >
                <View style={styles.activityInfo}>
                  <Text style={[styles.stationName, { color: colors.text }]}>
                    Station #{stationId}
                  </Text>
                  <Text style={[styles.activityDate, { color: colors.tabIconDefault }]}>
                    {new Date(stats.lastVisit).toLocaleDateString()}
                  </Text>
                </View>
                <Text style={[styles.activityAmount, { color: colors.tint }]}>
                  ₹{stats.totalSpent.toFixed(2)}
                </Text>
              </View>
            ))
        ) : (
          <Text style={[styles.emptyText, { color: colors.tabIconDefault }]}>
            No recent activity
          </Text>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  welcomeText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
    gap: 12,
  },
  statCard: {
    flex: 1,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statNumber: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 8,
  },
  statLabel: {
    color: '#fff',
    fontSize: 12,
    marginTop: 4,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  activityCard: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eee',
  },
  activityInfo: {
    flex: 1,
  },
  stationName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 4,
  },
  activityDate: {
    fontSize: 14,
  },
  activityAmount: {
    fontSize: 16,
    fontWeight: '600',
  },
  emptyText: {
    textAlign: 'center',
    fontStyle: 'italic',
    marginTop: 16,
  },
});
