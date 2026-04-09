/** Paleta y tipografías alineadas a la maqueta BusCali (Material / Tailwind del diseño). */
export const C = {
  surface: '#e1fbff',
  primary: '#006666',
  primaryDim: '#005959',
  onPrimary: '#bbfffe',
  onSurface: '#003439',
  onSurfaceVariant: '#29646a',
  secondary: '#6c5a00',
  secondaryContainer: '#ffd709',
  secondaryFixedDim: '#efc900',
  onSecondaryContainer: '#5b4b00',
  onSecondaryFixed: '#453900',
  surfaceContainerLow: '#cbf9ff',
  surfaceContainerLowest: '#ffffff',
  surfaceContainerHigh: '#a2eff9',
  surfaceContainerHighest: '#97eaf4',
  outline: '#477f86',
  outlineVariant: '#7eb6be',
  primaryContainer: '#8dedec',
  tertiary: '#006a3b',
  error: '#b31b25',
  white: '#ffffff',
} as const;

/** Deben coincidir con las claves pasadas a useFonts en App.tsx */
export const F = {
  headline: 'SpaceGrotesk_700Bold',
  headlineMed: 'SpaceGrotesk_500Medium',
  headlineReg: 'SpaceGrotesk_400Regular',
  body: 'PlusJakartaSans_400Regular',
  bodyMed: 'PlusJakartaSans_500Medium',
  bodySemi: 'PlusJakartaSans_600SemiBold',
  bodyBold: 'PlusJakartaSans_700Bold',
} as const;
