import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { colors, fonts } from '../theme';

interface Props {
  title: string;
  action?: string;
  accent?: string;
  onAction?: () => void;
}

/** Uppercase mono section label with optional right action — atoms.jsx. */
export default function SectionHead({ title, action, accent, onAction }: Props) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'flex-end',
        justifyContent: 'space-between',
        marginBottom: 12,
      }}
    >
      <Text
        style={{
          fontFamily: fonts.monoMedium,
          fontSize: 10,
          color: accent ?? colors.ink3,
          textTransform: 'uppercase',
          letterSpacing: 1.8,
        }}
      >
        {title}
      </Text>
      {action ? (
        <TouchableOpacity
          onPress={onAction}
          disabled={!onAction}
          accessibilityRole={onAction ? 'button' : undefined}
        >
          <Text
            style={{
              fontFamily: fonts.sansMedium,
              fontSize: 12,
              color: colors.teal,
            }}
          >
            {action}
          </Text>
        </TouchableOpacity>
      ) : null}
    </View>
  );
}
