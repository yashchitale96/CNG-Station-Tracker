import React from 'react';
import { View, ViewProps, useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';

interface ThemedViewProps extends ViewProps {
  lightBg?: string;
  darkBg?: string;
}

export function ThemedView({ style, lightBg, darkBg, ...props }: ThemedViewProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const backgroundColor = colorScheme === 'dark' 
    ? (darkBg || Colors[colorScheme].background)
    : (lightBg || Colors[colorScheme].background);

  return (
    <View 
      style={[
        { backgroundColor },
        style
      ]} 
      {...props} 
    />
  );
}
