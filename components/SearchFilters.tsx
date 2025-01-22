import React from 'react';
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Keyboard, 
  Platform,
  KeyboardAvoidingView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';

interface SearchFiltersProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  onFilterPress: () => void;
}

export function SearchFilters({ searchQuery, onSearchChange, onFilterPress }: SearchFiltersProps) {
  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.keyboardAvoid}
    >
      <View style={styles.container}>
        <View style={styles.searchContainer}>
          <Ionicons name="search" size={20} color={Colors.light.textSecondary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search stations..."
            placeholderTextColor={Colors.light.textSecondary}
            value={searchQuery}
            onChangeText={onSearchChange}
            returnKeyType="search"
            clearButtonMode="while-editing"
            autoCapitalize="none"
            autoCorrect={false}
            onSubmitEditing={Keyboard.dismiss}
          />
          <TouchableOpacity 
            onPress={onFilterPress} 
            style={styles.filterButton}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          >
            <Ionicons name="options" size={20} style={styles.filterIcon} />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoid: {
    width: '100%',
  },
  container: {
    backgroundColor: Colors.light.background,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.border,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.backgroundSecondary,
    borderRadius: 12,
    paddingHorizontal: 12,
    height: 44,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    color: Colors.light.text,
    paddingRight: 12,
  },
  filterButton: {
    position: 'absolute',
    right: 16,
    top: '50%',
    transform: [{ translateY: -12 }],
    padding: 8,
    borderRadius: 8,
    backgroundColor: Colors.light.tint,
  },
  filterIcon: {
    color: 'white',
  },
});
