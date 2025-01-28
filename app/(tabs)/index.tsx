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
  },
  statCard: {
    flex: 1,
    margin: 4,
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  statNumber: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginVertical: 8,
  },
  statLabel: {
    color: '#fff',
    fontSize: 12,
  },
});
