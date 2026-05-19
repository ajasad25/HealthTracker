import React from 'react';
import { View, Text } from 'react-native';

interface EmptyStateProps {
  icon: string;
  title: string;
  subtitle: string;
}

export default function EmptyState({ icon, title, subtitle }: EmptyStateProps) {
  return (
    <View className="flex-1 items-center justify-center py-16 px-8">
      <Text className="text-6xl mb-4">{icon}</Text>
      <Text className="text-lg font-semibold text-neutral-700 text-center mb-2">
        {title}
      </Text>
      <Text className="text-sm text-neutral-400 text-center">{subtitle}</Text>
    </View>
  );
}
