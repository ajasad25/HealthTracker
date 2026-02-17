import React, { useState, useCallback } from 'react';
import { View, Text, ScrollView, TextInput, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import type { BottomTabNavigationProp } from '@react-navigation/bottom-tabs';
import { useForm, Controller, type Resolver } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { healthEntrySchema, type HealthEntryFormData } from '../utils/validation';
import { checkForAlerts } from '../utils/alertLogic';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { addEntryThunk } from '../store/healthSlice';
import { SYMPTOMS } from '../constants/symptoms';
import VitalInput from '../components/VitalInput';
import SymptomChip from '../components/SymptomChip';
import Button from '../components/Button';
import type { MainTabParamList } from '../types';

type AddEntryNav = BottomTabNavigationProp<MainTabParamList, 'AddEntry'>;

export default function AddHealthEntryScreen() {
  const navigation = useNavigation<AddEntryNav>();
  const dispatch = useAppDispatch();
  const user = useAppSelector((state) => state.auth.user);
  const isLoading = useAppSelector((state) => state.health.isLoading);
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

  const onSubmit = async (data: HealthEntryFormData) => {
    if (!user) return;

    const entryData = {
      ...data,
      symptoms: selectedSymptoms,
      userId: user.id,
      timestamp: new Date().toISOString(),
    };

    const alertResult = checkForAlerts(entryData);

    if (alertResult.hasAlert) {
      Alert.alert(
        'Health Warning',
        alertResult.messages.join('\n\n'),
        [
          {
            text: 'Save Anyway',
            onPress: async () => {
              await dispatch(addEntryThunk(entryData)).unwrap();
              resetForm();
              navigation.navigate('History');
            },
          },
          { text: 'Edit Entry', style: 'cancel' },
        ]
      );
    } else {
      await dispatch(addEntryThunk(entryData)).unwrap();
      resetForm();
      navigation.navigate('History');
    }
  };

  const resetForm = () => {
    reset();
    setSelectedSymptoms([]);
  };

  const parseNumber = (text: string): number | undefined => {
    const num = parseFloat(text);
    return isNaN(num) ? undefined : num;
  };

  return (
    <ScrollView className="flex-1 bg-neutral-50" keyboardShouldPersistTaps="handled">
      <View className="px-6 pt-14 pb-8">
        <Text className="text-2xl font-bold text-neutral-900 mb-1">
          Log Health Entry
        </Text>
        <Text className="text-sm text-neutral-400 mb-6">
          Record your current vitals and symptoms
        </Text>

        <Text className="text-base font-semibold text-neutral-800 mb-3">
          Vital Signs
        </Text>

        <Controller
          control={control}
          name="heartRate"
          render={({ field: { onChange, value } }) => (
            <VitalInput
              label="Heart Rate"
              unit="bpm"
              placeholder="60-100"
              value={value?.toString() ?? ''}
              onChangeText={(text) => onChange(parseNumber(text))}
              error={errors.heartRate?.message}
            />
          )}
        />

        <Text className="text-sm font-medium text-neutral-700 mb-1.5">
          Blood Pressure
        </Text>
        <View className="flex-row gap-3 mb-4">
          <View className="flex-1">
            <Controller
              control={control}
              name="systolic"
              render={({ field: { onChange, value } }) => (
                <VitalInput
                  label="Systolic"
                  unit="mmHg"
                  placeholder="120"
                  value={value?.toString() ?? ''}
                  onChangeText={(text) => onChange(parseNumber(text))}
                  error={errors.systolic?.message}
                />
              )}
            />
          </View>
          <View className="flex-1">
            <Controller
              control={control}
              name="diastolic"
              render={({ field: { onChange, value } }) => (
                <VitalInput
                  label="Diastolic"
                  unit="mmHg"
                  placeholder="80"
                  value={value?.toString() ?? ''}
                  onChangeText={(text) => onChange(parseNumber(text))}
                  error={errors.diastolic?.message}
                />
              )}
            />
          </View>
        </View>

        <Controller
          control={control}
          name="spo2"
          render={({ field: { onChange, value } }) => (
            <VitalInput
              label="Blood Oxygen (SpO2)"
              unit="%"
              placeholder="95-100"
              value={value?.toString() ?? ''}
              onChangeText={(text) => onChange(parseNumber(text))}
              error={errors.spo2?.message}
            />
          )}
        />

        <Controller
          control={control}
          name="temperature"
          render={({ field: { onChange, value } }) => (
            <VitalInput
              label="Temperature"
              unit="°C"
              placeholder="36.6"
              value={value?.toString() ?? ''}
              onChangeText={(text) => onChange(parseNumber(text))}
              error={errors.temperature?.message}
            />
          )}
        />

        <Text className="text-base font-semibold text-neutral-800 mt-4 mb-3">
          Symptoms
        </Text>
        <View className="flex-row flex-wrap mb-4">
          {SYMPTOMS.map((symptom) => (
            <SymptomChip
              key={symptom}
              label={symptom}
              selected={selectedSymptoms.includes(symptom)}
              onToggle={() => toggleSymptom(symptom)}
            />
          ))}
        </View>

        <Text className="text-base font-semibold text-neutral-800 mb-3">
          Notes
        </Text>
        <Controller
          control={control}
          name="notes"
          render={({ field: { onChange, onBlur, value } }) => (
            <View className="mb-6">
              <TextInput
                className="bg-white border border-neutral-300 rounded-xl px-4 py-3 text-base text-neutral-900 min-h-[100px]"
                placeholder="Any additional notes..."
                placeholderTextColor="#9CA3AF"
                multiline
                textAlignVertical="top"
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                maxLength={500}
              />
              {errors.notes ? (
                <Text className="text-xs text-danger-500 mt-1">
                  {errors.notes.message}
                </Text>
              ) : null}
              <Text className="text-xs text-neutral-400 mt-1 text-right">
                {(value ?? '').length}/500
              </Text>
            </View>
          )}
        />

        <Button
          title="Submit Entry"
          onPress={handleSubmit(onSubmit)}
          loading={isLoading}
          disabled={!isValid}
        />
      </View>
    </ScrollView>
  );
}
