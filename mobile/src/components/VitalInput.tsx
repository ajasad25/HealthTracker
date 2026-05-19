import React from 'react';
import { View, Text, TextInput, type TextInputProps } from 'react-native';
import Icon, { type IconName } from './Icon';
import { colors, fonts, radii } from '../theme';

interface VitalInputProps extends Omit<TextInputProps, 'onChangeText'> {
  label: string;
  unit?: string;
  error?: string;
  onChangeText: (text: string) => void;
  /** Accent icon for the leading tile. */
  icon?: IconName;
  color?: string;
  /** Helper line under the label (e.g. "Resting · 60–100"). */
  hint?: string;
}

/**
 * Clinical-Calm input row: accent icon tile, label + hint, and a
 * right-aligned editable serif value with a mono unit. Public API
 * (label/unit/error/onChangeText) is unchanged.
 */
export default function VitalInput({
  label,
  unit,
  error,
  onChangeText,
  icon,
  color = colors.teal,
  hint,
  ...props
}: VitalInputProps) {
  return (
    <View style={{ marginBottom: 10 }}>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 14,
          backgroundColor: colors.surface,
          borderRadius: radii.lg,
          borderWidth: 1,
          borderColor: error ? colors.coral : colors.hairSoft,
          paddingHorizontal: 16,
          paddingVertical: 12,
        }}
      >
        {icon ? (
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: color + '22',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name={icon} size={20} color={color} />
          </View>
        ) : null}

        <View style={{ flex: 1 }}>
          <Text
            style={{
              fontFamily: fonts.sansMedium,
              fontSize: 12,
              color: colors.ink3,
              marginBottom: hint ? 2 : 0,
            }}
          >
            {label}
          </Text>
          {hint ? (
            <Text
              style={{ fontFamily: fonts.sans, fontSize: 11, color: colors.ink4 }}
            >
              {hint}
            </Text>
          ) : null}
        </View>

        <View style={{ alignItems: 'flex-end' }}>
          <TextInput
            style={{
              fontFamily: fonts.serifItalic,
              fontSize: 22,
              color: colors.ink,
              padding: 0,
              minWidth: 64,
              textAlign: 'right',
            }}
            keyboardType="numeric"
            placeholderTextColor={colors.ink4}
            onChangeText={onChangeText}
            {...props}
          />
          {unit ? (
            <Text
              style={{
                fontFamily: fonts.mono,
                fontSize: 10,
                color: colors.ink3,
                letterSpacing: 1,
                textTransform: 'uppercase',
                marginTop: 3,
              }}
            >
              {unit}
            </Text>
          ) : null}
        </View>
      </View>

      {error ? (
        <Text
          style={{
            fontFamily: fonts.sans,
            fontSize: 12,
            color: colors.coral,
            marginTop: 4,
            marginLeft: 4,
          }}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}
