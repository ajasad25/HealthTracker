import React from 'react';
import {
  View,
  ScrollView,
  type ScrollViewProps,
  type ViewStyle,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { colors } from '../theme';

interface Props extends ScrollViewProps {
  scroll?: boolean;
  /** Extra bottom padding so content clears the floating tab bar. */
  tabBarSpace?: boolean;
  children: React.ReactNode;
}

/**
 * Clinical-Calm screen shell: warm-cream canvas, safe-area top inset, and a
 * comfortable max content width on tablet/web. Screens supply their own
 * horizontal/vertical rhythm to match the handoff spacing exactly.
 */
export default function CalmScreen({
  scroll = true,
  tabBarSpace = false,
  children,
  contentContainerStyle,
  ...rest
}: Props) {
  const insets = useSafeAreaInsets();
  const frame: ViewStyle = {
    width: '100%',
    maxWidth: 600,
    alignSelf: 'center',
    paddingTop: insets.top + 8,
    paddingBottom: tabBarSpace ? 96 : insets.bottom + 24,
    flexGrow: 1,
  };

  if (!scroll) {
    return (
      <View style={{ flex: 1, backgroundColor: colors.bg }}>
        <View style={frame}>{children}</View>
      </View>
    );
  }

  return (
    <ScrollView
      style={{ flex: 1, backgroundColor: colors.bg }}
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerStyle={[frame, contentContainerStyle]}
      {...rest}
    >
      {children}
    </ScrollView>
  );
}
