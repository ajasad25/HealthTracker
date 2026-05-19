import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  type TouchableOpacityProps,
} from 'react-native';

interface ButtonProps extends TouchableOpacityProps {
  title: string;
  variant?: 'primary' | 'secondary' | 'danger';
  loading?: boolean;
}

const variantStyles = {
  primary: {
    container: 'bg-primary-500 active:bg-primary-600',
    text: 'text-white',
  },
  secondary: {
    container: 'bg-neutral-200 active:bg-neutral-300',
    text: 'text-neutral-800',
  },
  danger: {
    container: 'bg-danger-500 active:bg-danger-600',
    text: 'text-white',
  },
};

export default function Button({
  title,
  variant = 'primary',
  loading = false,
  disabled,
  ...props
}: ButtonProps) {
  const styles = variantStyles[variant];
  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      className={`rounded-xl py-4 px-6 items-center justify-center flex-row ${styles.container} ${
        isDisabled ? 'opacity-50' : ''
      }`}
      disabled={isDisabled}
      activeOpacity={0.8}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          color={variant === 'secondary' ? '#1F2937' : '#FFFFFF'}
          className="mr-2"
        />
      ) : null}
      <Text className={`text-base font-semibold ${styles.text}`}>{title}</Text>
    </TouchableOpacity>
  );
}
