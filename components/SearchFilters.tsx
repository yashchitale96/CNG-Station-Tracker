import React from 'react';
import { 
  StyleSheet, 
  View, 
  TextInput, 
  TouchableOpacity, 
  Keyboard, 
  Platform,
  KeyboardAvoidingView 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

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
          <Ionicons name="search" size={20} color="#666" style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search stations..."
            value={searchQuery}
            onChangeText={onSearchChange}
            returnKeyType="search"
            clearButtonMode="while-editing"
            autoCapitalize="none"
            autoCorrect={false}
            onSubmitEditing={Keyboard.dismiss}
          />
        </View>
        <TouchableOpacity 
          onPress={onFilterPress} 
          style={styles.filterButton}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Ionicons name="filter" size={24} color="#007AFF" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  keyboardAvoid: {
    width: '100%',
    zIndex: 1,
  },
  container: {
    flexDirection: 'row',
    padding: 10,
    backgroundColor: 'white',
    borderRadius: 8,
    margin: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  searchContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
    paddingHorizontal: 10,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 16,
    color: '#333',
    paddingVertical: 8,
  },
  filterButton: {
    marginLeft: 10,
    justifyContent: 'center',
    alignItems: 'center',
    width: 40,
    backgroundColor: '#f5f5f5',
    borderRadius: 6,
  },
});
