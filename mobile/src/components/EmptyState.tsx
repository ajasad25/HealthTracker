import React from 'react';
import { View, Text } from 'react-native';
import { colors, fonts } from '../theme';

interface EmptyStateProps {
  icon: string;
  title: string;
  subtitle: string;
}

/** Clinical-Calm empty state — editorial serif title, calm copy. */
export default function EmptyState({ icon, title, subtitle }: EmptyStateProps) {
  return (
    <View
      style={{
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 64,
        paddingHorizontal: 32,
      }}
    >
      <View
        style={{
          width: 60,
          height: 60,
          borderRadius: 20,
          backgroundColor: colors.tealSoft,
          alignItems: 'center',
          justifyContent: 'center',
          marginBottom: 16,
        }}
      >
        <Text style={{ fontSize: 26 }}>{icon}</Text>
      </View>
      <Text
        style={{
          fontFamily: fonts.serifItalic,
          fontSize: 22,
          color: colors.ink,
          textAlign: 'center',
          marginBottom: 6,
        }}
      >
        {title}
      </Text>
      <Text
        style={{
          fontFamily: fonts.sans,
          fontSize: 13,
          color: colors.ink3,
          textAlign: 'center',
          lineHeight: 19,
        }}
      >
        {subtitle}
      </Text>
    </View>
  );
}
