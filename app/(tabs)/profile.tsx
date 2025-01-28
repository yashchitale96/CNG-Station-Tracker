import React from 'react';
import {
  StyleSheet,
  ScrollView,
  Switch,
  TouchableOpacity,
  useColorScheme,
  Alert,
} from 'react-native';
import { useAuth } from '@/context/AuthContext';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { ThemedView } from '@/components/ThemedView';
import { ThemedText } from '@/components/ThemedText';

export default function ProfileScreen() {
  const { user, signOut, updatePreferences } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

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

  return (
    <ThemedView style={styles.container}>
      <ScrollView>
        {/* Profile Header */}
        <ThemedView style={styles.header}>
          <ThemedView style={styles.avatarPlaceholder}>
            <ThemedText style={styles.avatarText}>
              {user.displayName.charAt(0).toUpperCase()}
            </ThemedText>
          </ThemedView>
          <ThemedText type="title" style={styles.displayName}>{user.displayName}</ThemedText>
          <ThemedText type="subtitle" style={styles.email}>{user.email}</ThemedText>
        </ThemedView>

        {/* Preferences Section */}
        <ThemedView style={styles.section}>
          <ThemedText type="title" style={styles.sectionTitle}>Preferences</ThemedText>
          <ThemedView style={styles.preferenceItem}>
            <ThemedText>Dark Mode</ThemedText>
            <Switch
              value={user.preferences.darkMode}
              onValueChange={() => togglePreference('darkMode')}
              trackColor={{ false: colors.tabIconDefault, true: colors.tint }}
              thumbColor={colors.background}
            />
          </ThemedView>
          <ThemedView style={styles.preferenceItem}>
            <ThemedText>Notifications</ThemedText>
            <Switch
              value={user.preferences.notificationsEnabled}
              onValueChange={() => togglePreference('notificationsEnabled')}
              trackColor={{ false: colors.tabIconDefault, true: colors.tint }}
              thumbColor={colors.background}
            />
          </ThemedView>
          <ThemedView style={styles.preferenceItem}>
            <ThemedText>Price Alerts</ThemedText>
            <Switch
              value={user.preferences.priceAlerts}
              onValueChange={() => togglePreference('priceAlerts')}
              trackColor={{ false: colors.tabIconDefault, true: colors.tint }}
              thumbColor={colors.background}
            />
          </ThemedView>
        </ThemedView>

        {/* Sign Out Button */}
        <TouchableOpacity style={[styles.signOutButton, { borderTopColor: colors.border }]} onPress={handleSignOut}>
          <Ionicons name="log-out-outline" size={24} color="#ff3b30" />
          <ThemedText style={styles.signOutText}>Sign Out</ThemedText>
        </TouchableOpacity>
      </ScrollView>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
  },
  avatarPlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: Colors.light.tint,
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
    marginBottom: 4,
  },
  section: {
    padding: 20,
    borderBottomWidth: 1,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  preferenceItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderTopWidth: 1,
  },
  signOutText: {
    marginLeft: 8,
    color: '#ff3b30',
    fontSize: 17,
  },
});
