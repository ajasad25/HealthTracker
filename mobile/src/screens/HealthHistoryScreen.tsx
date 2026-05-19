import React, { useCallback, useMemo, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  RefreshControl,
  TouchableOpacity,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppSelector } from '../hooks/useAppSelector';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { fetchEntriesThunk } from '../store/healthSlice';
import EntryListItem from '../components/EntryListItem';
import EmptyState from '../components/EmptyState';
import ErrorBanner from '../components/ErrorBanner';
import SectionHead from '../components/SectionHead';
import BigStat from '../components/BigStat';
import Sparkline from '../components/Sparkline';
import Icon from '../components/Icon';
import { colors, fonts, radii } from '../theme';
import type { HealthEntry, HistoryStackParamList } from '../types';

type HistoryNav = NativeStackNavigationProp<HistoryStackParamList, 'HistoryList'>;
type Filter = 'all' | 'alerts';

export default function HealthHistoryScreen() {
  const navigation = useNavigation<HistoryNav>();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const { entries, isLoading, error } = useAppSelector((state) => state.health);
  const insets = useSafeAreaInsets();
  const [filter, setFilter] = useState<Filter>('all');

  const onRefresh = useCallback(() => {
    if (user) dispatch(fetchEntriesThunk());
  }, [dispatch, user]);

  const handlePress = useCallback(
    (entry: HealthEntry) =>
      navigation.navigate('EntryDetail', { entryId: entry.id }),
    [navigation]
  );

  const alertCount = useMemo(
    () => entries.filter((e) => e.hasAlert).length,
    [entries]
  );

  const data = useMemo(
    () => (filter === 'alerts' ? entries.filter((e) => e.hasAlert) : entries),
    [entries, filter]
  );

  const hrTrend = useMemo(
    () =>
      entries
        .slice(0, 10)
        .map((e) => e.heartRate)
        .reverse(),
    [entries]
  );
  const avgHr = hrTrend.length
    ? Math.round(hrTrend.reduce((a, b) => a + b, 0) / hrTrend.length)
    : 0;

  const renderItem = useCallback(
    ({ item }: { item: HealthEntry }) => (
      <EntryListItem entry={item} onPress={() => handlePress(item)} />
    ),
    [handlePress]
  );

  const Chip = ({ id, label }: { id: Filter; label: string }) => {
    const on = filter === id;
    return (
      <TouchableOpacity
        onPress={() => setFilter(id)}
        accessibilityRole="button"
        accessibilityState={{ selected: on }}
        style={{
          paddingVertical: 8,
          paddingHorizontal: 14,
          borderRadius: 999,
          marginRight: 6,
          backgroundColor: on ? colors.ink : colors.surface,
          borderWidth: 1,
          borderColor: on ? colors.ink : colors.hair,
        }}
      >
        <Text
          style={{
            fontFamily: fonts.sansMedium,
            fontSize: 12,
            color: on ? colors.bg : colors.ink2,
          }}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  const Header = (
    <View>
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          marginBottom: 8,
        }}
      >
        <View>
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
            {entries.length} entr{entries.length === 1 ? 'y' : 'ies'}
          </Text>
          <Text
            style={{
              fontFamily: fonts.serifItalic,
              fontSize: 30,
              color: colors.ink,
              lineHeight: 33,
              letterSpacing: -0.6,
            }}
          >
            Your history.
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
          <Icon name="filter" size={18} color={colors.ink2} />
        </View>
      </View>

      <View style={{ flexDirection: 'row', marginTop: 18, marginBottom: 18 }}>
        <Chip id="all" label="All" />
        <Chip id="alerts" label={`Alerts (${alertCount})`} />
      </View>

      {hrTrend.length >= 2 ? (
        <View
          style={{
            backgroundColor: colors.surface,
            borderRadius: radii.lg,
            borderWidth: 1,
            borderColor: colors.hairSoft,
            paddingHorizontal: 16,
            paddingVertical: 14,
            marginBottom: 18,
          }}
        >
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'flex-end',
              justifyContent: 'space-between',
              marginBottom: 10,
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
            <BigStat value={avgHr} unit="bpm" size={20} />
          </View>
          <Sparkline data={hrTrend} color={colors.rose} width={290} height={48} />
        </View>
      ) : null}

      <ErrorBanner message={error} />
      {data.length > 0 ? <SectionHead title="Entries" /> : null}
    </View>
  );

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.bg,
        width: '100%',
        maxWidth: 600,
        alignSelf: 'center',
        paddingTop: insets.top + 8,
      }}
    >
      <FlatList
        data={data}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        ListHeaderComponent={Header}
        contentContainerStyle={{
          paddingHorizontal: 22,
          paddingBottom: 110,
          flexGrow: 1,
        }}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={onRefresh}
            tintColor={colors.teal}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="🩺"
            title={filter === 'alerts' ? 'No alerts' : 'No history yet'}
            subtitle={
              filter === 'alerts'
                ? 'Entries that cross a threshold will show up here.'
                : 'Tap the + to log your first vitals and start your trend.'
            }
          />
        }
      />
    </View>
  );
}
