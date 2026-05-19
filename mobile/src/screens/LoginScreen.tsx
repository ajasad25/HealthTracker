import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useNavigation } from '@react-navigation/native';
import type { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { loginSchema, type LoginFormData } from '../utils/validation';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { loginThunk, clearError } from '../store/authSlice';
import AuthField from '../components/AuthField';
import Icon from '../components/Icon';
import { colors, fonts } from '../theme';
import type { AuthStackParamList } from '../types';

type LoginNav = NativeStackNavigationProp<AuthStackParamList, 'Login'>;

export default function LoginScreen() {
  const navigation = useNavigation<LoginNav>();
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
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Decorative tinted blooms */}
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: -120,
          right: -80,
          width: 320,
          height: 320,
          borderRadius: 160,
          backgroundColor: colors.teal,
          opacity: 0.1,
        }}
      />
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          bottom: -100,
          left: -60,
          width: 260,
          height: 260,
          borderRadius: 130,
          backgroundColor: colors.coral,
          opacity: 0.1,
        }}
      />

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 28,
          paddingTop: 90,
          paddingBottom: 40,
          width: '100%',
          maxWidth: 480,
          alignSelf: 'center',
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Brand */}
        <View style={{ flex: 1, justifyContent: 'flex-start' }}>
          <View
            style={{
              width: 52,
              height: 52,
              borderRadius: 16,
              backgroundColor: colors.teal,
              alignItems: 'center',
              justifyContent: 'center',
              shadowColor: colors.teal,
              shadowOpacity: 0.4,
              shadowRadius: 14,
              shadowOffset: { width: 0, height: 10 },
              elevation: 6,
            }}
          >
            <Icon name="heart" size={26} color={colors.white} stroke={1.8} />
          </View>
          <Text
            style={{
              fontFamily: fonts.serifItalic,
              fontSize: 40,
              color: colors.ink,
              lineHeight: 42,
              letterSpacing: -1.2,
              marginTop: 28,
            }}
          >
            Welcome{'\n'}back.
          </Text>
          <Text
            style={{
              fontFamily: fonts.sans,
              fontSize: 14,
              color: colors.ink3,
              lineHeight: 21,
              marginTop: 12,
              maxWidth: 260,
            }}
          >
            Sign in to keep tracking your vitals and stay ahead of your health.
          </Text>
        </View>

        {/* Form */}
        <View style={{ marginTop: 40 }}>
          {error ? (
            <View
              style={{
                backgroundColor: colors.coralTint,
                borderRadius: 14,
                padding: 12,
                marginBottom: 16,
              }}
            >
              <Text
                style={{
                  fontFamily: fonts.sansMedium,
                  fontSize: 13,
                  color: '#7C2F1B',
                  textAlign: 'center',
                }}
              >
                {error}
              </Text>
            </View>
          ) : null}

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <AuthField
                label="Email"
                icon="user"
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                error={errors.email?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, onBlur, value } }) => (
              <AuthField
                label="Password"
                icon="dot"
                placeholder="Enter your password"
                secureTextEntry={!showPassword}
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                error={errors.password?.message}
                secureToggle={{
                  shown: showPassword,
                  onToggle: () => setShowPassword((s) => !s),
                }}
              />
            )}
          />

          <TouchableOpacity
            activeOpacity={0.85}
            disabled={isLoading}
            onPress={handleSubmit(onSubmit)}
            accessibilityRole="button"
            accessibilityLabel="Sign in"
            accessibilityState={{ disabled: isLoading, busy: isLoading }}
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              backgroundColor: colors.ink,
              borderRadius: 14,
              paddingVertical: 16,
              marginTop: 4,
              opacity: isLoading ? 0.6 : 1,
            }}
          >
            <Text
              style={{
                fontFamily: fonts.sansSemibold,
                fontSize: 15,
                color: colors.white,
                letterSpacing: 0.2,
              }}
            >
              {isLoading ? 'Signing in…' : 'Sign in'}
            </Text>
            {!isLoading && (
              <Icon name="arrow" size={16} color={colors.white} stroke={1.8} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Signup')}
            accessibilityRole="button"
            accessibilityLabel="Go to sign up"
            style={{ marginTop: 22 }}
          >
            <Text
              style={{
                fontFamily: fonts.sans,
                fontSize: 13,
                color: colors.ink3,
                textAlign: 'center',
              }}
            >
              New here?{' '}
              <Text style={{ fontFamily: fonts.sansSemibold, color: colors.teal }}>
                Create account
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
