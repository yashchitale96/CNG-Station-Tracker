import React, { useState } from 'react';
import { 
  View, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Keyboard, 
  Platform,
  KeyboardAvoidingView,
  Animated,
  Pressable,
  StatusBar,
  SafeAreaView
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import Colors from '@/constants/Colors';
import { useColorScheme } from 'react-native';

interface SearchFiltersProps {
  searchQuery: string;
  onSearchChange: (text: string) => void;
  onFilterPress: () => void;
  style?: object;
}

export function SearchFilters({ 
  searchQuery, 
  onSearchChange, 
  onFilterPress,
  style 
}: SearchFiltersProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];
  const [isFocused, setIsFocused] = useState(false);
  const [scaleAnim] = useState(new Animated.Value(1));

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      useNativeDriver: true,
    }).start();
  };

  return (
    <SafeAreaView style={[styles.safeArea, { backgroundColor: colors.background }]}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={[styles.keyboardAvoid, style]}
      >
        <Animated.View 
          style={[
            styles.container,
            { 
              backgroundColor: colors.background,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <View style={[
            styles.searchContainer,
            { 
              backgroundColor: colors.backgroundSecondary,
              borderColor: isFocused ? colors.tint : 'transparent',
            }
          ]}>
            <Ionicons 
              name="search" 
              size={20} 
              color={isFocused ? colors.tint : colors.tabIconDefault} 
              style={styles.searchIcon} 
            />
            <TextInput
              style={[styles.searchInput, { color: colors.text }]}
              placeholder="Search stations..."
              placeholderTextColor={colors.tabIconDefault}
              value={searchQuery}
              onChangeText={onSearchChange}
              returnKeyType="search"
              clearButtonMode="while-editing"
              autoCapitalize="none"
              autoCorrect={false}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              onSubmitEditing={Keyboard.dismiss}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity
                onPress={() => onSearchChange('')}
                style={styles.clearButton}
                hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              >
                <Ionicons 
                  name="close-circle" 
                  size={18} 
                  color={colors.tabIconDefault}
                />
              </TouchableOpacity>
            )}
            <Pressable 
              onPress={onFilterPress}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
              style={({ pressed }) => [
                styles.filterButton,
                { backgroundColor: colors.tint },
                pressed && styles.filterButtonPressed
              ]}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Ionicons name="options" size={18} style={styles.filterIcon} />
            </Pressable>
          </View>
        </Animated.View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    width: '100%',
    paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0,
  },
  keyboardAvoid: {
    width: '100%',
  },
  container: {
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'android' ? 8 : 12,
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    paddingHorizontal: 12,
    height: Platform.OS === 'android' ? 44 : 48,
    borderWidth: 2,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: 16,
    paddingRight: 12,
    fontWeight: '400',
    paddingVertical: Platform.OS === 'android' ? 8 : 0,
  },
  clearButton: {
    padding: 4,
    marginRight: 8,
  },
  filterButton: {
    padding: 8,
    borderRadius: 10,
    backgroundColor: Colors.light.tint,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  filterButtonPressed: {
    opacity: 0.8,
    transform: [{ scale: 0.95 }],
  },
  filterIcon: {
    color: 'white',
  },
});
