import React, { useState, useCallback } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { format } from 'date-fns';
import { useForm, Controller, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { healthEntrySchema, type HealthEntryFormData } from '../utils/validation';
import { checkForAlerts } from '../utils/alertLogic';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { addEntryThunk } from '../store/healthSlice';
import { SYMPTOMS } from '../constants/symptoms';
import CalmScreen from '../components/CalmScreen';
import VitalInput from '../components/VitalInput';
import SymptomChip from '../components/SymptomChip';
import SectionHead from '../components/SectionHead';
import Icon from '../components/Icon';
import ErrorBanner from '../components/ErrorBanner';
import { colors, fonts, radii } from '../theme';
import type { MainTabParamList } from '../types';

type AddEntryNav = BottomTabNavigationProp<MainTabParamList, 'AddEntry'>;

export default function AddHealthEntryScreen() {
  const navigation = useNavigation<AddEntryNav>();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const isLoading = useAppSelector((state) => state.health.isLoading);
  const healthError = useAppSelector((state) => state.health.error);
  const [selectedSymptoms, setSelectedSymptoms] = useState<string[]>([]);

  const {
    control,
    handleSubmit,
    reset,
    formState: { errors, isValid },
  } = useForm<HealthEntryFormData>({
    resolver: zodResolver(healthEntrySchema) as Resolver<HealthEntryFormData>,
    mode: 'onChange',
    defaultValues: {
      heartRate: undefined,
      systolic: undefined,
      diastolic: undefined,
      spo2: undefined,
      temperature: undefined,
      symptoms: [],
      notes: '',
    },
  });

  const toggleSymptom = useCallback((symptom: string) => {
    setSelectedSymptoms((prev) =>
      prev.includes(symptom)
        ? prev.filter((s) => s !== symptom)
        : [...prev, symptom]
    );
  }, []);

  const resetForm = () => {
    reset();
    setSelectedSymptoms([]);
  };

  const onSubmit = async (data: HealthEntryFormData) => {
    if (!user) return;

    const entryData = {
      ...data,
      symptoms: selectedSymptoms,
      timestamp: new Date().toISOString(),
    };

    const alertResult = checkForAlerts(entryData);

    if (alertResult.hasAlert) {
      Alert.alert('Health Warning', alertResult.messages.join('\n\n'), [
        {
          text: 'Save Anyway',
          onPress: async () => {
            await dispatch(addEntryThunk(entryData)).unwrap();
            resetForm();
            navigation.navigate('History');
          },
        },
        { text: 'Edit Entry', style: 'cancel' },
      ]);
    } else {
      await dispatch(addEntryThunk(entryData)).unwrap();
      resetForm();
      navigation.navigate('History');
    }
  };

  const parseNumber = (text: string): number | undefined => {
    const num = parseFloat(text);
    return isNaN(num) ? undefined : num;
  };

  const iconTile = (
    name: 'chevronL',
    onPress?: () => void
  ): React.ReactElement => (
    <TouchableOpacity
      disabled={!onPress}
      onPress={onPress}
      accessibilityRole="button"
      accessibilityLabel="Go back"
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
      <Icon name={name} size={18} color={colors.ink2} />
    </TouchableOpacity>
  );

  return (
    <CalmScreen tabBarSpace contentContainerStyle={{ paddingHorizontal: 22 }}>
      {/* Top bar */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: 22,
        }}
      >
        {iconTile('chevronL', () => navigation.navigate('Dashboard'))}
        <Text
          style={{
            fontFamily: fonts.mono,
            fontSize: 10,
            color: colors.ink3,
            textTransform: 'uppercase',
            letterSpacing: 1.6,
          }}
        >
          New entry · {format(new Date(), 'h:mm a')}
        </Text>
        <View style={{ width: 38, height: 38 }} />
      </View>

      <Text
        style={{
          fontFamily: fonts.serifItalic,
          fontSize: 30,
          color: colors.ink,
          lineHeight: 33,
          letterSpacing: -0.6,
          marginBottom: 4,
        }}
      >
        How are you{'\n'}feeling today?
      </Text>
      <Text
        style={{
          fontFamily: fonts.sans,
          fontSize: 13,
          color: colors.ink3,
          marginBottom: 22,
        }}
      >
        Log your vitals to keep your trend going.
      </Text>

      <ErrorBanner message={healthError} />

      <SectionHead title="Vital signs" />
      <View style={{ marginBottom: 22 }}>
        <Controller
          control={control}
          name="heartRate"
          render={({ field: { onChange, value } }) => (
            <VitalInput
              icon="heart"
              color={colors.rose}
              label="Heart rate"
              hint="Resting · 60–100"
              unit="bpm"
              placeholder="—"
              value={value?.toString() ?? ''}
              onChangeText={(t) => onChange(parseNumber(t))}
              error={errors.heartRate?.message}
            />
          )}
        />

        {/* Blood pressure — systolic / diastolic share one row shell */}
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            gap: 14,
            backgroundColor: colors.surface,
            borderRadius: radii.lg,
            borderWidth: 1,
            borderColor:
              errors.systolic || errors.diastolic
                ? colors.coral
                : colors.hairSoft,
            paddingHorizontal: 16,
            paddingVertical: 12,
            marginBottom: 10,
          }}
        >
          <View
            style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              backgroundColor: colors.amber + '22',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Icon name="drop" size={20} color={colors.amber} />
          </View>
          <View style={{ flex: 1 }}>
            <Text
              style={{
                fontFamily: fonts.sansMedium,
                fontSize: 12,
                color: colors.ink3,
                marginBottom: 2,
              }}
            >
              Blood pressure
            </Text>
            <Text
              style={{ fontFamily: fonts.sans, fontSize: 11, color: colors.ink4 }}
            >
              Sys / Dia
            </Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
            <Controller
              control={control}
              name="systolic"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={{
                    fontFamily: fonts.serifItalic,
                    fontSize: 22,
                    color: colors.ink,
                    padding: 0,
                    minWidth: 38,
                    textAlign: 'right',
                  }}
                  keyboardType="numeric"
                  placeholder="—"
                  placeholderTextColor={colors.ink4}
                  value={value?.toString() ?? ''}
                  onChangeText={(t) => onChange(parseNumber(t))}
                />
              )}
            />
            <Text
              style={{
                fontFamily: fonts.serifItalic,
                fontSize: 22,
                color: colors.ink4,
                paddingHorizontal: 6,
              }}
            >
              /
            </Text>
            <Controller
              control={control}
              name="diastolic"
              render={({ field: { onChange, value } }) => (
                <TextInput
                  style={{
                    fontFamily: fonts.serifItalic,
                    fontSize: 22,
                    color: colors.ink,
                    padding: 0,
                    minWidth: 38,
                    textAlign: 'right',
                  }}
                  keyboardType="numeric"
                  placeholder="—"
                  placeholderTextColor={colors.ink4}
                  value={value?.toString() ?? ''}
                  onChangeText={(t) => onChange(parseNumber(t))}
                />
              )}
            />
            <Text
              style={{
                fontFamily: fonts.mono,
                fontSize: 10,
                color: colors.ink3,
                letterSpacing: 1,
                textTransform: 'uppercase',
                marginLeft: 6,
                marginBottom: 4,
              }}
            >
              mmHg
            </Text>
          </View>
        </View>
        {errors.systolic || errors.diastolic ? (
          <Text
            style={{
              fontFamily: fonts.sans,
              fontSize: 12,
              color: colors.coral,
              marginTop: -6,
              marginBottom: 8,
              marginLeft: 4,
            }}
          >
            {errors.systolic?.message ?? errors.diastolic?.message}
          </Text>
        ) : null}

        <Controller
          control={control}
          name="spo2"
          render={({ field: { onChange, value } }) => (
            <VitalInput
              icon="lung"
              color={colors.teal}
              label="Blood oxygen"
              hint="Normal · 95–100"
              unit="%"
              placeholder="—"
              value={value?.toString() ?? ''}
              onChangeText={(t) => onChange(parseNumber(t))}
              error={errors.spo2?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="temperature"
          render={({ field: { onChange, value } }) => (
            <VitalInput
              icon="thermo"
              color={colors.sage}
              label="Temperature"
              hint="Normal range"
              unit="°C"
              placeholder="—"
              value={value?.toString() ?? ''}
              onChangeText={(t) => onChange(parseNumber(t))}
              error={errors.temperature?.message}
            />
          )}
        />
      </View>

      <SectionHead
        title="Symptoms"
        action={`${selectedSymptoms.length} selected`}
      />
      <View
        style={{
          flexDirection: 'row',
          flexWrap: 'wrap',
          marginBottom: 22,
        }}
      >
        {SYMPTOMS.map((symptom) => (
          <SymptomChip
            key={symptom}
            label={symptom}
            selected={selectedSymptoms.includes(symptom)}
            onToggle={() => toggleSymptom(symptom)}
          />
        ))}
      </View>

      <SectionHead title="Notes" />
      <Controller
        control={control}
        name="notes"
        render={({ field: { onChange, onBlur, value } }) => (
          <View style={{ marginBottom: 22 }}>
            <View
              style={{
                backgroundColor: colors.surface,
                borderRadius: radii.lg,
                borderWidth: 1,
                borderColor: colors.hairSoft,
                padding: 16,
                minHeight: 96,
              }}
            >
              <TextInput
                style={{
                  fontFamily: fonts.sans,
                  fontSize: 13,
                  color: colors.ink2,
                  padding: 0,
                  minHeight: 56,
                }}
                placeholder="How are you feeling? Any context worth noting…"
                placeholderTextColor={colors.ink4}
                multiline
                textAlignVertical="top"
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                maxLength={500}
              />
              <Text
                style={{
                  fontFamily: fonts.mono,
                  fontSize: 11,
                  color: colors.ink4,
                  textAlign: 'right',
                  marginTop: 8,
                }}
              >
                {(value ?? '').length} / 500
              </Text>
            </View>
            {errors.notes ? (
              <Text
                style={{
                  fontFamily: fonts.sans,
                  fontSize: 12,
                  color: colors.coral,
                  marginTop: 4,
                }}
              >
                {errors.notes.message}
              </Text>
            ) : null}
          </View>
        )}
      />

      <TouchableOpacity
        activeOpacity={0.85}
        disabled={!isValid || isLoading}
        onPress={handleSubmit(onSubmit)}
        accessibilityRole="button"
        accessibilityLabel="Save entry"
        accessibilityState={{ disabled: !isValid || isLoading, busy: isLoading }}
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 8,
          backgroundColor: colors.teal,
          borderRadius: 16,
          paddingVertical: 16,
          opacity: !isValid || isLoading ? 0.5 : 1,
          shadowColor: colors.teal,
          shadowOpacity: 0.35,
          shadowRadius: 16,
          shadowOffset: { width: 0, height: 10 },
          elevation: 6,
        }}
      >
        <Icon name="check" size={18} color={colors.white} stroke={2} />
        <Text
          style={{
            fontFamily: fonts.sansSemibold,
            fontSize: 15,
            color: colors.white,
            letterSpacing: 0.2,
          }}
        >
          {isLoading ? 'Saving…' : 'Save entry'}
        </Text>
      </TouchableOpacity>
    </CalmScreen>
  );
}
