export const colors = {
  ink: '#17191C',
  charcoal: '#363A40',
  muted: '#737B85',
  subtle: '#A3A9B0',
  border: '#E4E7EB',
  canvas: '#F6F7F8',
  surface: '#FFFFFF',
  accent: '#D6A847',
  accentSoft: '#FBF4E5',
  success: '#247A58',
  successSoft: '#E8F5EE',
  warning: '#A96A16',
  warningSoft: '#FFF4E3',
  danger: '#BA4242',
  dangerSoft: '#FCEEEE',
  info: '#426B92',
  infoSoft: '#EDF4FA',
  overlay: 'rgba(18, 22, 26, 0.42)',
} as const;

export const spacing = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 20,
  xxl: 24,
  xxxl: 32,
} as const;

export const radius = {
  sm: 8,
  md: 12,
  lg: 18,
  pill: 999,
} as const;

export const typography = {
  caption: 12,
  body: 14,
  bodyLarge: 16,
  title: 20,
  heading: 26,
  display: 32,
} as const;

export const fontFamilies = {
  light: 'Figtree_300Light',
  regular: 'Figtree_400Regular',
  medium: 'Figtree_500Medium',
  semibold: 'Figtree_600SemiBold',
  bold: 'Figtree_700Bold',
  extrabold: 'Figtree_800ExtraBold',
  black: 'Figtree_900Black',
} as const;
