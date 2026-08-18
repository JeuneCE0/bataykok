import React from 'react';
import Svg, { Circle, Ellipse, G, Path, Rect } from 'react-native-svg';

import { TAIL_PALETTES } from '../game/bots';
import { Appearance } from '../game/types';

interface Props {
  appearance: Appearance;
  size?: number;
  /** true = regarde vers la gauche */
  flip?: boolean;
}

/** Coq cartoon paramétrique (couleurs + accessoires personnalisables) */
export default function Rooster({ appearance, size = 160, flip = false }: Props) {
  const tail = TAIL_PALETTES[appearance.tailPalette % TAIL_PALETTES.length];
  const body = appearance.bodyColor;
  const comb = appearance.combColor;
  const darker = shade(body, -25);

  return (
    <Svg
      width={size}
      height={size}
      viewBox="0 0 200 210"
      style={flip ? { transform: [{ scaleX: -1 }] } : undefined}
    >
      {/* Queue */}
      <Path
        d="M60 120 C 10 110, 0 60, 25 35 C 30 70, 45 90, 62 100 Z"
        fill={tail[0]}
      />
      <Path
        d="M62 118 C 22 100, 18 55, 45 30 C 45 65, 58 88, 70 100 Z"
        fill={tail[1]}
      />
      <Path
        d="M66 116 C 38 95, 40 55, 68 38 C 62 70, 70 90, 78 102 Z"
        fill={tail[2]}
      />
      {/* Corps */}
      <Path
        d="M55 125 C 55 95, 85 75, 115 78 C 150 82, 165 105, 160 130 C 156 155, 130 170, 102 168 C 72 166, 55 150, 55 125 Z"
        fill={body}
      />
      {/* Aile */}
      <Path
        d="M85 115 C 82 100, 100 92, 118 96 C 132 100, 136 115, 128 128 C 118 140, 90 135, 85 115 Z"
        fill={darker}
      />
      {/* Cou + tête */}
      <Path d="M128 95 C 124 70, 128 52, 142 42 L 160 55 C 152 70, 150 85, 152 100 Z" fill={body} />
      <Circle cx={150} cy={45} r={22} fill={body} />
      {/* Crête */}
      <Path
        d={
          appearance.accessory === 3
            ? 'M138 30 C 140 24, 146 24, 148 29 L 152 29 C 153 25, 159 25, 160 30 Z'
            : 'M136 30 C 134 18, 144 14, 147 24 C 148 12, 158 12, 158 24 C 164 16, 172 22, 166 32 Z'
        }
        fill={comb}
      />
      {/* Bec */}
      <Path d="M170 45 L 188 50 L 170 56 Z" fill="#f5a623" />
      <Path d="M170 51 L 182 53 L 170 57 Z" fill="#d68910" />
      {/* Caroncule */}
      <Ellipse cx={166} cy={62} rx={6} ry={9} fill={comb} />
      {/* Œil */}
      <Circle cx={156} cy={42} r={6.5} fill="#fff" />
      <Circle cx={158} cy={42} r={3} fill="#222" />
      {/* Sourcil fâché */}
      <Path d="M149 34 L 163 38" stroke="#222" strokeWidth={2.5} strokeLinecap="round" fill="none" />
      {/* Pattes */}
      <Path d="M95 165 L 93 190 M 93 190 L 84 198 M 93 190 L 96 200 M 93 190 L 102 197" stroke="#f5a623" strokeWidth={5} strokeLinecap="round" fill="none" />
      <Path d="M125 163 L 127 188 M 127 188 L 118 196 M 127 188 L 130 198 M 127 188 L 136 195" stroke="#f5a623" strokeWidth={5} strokeLinecap="round" fill="none" />
      {/* Zéprons */}
      <Path d="M91 182 L 82 178 L 90 176 Z" fill="#dfe6e9" />
      <Path d="M129 180 L 120 176 L 128 174 Z" fill="#dfe6e9" />

      {/* Accessoires */}
      {appearance.accessory === 1 && (
        // Bandana
        <G>
          <Path d="M130 55 C 140 62, 160 62, 170 55 L 168 63 C 158 69, 142 69, 132 63 Z" fill="#c0392b" />
          <Path d="M131 58 L 118 70 L 126 72 L 135 63 Z" fill="#c0392b" />
        </G>
      )}
      {appearance.accessory === 2 && (
        // Lunettes soleil
        <G>
          <Rect x={146} y={36} width={18} height={11} rx={4} fill="#222" />
          <Path d="M146 40 L 136 37" stroke="#222" strokeWidth={2.5} fill="none" />
        </G>
      )}
      {appearance.accessory === 3 && (
        // Chapo payanké (chapeau de paille)
        <G>
          <Ellipse cx={150} cy={28} rx={26} ry={7} fill="#e9c46a" />
          <Path d="M136 27 C 136 14, 164 14, 164 27 Z" fill="#f4d58d" />
          <Rect x={136} y={22} width={28} height={4} fill="#c0392b" />
        </G>
      )}
      {appearance.accessory === 4 && (
        // Chaîne en or
        <G>
          <Path d="M132 72 C 142 82, 158 82, 166 72" stroke="#f1c40f" strokeWidth={4} fill="none" />
          <Circle cx={149} cy={82} r={5} fill="#f1c40f" />
        </G>
      )}
    </Svg>
  );
}

/** assombrit/éclaircit une couleur hex */
function shade(hex: string, amt: number): string {
  const h = hex.replace('#', '');
  const num = parseInt(h, 16);
  let r = (num >> 16) + amt;
  let g = ((num >> 8) & 0xff) + amt;
  let b = (num & 0xff) + amt;
  r = Math.max(0, Math.min(255, r));
  g = Math.max(0, Math.min(255, g));
  b = Math.max(0, Math.min(255, b));
  return `#${((r << 16) | (g << 8) | b).toString(16).padStart(6, '0')}`;
}
