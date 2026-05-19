import React, { useCallback } from 'react';
import { View, Text, FlatList, RefreshControl } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { useAppSelector } from '../hooks/useAppSelector';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { fetchEntriesThunk } from '../store/healthSlice';
import EntryListItem from '../components/EntryListItem';
import EmptyState from '../components/EmptyState';
import ErrorBanner from '../components/ErrorBanner';
import type { HealthEntry, HistoryStackParamList } from '../types';

type HistoryNav = NativeStackNavigationProp<HistoryStackParamList, 'HistoryList'>;

export default function HealthHistoryScreen() {
  const navigation = useNavigation<HistoryNav>();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const { entries, isLoading, error } = useAppSelector((state) => state.health);
  const insets = useSafeAreaInsets();

  const onRefresh = useCallback(() => {
    if (user) {
      dispatch(fetchEntriesThunk());
    }
  }, [dispatch, user]);

  const handlePress = useCallback(
    (entry: HealthEntry) => {
      navigation.navigate('EntryDetail', { entryId: entry.id });
    },
    [navigation]
  );

  const renderItem = useCallback(
    ({ item }: { item: HealthEntry }) => (
      <EntryListItem entry={item} onPress={() => handlePress(item)} />
    ),
    [handlePress]
  );

  const keyExtractor = useCallback((item: HealthEntry) => item.id, []);

  return (
    <View
      className="flex-1 bg-neutral-50 w-full max-w-[600px] self-center"
      style={{ paddingTop: insets.top + 16 }}
    >
      <View className="px-6 pb-4">
        <Text className="text-2xl font-bold text-neutral-900">Health History</Text>
        <Text className="text-sm text-neutral-400 mt-1">
          {entries.length} record{entries.length !== 1 ? 's' : ''}
        </Text>
        <View className="mt-3">
          <ErrorBanner message={error} />
        </View>
      </View>

      <FlatList
        data={entries}
        renderItem={renderItem}
        keyExtractor={keyExtractor}
        contentContainerStyle={{ paddingHorizontal: 24, paddingBottom: 24 }}
        refreshControl={
          <RefreshControl
            refreshing={isLoading}
            onRefresh={onRefresh}
            tintColor="#0077A8"
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="📋"
            title="No health records yet"
            subtitle="Start tracking your vitals by adding your first entry"
          />
        }
      />
    </View>
  );
}
