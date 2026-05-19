import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import type { HealthEntry } from '../types';
import { formatDateTime } from '../utils/formatters';

interface EntryListItemProps {
  entry: HealthEntry;
  onPress: () => void;
}

export default function EntryListItem({ entry, onPress }: EntryListItemProps) {
  return (
    <TouchableOpacity
      className="bg-white rounded-2xl p-4 mb-3 border border-neutral-100"
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View className="flex-row justify-between items-start mb-2">
        <Text className="text-sm font-medium text-neutral-700">
          {formatDateTime(entry.timestamp)}
        </Text>
        {entry.hasAlert ? (
          <View className="bg-danger-100 rounded-full px-2.5 py-0.5">
            <Text className="text-xs font-bold text-danger-600">⚠ Alert</Text>
          </View>
        ) : null}
      </View>

      <View className="flex-row flex-wrap gap-2">
        <View className="bg-primary-50 rounded-lg px-2.5 py-1">
          <Text className="text-xs text-primary-700 font-medium">
            ❤️ {entry.heartRate} bpm
          </Text>
        </View>
        <View className="bg-primary-50 rounded-lg px-2.5 py-1">
          <Text className="text-xs text-primary-700 font-medium">
            🫁 {entry.spo2}%
          </Text>
        </View>
        <View className="bg-primary-50 rounded-lg px-2.5 py-1">
          <Text className="text-xs text-primary-700 font-medium">
            🌡️ {entry.temperature}°C
          </Text>
        </View>
        {entry.symptoms.length > 0 ? (
          <View className="bg-warning-50 rounded-lg px-2.5 py-1">
            <Text className="text-xs text-warning-700 font-medium">
              {entry.symptoms.length} symptom{entry.symptoms.length !== 1 ? 's' : ''}
            </Text>
          </View>
        ) : null}
      </View>

      <View className="flex-row justify-end mt-2">
        <Text className="text-neutral-400 text-sm">›</Text>
      </View>
    </TouchableOpacity>
  );
}
