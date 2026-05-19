import React, { useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { isToday, format } from 'date-fns';
import { useAppSelector } from '../hooks/useAppSelector';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { fetchEntriesThunk } from '../store/healthSlice';
import {
  getGreeting,
  getHeartRateStatus,
  getSpo2Status,
  getTemperatureStatus,
  getBloodPressureStatus,
  formatTime,
} from '../utils/formatters';
import { checkForAlerts } from '../utils/alertLogic';
import CalmScreen from '../components/CalmScreen';
import MetricCard from '../components/MetricCard';
import HealthRing from '../components/HealthRing';
import StatusPill from '../components/StatusPill';
import SectionHead from '../components/SectionHead';
import Icon from '../components/Icon';
import ErrorBanner from '../components/ErrorBanner';
import { colors, fonts, radii } from '../theme';
import type { VitalStatus, HealthEntry, MainTabParamList } from '../types';

type DashboardNav = BottomTabNavigationProp<MainTabParamList, 'Dashboard'>;

const SCORE_BY_STATUS: Record<VitalStatus, number> = {
  normal: 25,
  warning: 16,
  danger: 8,
};

/** Last N values of `pick` across entries, oldest→newest, for sparklines. */
function series(entries: HealthEntry[], pick: (e: HealthEntry) => number, n = 8) {
  return entries
    .slice(0, n)
    .map(pick)
    .reverse();
}

export default function DashboardScreen() {
  const navigation = useNavigation<DashboardNav>();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const entries = useAppSelector((state) => state.health.entries);
  const healthError = useAppSelector((state) => state.health.error);

  useEffect(() => {
    if (user) dispatch(fetchEntriesThunk());
  }, [dispatch, user]);

  const todayEntry = useMemo(
    () => entries.find((e) => isToday(new Date(e.timestamp))),
    [entries]
  );
  const latest = todayEntry ?? entries[0];

  const statuses = useMemo(() => {
    if (!latest) return null;
    return {
      hr: getHeartRateStatus(latest.heartRate),
      spo2: getSpo2Status(latest.spo2),
      bp: getBloodPressureStatus(latest.systolic, latest.diastolic),
      temp: getTemperatureStatus(latest.temperature),
    };
  }, [latest]);

  const score = useMemo(() => {
    if (!statuses) return 0;
    return Object.values(statuses).reduce(
      (sum, s) => sum + SCORE_BY_STATUS[s],
      0
    );
  }, [statuses]);

  const inRange = statuses
    ? Object.values(statuses).filter((s) => s === 'normal').length
    : 0;

  const alertMessages = useMemo(
    () => (todayEntry ? checkForAlerts(todayEntry).messages : []),
    [todayEntry]
  );

  const recent = useMemo(() => entries.slice(0, 3), [entries]);

  return (
    <CalmScreen tabBarSpace contentContainerStyle={{ paddingHorizontal: 22 }}>
      <ErrorBanner message={healthError} />

      {/* Header */}
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          marginBottom: 24,
        }}
      >
        <View style={{ flex: 1 }}>
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
            {format(new Date(), 'EEE · MMM d')}
          </Text>
          <Text
            style={{
              fontFamily: fonts.serifItalic,
              fontSize: 28,
              color: colors.ink,
              lineHeight: 31,
              letterSpacing: -0.6,
            }}
          >
            {getGreeting()},{'\n'}
            {user?.name?.split(' ')[0] ?? 'there'}.
          </Text>
        </View>
        <View
          style={{
            width: 42,
            height: 42,
            borderRadius: 12,
            backgroundColor: colors.surface,
            borderWidth: 1,
            borderColor: colors.hairSoft,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name="bell" size={20} color={colors.ink2} />
          {alertMessages.length > 0 ? (
            <View
              style={{
                position: 'absolute',
                top: 9,
                right: 10,
                width: 8,
                height: 8,
                borderRadius: 999,
                backgroundColor: colors.coral,
                borderWidth: 1.5,
                borderColor: colors.surface,
              }}
            />
          ) : null}
        </View>
      </View>

      {latest ? (
        <>
          {/* Hero ring card */}
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: radii.xl,
              borderWidth: 1,
              borderColor: colors.hairSoft,
              padding: 20,
              marginBottom: 14,
              flexDirection: 'row',
              alignItems: 'center',
              gap: 18,
            }}
          >
            <HealthRing score={score} size={132} stroke={10} color={colors.teal} />
            <View style={{ flex: 1 }}>
              <Text
                style={{
                  fontFamily: fonts.mono,
                  fontSize: 9,
                  color: colors.ink3,
                  textTransform: 'uppercase',
                  letterSpacing: 1.6,
                  marginBottom: 6,
                }}
              >
                {todayEntry ? 'Today' : 'Latest'}
              </Text>
              <Text
                style={{
                  fontFamily: fonts.serifItalic,
                  fontSize: 20,
                  color: colors.ink,
                  lineHeight: 24,
                  marginBottom: 10,
                }}
              >
                {score >= 80
                  ? "You're doing well."
                  : score >= 60
                    ? 'Keep an eye out.'
                    : 'Needs attention.'}
              </Text>
              <StatusPill
                status={inRange === 4 ? 'normal' : inRange >= 2 ? 'warning' : 'danger'}
                label={`${inRange} vitals in range`}
              />
            </View>
          </View>

          {/* Alert banner */}
          {alertMessages.length > 0 ? (
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => navigation.navigate('History')}
              accessibilityRole="button"
              accessibilityLabel="View health alerts"
              style={{
                backgroundColor: colors.coralTint,
                borderRadius: radii.lg,
                padding: 14,
                marginBottom: 18,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <View
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: 12,
                  backgroundColor: colors.coral,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Icon name="alert" size={18} color={colors.white} stroke={2} />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    fontFamily: fonts.sansSemibold,
                    fontSize: 13,
                    color: '#7C2F1B',
                  }}
                >
                  {alertMessages[0]}
                </Text>
                {alertMessages.length > 1 ? (
                  <Text
                    style={{
                      fontFamily: fonts.sans,
                      fontSize: 11,
                      color: '#8C4634',
                      marginTop: 2,
                    }}
                  >
                    +{alertMessages.length - 1} more · tap to review
                  </Text>
                ) : null}
              </View>
              <Icon name="chevron" size={18} color="#7C2F1B" />
            </TouchableOpacity>
          ) : (
            <View style={{ marginBottom: 8 }} />
          )}

          {/* Vitals grid */}
          <SectionHead
            title="Today's vitals"
            action="View all"
            onAction={() => navigation.navigate('History')}
          />
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 10,
              marginBottom: 22,
            }}
          >
            <MetricCard
              icon="heart"
              label="Heart"
              value={latest.heartRate}
              unit="bpm"
              status={statuses!.hr}
              color={colors.rose}
              data={series(entries, (e) => e.heartRate)}
            />
            <MetricCard
              icon="lung"
              label="SpO₂"
              value={latest.spo2}
              unit="%"
              status={statuses!.spo2}
              color={colors.teal}
              data={series(entries, (e) => e.spo2)}
            />
            <MetricCard
              icon="drop"
              label="BP"
              value={`${latest.systolic}/${latest.diastolic}`}
              unit="mmHg"
              status={statuses!.bp}
              color={colors.amber}
              data={series(entries, (e) => e.systolic)}
            />
            <MetricCard
              icon="thermo"
              label="Temp"
              value={latest.temperature}
              unit="°C"
              status={statuses!.temp}
              color={colors.sage}
              data={series(entries, (e) => e.temperature)}
            />
          </View>
          <Text
            style={{
              fontFamily: fonts.sans,
              fontSize: 11,
              color: colors.ink4,
              marginTop: -12,
              marginBottom: 22,
            }}
          >
            Last updated · {formatTime(latest.timestamp)}
          </Text>
        </>
      ) : (
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: radii.xl,
            borderWidth: 1,
            borderColor: colors.hairSoft,
            padding: 28,
            marginBottom: 22,
            alignItems: 'center',
          }}
        >
          <View
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              backgroundColor: colors.tealSoft,
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 14,
            }}
          >
            <Icon name="pulse" size={24} color={colors.teal} />
          </View>
          <Text
            style={{
              fontFamily: fonts.serifItalic,
              fontSize: 22,
              color: colors.ink,
              marginBottom: 6,
            }}
          >
            No data yet.
          </Text>
          <Text
            style={{
              fontFamily: fonts.sans,
              fontSize: 13,
              color: colors.ink3,
              textAlign: 'center',
            }}
          >
            Tap the + to log your first vitals and start your trend.
          </Text>
        </View>
      )}

      {/* Recent activity */}
      {recent.length > 0 ? (
        <>
          <SectionHead
            title="This week"
            action="See history"
            onAction={() => navigation.navigate('History')}
          />
          <View style={{ gap: 8 }}>
            {recent.map((e) => (
              <TouchableOpacity
                key={e.id}
                activeOpacity={0.8}
                onPress={() => navigation.navigate('History')}
                accessibilityRole="button"
                accessibilityLabel={`Entry ${format(new Date(e.timestamp), 'EEE h:mm a')}`}
                style={{
                  backgroundColor: colors.surface,
                  borderRadius: radii.md,
                  borderWidth: 1,
                  borderColor: colors.hairSoft,
                  padding: 14,
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 12,
                }}
              >
                <Text
                  style={{
                    width: 40,
                    textAlign: 'center',
                    fontFamily: fonts.serifItalic,
                    fontSize: 18,
                    color: colors.ink,
                  }}
                >
                  {format(new Date(e.timestamp), 'EEE')}
                </Text>
                <View style={{ flex: 1 }}>
                  <Text
                    style={{
                      fontFamily: fonts.sans,
                      fontSize: 12,
                      color: colors.ink2,
                      marginBottom: 4,
                    }}
                  >
                    {format(new Date(e.timestamp), 'h:mm a')}
                  </Text>
                  <View
                    style={{ flexDirection: 'row', gap: 6, flexWrap: 'wrap' }}
                  >
                    <StatusPill status={e.hasAlert ? 'danger' : 'normal'} />
                    {e.symptoms.slice(0, 2).map((t) => (
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
                </View>
                <Icon name="chevron" size={16} color={colors.ink3} />
              </TouchableOpacity>
            ))}
          </View>
        </>
      ) : null}
    </CalmScreen>
  );
}
