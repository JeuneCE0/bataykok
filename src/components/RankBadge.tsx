import React from 'react';
import Svg, { Defs, LinearGradient, Path, Polygon, Stop } from 'react-native-svg';

import { RankTier } from '../game/ranks';

/**
 * Écusson de palier.
 *
 * Les paliers d'honneur étaient signalés par des emoji (🐣 🐓 ⚔️ 🎖️ 🔥 👑) :
 * six pictogrammes sans parenté visuelle, qui ne racontaient aucune
 * progression. Un écusson gravé, lui, se lit d'un coup — même métal, même
 * forme, et le contenu qui monte : un chevron, deux, trois, puis l'étoile.
 *
 * Les métaux suivent notre palette plutôt que l'or/argent/bronze habituel :
 * pierre, cuivre, laiton, argent, braise, or.
 */
const METAUX: { clair: string; sombre: string; champ: string }[] = [
  { clair: '#8C93A0', sombre: '#4A505C', champ: '#2A2E38' }, // pierre
  { clair: '#C98A5B', sombre: '#7A4A2A', champ: '#3A2418' }, // cuivre
  { clair: '#D9B061', sombre: '#8A6A28', champ: '#3A2E14' }, // laiton
  { clair: '#D8DEE9', sombre: '#8A94A6', champ: '#2C303A' }, // argent
  { clair: '#FF9245', sombre: '#C22E00', champ: '#3A1A0C' }, // braise
  { clair: '#FFDE7A', sombre: '#D99000', champ: '#3A2C08' }, // or
];

export default function RankBadge({
  tier,
  index,
  size = 44,
}: {
  tier: RankTier;
  /** rang du palier dans l'échelle — décide du métal et du contenu gravé */
  index: number;
  size?: number;
}) {
  const m = METAUX[Math.min(METAUX.length - 1, Math.max(0, index))];
  const id = `rb${index}`;
  const chevrons = Math.min(3, index + 1);
  const etoile = index >= 4;

  return (
    <Svg width={size} height={size * 1.12} viewBox="0 0 100 112">
      <Defs>
        <LinearGradient id={`${id}m`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={m.clair} />
          <Stop offset="1" stopColor={m.sombre} />
        </LinearGradient>
        {/* le gravé garde le métal clair de bout en bout : dégradé jusqu'au
            sombre, il se noyait dans le champ */}
        <LinearGradient id={`${id}g`} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#FFFFFF" stopOpacity={0.92} />
          <Stop offset="1" stopColor={m.clair} />
        </LinearGradient>
      </Defs>

      {/* la monture */}
      <Path
        d="M50 3 L93 23 L93 64 C93 89 74 100 50 109 C26 100 7 89 7 64 L7 23 Z"
        fill={`url(#${id}m)`}
        stroke="rgba(6,3,12,0.85)"
        strokeWidth={5}
        strokeLinejoin="round"
      />
      {/* le champ, en creux */}
      <Path
        d="M50 15 L82 30 L82 62 C82 81 68 90 50 97 C32 90 18 81 18 62 L18 30 Z"
        fill={m.champ}
        opacity={0.92}
      />

      {etoile ? (
        <Polygon
          points="50,32 58,52 80,52 62,64 69,85 50,72 31,85 38,64 20,52 42,52"
          fill={`url(#${id}g)`}
          stroke="rgba(6,3,12,0.6)"
          strokeWidth={3}
          strokeLinejoin="round"
        />
      ) : (
        Array.from({ length: chevrons }, (_, i) => (
          <Path
            key={i}
            d={`M30 ${40 + i * 15} L50 ${52 + i * 15} L70 ${40 + i * 15} L70 ${49 + i * 15} L50 ${61 + i * 15} L30 ${49 + i * 15} Z`}
            fill={`url(#${id}g)`}
            stroke="rgba(6,3,12,0.6)"
            strokeWidth={2.5}
            strokeLinejoin="round"
          />
        ))
      )}
    </Svg>
  );
}
