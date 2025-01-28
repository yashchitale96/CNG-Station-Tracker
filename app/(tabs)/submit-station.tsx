import React, { useState } from 'react';
import { View, StyleSheet, useColorScheme } from 'react-native';
import { StationSubmissionForm} from '@/components/StationSubmissionForm';
import { addDoc, collection, getFirestore } from 'firebase/firestore';
import Colors from '@/constants/Colors';
import { Text } from 'react-native';
import { useRouter } from 'expo-router';

export default function SubmitStationScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const router = useRouter();

  const handleSubmit = async (formData: any) => {
    try {
      const db = getFirestore();
      const stationsRef = collection(db, 'stations');
      
      // Add verification-related fields
      const stationData = {
        ...formData,
        status: 'pending', // pending, verified, rejected
        verificationCount: 0,
        upvotes: 0,
        downvotes: 0,
        submittedAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
      };

      await addDoc(stationsRef, stationData);
      alert('Station submitted successfully! It will be verified by the community.');
      // Navigate to stations screen
      router.replace('/stations');
    } catch (error) {
      console.error('Error submitting station:', error);
      alert('Error submitting station. Please try again.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>
          Submit New CNG Station
        </Text>
      </View>
      <StationSubmissionForm onSubmit={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
  },
});
