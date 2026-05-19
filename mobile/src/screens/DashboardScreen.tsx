import React, { useEffect, useMemo } from 'react';
import { View, Text, ScrollView } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { isToday, format } from 'date-fns';
import { useAppSelector } from '../hooks/useAppSelector';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { fetchEntriesThunk } from '../store/healthSlice';
import { logoutThunk } from '../store/authSlice';
import {
  getGreeting,
  getHeartRateStatus,
  getSpo2Status,
  getTemperatureStatus,
  getBloodPressureStatus,
  formatTime,
} from '../utils/formatters';
import { checkForAlerts } from '../utils/alertLogic';
import MetricCard from '../components/MetricCard';
import AlertBanner from '../components/AlertBanner';
import Button from '../components/Button';
import type { MainTabParamList } from '../types';

type DashboardNav = BottomTabNavigationProp<MainTabParamList, 'Dashboard'>;

export default function DashboardScreen() {
  const navigation = useNavigation<DashboardNav>();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const entries = useAppSelector((state) => state.health.entries);

  useEffect(() => {
    if (user) {
      dispatch(fetchEntriesThunk(user.id));
    }
  }, [dispatch, user]);

  const todayEntry = useMemo(
    () => entries.find((e) => isToday(new Date(e.timestamp))),
    [entries]
  );

  const alertMessages = useMemo(() => {
    if (!todayEntry) return [];
    return checkForAlerts(todayEntry).messages;
  }, [todayEntry]);

  return (
    <ScrollView className="flex-1 bg-neutral-50">
      <View className="px-6 pt-14 pb-8">
        <View className="flex-row justify-between items-start mb-6">
          <View className="flex-1">
            <Text className="text-2xl font-bold text-neutral-900">
              {getGreeting()}, {user?.name?.split(' ')[0] ?? 'User'}
            </Text>
            <Text className="text-sm text-neutral-400 mt-1">
              {format(new Date(), 'EEEE, MMMM d, yyyy')}
            </Text>
          </View>
          <Button
            title="Logout"
            variant="secondary"
            onPress={() => dispatch(logoutThunk())}
          />
        </View>

        {alertMessages.length > 0 ? (
          <AlertBanner messages={alertMessages} />
        ) : null}

        {todayEntry ? (
          <>
            <Text className="text-lg font-semibold text-neutral-800 mb-3">
              Today's Vitals
            </Text>
            <View className="flex-row flex-wrap gap-3 mb-4">
              <MetricCard
                label="Heart Rate"
                value={todayEntry.heartRate}
                unit="bpm"
                status={getHeartRateStatus(todayEntry.heartRate)}
              />
              <MetricCard
                label="Blood Pressure"
                value={`${todayEntry.systolic}/${todayEntry.diastolic}`}
                unit="mmHg"
                status={getBloodPressureStatus(
                  todayEntry.systolic,
                  todayEntry.diastolic
                )}
              />
            </View>
            <View className="flex-row flex-wrap gap-3 mb-4">
              <MetricCard
                label="SpO2"
                value={todayEntry.spo2}
                unit="%"
                status={getSpo2Status(todayEntry.spo2)}
              />
              <MetricCard
                label="Temperature"
                value={todayEntry.temperature}
                unit="°C"
                status={getTemperatureStatus(todayEntry.temperature)}
              />
            </View>
            <Text className="text-xs text-neutral-400 mb-6">
              Last updated: {formatTime(todayEntry.timestamp)}
            </Text>
          </>
        ) : (
          <View className="bg-primary-50 border border-primary-200 rounded-2xl p-6 mb-6 items-center">
            <Text className="text-4xl mb-3">📊</Text>
            <Text className="text-base font-semibold text-primary-700 text-center">
              No data logged today
            </Text>
            <Text className="text-sm text-primary-500 text-center mt-1">
              Track your vitals to stay on top of your health
            </Text>
          </View>
        )}

        <View className="gap-3">
          <Button
            title="Log Health Entry"
            onPress={() => navigation.navigate('AddEntry')}
          />
          <Button
            title="View History"
            variant="secondary"
            onPress={() => navigation.navigate('History')}
          />
        </View>
      </View>
    </ScrollView>
  );
}
