import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';

interface GlassCardProps extends ViewProps {
  intensity?: number;
}

export const GlassCard: React.FC<GlassCardProps> = ({ children, style, intensity = 0.95, ...props }) => {
  return (
    <View
      style={[
        styles.container,
        { backgroundColor: `rgba(255, 255, 255, ${intensity})` },
        style,
      ]}
      {...props}
    >
      {children}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 10,
    },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 10,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
});
