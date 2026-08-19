import React, { useEffect, useId, useRef, useState } from 'react';
import { Animated, Easing } from 'react-native';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  G,
  LinearGradient,
  Path,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';

import { TAIL_PALETTES } from '../game/cosmetics';
import { Appearance } from '../game/types';
import { shade } from '../theme';

interface Props {
  appearance: Appearance;
  size?: number;
  /** true = regarde vers la gauche */
  flip?: boolean;
  /** ombre portée au sol (désactivée dans les listes denses) */
  ground?: boolean;
  /** cadrage buste (tête + poitrail) pour les médaillons ronds */
  portrait?: boolean;
  /** respiration + clignement — réservé aux grands portraits */
  alive?: boolean;
  /**
   * Halo de la meilleure gamme portée. C'est la seule façon de voir d'un coup
   * d'œil, dans une liste, qu'un kok est bien équipé — la fiche détaillée
   * demandait deux touchers.
   */
  aura?: string | null;
}

/**
 * Coq cartoon paramétrique. Tout est vectoriel : la personnalisation ne coûte
 * rien en taille d'app, et le rendu reste net à n'importe quelle échelle.
 */
export default function Rooster({
  appearance,
  size = 160,
  flip = false,
  ground = true,
  portrait = false,
  alive = false,
  aura = null,
}: Props) {
  // useId garantit des identifiants de dégradé uniques : deux coqs côte à côte
  // ne doivent pas se voler leurs couleurs.
  const uid = useId().replace(/:/g, '');
  const id = (n: string) => `${n}${uid}`;

  const tail = TAIL_PALETTES[appearance.tailPalette % TAIL_PALETTES.length];
  const body = appearance.bodyColor;
  const comb = appearance.combColor;
  const bodyLight = shade(body, 42);
  const bodyDark = shade(body, -38);
  const outline = shade(body, -78);
  const combDark = shade(comb, -45);

  const breathe = useRef(new Animated.Value(0)).current;
  const [blink, setBlink] = useState(false);

  useEffect(() => {
    if (!alive) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(breathe, {
          toValue: 1,
          duration: 1700,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(breathe, {
          toValue: 0,
          duration: 1700,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [alive, breathe]);

  useEffect(() => {
    if (!alive) return;
    let timer: ReturnType<typeof setTimeout>;
    const schedule = () => {
      timer = setTimeout(
        () => {
          setBlink(true);
          setTimeout(() => setBlink(false), 130);
          schedule();
        },
        2600 + Math.random() * 3200
      );
    };
    schedule();
    return () => clearTimeout(timer);
  }, [alive]);

  const svg = (
    <Svg
      width={size}
      height={size}
      viewBox={portrait ? '96 6 104 104' : '0 0 200 212'}
      style={flip ? { transform: [{ scaleX: -1 }] } : undefined}
    >
      <Defs>
        <RadialGradient id={id('body')} cx="0.38" cy="0.3" r="0.85">
          <Stop offset="0" stopColor={bodyLight} />
          <Stop offset="0.55" stopColor={body} />
          <Stop offset="1" stopColor={bodyDark} />
        </RadialGradient>
        <LinearGradient id={id('wing')} x1="0" y1="0" x2="0.4" y2="1">
          <Stop offset="0" stopColor={body} />
          <Stop offset="1" stopColor={bodyDark} />
        </LinearGradient>
        <LinearGradient id={id('comb')} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor={shade(comb, 40)} />
          <Stop offset="1" stopColor={combDark} />
        </LinearGradient>
        <LinearGradient id={id('beak')} x1="0" y1="0" x2="0" y2="1">
          <Stop offset="0" stopColor="#FFD34E" />
          <Stop offset="1" stopColor="#E8890B" />
        </LinearGradient>
        <LinearGradient id={id('leg')} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#FFC24E" />
          <Stop offset="1" stopColor="#D97A08" />
        </LinearGradient>
        <LinearGradient id={id('spur')} x1="0" y1="0" x2="1" y2="1">
          <Stop offset="0" stopColor="#FFFFFF" />
          <Stop offset="0.5" stopColor="#D8E2E8" />
          <Stop offset="1" stopColor="#8FA3B0" />
        </LinearGradient>
        {tail.map((c, i) => (
          <LinearGradient key={i} id={id(`t${i}`)} x1="0" y1="1" x2="0.6" y2="0">
            <Stop offset="0" stopColor={shade(c, -30)} />
            <Stop offset="1" stopColor={shade(c, 35)} />
          </LinearGradient>
        ))}
      </Defs>

      {aura ? (
        <G>
          <Circle cx={100} cy={116} r={86} fill={aura} opacity={0.13} />
          <Circle
            cx={100}
            cy={116}
            r={84}
            fill="none"
            stroke={aura}
            strokeWidth={2}
            opacity={0.5}
          />
        </G>
      ) : null}

      {ground && <Ellipse cx={108} cy={202} rx={54} ry={8} fill="#000" opacity={0.32} />}

      {/* ─── Queue : plumes en éventail, de l'arrière vers l'avant ─── */}
      <G stroke={outline} strokeWidth={1.6} strokeLinejoin="round">
        <Path
          d="M70 128 C 22 116, 2 58, 22 20 C 30 62, 50 98, 76 112 Z"
          fill={`url(#${id('t0')})`}
        />
        <Path
          d="M72 126 C 30 106, 16 54, 42 18 C 44 60, 60 94, 80 108 Z"
          fill={`url(#${id('t1')})`}
        />
        <Path
          d="M75 124 C 42 100, 38 52, 64 24 C 58 64, 70 92, 84 106 Z"
          fill={`url(#${id('t2')})`}
        />
        <Path
          d="M78 122 C 54 100, 56 62, 80 42 C 74 74, 82 94, 90 104 Z"
          fill={`url(#${id('t0')})`}
          opacity={0.9}
        />
      </G>

      {/* ─── Corps ─── */}
      <Path
        d="M55 126 C 55 95, 85 74, 116 77 C 151 81, 166 105, 161 131 C 157 157, 130 171, 101 169 C 71 167, 55 151, 55 126 Z"
        fill={`url(#${id('body')})`}
        stroke={outline}
        strokeWidth={2.2}
      />
      {/* poitrail éclairci */}
      <Path
        d="M118 84 C 145 88, 158 108, 154 130 C 150 150, 132 162, 112 163 C 138 152, 148 128, 143 108 C 139 95, 130 87, 118 84 Z"
        fill={bodyLight}
        opacity={0.35}
      />

      {/* ─── Aile ─── */}
      <Path
        d="M83 116 C 80 99, 99 90, 118 95 C 133 99, 138 115, 129 129 C 118 143, 88 137, 83 116 Z"
        fill={`url(#${id('wing')})`}
        stroke={outline}
        strokeWidth={1.8}
      />
      <G stroke={outline} strokeWidth={1.3} fill="none" opacity={0.55} strokeLinecap="round">
        <Path d="M92 121 C 104 114, 118 114, 127 121" />
        <Path d="M93 128 C 105 122, 117 122, 126 128" />
      </G>

      {/* ─── Cou + collerette ─── */}
      <Path
        d="M127 96 C 122 70, 127 50, 142 40 L 162 54 C 153 69, 151 86, 153 101 Z"
        fill={`url(#${id('body')})`}
        stroke={outline}
        strokeWidth={2}
      />
      <Path
        d="M124 92 C 133 100, 149 102, 157 96 C 155 104, 148 110, 138 110 C 130 110, 125 102, 124 92 Z"
        fill={bodyDark}
        opacity={0.75}
      />

      {/* ─── Tête ─── */}
      <Circle
        cx={150}
        cy={45}
        r={23}
        fill={`url(#${id('body')})`}
        stroke={outline}
        strokeWidth={2.2}
      />

      {/* Crête */}
      <Path
        d={
          appearance.accessory === 3
            ? 'M137 29 C 139 22, 146 22, 148 28 L 153 28 C 154 23, 161 23, 162 30 Z'
            : 'M134 31 C 130 16, 143 10, 147 23 C 149 8, 162 9, 161 23 C 169 13, 178 24, 169 35 Z'
        }
        fill={`url(#${id('comb')})`}
        stroke={combDark}
        strokeWidth={1.6}
        strokeLinejoin="round"
      />

      {/* Bec */}
      <Path
        d="M169 41 C 179 42, 189 46, 194 50 L 170 54 Z"
        fill={`url(#${id('beak')})`}
        stroke="#B96A05"
        strokeWidth={1.4}
        strokeLinejoin="round"
      />
      <Path
        d="M170 54 L 191 52 C 187 58, 178 61, 170 59 Z"
        fill="#E8890B"
        stroke="#B96A05"
        strokeWidth={1.4}
        strokeLinejoin="round"
      />

      {/* Caroncules */}
      <Ellipse cx={167} cy={64} rx={5.5} ry={8.5} fill={comb} stroke={combDark} strokeWidth={1.2} />
      <Ellipse cx={159} cy={66} rx={4.5} ry={7} fill={combDark} opacity={0.9} />

      {/* Œil */}
      {blink ? (
        <Path
          d="M149 41 C 153 45, 160 45, 164 41"
          stroke={outline}
          strokeWidth={2.6}
          strokeLinecap="round"
          fill="none"
        />
      ) : (
        <>
          <Circle cx={156} cy={41} r={7.6} fill="#FFFFFF" stroke={outline} strokeWidth={1.4} />
          <Circle cx={158} cy={41.5} r={4.4} fill="#F0A81E" />
          <Circle cx={158.8} cy={41.5} r={2.6} fill="#181018" />
          <Circle cx={160.4} cy={39.4} r={1.5} fill="#FFFFFF" opacity={0.95} />
        </>
      )}
      {/* sourcil déterminé */}
      <Path
        d="M147 31 C 153 32, 160 34, 165 37"
        stroke={outline}
        strokeWidth={3.4}
        strokeLinecap="round"
        fill="none"
      />

      {/* ─── Pattes ─── */}
      <G stroke={`url(#${id('leg')})`} strokeWidth={6} strokeLinecap="round" fill="none">
        <Path d="M97 166 L 95 190" />
        <Path d="M126 164 L 128 188" />
      </G>
      <G stroke={`url(#${id('leg')})`} strokeWidth={4.4} strokeLinecap="round" fill="none">
        <Path d="M95 190 L 85 198 M 95 190 L 97 201 M 95 190 L 106 197" />
        <Path d="M128 188 L 118 196 M 128 188 L 130 199 M 128 188 L 139 195" />
      </G>

      {/* Zéprons */}
      <Path d="M93 181 L 82 176 L 91 174 Z" fill={`url(#${id('spur')})`} stroke="#6F8290" strokeWidth={1} />
      <Path d="M131 179 L 120 174 L 129 172 Z" fill={`url(#${id('spur')})`} stroke="#6F8290" strokeWidth={1} />

      {/* ─── Accessoires ─── */}
      {appearance.accessory === 1 && (
        <G stroke="#7E1B12" strokeWidth={1.3} strokeLinejoin="round">
          <Path d="M129 56 C 140 64, 161 64, 171 56 L 169 65 C 158 72, 141 72, 131 65 Z" fill="#D6392B" />
          <Path d="M130 60 L 116 72 L 125 75 L 134 65 Z" fill="#B92E22" />
        </G>
      )}
      {appearance.accessory === 2 && (
        <G>
          <Rect x={144} y={34} width={22} height={13} rx={5} fill="#15121C" />
          <Rect x={146} y={36} width={7} height={4} rx={2} fill="#5B6470" opacity={0.8} />
          <Path d="M144 39 L 133 35" stroke="#15121C" strokeWidth={3} strokeLinecap="round" fill="none" />
        </G>
      )}
      {appearance.accessory === 3 && (
        <G stroke="#B98B32" strokeWidth={1.3} strokeLinejoin="round">
          <Ellipse cx={150} cy={27} rx={28} ry={7.5} fill="#E8C371" />
          <Path d="M134 26 C 134 11, 166 11, 166 26 Z" fill="#F6DA9A" />
          <Rect x={134} y={21} width={32} height={4.5} fill="#C0392B" stroke="none" />
        </G>
      )}
      {appearance.accessory === 4 && (
        <G>
          <Path
            d="M130 74 C 141 86, 159 86, 168 73"
            stroke="#F2C230"
            strokeWidth={4.5}
            strokeLinecap="round"
            fill="none"
          />
          <Circle cx={149} cy={85} r={5.5} fill="#FFD84D" stroke="#B98B14" strokeWidth={1.2} />
        </G>
      )}
      {/* Kouronn — le seul accessoire qui se voit de loin dans une liste */}
      {appearance.accessory === 5 && (
        <G stroke="#9A7018" strokeWidth={1.3} strokeLinejoin="round">
          <Path
            d="M131 30 L 136 15 L 143 25 L 150 11 L 157 25 L 164 15 L 169 30 Z"
            fill="#FFD84D"
          />
          <Rect x={131} y={29} width={38} height={6} rx={2} fill="#E8B93C" />
          <Circle cx={150} cy={20} r={2.6} fill="#E0353A" stroke="none" />
        </G>
      )}
      {/* Kask volkan */}
      {appearance.accessory === 6 && (
        <G stroke="#3A2118" strokeWidth={1.4} strokeLinejoin="round">
          <Path d="M128 38 C 132 16, 168 16, 172 38 Z" fill="#6E4B3A" />
          <Path d="M147 15 L 153 15 L 152 40 L 148 40 Z" fill="#E0561F" stroke="none" />
          <Rect x={127} y={37} width={46} height={5} rx={2.5} fill="#4E3428" />
        </G>
      )}
      {/* Flèr tiaré */}
      {appearance.accessory === 7 && (
        <G>
          {[0, 72, 144, 216, 288].map((a) => (
            <Ellipse
              key={a}
              cx={176 + 7 * Math.cos((a * Math.PI) / 180)}
              cy={44 + 7 * Math.sin((a * Math.PI) / 180)}
              rx={5.4}
              ry={4}
              fill="#FFF4E6"
              stroke="#E8C9B0"
              strokeWidth={0.8}
            />
          ))}
          <Circle cx={176} cy={44} r={3.4} fill="#F5C542" />
        </G>
      )}
      {/* Linèt an lor */}
      {appearance.accessory === 8 && (
        <G>
          <Rect x={144} y={34} width={22} height={13} rx={5} fill="#2A1F08" />
          <Rect x={146} y={36} width={8} height={4} rx={2} fill="#FFD84D" opacity={0.9} />
          <Path d="M144 39 L 133 35" stroke="#C89B3C" strokeWidth={3} strokeLinecap="round" fill="none" />
          <Rect x={143} y={33} width={24} height={2.4} rx={1.2} fill="#FFD84D" />
        </G>
      )}
    </Svg>
  );

  if (!alive) return svg;

  return (
    <Animated.View
      style={{
        transform: [
          {
            translateY: breathe.interpolate({
              inputRange: [0, 1],
              outputRange: [0, -3.5],
            }),
          },
          {
            scaleY: breathe.interpolate({
              inputRange: [0, 1],
              outputRange: [1, 1.018],
            }),
          },
        ],
      }}
    >
      {svg}
    </Animated.View>
  );
}
