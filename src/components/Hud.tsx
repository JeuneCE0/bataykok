import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { CLASSES } from '../game/classes';
import { eventOfDay } from '../game/events';
import { fmt, xpForLevel } from '../game/formulas';
import { play, syncMusic } from '../lib/sound';
import { useGame } from '../store/gameStore';
import { C, F, G, R, SHADOW } from '../theme';
import Counter from './Counter';
import Rooster from './Rooster';
import SettingsModal from './SettingsModal';
import { Bar } from './ui';
import { useT } from '../i18n/useT';

export default function Hud({ onBuy }: { onBuy?: () => void }) {
  const t = useT();
  const player = useGame((s) => s.player);
  const sfxOn = useGame((s) => s.sfxOn);
  const musicOn = useGame((s) => s.musicOn);
  const toggleMute = useGame((s) => s.toggleMute);
  const [settings, setSettings] = useState(false);
  if (!player) return null;
  const muted = !sfxOn && !musicOn;
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

        <View style={{ flex: 1, marginLeft: 12, gap: 4 }}>
          <Text style={styles.name} numberOfLines={1}>
            {player.name}
          </Text>
          <Text style={[styles.cls, { color: cls.color }]} numberOfLines={1}>
            {cls.emoji} {cls.name}
          </Text>
        </View>

        <View style={{ gap: 4, alignItems: 'flex-end' }}>
          <Purse icon="🌽" value={player.grains} colors={G.gold} onBuy={onBuy} />
          <Purse icon="🌶️" value={player.piments} colors={G.piment} onBuy={onBuy} />
        </View>

        {/* couper vite d'un côté, tout régler de l'autre */}
        <View style={styles.tools}>
          <Pressable
            onPress={() => {
              const on = toggleMute();
              syncMusic();
              if (on) play('tap');
            }}
            hitSlop={8}
            style={({ pressed }) => [
              styles.mute,
              muted && styles.muteOff,
              pressed && { opacity: 0.6 },
            ]}
          >
            <Text style={{ fontSize: 13 }}>{muted ? '🔇' : '🔊'}</Text>
          </Pressable>
          <Pressable
            onPress={() => {
              play('tap');
              setSettings(true);
            }}
            hitSlop={8}
            style={({ pressed }) => [styles.mute, pressed && { opacity: 0.6 }]}
          >
            <Text style={{ fontSize: 13 }}>⚙️</Text>
          </Pressable>
        </View>
        <SettingsModal visible={settings} onClose={() => setSettings(false)} />
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
          <Text style={[styles.evText, { color: ev.color }]}>{t(ev.shortKey)}</Text>
        </View>
      </View>
    </LinearGradient>
  );
}

function Purse({
  icon,
  value,
  colors,
  onBuy,
}: {
  icon: string;
  value: number;
  colors: readonly [string, string, string];
  onBuy?: () => void;
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
      {/* Le « + » mène au Bazar : la bourse indiquait un manque sans jamais
          dire où le combler. */}
      {onBuy ? (
        <Pressable
          hitSlop={8}
          onPress={() => {
            play('tap', 0.6);
            onBuy();
          }}
          style={({ pressed }) => [styles.plus, pressed && { opacity: 0.7 }]}
        >
          <Text style={styles.plusText}>+</Text>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  hud: {
    paddingHorizontal: 12,
    paddingTop: 8,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,246,232,0.10)',
    gap: 8,
  },
  row: { flexDirection: 'row', alignItems: 'center' },
  tools: { gap: 4, marginLeft: 8 },
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
    borderRadius: 10,
    paddingHorizontal: 4,
    backgroundColor: C.gold,
    borderWidth: 2,
    borderColor: C.night,
    alignItems: 'center',
    justifyContent: 'center',
  },
  levelText: {
    fontFamily: F.black,
    fontSize: 13,
    lineHeight: 17,
    color: C.ink,
    includeFontPadding: false,
    textAlign: 'center',
  },
  name: { fontFamily: F.black, fontSize: 20, lineHeight: 26, color: C.text },
  cls: { fontFamily: F.bold, fontSize: 13, lineHeight: 17 },
  purse: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(6,3,12,0.7)',
    borderRadius: R.pill,
    borderWidth: 2,
    borderColor: 'rgba(6,3,12,0.85)',
    paddingRight: 4,
    paddingLeft: 4,
    paddingVertical: 3,
    minWidth: 96,
  },
  plus: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: 'rgba(6,3,12,0.8)',
    backgroundColor: C.cane,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 'auto',
  },
  plusText: {
    fontFamily: F.black,
    fontSize: 15,
    lineHeight: 19,
    color: C.ink,
    includeFontPadding: false,
    marginTop: -1,
  },
  purseDot: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mute: {
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: C.hairlineSoft,
    backgroundColor: 'rgba(6,3,12,0.5)',
  },
  muteOff: { borderColor: C.piment, backgroundColor: 'rgba(255,59,92,0.14)' },
  purseValue: {
    fontFamily: F.black,
    fontSize: 15,
    lineHeight: 20,
    color: C.text,
    includeFontPadding: false,
  },
  xpRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  evPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    minHeight: 24,
    borderRadius: R.pill,
    borderWidth: 1,
    backgroundColor: 'rgba(6,3,12,0.5)',
  },
  evText: {
    fontFamily: F.black,
    fontSize: 11,
    lineHeight: 15,
    includeFontPadding: false,
  },
});
