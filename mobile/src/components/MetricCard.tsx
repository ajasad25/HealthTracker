import React from 'react';
import { View, Text } from 'react-native';
import type { VitalStatus } from '../types';
import { colors, fonts, radii } from '../theme';
import Icon, { type IconName } from './Icon';
import StatusPill from './StatusPill';
import BigStat from './BigStat';
import Sparkline from './Sparkline';

interface MetricCardProps {
  label: string;
  value: string | number;
  unit: string;
  status: VitalStatus;
  /** Optional accent icon shown beside the label. */
  icon?: IconName;
  /** Optional sparkline series (needs ≥2 points to render). */
  data?: number[];
  /** Accent color for the icon + sparkline. */
  color?: string;
}

/**
 * Clinical-Calm vital card: mono label + status pill, editorial serif
 * stat, optional mini sparkline. Public API (label/value/unit/status) is
 * unchanged so existing consumers and tests keep working.
 */
export default function MetricCard({
  label,
  value,
  unit,
  status,
  icon,
  data,
  color = colors.teal,
}: MetricCardProps) {
  return (
    <View
      style={{
        flex: 1,
        minWidth: '45%',
        backgroundColor: colors.surface,
        borderRadius: radii.lg,
        borderWidth: 1,
        borderColor: colors.hairSoft,
        padding: 14,
        gap: 12,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8, flex: 1 }}>
          {icon ? <Icon name={icon} size={16} color={color} /> : null}
          <Text
            style={{
              fontFamily: fonts.monoMedium,
              fontSize: 11,
              color: colors.ink3,
              textTransform: 'uppercase',
              letterSpacing: 1.2,
            }}
          >
            {label}
          </Text>
        </View>
        <StatusPill status={status} />
      </View>

      <BigStat value={value} unit={unit} size={30} />

      {data && data.length >= 2 ? (
        <Sparkline data={data} color={color} width={150} height={26} />
      ) : null}
    </View>
  );
}
