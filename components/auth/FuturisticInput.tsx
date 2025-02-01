import React from 'react';
import { View, TextInput, StyleSheet, TextInputProps } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface FuturisticInputProps extends TextInputProps {
  icon: keyof typeof Ionicons.glyphMap;
  error?: boolean;
}

export const FuturisticInput: React.FC<FuturisticInputProps> = ({
  icon,
  error,
  style,
  ...props
}) => {
  return (
    <View style={[styles.container, error && styles.containerError]}>
      <View style={styles.iconContainer}>
        <Ionicons name={icon} size={20} color={error ? "#ff4444" : "#666"} />
      </View>
      <TextInput
        style={[styles.input, style]}
        placeholderTextColor="#666"
        {...props}
      />
      <View style={[styles.border, error && styles.borderError]} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f5f5f5',
    borderRadius: 12,
    marginBottom: 16,
    paddingHorizontal: 12,
    height: 56,
    position: 'relative',
    overflow: 'hidden',
  },
  containerError: {
    backgroundColor: '#fff1f0',
  },
  iconContainer: {
    width: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  input: {
    flex: 1,
    color: '#333',
    fontSize: 16,
    paddingVertical: 12,
  },
  border: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: '#4CAF50',
    transform: [{ scaleX: 0 }],
  },
  borderError: {
    backgroundColor: '#ff4444',
    transform: [{ scaleX: 1 }],
  },
});
