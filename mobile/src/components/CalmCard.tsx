import React from 'react';
import { View, type ViewStyle } from 'react-native';
import { colors, radii } from '../theme';

interface Props {
  children: React.ReactNode;
  style?: ViewStyle | ViewStyle[];
  padded?: boolean;
}

/** Soft white surface with hairline border — from atoms.jsx Card. */
export default function CalmCard({ children, style, padded = true }: Props) {
  return (
    <View
      style={[
        {
          backgroundColor: colors.surface,
          borderRadius: radii.lg,
          borderWidth: 1,
          borderColor: colors.hairSoft,
          padding: padded ? 18 : 0,
        },
        style as ViewStyle,
      ]}
    >
      {children}
    </View>
  );
}
