import React, { useMemo } from 'react';
import { View, Text } from 'react-native';
import { useAppSelector } from '../hooks/useAppSelector';
import CalmScreen from '../components/CalmScreen';
import CalmCard from '../components/CalmCard';
import SectionHead from '../components/SectionHead';
import BigStat from '../components/BigStat';
import Sparkline from '../components/Sparkline';
import Icon from '../components/Icon';
import { colors, fonts } from '../theme';

/**
 * Trends — stub screen for the FAB tab bar's "Trends" slot. Surfaces a
 * 7-day heart-rate trend from real entries; deeper analytics are a follow-up.
 */
export default function TrendsScreen() {
  const entries = useAppSelector((s) => s.health.entries);

  const hr = useMemo(
    () =>
      entries
        .slice(0, 10)
        .map((e) => e.heartRate)
        .reverse(),
    [entries]
  );
  const avg = hr.length
    ? Math.round(hr.reduce((a, b) => a + b, 0) / hr.length)
    : 0;

  return (
    <CalmScreen tabBarSpace contentContainerStyle={{ paddingHorizontal: 22 }}>
      <View style={{ marginBottom: 24 }}>
        <Text
          style={{
            fontFamily: fonts.mono,
            fontSize: 10,
            color: colors.ink3,
            textTransform: 'uppercase',
            letterSpacing: 1.6,
            marginBottom: 6,
          }}
        >
          Insights · {entries.length} entries
        </Text>
        <Text
          style={{
            fontFamily: fonts.serifItalic,
            fontSize: 30,
            color: colors.ink,
            lineHeight: 34,
            letterSpacing: -0.6,
          }}
        >
          Your trends.
        </Text>
      </View>

      <CalmCard style={{ marginBottom: 14 }}>
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'flex-end',
            justifyContent: 'space-between',
            marginBottom: 12,
          }}
        >
          <Text
            style={{
              fontFamily: fonts.mono,
              fontSize: 10,
              color: colors.ink3,
              textTransform: 'uppercase',
              letterSpacing: 1.4,
            }}
          >
            Avg heart rate · recent
          </Text>
          <BigStat value={avg || '—'} unit="bpm" size={20} />
        </View>
        {hr.length >= 2 ? (
          <Sparkline data={hr} color={colors.rose} width={300} height={56} />
        ) : (
          <Text style={{ fontFamily: fonts.sans, fontSize: 13, color: colors.ink3 }}>
            Log a few entries to see your trend line.
          </Text>
        )}
      </CalmCard>

      <SectionHead title="Coming soon" />
      <CalmCard>
        <View style={{ flexDirection: 'row', gap: 14, alignItems: 'flex-start' }}>
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: colors.tealSoft,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="sparkle" size={20} color={colors.teal} />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: fonts.sansSemibold,
                fontSize: 14,
                color: colors.ink,
                marginBottom: 4,
              }}
            >
              Deeper analytics
            </Text>
            <Text
              style={{
                fontFamily: fonts.sans,
                fontSize: 13,
                color: colors.ink3,
                lineHeight: 19,
              }}
            >
              Multi-metric correlations, weekly digests and personalized range
              insights are on the way.
            </Text>
          </View>
        </View>
      </CalmCard>
    </CalmScreen>
  );
}
