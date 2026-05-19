import React from 'react';
import { TouchableOpacity, Text } from 'react-native';

interface SymptomChipProps {
  label: string;
  selected: boolean;
  onToggle: () => void;
}

export default function SymptomChip({ label, selected, onToggle }: SymptomChipProps) {
  return (
    <TouchableOpacity
      className={`rounded-full px-4 py-2 mr-2 mb-2 border ${
        selected
          ? 'bg-primary-500 border-primary-500'
          : 'bg-white border-neutral-300'
      }`}
      onPress={onToggle}
      activeOpacity={0.7}
    >
      <Text
        className={`text-sm font-medium ${
          selected ? 'text-white' : 'text-neutral-600'
        }`}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
}
