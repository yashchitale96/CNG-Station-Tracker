import React from 'react';
import { StyleSheet, View, useColorScheme } from 'react-native';
import { StationSubmissionForm } from '../../components/StationSubmissionForm';
import { addDoc, collection, getFirestore } from 'firebase/firestore';
import Colors from '@/constants/Colors';
import { Text } from 'react-native';

export default function SubmitStationScreen() {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

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
    } catch (error) {
      console.error('Error submitting station:', error);
      alert('Error submitting station. Please try again.');
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <Text style={[styles.title, { color: colors.text }]}>
        Submit New CNG Station
      </Text>
      <Text style={[styles.subtitle, { color: colors.text }]}>
        Help the community by adding a new CNG station. Your submission will be verified by other users.
      </Text>
      <StationSubmissionForm onSubmit={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    marginBottom: 24,
    opacity: 0.7,
  },
});
