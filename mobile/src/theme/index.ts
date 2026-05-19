/**
 * "Clinical Calm" design system — single source of truth for the redesign.
 *
 * Ported from the Claude Design handoff (tokens.jsx). The prototype mutated
 * a global token object for a live dark-mode tweak panel; that panel is
 * design-tool scaffolding, so here we ship the default light palette as a
 * static, strongly-typed theme. Screens reference `theme.*` instead of
 * hardcoding hex (the redesign supersedes the old primary/neutral scale).
 */

export const colors = {
  // Surfaces
  bg: '#F2EEE5', // warm cream canvas
  bgSoft: '#EBE6DA',
  surface: '#FFFFFF',
  surface2: '#FAF7F0',
  hair: '#E6DFCE',
  hairSoft: '#EFEADC',

  // Ink
  ink: '#0E1614',
  ink2: '#3A4543',
  ink3: '#6B7572',
  ink4: '#A1A8A4',

  // Brand
  teal: '#0E5460',
  tealDeep: '#062F37',
  tealTint: '#DDE8E9',
  tealSoft: '#EEF4F4',

  // Semantic
  coral: '#E07A5F', // alert / energy
  coralTint: '#F8DDD3',
  sage: '#7A9B7E', // good
  sageTint: '#E1ECE2',
  amber: '#C58B3F', // warning
  amberTint: '#F4E6CC',
  rose: '#D55B6E', // heart pink
  roseTint: '#F7D9DE',

  white: '#FFFFFF',
} as const;

/**
 * Google-font family names as registered by @expo-google-fonts. React
 * Native cannot synthesize italics for custom fonts, so the editorial
 * "serif" is the dedicated Newsreader *italic* face — use it directly,
 * never with `fontStyle: 'italic'`.
 */
export const fonts = {
  sans: 'Inter_400Regular',
  sansMedium: 'Inter_500Medium',
  sansSemibold: 'Inter_600SemiBold',
  sansBold: 'Inter_700Bold',
  serifItalic: 'Newsreader_400Regular_Italic',
  serifItalicMedium: 'Newsreader_500Medium_Italic',
  mono: 'JetBrainsMono_400Regular',
  monoMedium: 'JetBrainsMono_500Medium',
} as const;

export const radii = {
  sm: 10,
  md: 14,
  lg: 20,
  xl: 28,
} as const;

/** Maps a VitalStatus to its pill colors (dot + tint background). */
export const statusColor = {
  normal: { dot: colors.sage, tint: colors.sageTint, text: 'Normal' },
  warning: { dot: colors.amber, tint: colors.amberTint, text: 'Watch' },
  danger: { dot: colors.coral, tint: colors.coralTint, text: 'Alert' },
} as const;

export const theme = { colors, fonts, radii, statusColor };
export type Theme = typeof theme;
