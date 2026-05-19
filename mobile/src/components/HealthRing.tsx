import React from 'react';
import { View, Text } from 'react-native';
import Svg, { Circle } from 'react-native-svg';
import { colors, fonts } from '../theme';

interface Props {
  score?: number;
  size?: number;
  stroke?: number;
  color?: string;
  label?: string;
}

/** Overall wellness donut with editorial serif score — from atoms.jsx. */
export default function HealthRing({
  score = 86,
  size = 168,
  stroke = 12,
  color = colors.teal,
  label = 'Wellness',
}: Props) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const off = c * (1 - score / 100);

  return (
    <View style={{ width: size, height: size }}>
      <Svg
        width={size}
        height={size}
        style={{ transform: [{ rotate: '-90deg' }] }}
      >
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={colors.hair}
          strokeWidth={stroke}
        />
        <Circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke={color}
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={c}
          strokeDashoffset={off}
        />
      </Svg>
      <View
        style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text
          style={{
            fontFamily: fonts.serifItalic,
            fontSize: size * 0.33,
            color: colors.ink,
            lineHeight: size * 0.33,
            letterSpacing: -1,
          }}
        >
          {score}
        </Text>
        <Text
          style={{
            fontFamily: fonts.mono,
            fontSize: 10,
            color: colors.ink3,
            textTransform: 'uppercase',
            letterSpacing: 1.6,
            marginTop: 6,
          }}
        >
          {label}
        </Text>
      </View>
    </View>
  );
}
