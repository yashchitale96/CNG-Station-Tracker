import React from 'react';
import { Text, TextProps, useColorScheme } from 'react-native';
import Colors from '@/constants/Colors';

interface ThemedTextProps extends TextProps {
  type?: 'default' | 'title' | 'subtitle' | 'link';
}

export function ThemedText({ style, type = 'default', ...props }: ThemedTextProps) {
  const colorScheme = useColorScheme() ?? 'light';
  const colors = Colors[colorScheme];

  const getTextStyle = () => {
    switch (type) {
      case 'title':
        return {
          fontSize: 20,
          fontWeight: '700' as const,
          color: colors.text,
        };
      case 'subtitle':
        return {
          fontSize: 16,
          color: colors.text,
          opacity: 0.8,
        };
      case 'link':
        return {
          fontSize: 16,
          color: colors.tint,
          textDecorationLine: 'underline' as const,
        };
      default:
        return {
          fontSize: 16,
          color: colors.text,
        };
    }
  };

  return (
    <Text 
      style={[
        getTextStyle(),
        style
      ]} 
      {...props} 
    />
  );
}
