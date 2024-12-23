import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';

export default function ProfileScreen() {
  const { user, signOut, updatePreferences } = useAuth();

  if (!user) return null;

  const handleSignOut = () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Sign Out', style: 'destructive', onPress: signOut },
      ]
    );
  };

  const togglePreference = (key: keyof typeof user.preferences) => {
    if (typeof user.preferences[key] === 'boolean') {
      updatePreferences({ [key]: !user.preferences[key] });
    }
  };

  const formatCurrency = (amount: number) => {
    return `₹${amount.toFixed(2)}`;
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  return (
    <ScrollView style={styles.container}>
      {/* Profile Header */}
      <View style={styles.header}>
        <View style={styles.avatarPlaceholder}>
          <Text style={styles.avatarText}>
            {user.displayName.charAt(0).toUpperCase()}
          </Text>
        </View>
        <Text style={styles.displayName}>{user.displayName}</Text>
        <Text style={styles.email}>{user.email}</Text>
      </View>

      {/* Statistics Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Your Statistics</Text>
        <View style={styles.statsGrid}>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>{user.statistics.totalRefills}</Text>
            <Text style={styles.statLabel}>Total Refills</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {formatCurrency(user.statistics.totalSpent)}
            </Text>
            <Text style={styles.statLabel}>Total Spent</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statValue}>
              {formatCurrency(user.statistics.averagePricePerRefill)}
            </Text>
            <Text style={styles.statLabel}>Avg. per Refill</Text>
          </View>
        </View>
      </View>

      {/* Preferences Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Preferences</Text>
        <View style={styles.preferenceItem}>
          <Text>Dark Mode</Text>
          <Switch
            value={user.preferences.darkMode}
            onValueChange={() => togglePreference('darkMode')}
          />
        </View>
        <View style={styles.preferenceItem}>
          <Text>Notifications</Text>
          <Switch
            value={user.preferences.notificationsEnabled}
            onValueChange={() => togglePreference('notificationsEnabled')}
          />
        </View>
        <View style={styles.preferenceItem}>
          <Text>Price Alerts</Text>
          <Switch
            value={user.preferences.priceAlerts}
            onValueChange={() => togglePreference('priceAlerts')}
          />
        </View>
      </View>

      {/* Recently Visited Stations */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recently Visited Stations</Text>
        {Object.entries(user.statistics.visitedStations).length > 0 ? (
          Object.entries(user.statistics.visitedStations)
            .sort(([, a], [, b]) => b.lastVisit - a.lastVisit)
            .slice(0, 5)
            .map(([stationId, stats]) => (
              <View key={stationId} style={styles.visitedStation}>
                <View>
                  <Text style={styles.stationName}>Station #{stationId}</Text>
                  <Text style={styles.visitDate}>
                    Last visit: {formatDate(stats.lastVisit)}
                  </Text>
                </View>
                <View>
                  <Text style={styles.visitCount}>{stats.visitCount} visits</Text>
                  <Text style={styles.totalSpent}>
                    {formatCurrency(stats.totalSpent)}
                  </Text>
                </View>
              </View>
            ))
        ) : (
          <Text style={styles.noDataText}>No stations visited yet</Text>
        )}
      </View>

      {/* Sign Out Button */}
      <TouchableOpacity style={styles.signOutButton} onPress={handleSignOut}>
        <Ionicons name="log-out-outline" size={24} color="#ff3b30" />
        <Text style={styles.signOutText}>Sign Out</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#007AFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  avatarText: {
    fontSize: 32,
    color: '#fff',
    fontWeight: 'bold',
  },
  displayName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  email: {
    color: '#666',
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  statsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statItem: {
    flex: 1,
    alignItems: 'center',
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  statLabel: {
    color: '#666',
    fontSize: 12,
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  visitedStation: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  stationName: {
    fontWeight: '600',
    marginBottom: 4,
  },
  visitDate: {
    color: '#666',
    fontSize: 12,
  },
  visitCount: {
    textAlign: 'right',
    marginBottom: 4,
  },
  totalSpent: {
    color: '#666',
    fontSize: 12,
    textAlign: 'right',
  },
  noDataText: {
    color: '#666',
    fontStyle: 'italic',
    textAlign: 'center',
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    gap: 8,
  },
  signOutText: {
    color: '#ff3b30',
    fontSize: 16,
    fontWeight: '600',
  },
});
