import React from 'react';
import { View, Text, TouchableOpacity, Platform } from 'react-native';
import type { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import Icon, { type IconName } from './Icon';
import { colors, fonts } from '../theme';

const ITEMS: { route: string; icon: IconName; label: string }[] = [
  { route: 'Dashboard', icon: 'home', label: 'Today' },
  { route: 'History', icon: 'list', label: 'History' },
  { route: 'Trends', icon: 'pulse', label: 'Trends' },
  { route: 'Profile', icon: 'user', label: 'Profile' },
];

/**
 * Floating-FAB tab bar — recreates atoms.jsx TabBar. Four nav items split
 * around a central accent FAB that routes to the New Entry screen.
 */
export default function AppTabBar({ state, navigation }: BottomTabBarProps) {
  const insets = useSafeAreaInsets();
  const current = state.routes[state.index]?.name;

  const Item = ({
    route,
    icon,
    label,
  }: {
    route: string;
    icon: IconName;
    label: string;
  }) => {
    const on = current === route;
    return (
      <TouchableOpacity
        style={{
          flex: 1,
          alignItems: 'center',
          gap: 4,
          paddingTop: 6,
        }}
        activeOpacity={0.7}
        accessibilityRole="button"
        accessibilityState={{ selected: on }}
        accessibilityLabel={label}
        onPress={() => navigation.navigate(route)}
      >
        <Icon
          name={icon}
          size={22}
          color={on ? colors.teal : colors.ink3}
          stroke={on ? 1.8 : 1.5}
        />
        <Text
          style={{
            fontFamily: on ? fonts.sansSemibold : fonts.sansMedium,
            fontSize: 10,
            color: on ? colors.teal : colors.ink3,
            letterSpacing: 0.2,
          }}
        >
          {label}
        </Text>
      </TouchableOpacity>
    );
  };

  return (
    <View
      style={{
        backgroundColor: colors.surface,
        borderTopWidth: 1,
        borderTopColor: colors.hairSoft,
        paddingBottom: Math.max(insets.bottom, Platform.OS === 'ios' ? 16 : 12),
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'flex-start',
          paddingTop: 8,
          paddingBottom: 4,
        }}
      >
        <Item {...ITEMS[0]} />
        <Item {...ITEMS[1]} />
        <View style={{ flex: 1 }} />
        <Item {...ITEMS[2]} />
        <Item {...ITEMS[3]} />

        {/* Center FAB → New Entry */}
        <View
          style={{
            position: 'absolute',
            left: '50%',
            top: -22,
            marginLeft: -28,
          }}
        >
          <TouchableOpacity
            activeOpacity={0.85}
            accessibilityRole="button"
            accessibilityLabel="Log new health entry"
            onPress={() => navigation.navigate('AddEntry')}
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: colors.teal,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: colors.teal,
              shadowOpacity: 0.4,
              shadowRadius: 16,
              shadowOffset: { width: 0, height: 10 },
              elevation: 8,
            }}
          >
            <Icon name="plus" size={26} color={colors.white} stroke={2} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
}
