import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { ItemComparison } from '../game/power';
import { C, F, R } from '../theme';

const VERDICT = {
  better: { label: 'MIEUX', color: C.cane, arrow: '▲' },
  worse: { label: 'MOINS BON', color: C.piment, arrow: '▼' },
  equal: { label: 'ÉGAL', color: C.textFaint, arrow: '=' },
  empty: { label: 'EMPLACEMENT VIDE', color: C.gold, arrow: '＋' },
} as const;

/** Pastille de verdict : le joueur doit savoir en un coup d'œil. */
export function VerdictBadge({
  cmp,
  compact,
}: {
  cmp: ItemComparison;
  compact?: boolean;
}) {
  const v = VERDICT[cmp.verdict];
  const sign = cmp.diff > 0 ? '+' : '';
  return (
    <View style={[styles.badge, { borderColor: v.color, backgroundColor: `${v.color}1F` }]}>
      <Text style={[styles.badgeText, { color: v.color }]}>
        {v.arrow} {compact ? '' : `${v.label} `}
        {cmp.verdict !== 'empty' ? `${sign}${cmp.diff}` : ''}
      </Text>
    </View>
  );
}

/** Détail des écarts stat par stat, face à la pièce portée. */
export function CompareLines({ cmp }: { cmp: ItemComparison }) {
  if (cmp.deltas.length === 0) {
    return <Text style={styles.none}>Identique à ce que ton kok i port.</Text>;
  }
  return (
    <View style={styles.lines}>
      {cmp.deltas.map((d) => {
        const up = d.delta > 0;
        return (
          <View key={d.label} style={styles.line}>
            <Text style={styles.lineLabel}>{d.label}</Text>
            <Text style={[styles.lineDelta, { color: up ? C.cane : C.piment }]}>
              {up ? '▲ +' : '▼ '}
              {d.delta}
            </Text>
          </View>
        );
      })}
      {cmp.equipped ? (
        <Text style={styles.vs}>vs {cmp.equipped.name}</Text>
      ) : (
        <Text style={styles.vs}>Aucun ékipman su sèt emplacement</Text>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  badge: {
    paddingHorizontal: 9,
    minHeight: 24,
    borderRadius: R.pill,
    borderWidth: 1,
    alignSelf: 'flex-start',
    alignItems: 'center',
    justifyContent: 'center',
  },
  badgeText: {
    fontFamily: F.black,
    fontSize: 11.5,
    lineHeight: 14,
    letterSpacing: 0.2,
    textAlign: 'center',
    includeFontPadding: false,
  },
  lines: { gap: 3, marginTop: 6 },
  line: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  lineLabel: { fontFamily: F.semi, fontSize: 13, lineHeight: 18, color: C.textDim },
  lineDelta: { fontFamily: F.black, fontSize: 13, lineHeight: 18 },
  vs: { fontFamily: F.regular, fontSize: 12, lineHeight: 16, color: C.textFaint, marginTop: 3 },
  none: { fontFamily: F.regular, fontSize: 12.5, color: C.textFaint, marginTop: 4 },
});
