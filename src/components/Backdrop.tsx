import React from 'react';
import { StyleSheet, View } from 'react-native';
import Svg, {
  Circle,
  Defs,
  Ellipse,
  LinearGradient as SvgLinearGradient,
  RadialGradient,
  Rect,
  Stop,
} from 'react-native-svg';

/**
 * Nuit tropicale : dégradé profond, halo de braise au ras du sol (le volcan)
 * et poussière lumineuse. Rendu une seule fois, sous toute l'app.
 */
export default function Backdrop() {
  return (
    <View style={StyleSheet.absoluteFill} pointerEvents="none">
      <Svg width="100%" height="100%" viewBox="0 0 100 200" preserveAspectRatio="xMidYMid slice">
        <Defs>
          <SvgLinearGradient id="sky" x1="0" y1="0" x2="0.35" y2="1">
            <Stop offset="0" stopColor="#1B1030" />
            <Stop offset="0.45" stopColor="#120A1D" />
            <Stop offset="1" stopColor="#08050F" />
          </SvgLinearGradient>
          <RadialGradient id="lava" cx="0.5" cy="1" r="0.75">
            <Stop offset="0" stopColor="#FF5A1F" stopOpacity="0.42" />
            <Stop offset="0.45" stopColor="#C22E00" stopOpacity="0.14" />
            <Stop offset="1" stopColor="#C22E00" stopOpacity="0" />
          </RadialGradient>
          <RadialGradient id="moon" cx="0.5" cy="0.5" r="0.5">
            <Stop offset="0" stopColor="#B06BFF" stopOpacity="0.3" />
            <Stop offset="1" stopColor="#B06BFF" stopOpacity="0" />
          </RadialGradient>
        </Defs>

        <Rect x="0" y="0" width="100" height="200" fill="url(#sky)" />
        <Circle cx="86" cy="26" r="42" fill="url(#moon)" />
        <Ellipse cx="50" cy="200" rx="90" ry="80" fill="url(#lava)" />

        {/* poussière lumineuse */}
        {DUST.map((d, i) => (
          <Circle key={i} cx={d.x} cy={d.y} r={d.r} fill="#FFD9A8" opacity={d.o} />
        ))}
      </Svg>
    </View>
  );
}

const DUST = [
  { x: 12, y: 24, r: 0.5, o: 0.5 },
  { x: 31, y: 12, r: 0.35, o: 0.35 },
  { x: 68, y: 40, r: 0.45, o: 0.3 },
  { x: 88, y: 74, r: 0.4, o: 0.28 },
  { x: 22, y: 96, r: 0.5, o: 0.22 },
  { x: 56, y: 132, r: 0.45, o: 0.24 },
  { x: 8, y: 148, r: 0.4, o: 0.3 },
  { x: 78, y: 168, r: 0.55, o: 0.34 },
  { x: 42, y: 62, r: 0.3, o: 0.4 },
  { x: 94, y: 112, r: 0.35, o: 0.26 },
];
