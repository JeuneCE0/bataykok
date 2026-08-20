import React, { useId } from 'react';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  Polygon,
  Rect,
  Stop,
} from 'react-native-svg';

import { Rarity, SlotId } from '../game/types';

/**
 * Dessin d'un équipement.
 *
 * Les objets étaient signalés par un emoji d'emplacement : les huit zéprons du
 * jeu, du commun au mitik, partageaient le même 🗡️. Rien ne distinguait une
 * pièce d'une autre, et une gamme d'une autre.
 *
 * Ici chaque emplacement a sa forme, et chaque gamme son métal et sa pierre —
 * même principe que le coq : tout est vectoriel, donc la variété ne coûte rien
 * en taille d'app et reste nette à n'importe quelle échelle. Les hautes gammes
 * gagnent en plus une gravure et une pierre sertie.
 */
interface Palette {
  clair: string;
  moyen: string;
  sombre: string;
  pierre: string;
  pierreClaire: string;
  /** 0 = brut, 1 = gravé, 2 = serti */
  faste: 0 | 1 | 2;
}

const PALETTES: Record<Rarity, Palette> = {
  commun: {
    clair: '#B8BFC7', moyen: '#8A929C', sombre: '#4E555E',
    pierre: '#6B737D', pierreClaire: '#98A0AA', faste: 0,
  },
  korek: {
    clair: '#9BE8B8', moyen: '#3BD97E', sombre: '#177A45',
    pierre: '#2FA85F', pierreClaire: '#7DE3A6', faste: 0,
  },
  kalite: {
    clair: '#9BD7F7', moyen: '#3BA9F0', sombre: '#15588F',
    pierre: '#2F86C6', pierreClaire: '#8ACBF0', faste: 1,
  },
  rar: {
    clair: '#D6B0FF', moyen: '#B06BFF', sombre: '#5E2AA8',
    pierre: '#8B3FE0', pierreClaire: '#CDA2FF', faste: 1,
  },
  lezand: {
    clair: '#FFC79B', moyen: '#FF8A3D', sombre: '#A83E00',
    pierre: '#E05A1A', pierreClaire: '#FFB584', faste: 2,
  },
  mitik: {
    clair: '#FFE9A8', moyen: '#FFC93C', sombre: '#A87400',
    pierre: '#E8A000', pierreClaire: '#FFDD7A', faste: 2,
  },
  zanset: {
    clair: '#FFB3C6', moyen: '#FF2E63', sombre: '#8A0B2C',
    pierre: '#D4145A', pierreClaire: '#FF7FA3', faste: 2,
  },
};

const TRAIT = 'rgba(6,3,12,0.85)';

export default function ItemArt({
  slot,
  rarity,
  size = 40,
}: {
  slot: SlotId;
  rarity: Rarity;
  size?: number;
}) {
  const uid = useId().replace(/:/g, '');
  const p = PALETTES[rarity];
  const g = (n: string) => `${n}${uid}`;

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id={g('metal')} x1="0" y1="0" x2="0.4" y2="1">
          <Stop offset="0" stopColor={p.clair} />
          <Stop offset="0.55" stopColor={p.moyen} />
          <Stop offset="1" stopColor={p.sombre} />
        </LinearGradient>
        <LinearGradient id={g('gem')} x1="0" y1="0" x2="0.5" y2="1">
          <Stop offset="0" stopColor={p.pierreClaire} />
          <Stop offset="1" stopColor={p.pierre} />
        </LinearGradient>
      </Defs>
      {DESSINS[slot](g, p)}
    </Svg>
  );
}

type Dessin = (g: (n: string) => string, p: Palette) => React.ReactElement;

/** Pierre sertie — réservée aux gammes qui la méritent. */
function Pierre(g: (n: string) => string, p: Palette, cx: number, cy: number, r: number) {
  if (p.faste === 0) return null;
  return (
    <G>
      <Circle cx={cx} cy={cy} r={r} fill={`url(#${g('gem')})`} stroke={TRAIT} strokeWidth={2.5} />
      <Circle cx={cx - r * 0.3} cy={cy - r * 0.3} r={r * 0.3} fill="#FFFFFF" opacity={0.55} />
    </G>
  );
}

const DESSINS: Record<SlotId, Dessin> = {
  // Zéprons : une lame franche, garde et manche gainé.
  // Deux lames croisées finissaient en filets — sous 18 unités de large, le
  // trait de contour mange la forme et il ne reste qu'un gribouillis.
  arme: (g, p) => (
    <G stroke={TRAIT} strokeWidth={3} strokeLinejoin="round">
      <Path d="M50 8 L64 30 L64 64 L36 64 L36 30 Z" fill={`url(#${g('metal')})`} />
      <Rect x={22} y={62} width={56} height={12} rx={5} fill={p.sombre} />
      <Rect x={42} y={72} width={16} height={20} rx={5} fill={p.sombre} />
      <Ellipse cx={50} cy={92} rx={12} ry={6} fill={`url(#${g('metal')})`} />
      {Pierre(g, p, 50, 40, 9)}
    </G>
  ),

  // Kasket : dôme et visière
  tete: (g, p) => (
    <G stroke={TRAIT} strokeWidth={3} strokeLinejoin="round">
      <Path d="M22 62 C22 30, 78 30, 78 62 Z" fill={`url(#${g('metal')})`} />
      <Path d="M18 62 C34 74, 66 74, 82 62 L82 68 C66 80, 34 80, 18 68 Z" fill={p.sombre} />
      {p.faste > 0 ? (
        <Path d="M47 30 L53 30 L53 60 L47 60 Z" fill={p.clair} opacity={0.9} />
      ) : null}
      {Pierre(g, p, 50, 46, 8)}
    </G>
  ),

  // Plimaz : plastron et épaulières
  torse: (g, p) => (
    <G stroke={TRAIT} strokeWidth={3} strokeLinejoin="round">
      <Path d="M18 30 C26 24, 34 24, 40 30 L40 44 L18 44 Z" fill={p.sombre} />
      <Path d="M82 30 C74 24, 66 24, 60 30 L60 44 L82 44 Z" fill={p.sombre} />
      <Path d="M32 28 L50 34 L68 28 L74 62 C74 80, 62 88, 50 92 C38 88, 26 80, 26 62 Z"
        fill={`url(#${g('metal')})`} />
      {p.faste > 0 ? (
        <Path d="M50 40 L50 84" stroke={p.clair} strokeWidth={3} opacity={0.8} />
      ) : null}
      {Pierre(g, p, 50, 54, 9)}
    </G>
  ),

  // Zergos : botte
  pattes: (g, p) => (
    <G stroke={TRAIT} strokeWidth={3} strokeLinejoin="round">
      <Path d="M34 18 L62 18 L62 62 L82 62 C88 62, 88 80, 82 80 L34 80 Z"
        fill={`url(#${g('metal')})`} />
      <Rect x={30} y={76} width={58} height={12} rx={5} fill={p.sombre} />
      <Rect x={34} y={36} width={28} height={7} rx={3} fill={p.sombre} />
      {p.faste > 0 ? <Rect x={34} y={50} width={28} height={7} rx={3} fill={p.sombre} /> : null}
      {Pierre(g, p, 72, 68, 6)}
    </G>
  ),

  // Kolié : cordon et pendentif
  amulette: (g, p) => (
    <G strokeLinejoin="round">
      <Path d="M22 18 C22 58, 78 58, 78 18" fill="none" stroke={TRAIT} strokeWidth={13} />
      <Path d="M22 18 C22 58, 78 58, 78 18" fill="none" stroke={p.sombre} strokeWidth={8} />
      <Path
        d="M50 44 L72 68 L50 94 L28 68 Z"
        fill={`url(#${g('metal')})`}
        stroke={TRAIT}
        strokeWidth={3}
      />
      {Pierre(g, p, 50, 68, 11)}
    </G>
  ),

  // Bag : jonc épais et chaton serti.
  // Le contour était tracé au même rayon que le jonc : il le recouvrait tout
  // entier, et l'anneau sortait en simple filet sombre.
  anneau: (g, p) => (
    <G strokeLinejoin="round">
      <Circle cx={50} cy={62} r={30} fill="none" stroke={TRAIT} strokeWidth={20} />
      <Circle cx={50} cy={62} r={30} fill="none" stroke={`url(#${g('metal')})`} strokeWidth={14} />
      <Polygon
        points="50,10 68,30 50,50 32,30"
        fill={`url(#${g('gem')})`}
        stroke={TRAIT}
        strokeWidth={3}
      />
      {p.faste > 0 ? (
        <Polygon points="50,18 60,30 50,42 40,30" fill="#FFFFFF" opacity={0.35} />
      ) : null}
    </G>
  ),

  // Sintir : sangle et boucle
  ceinture: (g, p) => (
    <G stroke={TRAIT} strokeWidth={3} strokeLinejoin="round">
      <Rect x={8} y={40} width={84} height={22} rx={6} fill={p.sombre} />
      <Rect x={8} y={44} width={84} height={5} rx={2} fill={p.clair} opacity={0.35} stroke="none" />
      <Rect x={34} y={32} width={32} height={38} rx={8} fill={`url(#${g('metal')})`} />
      <Rect x={44} y={42} width={12} height={18} rx={4} fill={p.sombre} />
      {Pierre(g, p, 50, 26, 7)}
    </G>
  ),

  // Gri-gri : sachet noué et perle
  grigri: (g, p) => (
    <G stroke={TRAIT} strokeWidth={3} strokeLinejoin="round">
      <Path d="M50 14 C42 22, 42 30, 50 34 C58 30, 58 22, 50 14 Z" fill={p.sombre} />
      <Path d="M34 36 L66 36 L74 74 C74 88, 26 88, 26 74 Z" fill={`url(#${g('metal')})`} />
      <Rect x={30} y={34} width={40} height={9} rx={4} fill={p.sombre} />
      <Ellipse cx={50} cy={64} rx={13} ry={11} fill={p.sombre} opacity={0.5} stroke="none" />
      {Pierre(g, p, 50, 64, 9)}
    </G>
  ),
};
