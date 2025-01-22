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
  Pressable,
  TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';

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
}

export function FilterModal({ visible, onClose, options, onChange, onReset }: FilterModalProps) {
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
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.contentContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>Filter Stations</Text>
            <TouchableOpacity onPress={onClose}>
              <Ionicons name="close" size={24} color={Colors.light.text} />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Price Range</Text>
              <View style={styles.row}>
                <TextInput
                  style={styles.priceInput}
                  placeholder="Min"
                  keyboardType="numeric"
                  value={options.priceRange.min.toString()}
                  onChangeText={(value) => handlePriceChange('min', Number(value))}
                />
                <TextInput
                  style={styles.priceInput}
                  placeholder="Max"
                  keyboardType="numeric"
                  value={options.priceRange.max.toString()}
                  onChangeText={(value) => handlePriceChange('max', Number(value))}
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Filters</Text>
              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Only Open Stations</Text>
                <Switch
                  value={options.onlyOpen}
                  onValueChange={(value) =>
                    onChange({ ...options, onlyOpen: value })
                  }
                  trackColor={{ false: '#767577', true: Colors.light.tint }}
                />
              </View>
              <View style={styles.switchContainer}>
                <Text style={styles.switchLabel}>Only Favorites</Text>
                <Switch
                  value={options.onlyFavorites}
                  onValueChange={(value) =>
                    onChange({ ...options, onlyFavorites: value })
                  }
                  trackColor={{ false: '#767577', true: Colors.light.tint }}
                />
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Minimum Rating</Text>
              <View style={styles.ratingContainer}>
                {[1, 2, 3, 4, 5].map((rating) => (
                  <TouchableOpacity
                    key={rating}
                    onPress={() => onChange({ ...options, rating })}
                    style={styles.star}
                  >
                    <Ionicons
                      name={rating <= options.rating ? 'star' : 'star-outline'}
                      size={24}
                      color={rating <= options.rating ? '#FFD700' : '#767577'}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Sort By</Text>
              <View style={styles.sortByContainer}>
                {(['price', 'distance', 'rating'] as const).map((sort) => (
                  <TouchableOpacity
                    key={sort}
                    onPress={() => onChange({ ...options, sortBy: sort })}
                    style={[
                      styles.sortByOption,
                      options.sortBy === sort && styles.sortByOptionSelected,
                    ]}
                  >
                    <Text
                      style={[
                        styles.sortByText,
                        options.sortBy === sort && styles.sortByTextSelected,
                      ]}
                    >
                      {sort.charAt(0).toUpperCase() + sort.slice(1)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>

          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={styles.resetButton}
              onPress={onReset}
            >
              <Text style={[styles.buttonText, styles.resetButtonText]}>Reset</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.applyButton}
              onPress={onClose}
            >
              <Text style={[styles.buttonText, styles.applyButtonText]}>Apply</Text>
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
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  contentContainer: {
    backgroundColor: Colors.light.background,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    paddingBottom: Platform.OS === 'ios' ? 40 : 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -3,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    color: Colors.light.text,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
    color: Colors.light.text,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  priceInput: {
    borderWidth: 1,
    borderColor: Colors.light.border,
    borderRadius: 8,
    padding: 8,
    width: '45%',
    color: Colors.light.text,
  },
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  switchLabel: {
    fontSize: 16,
    color: Colors.light.text,
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  star: {
    marginRight: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  resetButton: {
    backgroundColor: Colors.light.background,
    borderWidth: 1,
    borderColor: Colors.light.tint,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '48%',
  },
  applyButton: {
    backgroundColor: Colors.light.tint,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    width: '48%',
  },
  buttonText: {
    textAlign: 'center',
    fontSize: 16,
    fontWeight: '600',
  },
  resetButtonText: {
    color: Colors.light.tint,
  },
  applyButtonText: {
    color: 'white',
  },
  sortByContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sortByOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: Colors.light.border,
    marginBottom: 8,
  },
  sortByOptionSelected: {
    backgroundColor: Colors.light.tint,
    borderColor: Colors.light.tint,
  },
  sortByText: {
    color: Colors.light.text,
    fontSize: 14,
  },
  sortByTextSelected: {
    color: 'white',
  },
});
