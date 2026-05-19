import React from 'react';
import { View, Text } from 'react-native';
import { colors, fonts } from '../theme';

interface Props {
  value: string | number;
  unit?: string;
  color?: string;
  size?: number;
}

/** Editorial serif-italic stat with mono unit — from atoms.jsx BigStat. */
export default function BigStat({
  value,
  unit,
  color = colors.ink,
  size = 36,
}: Props) {
  return (
    <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
      <Text
        style={{
          fontFamily: fonts.serifItalic,
          fontSize: size,
          color,
          lineHeight: size,
          letterSpacing: -0.8,
        }}
      >
        {value}
      </Text>
      {unit ? (
        <Text
          style={{
            fontFamily: fonts.mono,
            fontSize: 10,
            color: colors.ink3,
            letterSpacing: 1,
            textTransform: 'uppercase',
            marginLeft: 4,
            marginBottom: 2,
          }}
        >
          {unit}
        </Text>
      ) : null}
    </View>
  );
}
