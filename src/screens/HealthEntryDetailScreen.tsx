import React from 'react';
import { View, Text, ScrollView } from 'react-native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { useAppSelector } from '../hooks/useAppSelector';
import {
  formatDateTime,
  getHeartRateStatus,
  getSpo2Status,
  getTemperatureStatus,
  getBloodPressureStatus,
} from '../utils/formatters';
import { checkForAlerts } from '../utils/alertLogic';
import MetricCard from '../components/MetricCard';
import type { HistoryStackParamList } from '../types';

type Props = NativeStackScreenProps<HistoryStackParamList, 'EntryDetail'>;

export default function HealthEntryDetailScreen({ route }: Props) {
  const { entryId } = route.params;
  const entry = useAppSelector((state) =>
    state.health.entries.find((e) => e.id === entryId)
  );

  if (!entry) {
    return (
      <View className="flex-1 items-center justify-center bg-neutral-50">
        <Text className="text-neutral-500">Entry not found</Text>
      </View>
    );
  }

  const alertResult = checkForAlerts(entry);

  return (
    <ScrollView className="flex-1 bg-neutral-50">
      <View className="px-6 py-6">
        <Text className="text-sm text-neutral-400 mb-6">
          {formatDateTime(entry.timestamp)}
        </Text>

        {entry.hasAlert ? (
          <View className="bg-danger-50 border border-danger-200 rounded-2xl p-4 mb-4">
            <Text className="text-danger-700 font-bold text-sm mb-2">
              ⚠️ Health Alerts
            </Text>
            {alertResult.messages.map((msg, index) => (
              <Text key={index} className="text-danger-600 text-sm mt-1">
                • {msg}
              </Text>
            ))}
          </View>
        ) : (
          <View className="bg-success-50 border border-success-200 rounded-2xl p-4 mb-4">
            <Text className="text-success-700 font-semibold text-sm">
              ✅ All vitals within normal range
            </Text>
          </View>
        )}

        <Text className="text-base font-semibold text-neutral-800 mb-3">
          Vital Signs
        </Text>

        <View className="flex-row flex-wrap gap-3 mb-3">
          <MetricCard
            label="Heart Rate"
            value={entry.heartRate}
            unit="bpm"
            status={getHeartRateStatus(entry.heartRate)}
          />
          <MetricCard
            label="Blood Pressure"
            value={`${entry.systolic}/${entry.diastolic}`}
            unit="mmHg"
            status={getBloodPressureStatus(entry.systolic, entry.diastolic)}
          />
        </View>
        <View className="flex-row flex-wrap gap-3 mb-6">
          <MetricCard
            label="SpO2"
            value={entry.spo2}
            unit="%"
            status={getSpo2Status(entry.spo2)}
          />
          <MetricCard
            label="Temperature"
            value={entry.temperature}
            unit="°C"
            status={getTemperatureStatus(entry.temperature)}
          />
        </View>

        {entry.symptoms.length > 0 ? (
          <>
            <Text className="text-base font-semibold text-neutral-800 mb-3">
              Symptoms
            </Text>
            <View className="flex-row flex-wrap mb-6">
              {entry.symptoms.map((symptom) => (
                <View
                  key={symptom}
                  className="bg-warning-100 rounded-full px-3 py-1.5 mr-2 mb-2"
                >
                  <Text className="text-sm text-warning-700 font-medium">
                    {symptom}
                  </Text>
                </View>
              ))}
            </View>
          </>
        ) : (
          <View className="mb-6">
            <Text className="text-base font-semibold text-neutral-800 mb-2">
              Symptoms
            </Text>
            <Text className="text-sm text-neutral-400">No symptoms reported</Text>
          </View>
        )}

        {entry.notes ? (
          <>
            <Text className="text-base font-semibold text-neutral-800 mb-2">
              Notes
            </Text>
            <View className="bg-white border border-neutral-200 rounded-xl p-4">
              <Text className="text-sm text-neutral-700 leading-5">
                {entry.notes}
              </Text>
            </View>
          </>
        ) : null}
      </View>
    </ScrollView>
  );
}
