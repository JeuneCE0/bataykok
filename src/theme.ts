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

/**
 * Échelle d'espacement, en pas de 4.
 *
 * Le relevé d'avant cette grille donnait vingt valeurs distinctes (1, 2, 3, 5,
 * 6, 7, 9, 11, 14, 18, 22, 26…) posées au jugé écran par écran. Les jeux qui
 * paraissent « propres » ne le doivent pas à leur palette mais à cette
 * discipline : tout se cale sur la même trame, donc rien ne flotte.
 */
export const SP = {
  xxs: 2,
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

/**
 * Épaisseurs de trait.
 *
 * Le trait épais et sombre est la signature du genre : chaque élément se
 * détache comme un autocollant posé sur le fond, au lieu de s'y fondre.
 */
export const BW = { hair: 1, thick: 2, chunky: 3 } as const;

/** Contour sombre des éléments interactifs — c'est lui qui « découpe » la forme. */
export const OUTLINE = 'rgba(6,3,12,0.75)';

/**
 * Échelle typographique.
 *
 * Vingt tailles cohabitaient, dont neuf en demi-points (9,5 · 10,5 · 11,5 …).
 * Neuf suffisent — et les trois dernières sont des tailles d'affichage, à
 * réserver aux moments qui doivent occuper l'écran.
 */
export const FS = {
  micro: 11,
  caption: 12,
  small: 13,
  body: 15,
  title: 17,
  h2: 20,
  h1: 24,
  display: 31,
  hero: 44,
  giant: 64,
} as const;

/**
 * Contour de texte.
 *
 * Un titre clair sur un fond clair perd ses bords ; le liseré sombre le tient
 * lisible partout, et c'est ce qui donne aux gros chiffres leur présence.
 */
export const TEXT_OUTLINE = {
  textShadowColor: 'rgba(6,3,12,0.85)',
  textShadowOffset: { width: 0, height: 2 },
  textShadowRadius: 3,
} as const;

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
    ...TEXT_OUTLINE,
    fontSize: 31,
    lineHeight: 41,
    letterSpacing: 0.3,
    color: C.text,
  } as TextStyle,
  h1: {
    fontFamily: F.black,
    ...TEXT_OUTLINE,
    fontSize: 24,
    lineHeight: 32,
    color: C.text,
  } as TextStyle,
  h2: {
    fontFamily: F.bold,
    fontSize: 17,
    lineHeight: 22,
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
    lineHeight: 20,
    color: C.text,
  } as TextStyle,
  dim: {
    fontFamily: F.regular,
    fontSize: 13,
    lineHeight: 17,
    color: C.textDim,
  } as TextStyle,
  tiny: {
    fontFamily: F.semi,
    fontSize: 12,
    lineHeight: 16,
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
