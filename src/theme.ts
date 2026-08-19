import type { TextStyle } from 'react-native';

/**
 * Direction artistique « Kabar Volcan » : nuit tropicale profonde, braise du
 * volcan et or de fête foraine. Les aplats sont bannis — tout ce qui est
 * interactif porte un dégradé et un relief.
 */
export const C = {
  // Fonds
  night: '#0A0713',
  night2: '#160D22',
  night3: '#241533',
  // Surfaces (posées sur le fond avec transparence)
  card: 'rgba(255, 246, 232, 0.055)',
  cardStrong: 'rgba(255, 246, 232, 0.10)',
  hairline: 'rgba(255, 246, 232, 0.16)',
  hairlineSoft: 'rgba(255, 246, 232, 0.10)',
  well: 'rgba(8, 4, 16, 0.72)',
  // Accents
  ember: '#FF5A1F',
  emberDeep: '#C22E00',
  lava: '#FF8A3D',
  gold: '#FFC93C',
  goldDeep: '#D99000',
  piment: '#FF3B5C',
  cane: '#3BD97E',
  lagoon: '#2FC6E8',
  mystic: '#B06BFF',
  // Textes — les trois niveaux restent distincts mais tous lisibles sur
  // surface sombre (le gris violacé d'origine tombait sous 3,5:1)
  text: '#FFF6EC',
  textDim: '#CDBEDA',
  textFaint: '#A08FB2',
  ink: '#2A1206',
} as const;

/** Dégradés réutilisables (expo-linear-gradient attend un tuple). */
export const G = {
  gold: ['#FFDE7A', '#FFC93C', '#E9A100'] as const,
  ember: ['#FF9245', '#FF5A1F', '#D13500'] as const,
  piment: ['#FF7A8F', '#FF3B5C', '#C4102F'] as const,
  cane: ['#7BE8A8', '#3BD97E', '#17A75A'] as const,
  lagoon: ['#7FE3F7', '#2FC6E8', '#0E8FB0'] as const,
  mystic: ['#D6A8FF', '#B06BFF', '#7B2FD6'] as const,
  slate: ['#5B4A6E', '#3D3050', '#241B33'] as const,
  card: ['rgba(41,28,58,0.88)', 'rgba(21,13,34,0.92)'] as const,
  night: ['#160D22', '#0A0713'] as const,
} as const;

export type GradientKey = keyof typeof G;

export const R = { sm: 10, md: 14, lg: 20, xl: 28, pill: 999 } as const;

export const SP = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24 } as const;

/** Ombres portées — la profondeur fait 80 % du « premium » sur mobile. */
export const SHADOW = {
  card: {
    shadowColor: '#000',
    shadowOpacity: 0.45,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 8 },
    elevation: 8,
  },
  float: {
    shadowColor: '#000',
    shadowOpacity: 0.55,
    shadowRadius: 24,
    shadowOffset: { width: 0, height: 14 },
    elevation: 14,
  },
  glowEmber: {
    shadowColor: C.ember,
    shadowOpacity: 0.55,
    shadowRadius: 18,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
  glowGold: {
    shadowColor: C.gold,
    shadowOpacity: 0.5,
    shadowRadius: 16,
    shadowOffset: { width: 0, height: 6 },
    elevation: 10,
  },
} as const;

/**
 * Baloo 2 : cartoon rond, chaleureux, avec un latin-ext complet (les accents
 * créoles/français passent, contrairement aux display fonts type Titan One).
 */
export const F = {
  black: 'Baloo2_800ExtraBold',
  bold: 'Baloo2_700Bold',
  semi: 'Baloo2_600SemiBold',
  regular: 'Baloo2_500Medium',
} as const;

export const TYPO = {
  display: {
    fontFamily: F.black,
    fontSize: 31,
    lineHeight: 40,
    letterSpacing: 0.3,
    color: C.text,
  } as TextStyle,
  h1: {
    fontFamily: F.black,
    fontSize: 23,
    lineHeight: 30,
    color: C.text,
  } as TextStyle,
  h2: {
    fontFamily: F.bold,
    fontSize: 18,
    lineHeight: 24,
    color: C.text,
  } as TextStyle,
  label: {
    fontFamily: F.black,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
    color: C.textDim,
  } as TextStyle,
  body: {
    fontFamily: F.regular,
    fontSize: 15,
    lineHeight: 22,
    color: C.text,
  } as TextStyle,
  dim: {
    fontFamily: F.regular,
    fontSize: 14,
    lineHeight: 21,
    color: C.textDim,
  } as TextStyle,
  tiny: {
    fontFamily: F.semi,
    fontSize: 12.5,
    lineHeight: 17,
    color: C.textDim,
  } as TextStyle,
  num: {
    fontFamily: F.black,
    fontSize: 17,
    lineHeight: 22,
    color: C.text,
  } as TextStyle,
} as const;

/**
 * Éclaircit (amt > 0) ou assombrit (amt < 0) une couleur hexadécimale.
 * Sert au coq paramétrique et aux médaillons de classe.
 */
export function shade(hex: string, amt: number): string {
  const num = parseInt(hex.replace('#', ''), 16);
  const cl = (v: number) => Math.max(0, Math.min(255, v));
  const r = cl((num >> 16) + amt);
  const g = cl(((num >> 8) & 0xff) + amt);
  const b = cl((num & 0xff) + amt);
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
