import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { eventOfDay } from '../game/events';
import { C, F, R } from '../theme';

/** Ce qui change aujourd'hui — visible partout, parce que ça change les gains. */
export default function DayEventBanner() {
  const ev = eventOfDay(new Date().toISOString().slice(0, 10));
  return (
    <LinearGradient
      colors={[`${ev.color}2E`, `${ev.color}0A`]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 0 }}
      style={[styles.wrap, { borderColor: `${ev.color}55` }]}
    >
      <Text style={{ fontSize: 15 }}>{ev.icon}</Text>
      <Text style={[styles.title, { color: ev.color }]} numberOfLines={1}>
        {ev.title}
      </Text>
      <View style={styles.dot} />
      <Text style={styles.desc} numberOfLines={1}>
        {ev.desc}
      </Text>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginHorizontal: 12,
    marginTop: 8,
    paddingHorizontal: 11,
    paddingVertical: 6,
    borderRadius: R.pill,
    borderWidth: 1,
  },
  title: { fontFamily: F.black, fontSize: 13, lineHeight: 17 },
  dot: {
    width: 3,
    height: 3,
    borderRadius: 2,
    backgroundColor: C.textFaint,
  },
  desc: {
    flex: 1,
    fontFamily: F.semi,
    fontSize: 12,
    lineHeight: 16,
    color: C.textDim,
  },
});
