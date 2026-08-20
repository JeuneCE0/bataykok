import React, { useId } from 'react';
import Svg, { Circle, Defs, G, LinearGradient, Path, Stop } from 'react-native-svg';

import { SET_BY_ID } from '../game/sets';

/**
 * Blason d'une panoplie.
 *
 * Les cinq panoplies s'annonçaient par un emoji (🥾 🌋 🎵 🪬 💨) au milieu
 * d'une interface entièrement vectorielle — et, glissé dans une ligne de
 * texte, l'emoji gonfle la boîte de ligne et décale le centrage (Baloo 2).
 * Chaque panoplie a désormais son écu, teinté de sa couleur.
 */
const TRAIT = 'rgba(6,3,12,0.85)';
const ECU = 'M50 5 L89 19 L89 52 C89 77, 69 91, 50 97 C31 91, 11 77, 11 52 L11 19 Z';

/** Mélange vers le blanc (k > 0) ou vers le noir (k < 0). */
function melanger(hex: string, k: number): string {
  const n = parseInt(hex.slice(1), 16);
  const cible = k > 0 ? 255 : 0;
  const t = Math.abs(k);
  const c = (d: number) => Math.round(((n >> d) & 255) * (1 - t) + cible * t);
  return `rgb(${c(16)}, ${c(8)}, ${c(0)})`;
}

const GLYPHES: Record<string, (clair: string) => React.ReactElement> = {
  // Mafate : la ligne de crête du cirque
  mafate: (clair) => (
    <Path
      d="M24 70 L42 42 L53 57 L66 36 L80 70 Z"
      fill={clair}
      stroke={TRAIT}
      strokeWidth={3}
      strokeLinejoin="round"
    />
  ),
  // Volkan : cratère ouvert et coulée — un cône plein se lisait comme la
  // crête du Mafate, les deux écus se ressemblaient de loin
  volkan: (clair) => (
    <G stroke={TRAIT} strokeWidth={3} strokeLinejoin="round">
      <Path d="M24 80 L42 38 L58 38 L76 80 Z" fill={clair} />
      <Path d="M42 38 L58 38 L56 52 L44 52 Z" fill="#FFFFFF" stroke="none" />
      <Path
        d="M57 46 C65 56, 60 66, 70 80"
        fill="none"
        strokeWidth={9}
        stroke="#FFFFFF"
        strokeLinecap="round"
      />
    </G>
  ),

  // Séga : deux notes liées
  sega: (clair) => (
    <G stroke={TRAIT} strokeWidth={3} strokeLinejoin="round">
      <Path d="M40 68 L40 34 L74 26 L74 60" fill="none" strokeWidth={7} stroke={clair} />
      <Circle cx={34} cy={70} r={9} fill={clair} />
      <Circle cx={68} cy={62} r={9} fill={clair} />
    </G>
  ),
  // Gramoune : la main qui protège
  gramoune: (clair) => (
    <G stroke={TRAIT} strokeWidth={3} strokeLinejoin="round">
      <Path
        d="M36 76 L36 44 C36 39, 44 39, 44 44 L44 34 C44 29, 52 29, 52 34 L52 36
           C52 31, 60 31, 60 36 L60 46 C60 41, 68 41, 68 46 L68 66
           C68 76, 60 82, 50 82 C42 82, 36 80, 36 76 Z"
        fill={clair}
      />
      <Circle cx={52} cy={60} r={5} fill={TRAIT} stroke="none" />
    </G>
  ),
  // Kanyar : le vent qui file
  kanyar: (clair) => (
    <G stroke={clair} strokeWidth={8} strokeLinecap="round" fill="none">
      <Path d="M24 40 L64 40 C74 40, 74 26, 64 28" />
      <Path d="M24 56 L72 56" />
      <Path d="M24 72 L58 72 C68 72, 68 84, 58 82" />
    </G>
  ),
};

export default function SetCrest({ id, size = 26 }: { id: string; size?: number }) {
  const uid = useId().replace(/:/g, '');
  const def = SET_BY_ID[id];
  const glyphe = GLYPHES[id];
  if (!def || !glyphe) return null;

  return (
    <Svg width={size} height={size} viewBox="0 0 100 100">
      <Defs>
        <LinearGradient id={`ecu${uid}`} x1="0" y1="0" x2="0.3" y2="1">
          <Stop offset="0" stopColor={melanger(def.color, 0.3)} />
          <Stop offset="0.55" stopColor={def.color} />
          <Stop offset="1" stopColor={melanger(def.color, -0.45)} />
        </LinearGradient>
      </Defs>
      <Path
        d={ECU}
        fill={`url(#ecu${uid})`}
        stroke={TRAIT}
        strokeWidth={6}
        strokeLinejoin="round"
      />
      <G transform="translate(50 54) scale(0.78) translate(-50 -54)">
        <G transform="translate(50 54) scale(0.78) translate(-50 -54)">
        {glyphe(melanger(def.color, 0.72))}
      </G>
      </G>
    </Svg>
  );
}
