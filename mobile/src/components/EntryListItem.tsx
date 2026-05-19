import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { isToday, isYesterday, format } from 'date-fns';
import type { HealthEntry } from '../types';
import { formatDateTime, getHeartRateStatus } from '../utils/formatters';
import { colors, fonts, radii } from '../theme';
import StatusPill from './StatusPill';

interface EntryListItemProps {
  entry: HealthEntry;
  onPress: () => void;
}

function relativeDate(ts: string): string {
  const d = new Date(ts);
  if (isToday(d)) return 'Today';
  if (isYesterday(d)) return 'Yesterday';
  return format(d, 'MMM d');
}

function Tiny({
  label,
  value,
  unit,
  alert,
}: {
  label: string;
  value: string | number;
  unit: string;
  alert?: boolean;
}) {
  return (
    <View style={{ flex: 1 }}>
      <Text
        style={{
          fontFamily: fonts.mono,
          fontSize: 9,
          color: colors.ink4,
          textTransform: 'uppercase',
          letterSpacing: 1.2,
        }}
      >
        {label}
      </Text>
      <Text
        style={{
          fontFamily: fonts.serifItalic,
          fontSize: 16,
          color: alert ? colors.coral : colors.ink,
          marginTop: 2,
        }}
      >
        {value}
      </Text>
      <Text style={{ fontFamily: fonts.sans, fontSize: 9, color: colors.ink4 }}>
        {unit}
      </Text>
    </View>
  );
}

/** Clinical-Calm history card — relative date, status pill, vital grid. */
export default function EntryListItem({ entry, onPress }: EntryListItemProps) {
  const alert = entry.hasAlert;
  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.85}
      accessibilityRole="button"
      accessibilityLabel={`Health entry ${formatDateTime(entry.timestamp)}`}
      style={{
        backgroundColor: colors.surface,
        borderRadius: radii.lg,
        borderWidth: 1,
        borderColor: alert ? colors.coralTint : colors.hairSoft,
        padding: 16,
        marginBottom: 8,
      }}
    >
      {alert ? (
        <View
          style={{
            position: 'absolute',
            left: 0,
            top: 18,
            bottom: 18,
            width: 3,
            borderRadius: 999,
            backgroundColor: colors.coral,
          }}
        />
      ) : null}

      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 10,
        }}
      >
        <View>
          <Text
            style={{
              fontFamily: fonts.sansSemibold,
              fontSize: 14,
              color: colors.ink,
            }}
          >
            {relativeDate(entry.timestamp)}
          </Text>
          <Text
            style={{
              fontFamily: fonts.sans,
              fontSize: 11,
              color: colors.ink3,
              marginTop: 1,
            }}
          >
            {format(new Date(entry.timestamp), 'h:mm a')}
          </Text>
        </View>
        <StatusPill
          status={alert ? 'danger' : 'normal'}
          label={alert ? 'Alert' : 'Normal'}
        />
      </View>

      <View style={{ flexDirection: 'row', gap: 6 }}>
        <Tiny
          label="HR"
          value={entry.heartRate}
          unit="bpm"
          alert={getHeartRateStatus(entry.heartRate) === 'danger'}
        />
        <Tiny
          label="BP"
          value={`${entry.systolic}/${entry.diastolic}`}
          unit="mmHg"
        />
        <Tiny label="SpO₂" value={entry.spo2} unit="%" />
        <Tiny label="Temp" value={entry.temperature} unit="°C" />
      </View>

      {entry.symptoms.length > 0 ? (
        <View
          style={{
            flexDirection: 'row',
            gap: 6,
            marginTop: 10,
            flexWrap: 'wrap',
          }}
        >
          {entry.symptoms.slice(0, 4).map((t) => (
            <View
              key={t}
              style={{
                paddingVertical: 3,
                paddingHorizontal: 8,
                borderRadius: 999,
                backgroundColor: colors.bgSoft,
              }}
            >
              <Text
                style={{
                  fontFamily: fonts.sansMedium,
                  fontSize: 10,
                  color: colors.ink2,
                }}
              >
                {t}
              </Text>
            </View>
          ))}
        </View>
      ) : null}
    </TouchableOpacity>
  );
}
