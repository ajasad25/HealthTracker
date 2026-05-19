import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import { format } from 'date-fns';
import { useAppSelector } from '../hooks/useAppSelector';
import {
  getHeartRateStatus,
  getSpo2Status,
  getTemperatureStatus,
  getBloodPressureStatus,
} from '../utils/formatters';
import { checkForAlerts } from '../utils/alertLogic';
import CalmScreen from '../components/CalmScreen';
import SectionHead from '../components/SectionHead';
import StatusPill from '../components/StatusPill';
import BigStat from '../components/BigStat';
import Icon, { type IconName } from '../components/Icon';
import { colors, fonts, radii } from '../theme';
import type { VitalStatus, HistoryStackParamList } from '../types';

type Props = NativeStackScreenProps<HistoryStackParamList, 'EntryDetail'>;

function BigVital({
  icon,
  name,
  value,
  unit,
  status,
  range,
  color,
}: {
  icon: IconName;
  name: string;
  value: string | number;
  unit: string;
  status: VitalStatus;
  range: string;
  color: string;
}) {
  return (
    <View
      style={{
        flex: 1,
        minWidth: '45%',
        backgroundColor: colors.surface,
        borderRadius: radii.lg,
        borderWidth: 1,
        borderColor: colors.hairSoft,
        padding: 16,
      }}
    >
      <View
        style={{
          flexDirection: 'row',
          justifyContent: 'space-between',
          marginBottom: 12,
        }}
      >
        <View
          style={{
            width: 32,
            height: 32,
            borderRadius: 10,
            backgroundColor: color + '22',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Icon name={icon} size={16} color={color} />
        </View>
        <StatusPill status={status} />
      </View>
      <Text
        style={{
          fontFamily: fonts.mono,
          fontSize: 10,
          color: colors.ink3,
          textTransform: 'uppercase',
          letterSpacing: 1.4,
          marginBottom: 6,
        }}
      >
        {name}
      </Text>
      <BigStat value={value} unit={unit} size={28} />
      <Text
        style={{
          fontFamily: fonts.sans,
          fontSize: 10,
          color: colors.ink4,
          marginTop: 8,
        }}
      >
        Range {range}
      </Text>
    </View>
  );
}

function tile(child: React.ReactNode, onPress?: () => void, label?: string) {
  return (
    <TouchableOpacity
      disabled={!onPress}
      onPress={onPress}
      accessibilityRole={onPress ? 'button' : undefined}
      accessibilityLabel={label}
      style={{
        width: 38,
        height: 38,
        borderRadius: 12,
        backgroundColor: colors.surface,
        borderWidth: 1,
        borderColor: colors.hairSoft,
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {child}
    </TouchableOpacity>
  );
}

export default function HealthEntryDetailScreen({ route }: Props) {
  const navigation = useNavigation();
  const { entryId } = route.params;
  const entry = useAppSelector((state) =>
    state.health.entries.find((e) => e.id === entryId)
  );

  if (!entry) {
    return (
      <CalmScreen scroll={false}>
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
        >
          <Text
            style={{ fontFamily: fonts.serifItalic, fontSize: 20, color: colors.ink3 }}
          >
            Entry not found.
          </Text>
        </View>
      </CalmScreen>
    );
  }

  const alert = checkForAlerts(entry);
  const d = new Date(entry.timestamp);
  const hour = d.getHours();
  const title =
    hour < 12 ? 'Morning check-in' : hour < 18 ? 'Afternoon check-in' : 'Evening check-in';

  return (
    <CalmScreen contentContainerStyle={{ paddingHorizontal: 22 }}>
      {/* Top bar */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 20,
        }}
      >
        {tile(
          <Icon name="chevronL" size={18} color={colors.ink2} />,
          () => navigation.goBack(),
          'Go back'
        )}
        <Text
          style={{
            fontFamily: fonts.mono,
            fontSize: 10,
            color: colors.ink3,
            textTransform: 'uppercase',
            letterSpacing: 1.6,
          }}
        >
          Entry detail
        </Text>
        {tile(<Icon name="sparkle" size={18} color={colors.teal} />)}
      </View>

      {/* Hero */}
      <View style={{ marginBottom: 18 }}>
        <Text
          style={{
            fontFamily: fonts.mono,
            fontSize: 10,
            color: colors.ink3,
            textTransform: 'uppercase',
            letterSpacing: 1.6,
          }}
        >
          {format(d, 'EEE, MMM d · h:mm a')}
        </Text>
        <Text
          style={{
            fontFamily: fonts.serifItalic,
            fontSize: 32,
            color: colors.ink,
            lineHeight: 34,
            letterSpacing: -0.8,
            marginTop: 6,
          }}
        >
          {title}
        </Text>
      </View>

      {/* Alert / all-clear banner */}
      {alert.hasAlert ? (
        <View
          style={{
            backgroundColor: colors.ink,
            borderRadius: radii.xl,
            padding: 18,
            marginBottom: 16,
            flexDirection: 'row',
            gap: 14,
            overflow: 'hidden',
          }}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: colors.coral,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="alert" size={20} color={colors.white} stroke={2} />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: fonts.mono,
                fontSize: 11,
                color: '#E8B5A3',
                textTransform: 'uppercase',
                letterSpacing: 1.6,
                marginBottom: 4,
              }}
            >
              {alert.messages.length} Alert
              {alert.messages.length > 1 ? 's' : ''}
            </Text>
            {alert.messages.map((m, i) => (
              <Text
                key={i}
                style={{
                  fontFamily: fonts.sansSemibold,
                  fontSize: 14,
                  color: colors.white,
                  marginBottom: 4,
                }}
              >
                {m}
              </Text>
            ))}
            <Text
              style={{
                fontFamily: fonts.sans,
                fontSize: 12,
                color: '#C9CCC9',
                lineHeight: 18,
                marginTop: 2,
              }}
            >
              Consider resting and re-measuring in 10 minutes.
            </Text>
          </View>
        </View>
      ) : (
        <View
          style={{
            backgroundColor: colors.sageTint,
            borderRadius: radii.lg,
            padding: 16,
            marginBottom: 16,
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
              backgroundColor: colors.sage,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="check" size={18} color={colors.white} stroke={2} />
          </View>
          <Text
            style={{
              fontFamily: fonts.sansSemibold,
              fontSize: 13,
              color: '#2A3331',
              flex: 1,
            }}
          >
            All vitals within your normal range.
          </Text>
        </View>
      )}

      {/* Vitals grid */}
      <SectionHead title="Vitals" />
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          gap: 10,
          marginBottom: 22,
        }}
      >
        <BigVital
          icon="heart"
          name="Heart Rate"
          value={entry.heartRate}
          unit="bpm"
          status={getHeartRateStatus(entry.heartRate)}
          range="60–100"
          color={colors.rose}
        />
        <BigVital
          icon="lung"
          name="SpO₂"
          value={entry.spo2}
          unit="%"
          status={getSpo2Status(entry.spo2)}
          range="95–100"
          color={colors.teal}
        />
        <BigVital
          icon="drop"
          name="Pressure"
          value={`${entry.systolic}/${entry.diastolic}`}
          unit="mmHg"
          status={getBloodPressureStatus(entry.systolic, entry.diastolic)}
          range="<120/80"
          color={colors.amber}
        />
        <BigVital
          icon="thermo"
          name="Temp"
          value={entry.temperature}
          unit="°C"
          status={getTemperatureStatus(entry.temperature)}
          range="<37.5"
          color={colors.sage}
        />
      </View>

      {/* Symptoms */}
      {entry.symptoms.length > 0 ? (
        <>
          <SectionHead
            title="Symptoms"
            action={`${entry.symptoms.length} reported`}
          />
          <View
            style={{
              flexDirection: 'row',
              flexWrap: 'wrap',
              gap: 6,
              marginBottom: 22,
            }}
          >
            {entry.symptoms.map((t) => (
              <View
                key={t}
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 6,
                  paddingVertical: 8,
                  paddingHorizontal: 14,
                  borderRadius: 999,
                  backgroundColor: colors.amberTint,
                }}
              >
                <View
                  style={{
                    width: 5,
                    height: 5,
                    borderRadius: 999,
                    backgroundColor: colors.amber,
                  }}
                />
                <Text
                  style={{
                    fontFamily: fonts.sansSemibold,
                    fontSize: 12,
                    color: '#7A4E1F',
                  }}
                >
                  {t}
                </Text>
              </View>
            ))}
          </View>
        </>
      ) : (
        <View style={{ marginBottom: 22 }}>
          <SectionHead title="Symptoms" />
          <Text
            style={{ fontFamily: fonts.sans, fontSize: 13, color: colors.ink3 }}
          >
            No symptoms reported.
          </Text>
        </View>
      )}

      {/* Notes */}
      {entry.notes ? (
        <>
          <SectionHead title="Notes" />
          <View
            style={{
              backgroundColor: colors.surface,
              borderRadius: radii.lg,
              borderWidth: 1,
              borderColor: colors.hairSoft,
              padding: 16,
              marginBottom: 22,
            }}
          >
            <Text
              style={{
                fontFamily: fonts.serifItalic,
                fontSize: 14,
                color: colors.ink2,
                lineHeight: 22,
              }}
            >
              “{entry.notes}”
            </Text>
          </View>
        </>
      ) : null}

      {/* Suggestion */}
      {alert.hasAlert ? (
        <View
          style={{
            backgroundColor: colors.tealSoft,
            borderRadius: radii.lg,
            borderWidth: 1,
            borderColor: colors.tealTint,
            padding: 16,
            flexDirection: 'row',
            gap: 12,
            alignItems: 'flex-start',
          }}
        >
          <View
            style={{
              width: 32,
              height: 32,
              borderRadius: 10,
              backgroundColor: colors.teal,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="sparkle" size={16} color={colors.white} />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: fonts.mono,
                fontSize: 11,
                color: colors.teal,
                textTransform: 'uppercase',
                letterSpacing: 1.4,
                marginBottom: 4,
              }}
            >
              Suggestion
            </Text>
            <Text
              style={{
                fontFamily: fonts.sans,
                fontSize: 13,
                color: colors.ink,
                lineHeight: 19,
              }}
            >
              Re-measure in 10 minutes after sitting calmly. If it stays out of
              range, log a note and consider contacting your provider.
            </Text>
          </View>
        </View>
      ) : null}
    </CalmScreen>
  );
}
