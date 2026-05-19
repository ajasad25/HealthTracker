import React from 'react';
import { View, Text } from 'react-native';
import Icon from './Icon';
import { colors, fonts, radii } from '../theme';

export default function ErrorBanner({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <View
      accessibilityRole="alert"
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
        backgroundColor: colors.coralTint,
        borderRadius: radii.md,
        padding: 12,
        marginBottom: 16,
      }}
    >
      <Icon name="alert" size={16} color={colors.coral} stroke={2} />
      <Text
        style={{
          flex: 1,
          fontFamily: fonts.sansMedium,
          fontSize: 13,
          color: '#7C2F1B',
        }}
      >
        {message}
      </Text>
    </View>
  );
}
