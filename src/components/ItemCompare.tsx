import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { itemLabel } from '../game/items';
import { ItemComparison } from '../game/power';
import { useT } from '../i18n/useT';
import { C, F, R } from '../theme';

const VERDICT = {
  better: { key: 'compare.better', color: C.cane, arrow: '▲' },
  worse: { key: 'compare.worse', color: C.piment, arrow: '▼' },
  equal: { key: 'compare.equal', color: C.textFaint, arrow: '=' },
  empty: { key: 'compare.empty', color: C.gold, arrow: '＋' },
} as const;

/** Pastille de verdict : le joueur doit savoir en un coup d'œil. */
export function VerdictBadge({
  cmp,
  compact,
}: {
  cmp: ItemComparison;
  compact?: boolean;
}) {
  const t = useT();
  const v = VERDICT[cmp.verdict];
  const sign = cmp.diff > 0 ? '+' : '';
  return (
    <View style={[styles.badge, { borderColor: v.color, backgroundColor: `${v.color}1F` }]}>
      <Text style={[styles.badgeText, { color: v.color }]}>
        {v.arrow} {compact ? '' : `${t(v.key)} `}
        {cmp.verdict !== 'empty' ? `${sign}${cmp.diff}` : ''}
      </Text>
    </View>
  );
}

/** Détail des écarts stat par stat, face à la pièce portée. */
export function CompareLines({ cmp }: { cmp: ItemComparison }) {
  const t = useT();
  if (cmp.deltas.length === 0) {
    return <Text style={styles.none}>{t('compare.identical')}</Text>;
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
        <Text style={styles.vs}>vs {itemLabel(cmp.equipped, t)}</Text>
      ) : (
        <Text style={styles.vs}>{t('compare.emptySlot')}</Text>
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
