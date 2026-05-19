import React from 'react';
import { View, ScrollView, type ScrollViewProps } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

interface Props extends ScrollViewProps {
  scroll?: boolean;
  /** Set when the screen already has a navigation header consuming the
   *  status-bar area, so the safe-area top inset isn't applied twice. */
  hasHeader?: boolean;
  children: React.ReactNode;
}

/**
 * Standard screen wrapper: applies safe-area top inset (replacing hardcoded
 * pt-14) and constrains content to a comfortable reading width on
 * tablet/web so layouts never stretch edge-to-edge.
 */
export default function ScreenContainer({
  scroll = true,
  hasHeader = false,
  children,
  contentContainerStyle,
  ...rest
}: Props) {
  const insets = useSafeAreaInsets();
  const pad = { paddingTop: hasHeader ? 24 : insets.top + 16 };

  const inner = (
    <View className="w-full max-w-[600px] self-center px-6 pb-8 flex-1" style={pad}>
      {children}
    </View>
  );

  if (!scroll) {
    return <View className="flex-1 bg-neutral-50">{inner}</View>;
  }

  return (
    <ScrollView
      className="flex-1 bg-neutral-50"
      keyboardShouldPersistTaps="handled"
      contentContainerStyle={[{ flexGrow: 1 }, contentContainerStyle]}
      {...rest}
    >
      {inner}
    </ScrollView>
  );
}
