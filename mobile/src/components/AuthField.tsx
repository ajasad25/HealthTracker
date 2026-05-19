import React from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  type TextInputProps,
} from 'react-native';
import Icon, { type IconName } from './Icon';
import { colors, fonts } from '../theme';

interface Props extends TextInputProps {
  label: string;
  icon: IconName;
  error?: string;
  /** Right-side accent action shown next to the label (e.g. "Forgot?"). */
  labelAction?: string;
  onLabelAction?: () => void;
  /** Renders an eye toggle on the right of the field. */
  secureToggle?: { shown: boolean; onToggle: () => void };
}

/** Clinical-Calm labelled text field — used by Login & Signup. */
export default function AuthField({
  label,
  icon,
  error,
  labelAction,
  onLabelAction,
  secureToggle,
  ...input
}: Props) {
  return (
    <View style={{ marginBottom: 16 }}>
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 8,
        }}
      >
        <Text
          style={{
            fontFamily: fonts.mono,
            fontSize: 11,
            color: colors.ink3,
            textTransform: 'uppercase',
            letterSpacing: 1.6,
          }}
        >
          {label}
        </Text>
        {labelAction ? (
          <TouchableOpacity onPress={onLabelAction} accessibilityRole="button">
            <Text
              style={{
                fontFamily: fonts.sansSemibold,
                fontSize: 12,
                color: colors.teal,
              }}
            >
              {labelAction}
            </Text>
          </TouchableOpacity>
        ) : null}
      </View>

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 10,
          backgroundColor: colors.surface,
          borderRadius: 14,
          borderWidth: 1,
          borderColor: error ? colors.coral : colors.hair,
          paddingHorizontal: 16,
          paddingVertical: 14,
        }}
      >
        <Icon name={icon} size={18} color={colors.ink3} />
        <TextInput
          style={{
            flex: 1,
            fontFamily: fonts.sansMedium,
            fontSize: 15,
            color: colors.ink,
            padding: 0,
          }}
          placeholderTextColor={colors.ink4}
          {...input}
        />
        {secureToggle ? (
          <TouchableOpacity
            onPress={secureToggle.onToggle}
            accessibilityRole="button"
            accessibilityLabel={
              secureToggle.shown ? 'Hide password' : 'Show password'
            }
          >
            <Icon
              name={secureToggle.shown ? 'eyeOff' : 'eye'}
              size={18}
              color={colors.ink3}
            />
          </TouchableOpacity>
        ) : null}
      </View>

      {error ? (
        <Text
          style={{
            fontFamily: fonts.sans,
            fontSize: 12,
            color: colors.coral,
            marginTop: 6,
          }}
        >
          {error}
        </Text>
      ) : null}
    </View>
  );
}
