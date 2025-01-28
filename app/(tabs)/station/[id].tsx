import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  useColorScheme,
  Alert,
  Linking,
  Image,
  Dimensions,
  Platform,
  StatusBar,
  SafeAreaView
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { 
  doc, 
  getDoc, 
  setDoc,
  updateDoc, 
  increment, 
  collection, 
  query, 
  where, 
  getDocs,
  addDoc,
  writeBatch
} from 'firebase/firestore';
import { getFirestore } from 'firebase/firestore';
import { useAuth } from '@/context/AuthContext';
import Colors from '@/constants/Colors';
import { Ionicons } from '@expo/vector-icons';

interface StationDetails {
  name: string;
  address: string;
  operatingHours: string;
  contactNumber: string;
  email?: string;
  status: 'pending' | 'verified' | 'rejected';
  verificationCount: number;
  upvotes: number;
  downvotes: number;
  photos: string[];
  latitude: string;
  longitude: string;
  verifiedAt?: string;
  verifiedBy?: string[];
  reliability?: number;
}

export default function StationDetailsScreen() {
  const params = useLocalSearchParams();
  const stationId = typeof params?.id === 'string' ? params.id : null;
  const { user } = useAuth();
  const router = useRouter();
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const [station, setStation] = useState<StationDetails | null>(null);
  const [hasVerified, setHasVerified] = useState(false);
  const [hasVoted, setHasVoted] = useState<'up' | 'down' | null>(null);
  const [loading, setLoading] = useState(true);

  const db = getFirestore();

  useEffect(() => {
    if (stationId) {
      loadStationDetails();
    } else {
      setLoading(false);
    }
  }, [stationId]);

  useEffect(() => {
    if (stationId && user?.id) {
      checkUserVerification();
      checkUserVote();
    }
  }, [stationId, user]);

  const loadStationDetails = async () => {
    if (!stationId) {
      setLoading(false);
      return;
    }

    try {
      const stationRef = doc(db, 'stations', stationId);
      const stationDoc = await getDoc(stationRef);
      
      if (stationDoc.exists()) {
        setStation(stationDoc.data() as StationDetails);
      }
    } catch (error) {
      console.error('Error loading station:', error);
      Alert.alert('Error', 'Failed to load station details');
    } finally {
      setLoading(false);
    }
  };

  const checkUserVerification = async () => {
    if (!user?.id || !stationId) return;
    
    try {
      const verificationQuery = query(
        collection(db, 'stations', stationId, 'verifications'),
        where('userId', '==', user.id)
      );
      const snapshot = await getDocs(verificationQuery);
      setHasVerified(!snapshot.empty);
    } catch (error) {
      console.error('Error checking verification:', error);
    }
  };

  const checkUserVote = async () => {
    if (!user?.id || !stationId) return;
    
    try {
      const votesQuery = query(
        collection(db, 'stations', stationId, 'votes'),
        where('userId', '==', user.id)
      );
      const snapshot = await getDocs(votesQuery);
      if (!snapshot.empty) {
        setHasVoted(snapshot.docs[0].data().type);
      }
    } catch (error) {
      console.error('Error checking vote:', error);
    }
  };

  const verifyStation = async () => {
    if (!user?.id || !stationId) {
      Alert.alert('Error', 'User must be logged in to verify stations');
      return;
    }

    try {
      const stationRef = doc(db, 'stations', stationId);
      const verificationRef = doc(db, 'stations', stationId, 'verifications', user.id);

      const verificationDoc = await getDoc(verificationRef);
      if (verificationDoc.exists()) {
        Alert.alert('Already Verified', 'You have already verified this station');
        return;
      }

      const batch = writeBatch(db);
      const stationDoc = await getDoc(stationRef);
      
      if (!stationDoc.exists()) {
        throw new Error('Station not found');
      }
      
      const stationData = stationDoc.data() as StationDetails;
      const newVerificationCount = (stationData.verificationCount || 0) + 1;
      const updateData: Partial<StationDetails> & { lastUpdated: string } = {
        verificationCount: newVerificationCount,
        lastUpdated: new Date().toISOString()
      };

      if (newVerificationCount >= 5 && stationData.status !== 'verified') {
        updateData.status = 'verified';
        updateData.verifiedAt = new Date().toISOString();
        updateData.verifiedBy = stationData.verifiedBy ? [...stationData.verifiedBy, user.id] : [user.id];
      }

      batch.set(verificationRef, {
        userId: user.id,
        timestamp: new Date().toISOString(),
        displayName: user.displayName || ''
      });
      
      batch.update(stationRef, updateData);
      await batch.commit();
      
      setHasVerified(true);
      loadStationDetails();

      Alert.alert(
        newVerificationCount >= 5 ? 'Success' : 'Thank You',
        newVerificationCount >= 5 
          ? 'Station has been verified!'
          : `Station needs ${5 - newVerificationCount} more verifications to be fully verified.`
      );
    } catch (error) {
      console.error('Error verifying station:', error);
      Alert.alert('Error', error instanceof Error ? error.message : 'Failed to verify station');
    }
  };

  const handleVote = async (type: 'up' | 'down') => {
    if (!user?.id || !stationId) {
      Alert.alert('Login Required', 'Please login to vote');
      return;
    }

    try {
      const stationRef = doc(db, 'stations', stationId);
      const votesRef = collection(db, 'stations', stationId, 'votes');
      const voteQuery = query(votesRef, where('userId', '==', user.id));
      const snapshot = await getDocs(voteQuery);

      const voteData = {
        userId: user.id,
        type,
        timestamp: new Date().toISOString(),
      };

      if (snapshot.empty) {
        await addDoc(votesRef, voteData);
        await updateDoc(stationRef, {
          [type === 'up' ? 'upvotes' : 'downvotes']: increment(1),
          lastUpdated: new Date().toISOString(),
        });
      } else {
        const oldVote = snapshot.docs[0].data().type;
        if (oldVote !== type) {
          await updateDoc(snapshot.docs[0].ref, voteData);
          await updateDoc(stationRef, {
            [oldVote === 'up' ? 'upvotes' : 'downvotes']: increment(-1),
            [type === 'up' ? 'upvotes' : 'downvotes']: increment(1),
            lastUpdated: new Date().toISOString(),
          });
        }
      }

      setHasVoted(type);
      loadStationDetails();
    } catch (error) {
      console.error('Error voting:', error);
      Alert.alert('Error', 'Failed to submit vote');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={[styles.container, { backgroundColor: colors.background }]}>
          <Text style={[styles.text, { color: colors.text }]}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!station || !stationId) {
    return (
      <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
        <View style={[styles.errorContainer, { backgroundColor: colors.background }]}>
          <Text style={[styles.errorText, { color: colors.text }]}>Station not found</Text>
          <TouchableOpacity 
            style={[styles.backButton, { backgroundColor: colors.tint }]} 
            onPress={() => router.replace('/(tabs)/stations')}
          >
            <Text style={styles.buttonText}>Go Back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
        <View style={styles.header}>
          <Text style={[styles.title, { color: colors.text }]}>{station.name}</Text>
          <View style={styles.statusContainer}>
            <Text style={[styles.status, { color: colors.text }]}>
              Status: {station.status.charAt(0).toUpperCase() + station.status.slice(1)}
            </Text>
            {station.status === 'verified' && (
              <Ionicons name="checkmark-circle" size={20} color="#4CAF50" />
            )}
          </View>
        </View>

        <View style={styles.infoSection}>
          <Text style={[styles.label, { color: colors.text }]}>Address:</Text>
          <Text style={[styles.text, { color: colors.text }]}>{station.address}</Text>

          <Text style={[styles.label, { color: colors.text }]}>Operating Hours:</Text>
          <Text style={[styles.text, { color: colors.text }]}>{station.operatingHours}</Text>

          <Text style={[styles.label, { color: colors.text }]}>Contact:</Text>
          <Text style={[styles.text, { color: colors.text }]}>{station.contactNumber}</Text>
          {station.email && (
            <Text style={[styles.text, { color: colors.text }]}>{station.email}</Text>
          )}
        </View>

        <View style={styles.verificationSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Verification</Text>
          
          {station.photos && station.photos.length > 0 && (
            <View style={styles.photosContainer}>
              <Text style={[styles.label, { color: colors.text }]}>Station Photos:</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                {station.photos.map((photo, index) => (
                  <View key={index} style={styles.photoWrapper}>
                    <Image
                      source={{ uri: photo }}
                      style={styles.stationPhoto}
                      resizeMode="cover"
                    />
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          <View style={styles.verificationInfo}>
            <Text style={[styles.text, { color: colors.text }]}>
              {station.verificationCount} users have verified this station
            </Text>
            {station.status === 'verified' && (
              <>
                <View style={styles.reliabilityScore}>
                  <Text style={[styles.label, { color: colors.text }]}>Reliability Score:</Text>
                  <Text style={[styles.scoreText, { color: colors.text }]}>
                    {station.reliability || 0}%
                  </Text>
                </View>
                <Text style={[styles.verifiedDate, { color: colors.text }]}>
                  Verified on: {new Date(station.verifiedAt || '').toLocaleDateString()}
                </Text>
              </>
            )}
          </View>
          {!hasVerified && user?.id && (
            <TouchableOpacity
              style={styles.verifyButton}
              onPress={verifyStation}
            >
              <Text style={styles.buttonText}>Verify Station</Text>
            </TouchableOpacity>
          )}
          {!user?.id && (
            <Text style={[styles.text, { color: colors.text, fontStyle: 'italic' }]}>
              Login to verify this station
            </Text>
          )}
        </View>

        <View style={styles.votingSection}>
          <Text style={[styles.sectionTitle, { color: colors.text }]}>Community Rating</Text>
          <View style={styles.voteContainer}>
            <TouchableOpacity
              style={[styles.voteButton, hasVoted === 'up' && styles.votedButton]}
              onPress={() => handleVote('up')}
              disabled={!user?.id}
            >
              <Ionicons
                name={hasVoted === 'up' ? 'thumbs-up' : 'thumbs-up-outline'}
                size={24}
                color="#fff"
              />
              <Text style={styles.voteCount}>{station.upvotes || 0}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.voteButton, hasVoted === 'down' && styles.votedButton]}
              onPress={() => handleVote('down')}
              disabled={!user?.id}
            >
              <Ionicons
                name={hasVoted === 'down' ? 'thumbs-down' : 'thumbs-down-outline'}
                size={24}
                color="#fff"
              />
              <Text style={styles.voteCount}>{station.downvotes || 0}</Text>
            </TouchableOpacity>
          </View>
          {!user?.id && (
            <Text style={[styles.text, { color: colors.text, fontStyle: 'italic', textAlign: 'center', marginTop: 8 }]}>
              Login to vote on this station
            </Text>
          )}
        </View>
      </ScrollView>
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    gap: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
  },
  backButton: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    elevation: 2,
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  status: {
    fontSize: 16,
  },
  infoSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  label: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 8,
  },
  text: {
    fontSize: 16,
    marginBottom: 8,
  },
  verificationSection: {
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
  },
  verificationInfo: {
    marginVertical: 8,
  },
  reliabilityScore: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    gap: 8,
  },
  scoreText: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  verifiedDate: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 4,
    opacity: 0.7,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  verifyButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 12,
  },
  votingSection: {
    padding: 16,
  },
  voteContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: 12,
  },
  voteButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    flexDirection: 'row',
    gap: 8,
  },
  votedButton: {
    backgroundColor: '#1976D2',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  voteCount: {
    color: '#fff',
    fontSize: 16,
  },
  photosContainer: {
    marginVertical: 16,
  },
  photoWrapper: {
    marginRight: 10,
    borderRadius: 8,
    overflow: 'hidden',
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
  },
  stationPhoto: {
    width: Dimensions.get('window').width * 0.8,
    height: 200,
    borderRadius: 8,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
});
