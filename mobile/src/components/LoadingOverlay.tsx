import React from 'react';
import { View, ActivityIndicator } from 'react-native';

export default function LoadingOverlay() {
  return (
    <View className="absolute inset-0 bg-black/30 items-center justify-center z-50">
      <View className="bg-white rounded-2xl p-6">
        <ActivityIndicator size="large" color="#0077A8" />
      </View>
    </View>
  );
}
