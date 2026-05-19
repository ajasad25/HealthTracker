import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useAppSelector } from '../hooks/useAppSelector';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { logoutThunk } from '../store/authSlice';
import CalmScreen from '../components/CalmScreen';
import CalmCard from '../components/CalmCard';
import SectionHead from '../components/SectionHead';
import Icon, { type IconName } from '../components/Icon';
import { colors, fonts, radii } from '../theme';

function Row({
  icon,
  label,
  value,
}: {
  icon: IconName;
  label: string;
  value: string;
}) {
  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 14,
        paddingVertical: 14,
      }}
    >
      <View
        style={{
          width: 36,
          height: 36,
          borderRadius: 11,
          backgroundColor: colors.tealSoft,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Icon name={icon} size={18} color={colors.teal} />
      </View>
      <Text style={{ flex: 1, fontFamily: fonts.sansMedium, fontSize: 14, color: colors.ink2 }}>
        {label}
      </Text>
      <Text style={{ fontFamily: fonts.sans, fontSize: 14, color: colors.ink3 }}>
        {value}
      </Text>
    </View>
  );
}

/** Profile — stub for the FAB tab bar's "Profile" slot; owns sign-out. */
export default function ProfileScreen() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const entries = useAppSelector((s) => s.health.entries);
  const initial = (user?.name?.trim()?.[0] ?? 'U').toUpperCase();

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
          Account
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
          Profile.
        </Text>
      </View>

      <CalmCard style={{ marginBottom: 14, alignItems: 'center', paddingVertical: 26 }}>
        <View
          style={{
            width: 72,
            height: 72,
            borderRadius: 24,
            backgroundColor: colors.teal,
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: 14,
          }}
        >
          <Text
            style={{
              fontFamily: fonts.serifItalic,
              fontSize: 34,
              color: colors.white,
            }}
          >
            {initial}
          </Text>
        </View>
        <Text
          style={{
            fontFamily: fonts.serifItalic,
            fontSize: 24,
            color: colors.ink,
            letterSpacing: -0.5,
          }}
        >
          {user?.name ?? 'Your account'}
        </Text>
        <Text
          style={{
            fontFamily: fonts.sans,
            fontSize: 13,
            color: colors.ink3,
            marginTop: 4,
          }}
        >
          {user?.email ?? ''}
        </Text>
      </CalmCard>

      <SectionHead title="Overview" />
      <CalmCard style={{ marginBottom: 22, paddingVertical: 4 }}>
        <Row icon="list" label="Entries logged" value={String(entries.length)} />
        <View style={{ height: 1, backgroundColor: colors.hairSoft }} />
        <Row
          icon="alert"
          label="Active alerts"
          value={String(entries.filter((e) => e.hasAlert).length)}
        />
      </CalmCard>

      <TouchableOpacity
        activeOpacity={0.85}
        accessibilityRole="button"
        accessibilityLabel="Sign out"
        onPress={() => dispatch(logoutThunk())}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          paddingVertical: 16,
          borderRadius: radii.md,
          backgroundColor: colors.surface,
          borderWidth: 1,
          borderColor: colors.hair,
        }}
      >
        <Icon name="logout" size={18} color={colors.coral} stroke={1.8} />
        <Text
          style={{
            fontFamily: fonts.sansSemibold,
            fontSize: 15,
            color: colors.coral,
          }}
        >
          Sign out
        </Text>
      </TouchableOpacity>
    </CalmScreen>
  );
}
