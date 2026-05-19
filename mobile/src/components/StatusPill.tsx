import React from 'react';
import { View, Text } from 'react-native';
import { fonts, statusColor } from '../theme';
import type { VitalStatus } from '../types';

interface Props {
  status: VitalStatus;
  label?: string;
  size?: 'sm' | 'lg';
}

/** Colored-dot + label pill — from atoms.jsx StatusPill. */
export default function StatusPill({ status, label, size = 'sm' }: Props) {
  const s = statusColor[status] ?? statusColor.normal;
  const lg = size === 'lg';

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        alignSelf: 'flex-start',
        gap: 6,
        paddingVertical: lg ? 6 : 3,
        paddingHorizontal: lg ? 12 : 8,
        borderRadius: 999,
        backgroundColor: s.tint,
      }}
    >
      <View
        style={{
          width: 6,
          height: 6,
          borderRadius: 999,
          backgroundColor: s.dot,
        }}
      />
      <Text
        style={{
          color: '#2A3331',
          fontFamily: fonts.sansSemibold,
          fontSize: lg ? 12 : 11,
          letterSpacing: 0.1,
        }}
      >
        {label ?? s.text}
      </Text>
    </View>
  );
}
