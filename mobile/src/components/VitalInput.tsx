import React from 'react';
import { View, Text, TextInput, type TextInputProps } from 'react-native';

interface VitalInputProps extends Omit<TextInputProps, 'onChangeText'> {
  label: string;
  unit?: string;
  error?: string;
  onChangeText: (text: string) => void;
}

export default function VitalInput({
  label,
  unit,
  error,
  onChangeText,
  ...props
}: VitalInputProps) {
  return (
    <View className="mb-4">
      <Text className="text-sm font-medium text-neutral-700 mb-1.5">{label}</Text>
      <View className="flex-row items-center">
        <TextInput
          className={`flex-1 bg-white border rounded-xl px-4 py-3 text-base text-neutral-900 ${
            error ? 'border-danger-400' : 'border-neutral-300'
          }`}
          keyboardType="numeric"
          placeholderTextColor="#9CA3AF"
          onChangeText={onChangeText}
          {...props}
        />
        {unit ? (
          <Text className="ml-2 text-sm text-neutral-500 w-12">{unit}</Text>
        ) : null}
      </View>
      {error ? (
        <Text className="text-xs text-danger-500 mt-1">{error}</Text>
      ) : null}
    </View>
  );
}
