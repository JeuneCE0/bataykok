import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { fmt, xpForLevel } from '../game/formulas';
import { useGame } from '../store/gameStore';
import { Bar, COLORS } from './ui';

export default function Hud() {
  const player = useGame((s) => s.player);
  if (!player) return null;
  return (
    <View style={styles.hud}>
      <View style={styles.row}>
        <Text style={styles.name} numberOfLines={1}>
          🐓 {player.name}
        </Text>
        <Text style={styles.level}>Niv. {player.level}</Text>
        <View style={styles.currencies}>
          <Text style={styles.currency}>🌽 {fmt(player.grains)}</Text>
          <Text style={styles.currency}>🌶️ {fmt(player.piments)}</Text>
        </View>
      </View>
      <Bar
        value={player.xp}
        max={xpForLevel(player.level)}
        color={COLORS.purple}
        height={10}
        label={`${fmt(player.xp)} / ${fmt(xpForLevel(player.level))} XP`}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  hud: {
    paddingHorizontal: 14,
    paddingTop: 6,
    paddingBottom: 8,
    backgroundColor: COLORS.bgLight,
    borderBottomWidth: 2,
    borderBottomColor: COLORS.panelBorder,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 5,
    gap: 8,
  },
  name: {
    color: COLORS.text,
    fontWeight: '900',
    fontSize: 15,
    flexShrink: 1,
  },
  level: {
    color: COLORS.gold,
    fontWeight: '800',
    fontSize: 13,
  },
  currencies: { flexDirection: 'row', gap: 10, marginLeft: 'auto' },
  currency: { color: COLORS.text, fontWeight: '800', fontSize: 13 },
});
