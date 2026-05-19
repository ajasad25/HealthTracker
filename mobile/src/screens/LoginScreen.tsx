import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginFormData } from '../utils/validation';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { loginThunk, clearError } from '../store/authSlice';
import Button from '../components/Button';

export default function LoginScreen() {
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = (data: LoginFormData) => {
    dispatch(clearError());
    dispatch(loginThunk(data));
  };

  return (
    <KeyboardAvoidingView
      className="flex-1 bg-neutral-50"
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1, justifyContent: 'center' }}
        keyboardShouldPersistTaps="handled"
      >
        <View className="px-8 py-12">
          <View className="items-center mb-10">
            <Text className="text-6xl mb-4">💓</Text>
            <Text className="text-3xl font-bold text-primary-700">
              Health Tracker
            </Text>
            <Text className="text-base text-neutral-400 mt-2">
              Monitor your wellbeing
            </Text>
          </View>

          {error ? (
            <View className="bg-danger-50 border border-danger-200 rounded-xl p-3 mb-4">
              <Text className="text-danger-600 text-sm text-center">{error}</Text>
            </View>
          ) : null}

          <View className="mb-4">
            <Text className="text-sm font-medium text-neutral-700 mb-1.5">
              Email
            </Text>
            <Controller
              control={control}
              name="email"
              render={({ field: { onChange, onBlur, value } }) => (
                <TextInput
                  className={`bg-white border rounded-xl px-4 py-3.5 text-base text-neutral-900 ${
                    errors.email ? 'border-danger-400' : 'border-neutral-300'
                  }`}
                  placeholder="you@example.com"
                  placeholderTextColor="#9CA3AF"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  onChangeText={onChange}
                  onBlur={onBlur}
                  value={value}
                />
              )}
            />
            {errors.email ? (
              <Text className="text-xs text-danger-500 mt-1">
                {errors.email.message}
              </Text>
            ) : null}
          </View>

          <View className="mb-6">
            <Text className="text-sm font-medium text-neutral-700 mb-1.5">
              Password
            </Text>
            <View className="relative">
              <Controller
                control={control}
                name="password"
                render={({ field: { onChange, onBlur, value } }) => (
                  <TextInput
                    className={`bg-white border rounded-xl px-4 py-3.5 text-base text-neutral-900 pr-12 ${
                      errors.password ? 'border-danger-400' : 'border-neutral-300'
                    }`}
                    placeholder="Enter your password"
                    placeholderTextColor="#9CA3AF"
                    secureTextEntry={!showPassword}
                    onChangeText={onChange}
                    onBlur={onBlur}
                    value={value}
                  />
                )}
              />
              <TouchableOpacity
                className="absolute right-3 top-3.5"
                onPress={() => setShowPassword(!showPassword)}
              >
                <Text className="text-lg">{showPassword ? '🙈' : '👁️'}</Text>
              </TouchableOpacity>
            </View>
            {errors.password ? (
              <Text className="text-xs text-danger-500 mt-1">
                {errors.password.message}
              </Text>
            ) : null}
          </View>

          <Button
            title="Sign In"
            onPress={handleSubmit(onSubmit)}
            loading={isLoading}
          />

          <Text className="text-xs text-neutral-400 text-center mt-6">
            Use any email with password: password123
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
