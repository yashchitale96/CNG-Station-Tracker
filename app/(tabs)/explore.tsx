import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from '@/context/AuthContext';

export default function ExploreScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();
  const { user } = useAuth();

  const features = [
    {
      title: 'Find Stations',
      description: 'Locate CNG stations near you with real-time availability',
      icon: 'location',
      action: () => router.push('/(tabs)/map'),
    },
    {
      title: 'Track Prices',
      description: 'Compare CNG prices across different stations',
      icon: 'pricetag',
      action: () => router.push('/(tabs)/map?filter=price'),
    },
    {
      title: 'View Statistics',
      description: 'Track your CNG usage and spending patterns',
      icon: 'stats-chart',
      action: () => router.push('/(tabs)/profile'),
    },
    {
      title: 'Favorite Stations',
      description: 'Quick access to your most visited stations',
      icon: 'heart',
      action: () => router.push('/(tabs)/map?filter=favorites'),
    },
  ];

  const tips = [
    'Save up to 10% by tracking price trends',
    'Plan your refills during off-peak hours',
    'Keep track of your monthly CNG expenses',
    'Compare prices across different stations',
  ];

  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: colors.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Explore Features
        </Text>
        <Text style={[styles.subtitle, { color: colors.tabIconDefault }]}>
          Discover what you can do with CNG Station Tracker
        </Text>
      </View>

      <View style={styles.featuresGrid}>
        {features.map((feature, index) => (
          <TouchableOpacity
            key={index}
            style={[styles.featureCard, { backgroundColor: colors.background, borderColor: colors.tint }]}
            onPress={feature.action}
          >
            <View style={[styles.iconContainer, { backgroundColor: colors.tint }]}>
              <Ionicons name={feature.icon as any} size={24} color="#fff" />
            </View>
            <Text style={[styles.featureTitle, { color: colors.text }]}>
              {feature.title}
            </Text>
            <Text style={[styles.featureDescription, { color: colors.tabIconDefault }]}>
              {feature.description}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      <View style={styles.tipsSection}>
        <Text style={[styles.tipsTitle, { color: colors.text }]}>
          Pro Tips
        </Text>
        {tips.map((tip, index) => (
          <View 
            key={index}
            style={[styles.tipCard, { backgroundColor: colors.background, borderColor: colors.tint }]}
          >
            <Ionicons name="bulb" size={20} color={colors.tint} style={styles.tipIcon} />
            <Text style={[styles.tipText, { color: colors.text }]}>{tip}</Text>
          </View>
        ))}
      </View>

      {user && (
        <TouchableOpacity
          style={[styles.profileButton, { backgroundColor: colors.tint }]}
          onPress={() => router.push('/(tabs)/profile')}
        >
          <Text style={styles.profileButtonText}>View Your Profile</Text>
          <Ionicons name="arrow-forward" size={20} color="#fff" />
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    marginBottom: 32,
  },
  featureCard: {
    width: '47%',
    padding: 16,
    borderRadius: 12,
    borderWidth: 1,
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  featureTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 14,
    lineHeight: 20,
  },
  tipsSection: {
    marginBottom: 24,
  },
  tipsTitle: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  tipCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
  },
  tipIcon: {
    marginRight: 12,
  },
  tipText: {
    flex: 1,
    fontSize: 14,
    lineHeight: 20,
  },
  profileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  profileButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
