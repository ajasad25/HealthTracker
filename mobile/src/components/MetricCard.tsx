import React from 'react';
import { View, Text } from 'react-native';
import type { VitalStatus } from '../types';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit: string;
  status: VitalStatus;
}

const statusColors = {
  normal: {
    bg: 'bg-success-50',
    border: 'border-success-200',
    dot: 'bg-success-500',
    text: 'text-success-700',
  },
  warning: {
    bg: 'bg-warning-50',
    border: 'border-warning-200',
    dot: 'bg-warning-500',
    text: 'text-warning-700',
  },
  danger: {
    bg: 'bg-danger-50',
    border: 'border-danger-200',
    dot: 'bg-danger-500',
    text: 'text-danger-700',
  },
};

export default function MetricCard({ label, value, unit, status }: MetricCardProps) {
  const colors = statusColors[status];

  return (
    <View
      className={`${colors.bg} ${colors.border} border rounded-2xl p-4 flex-1 min-w-[45%]`}
    >
      <View className="flex-row items-center mb-2">
        <View className={`w-2.5 h-2.5 rounded-full ${colors.dot} mr-2`} />
        <Text className="text-xs text-neutral-500 font-medium uppercase tracking-wide">
          {label}
        </Text>
      </View>
      <View className="flex-row items-baseline">
        <Text className={`text-2xl font-bold ${colors.text}`}>{value}</Text>
        <Text className="text-sm text-neutral-400 ml-1">{unit}</Text>
      </View>
    </View>
  );
}
