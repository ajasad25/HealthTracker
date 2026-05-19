import React from 'react';
import { View, Text } from 'react-native';

export default function ErrorBanner({ message }: { message?: string | null }) {
  if (!message) return null;
  return (
    <View
      className="bg-danger-50 border border-danger-200 rounded-xl p-3 mb-4"
      accessibilityRole="alert"
    >
      <Text className="text-danger-600 text-sm text-center">{message}</Text>
    </View>
  );
}
