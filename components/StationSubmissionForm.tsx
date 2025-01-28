import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Image, StyleSheet, ScrollView, Text, useColorScheme } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Location from 'expo-location';
import Colors from '@/constants/Colors';

interface StationFormData {
  name: string;
  address: string;
  latitude: string;
  longitude: string;
  operatingHours: string;
  contactNumber: string;
  email: string;
  photos: string[];
}

const defaultFormData: StationFormData = {
  name: '',
  address: '',
  latitude: '',
  longitude: '',
  operatingHours: '',
  contactNumber: '',
  email: '',
  photos: [],
};

export const StationSubmissionForm = ({ onSubmit }: { onSubmit: (data: StationFormData) => void }) => {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  
  const [formData, setFormData] = useState<StationFormData>(defaultFormData);
  const [errors, setErrors] = useState<Partial<Record<keyof StationFormData, string>>>({});

  const validateForm = () => {
    const newErrors: Partial<Record<keyof StationFormData, string>> = {};

    if (!formData.name.trim()) newErrors.name = 'Station name is required';
    if (!formData.address.trim()) newErrors.address = 'Address is required';
    if (!formData.latitude || !formData.longitude) newErrors.latitude = 'Location is required';
    if (!formData.operatingHours.trim()) newErrors.operatingHours = 'Operating hours are required';
    
    const phoneRegex = /^\+?[\d\s-]{10,}$/;
    if (!phoneRegex.test(formData.contactNumber)) {
      newErrors.contactNumber = 'Please enter a valid phone number';
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (formData.email && !emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (formData.photos.length === 0) {
      newErrors.photos = 'Please upload at least one photo of the station';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = () => {
    if (validateForm()) {
      onSubmit(formData);
      // Reset form after successful submission
      setFormData(defaultFormData);
      setErrors({});
    }
  };

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled && result.assets[0].uri) {
      setFormData(prev => ({
        ...prev,
        photos: [...prev.photos, result.assets[0].uri],
      }));
    }
  };

  const getCurrentLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        alert('Permission to access location was denied');
        return;
      }

      const location = await Location.getCurrentPositionAsync({});
      setFormData(prev => ({
        ...prev,
        latitude: location.coords.latitude.toString(),
        longitude: location.coords.longitude.toString(),
      }));
    } catch (error) {
      alert('Error getting location');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.form}>
        <TextInput
          style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
          placeholder="Station Name"
          placeholderTextColor={colors.text}
          value={formData.name}
          onChangeText={(text) => setFormData(prev => ({ ...prev, name: text }))}
        />
        {errors.name && <Text style={styles.errorText}>{errors.name}</Text>}

        <TextInput
          style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
          placeholder="Address"
          placeholderTextColor={colors.text}
          value={formData.address}
          onChangeText={(text) => setFormData(prev => ({ ...prev, address: text }))}
          multiline
        />
        {errors.address && <Text style={styles.errorText}>{errors.address}</Text>}

        <View style={styles.locationContainer}>
          <TextInput
            style={[styles.input, styles.locationInput, { backgroundColor: colors.background, color: colors.text }]}
            placeholder="Latitude"
            placeholderTextColor={colors.text}
            value={formData.latitude}
            onChangeText={(text) => setFormData(prev => ({ ...prev, latitude: text }))}
            keyboardType="numeric"
          />
          <TextInput
            style={[styles.input, styles.locationInput, { backgroundColor: colors.background, color: colors.text }]}
            placeholder="Longitude"
            placeholderTextColor={colors.text}
            value={formData.longitude}
            onChangeText={(text) => setFormData(prev => ({ ...prev, longitude: text }))}
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.locationButton} onPress={getCurrentLocation}>
            <Text style={styles.buttonText}>Get Location</Text>
          </TouchableOpacity>
        </View>
        {errors.latitude && <Text style={styles.errorText}>{errors.latitude}</Text>}

        <TextInput
          style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
          placeholder="Operating Hours"
          placeholderTextColor={colors.text}
          value={formData.operatingHours}
          onChangeText={(text) => setFormData(prev => ({ ...prev, operatingHours: text }))}
        />
        {errors.operatingHours && <Text style={styles.errorText}>{errors.operatingHours}</Text>}

        <TextInput
          style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
          placeholder="Contact Number"
          placeholderTextColor={colors.text}
          value={formData.contactNumber}
          onChangeText={(text) => setFormData(prev => ({ ...prev, contactNumber: text }))}
          keyboardType="phone-pad"
        />
        {errors.contactNumber && <Text style={styles.errorText}>{errors.contactNumber}</Text>}

        <TextInput
          style={[styles.input, { backgroundColor: colors.background, color: colors.text }]}
          placeholder="Email (Optional)"
          placeholderTextColor={colors.text}
          value={formData.email}
          onChangeText={(text) => setFormData(prev => ({ ...prev, email: text }))}
          keyboardType="email-address"
        />
        {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

        <TouchableOpacity style={styles.photoButton} onPress={pickImage}>
          <Text style={styles.buttonText}>Upload Station Photo</Text>
        </TouchableOpacity>
        {errors.photos && <Text style={styles.errorText}>{errors.photos}</Text>}

        <View style={styles.photoPreviewContainer}>
          {formData.photos.map((photo, index) => (
            <Image key={index} source={{ uri: photo }} style={styles.photoPreview} />
          ))}
        </View>

        <TouchableOpacity style={styles.submitButton} onPress={handleSubmit}>
          <Text style={styles.buttonText}>Submit Station</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
  },
  locationContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  locationInput: {
    flex: 1,
    marginRight: 8,
  },
  locationButton: {
    backgroundColor: '#4CAF50',
    padding: 12,
    borderRadius: 8,
    justifyContent: 'center',
  },
  photoButton: {
    backgroundColor: '#2196F3',
    padding: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  photoPreviewContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  photoPreview: {
    width: 100,
    height: 100,
    margin: 4,
    borderRadius: 8,
  },
  submitButton: {
    backgroundColor: '#4CAF50',
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  errorText: {
    color: 'red',
    marginBottom: 8,
  },
});
