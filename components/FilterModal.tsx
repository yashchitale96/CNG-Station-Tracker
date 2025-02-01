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
  StatusBar,
  SafeAreaView,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '../constants/Colors';
import { useColorScheme } from 'react-native';

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

const SCREEN_HEIGHT = Dimensions.get('window').height;

export function FilterModal({ visible, onClose, options, onChange, onReset }: FilterModalProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

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
      <SafeAreaView style={[styles.safeArea, { backgroundColor: 'rgba(0, 0, 0, 0.5)' }]}>
        <View style={styles.modalContainer}>
          <View style={[styles.contentContainer, { backgroundColor: colors.background }]}>
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.text }]}>Filter Stations</Text>
              <TouchableOpacity 
                onPress={onClose}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons name="close" size={24} color={colors.text} />
              </TouchableOpacity>
            </View>

            <ScrollView 
              style={styles.scrollView}
              showsVerticalScrollIndicator={false}
              contentContainerStyle={styles.scrollContent}
            >
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Price Range</Text>
                <View style={styles.row}>
                  <TextInput
                    style={[styles.priceInput, { 
                      color: colors.text,
                      backgroundColor: colors.backgroundSecondary,
                      borderColor: colors.border
                    }]}
                    placeholder="Min"
                    placeholderTextColor={colors.tabIconDefault}
                    keyboardType="numeric"
                    value={options.priceRange.min.toString()}
                    onChangeText={(value) => handlePriceChange('min', Number(value))}
                  />
                  <TextInput
                    style={[styles.priceInput, { 
                      color: colors.text,
                      backgroundColor: colors.backgroundSecondary,
                      borderColor: colors.border
                    }]}
                    placeholder="Max"
                    placeholderTextColor={colors.tabIconDefault}
                    keyboardType="numeric"
                    value={options.priceRange.max.toString()}
                    onChangeText={(value) => handlePriceChange('max', Number(value))}
                  />
                </View>
              </View>

              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Filters</Text>
                <View style={styles.switchContainer}>
                  <Text style={[styles.switchLabel, { color: colors.text }]}>Only Open Stations</Text>
                  <Switch
                    value={options.onlyOpen}
                    onValueChange={(value) => onChange({ ...options, onlyOpen: value })}
                    trackColor={{ false: '#767577', true: colors.tint }}
                    thumbColor={Platform.OS === 'android' ? (options.onlyOpen ? colors.tint : '#f4f3f4') : ''}
                  />
                </View>
                <View style={styles.switchContainer}>
                  <Text style={[styles.switchLabel, { color: colors.text }]}>Only Favorites</Text>
                  <Switch
                    value={options.onlyFavorites}
                    onValueChange={(value) => onChange({ ...options, onlyFavorites: value })}
                    trackColor={{ false: '#767577', true: colors.tint }}
                    thumbColor={Platform.OS === 'android' ? (options.onlyFavorites ? colors.tint : '#f4f3f4') : ''}
                  />
                </View>
              </View>

              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Minimum Rating</Text>
                <View style={styles.ratingContainer}>
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <TouchableOpacity
                      key={rating}
                      onPress={() => onChange({ ...options, rating })}
                      style={styles.star}
                      hitSlop={{ top: 10, bottom: 10, left: 5, right: 5 }}
                    >
                      <Ionicons
                        name={rating <= options.rating ? 'star' : 'star-outline'}
                        size={24}
                        color={rating <= options.rating ? '#FFD700' : colors.tabIconDefault}
                      />
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: colors.text }]}>Sort By</Text>
                <View style={styles.sortByContainer}>
                  {(['price', 'distance', 'rating'] as const).map((sort) => (
                    <TouchableOpacity
                      key={sort}
                      onPress={() => onChange({ ...options, sortBy: sort })}
                      style={[
                        styles.sortByOption,
                        { borderColor: colors.border },
                        options.sortBy === sort && [styles.sortByOptionSelected, { backgroundColor: colors.tint }]
                      ]}
                    >
                      <Text
                        style={[
                          styles.sortByText,
                          { color: colors.text },
                          options.sortBy === sort && styles.sortByTextSelected
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
                style={[styles.resetButton, { borderColor: colors.border }]}
                onPress={onReset}
              >
                <Text style={[styles.buttonText, styles.resetButtonText, { color: colors.text }]}>
                  Reset
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.applyButton, { backgroundColor: colors.tint }]}
                onPress={onClose}
              >
                <Text style={[styles.buttonText, styles.applyButtonText]}>
                  Apply
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  contentContainer: {
    maxHeight: SCREEN_HEIGHT * 0.85,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 20,
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
  scrollView: {
    maxHeight: SCREEN_HEIGHT * 0.6,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingHorizontal: Platform.OS === 'android' ? 4 : 0,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 12,
  },
  row: {
    flexDirection: 'row',
    gap: 12,
  },
  priceInput: {
    flex: 1,
    height: 44,
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    fontSize: 16,
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  switchLabel: {
    fontSize: 16,
  },
  ratingContainer: {
    flexDirection: 'row',
    gap: 8,
  },
  star: {
    padding: 4,
  },
  sortByContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  sortByOption: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
  },
  sortByOptionSelected: {
    borderWidth: 0,
  },
  sortByText: {
    fontSize: 14,
    fontWeight: '500',
  },
  sortByTextSelected: {
    color: '#fff',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 12,
    paddingTop: 16,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: 'rgba(0, 0, 0, 0.1)',
  },
  resetButton: {
    flex: 1,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
    borderWidth: 1,
  },
  applyButton: {
    flex: 1,
    height: 48,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 8,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '600',
  },
  resetButtonText: {
    opacity: 0.8,
  },
  applyButtonText: {
    color: '#fff',
  },
});
