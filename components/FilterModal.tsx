import React from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Switch,
  Platform,
  Pressable
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface FilterOptions {
  priceRange: { min: number; max: number };
  onlyOpen: boolean;
  onlyFavorites: boolean;
  rating: number;
  sortBy: 'price' | 'distance' | 'rating';
}

interface FilterModalProps {
  visible: boolean;
  onClose: () => void;
  options: FilterOptions;
  onChange: (newOptions: FilterOptions) => void;
  onReset: () => void;
  hi
}


export function FilterModal({ visible, onClose, options, onChange, onReset }: FilterModalProps) {
  const PRICE_STEPS = Array.from({ length: 21 }, (_, i) => 80 + i * 0.5);

  const handlePriceChange = (type: 'min' | 'max', value: number) => {
    const newRange = { ...options.priceRange };
    if (type === 'min') {
      newRange.min = Math.min(value, newRange.max - 0.5);
    } else {
      newRange.max = Math.max(value, newRange.min + 0.5);
    }
    onChange({ ...options, priceRange: newRange });
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.modalContent}>
          <View style={styles.header}>
            <Text style={styles.title}>Filter Stations</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#666" />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.scrollContent}>
            {/* Price Range Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Price Range (₹/kg)</Text>
              <View style={styles.priceLabels}>
                <Text>₹{options.priceRange.min.toFixed(2)}</Text>
                <Text>₹{options.priceRange.max.toFixed(2)}</Text>
              </View>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.priceStepsContainer}>
                {PRICE_STEPS.map((price) => (
                  <Pressable
                    key={price}
                    onPress={() => handlePriceChange('min', price)}
                    style={[
                      styles.priceStep,
                      price >= options.priceRange.min && price <= options.priceRange.max && styles.priceStepActive,
                      price === options.priceRange.min && styles.priceStepMin,
                      price === options.priceRange.max && styles.priceStepMax,
                    ]}
                  >
                    <Text style={[
                      styles.priceStepText,
                      (price === options.priceRange.min || price === options.priceRange.max) && styles.priceStepTextActive
                    ]}>
                      {price.toFixed(1)}
                    </Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* Switches Section */}
            <View style={styles.section}>
              <View style={styles.switchRow}>
                <Text>Show Only Open Stations</Text>
                <Switch
                  value={options.onlyOpen}
                  onValueChange={(value) => onChange({ ...options, onlyOpen: value })}
                />
              </View>
              <View style={styles.switchRow}>
                <Text>Show Only Favorites</Text>
                <Switch
                  value={options.onlyFavorites}
                  onValueChange={(value) => onChange({ ...options, onlyFavorites: value })}
                />
              </View>
            </View>

            {/* Rating Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Minimum Rating</Text>
              <View style={styles.ratingContainer}>
                {[1, 2, 3, 4, 5].map((rating) => (
                  <TouchableOpacity
                    key={rating}
                    onPress={() => onChange({ ...options, rating })}
                    style={styles.starContainer}
                  >
                    <Ionicons
                      name={rating <= options.rating ? "star" : "star-outline"}
                      size={24}
                      color={rating <= options.rating ? "#FFD700" : "#666"}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {/* Sort By Section */}
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sort By</Text>
              <View style={styles.sortButtons}>
                {[
                  { key: 'price', label: 'Price', icon: 'pricetag' },
                  { key: 'distance', label: 'Distance', icon: 'location' },
                  { key: 'rating', label: 'Rating', icon: 'star' },
                ].map((item) => (
                  <TouchableOpacity
                    key={item.key}
                    style={[
                      styles.sortButton,
                      options.sortBy === item.key && styles.sortButtonActive,
                    ]}
                    onPress={() => onChange({ ...options, sortBy: item.key as FilterOptions['sortBy'] })}
                  >
                    <Ionicons
                      name={item.icon}
                      size={20}
                      color={options.sortBy === item.key ? '#fff' : '#666'}
                    />
                    <Text
                      style={[
                        styles.sortButtonText,
                        options.sortBy === item.key && styles.sortButtonTextActive,
                      ]}
                    >
                      {item.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.resetButton} onPress={onReset}>
              <Text style={styles.resetButtonText}>Reset Filters</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.applyButton} onPress={onClose}>
              <Text style={styles.applyButtonText}>Apply Filters</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  scrollContent: {
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  priceLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  priceStepsContainer: {
    flexDirection: 'row',
    paddingVertical: 8,
  },
  priceStep: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: 2,
    borderRadius: 20,
    backgroundColor: '#f5f5f5',
  },
  priceStepActive: {
    backgroundColor: '#e3f2fd',
  },
  priceStepMin: {
    backgroundColor: '#007AFF',
  },
  priceStepMax: {
    backgroundColor: '#007AFF',
  },
  priceStepText: {
    fontSize: 12,
    color: '#666',
  },
  priceStepTextActive: {
    color: '#fff',
    fontWeight: 'bold',
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 32,
  },
  starContainer: {
    padding: 4,
  },
  sortButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  sortButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    flex: 1,
    marginHorizontal: 4,
    justifyContent: 'center',
  },
  sortButtonActive: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  sortButtonText: {
    marginLeft: 4,
    color: '#666',
  },
  sortButtonTextActive: {
    color: '#fff',
  },
  footer: {
    flexDirection: 'row',
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#eee',
  },
  resetButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#007AFF',
    marginRight: 8,
    alignItems: 'center',
  },
  resetButtonText: {
    color: '#007AFF',
    fontWeight: '600',
  },
  applyButton: {
    flex: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#007AFF',
    marginLeft: 8,
    alignItems: 'center',
  },
  applyButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
});
