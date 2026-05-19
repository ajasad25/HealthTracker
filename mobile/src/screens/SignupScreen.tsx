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
import { signupSchema, type SignupFormData } from '../utils/validation';
import { useAppDispatch } from '../hooks/useAppDispatch';
import { useAppSelector } from '../hooks/useAppSelector';
import { signupThunk, clearError } from '../store/authSlice';
import AuthField from '../components/AuthField';
import Icon from '../components/Icon';
import { colors, fonts } from '../theme';
import type { AuthStackParamList } from '../types';

type SignupNav = NativeStackNavigationProp<AuthStackParamList, 'Signup'>;

export default function SignupScreen() {
  const navigation = useNavigation<SignupNav>();
  const dispatch = useAppDispatch();
  const { isLoading, error } = useAppSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm<SignupFormData>({
    resolver: zodResolver(signupSchema),
    defaultValues: { name: '', email: '', password: '' },
  });

  const onSubmit = (data: SignupFormData) => {
    dispatch(clearError());
    dispatch(signupThunk(data));
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: colors.bg }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <View
        pointerEvents="none"
        style={{
          position: 'absolute',
          top: -120,
          left: -80,
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
          right: -60,
          width: 260,
          height: 260,
          borderRadius: 130,
          backgroundColor: colors.sage,
          opacity: 0.12,
        }}
      />

      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 28,
          paddingTop: 80,
          paddingBottom: 40,
          width: '100%',
          maxWidth: 480,
          alignSelf: 'center',
        }}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        <View style={{ flex: 1 }}>
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
            Create{'\n'}account.
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
            Start tracking your vitals and build a clear picture of your health.
          </Text>
        </View>

        <View style={{ marginTop: 36 }}>
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
            name="name"
            render={({ field: { onChange, onBlur, value } }) => (
              <AuthField
                label="Name"
                icon="user"
                placeholder="Jane Doe"
                autoCapitalize="words"
                autoCorrect={false}
                onChangeText={onChange}
                onBlur={onBlur}
                value={value}
                error={errors.name?.message}
              />
            )}
          />

          <Controller
            control={control}
            name="email"
            render={({ field: { onChange, onBlur, value } }) => (
              <AuthField
                label="Email"
                icon="dot"
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
                placeholder="At least 6 characters"
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
            accessibilityLabel="Sign up"
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
              {isLoading ? 'Creating account…' : 'Create account'}
            </Text>
            {!isLoading && (
              <Icon name="arrow" size={16} color={colors.white} stroke={1.8} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => navigation.navigate('Login')}
            accessibilityRole="button"
            accessibilityLabel="Go to sign in"
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
              Already have an account?{' '}
              <Text style={{ fontFamily: fonts.sansSemibold, color: colors.teal }}>
                Sign in
              </Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
