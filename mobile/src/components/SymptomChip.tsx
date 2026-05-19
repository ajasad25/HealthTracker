import React from 'react';
import { TouchableOpacity, Text, View } from 'react-native';
import Icon from './Icon';
import { colors, fonts } from '../theme';

interface SymptomChipProps {
  label: string;
  selected: boolean;
  onToggle: () => void;
}

/** Clinical-Calm selectable chip — ink fill + check when selected. */
export default function SymptomChip({
  label,
  selected,
  onToggle,
}: SymptomChipProps) {
  return (
    <TouchableOpacity
      onPress={onToggle}
      activeOpacity={0.7}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ selected }}
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        paddingVertical: 8,
        paddingHorizontal: 12,
        borderRadius: 999,
        marginRight: 6,
        marginBottom: 6,
        backgroundColor: selected ? colors.ink : colors.surface,
        borderWidth: 1,
        borderColor: selected ? colors.ink : colors.hair,
      }}
    >
      {selected ? (
        <View>
          <Icon name="check" size={12} color={colors.bg} stroke={2} />
        </View>
      ) : null}
      <Text
        style={{
          fontFamily: fonts.sansMedium,
          fontSize: 12,
          color: selected ? colors.bg : colors.ink2,
        }}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
