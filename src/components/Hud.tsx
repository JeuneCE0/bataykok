import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { CLASSES } from '../game/classes';
import { eventOfDay } from '../game/events';
import { fmt, xpForLevel } from '../game/formulas';
import { useGame } from '../store/gameStore';
import { C, F, G, R, SHADOW } from '../theme';
import Counter from './Counter';
import Rooster from './Rooster';
import { Bar } from './ui';

export default function Hud() {
  const player = useGame((s) => s.player);
  if (!player) return null;
  const cls = CLASSES[player.classId];
  const need = xpForLevel(player.level);
  const ev = eventOfDay(new Date().toISOString().slice(0, 10));

  return (
    <LinearGradient
      colors={['rgba(36,21,51,0.96)', 'rgba(12,7,20,0.92)']}
      style={styles.hud}
    >
      <View style={styles.row}>
        <View style={[styles.avatar, { borderColor: cls.color }]}>
          <View style={styles.avatarClip}>
            <Rooster appearance={player.appearance} size={50} ground={false} portrait />
          </View>
          <View style={styles.levelBadge}>
            <Text style={styles.levelText}>{player.level}</Text>
          </View>
        </View>

        <View style={{ flex: 1, marginLeft: 12, gap: 3 }}>
          <Text style={styles.name} numberOfLines={1}>
            {player.name}
          </Text>
          <Text style={[styles.cls, { color: cls.color }]} numberOfLines={1}>
            {cls.emoji} {cls.name}
          </Text>
        </View>

        <View style={{ gap: 5, alignItems: 'flex-end' }}>
          <Purse icon="🌽" value={player.grains} colors={G.gold} />
          <Purse icon="🌶️" value={player.piments} colors={G.piment} />
        </View>
      </View>

      <View style={styles.xpRow}>
        <View style={{ flex: 1 }}>
          <Bar
            value={player.xp}
            max={need}
            variant="mystic"
            height={11}
            label={`${fmt(player.xp)} / ${fmt(need)} XP`}
          />
        </View>
        <View style={[styles.evPill, { borderColor: `${ev.color}66` }]}>
          <Text style={{ fontSize: 11 }}>{ev.icon}</Text>
          <Text style={[styles.evText, { color: ev.color }]}>{ev.short}</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

function Purse({
  icon,
  value,
  colors,
}: {
  icon: string;
  value: number;
  colors: readonly [string, string, string];
}) {
  return (
    <View style={styles.purse}>
      <LinearGradient
        colors={colors}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.purseDot}
      >
        <Text style={{ fontSize: 11 }}>{icon}</Text>
      </LinearGradient>
      <Counter value={value} style={styles.purseValue} />
    </View>
  );
}

const styles = StyleSheet.create({
  hud: {
    paddingHorizontal: 14,
    paddingTop: 8,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,246,232,0.10)',
    gap: 8,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  avatar: {
    width: 54,
    height: 54,
    borderRadius: 27,
    borderWidth: 2,
    backgroundColor: 'rgba(6,3,12,0.6)',
    alignItems: 'center',
    justifyContent: 'center',
    ...SHADOW.card,
  },
  avatarClip: {
    width: 50,
    height: 50,
    borderRadius: 25,
    overflow: 'hidden',
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelBadge: {
    position: 'absolute',
    bottom: -5,
    right: -5,
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    paddingHorizontal: 4,
    backgroundColor: C.gold,
    borderWidth: 2,
    borderColor: C.night,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelText: { fontFamily: F.black, fontSize: 13, lineHeight: 17, color: C.ink },
  name: { fontFamily: F.black, fontSize: 19, lineHeight: 25, color: C.text },
  cls: { fontFamily: F.bold, fontSize: 13, lineHeight: 17 },
  purse: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(6,3,12,0.55)',
    borderRadius: R.pill,
    borderWidth: 1,
    borderColor: C.hairlineSoft,
    paddingRight: 10,
    paddingLeft: 3,
    paddingVertical: 3,
    minWidth: 84,
  },
  purseDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  purseValue: { fontFamily: F.black, fontSize: 14.5, lineHeight: 19, color: C.text },
  xpRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  evPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: R.pill,
    borderWidth: 1,
    backgroundColor: 'rgba(6,3,12,0.5)',
  },
  evText: { fontFamily: F.black, fontSize: 11, lineHeight: 15 },
});
