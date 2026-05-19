import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface AlertBannerProps {
  messages: string[];
}

export default function AlertBanner({ messages }: AlertBannerProps) {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed || messages.length === 0) return null;

  return (
    <View className="bg-danger-50 border border-danger-200 rounded-2xl p-4 mb-4">
      <View className="flex-row justify-between items-start">
        <View className="flex-row items-center flex-1">
          <Text className="text-lg mr-2">⚠️</Text>
          <Text className="text-danger-700 font-bold text-sm flex-1">
            Health Alert
          </Text>
        </View>
        <TouchableOpacity onPress={() => setDismissed(true)} className="p-1">
          <Text className="text-danger-400 text-lg">✕</Text>
        </TouchableOpacity>
      </View>
      {messages.map((msg, index) => (
        <Text key={index} className="text-danger-600 text-sm mt-1 ml-7">
          • {msg}
        </Text>
      ))}
    </View>
  );
}
