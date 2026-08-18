import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { CLASSES } from '../game/classes';
import { fmt, maxHp, playerArmor, playerToFighter, playerWeapon } from '../game/formulas';
import { kokPower } from '../game/power';
import { PlayerState } from '../game/types';
import { C, F, R } from '../theme';
import Rooster from './Rooster';

/**
 * Carte de profil : la vue que l'on capture pour la partager. Pas de
 * défilement, pas d'interaction — elle doit tenir dans une image.
 */
export default function ProfileCard({
  player,
  code,
}: {
  player: PlayerState;
  code: string | null;
}) {
  const cls = CLASSES[player.classId];
  const w = playerWeapon(player);
  const f = playerToFighter(player);

  return (
    <LinearGradient colors={['#2A1A3D', '#0B0714']} style={styles.card}>
      <View style={styles.header}>
        <Text style={styles.brand}>BATAY KOK</Text>
        <Text style={styles.tagline}>RPG de batay coq péi · La Réunion</Text>
      </View>

      <View style={styles.body}>
        <View style={styles.portrait}>
          <View style={[styles.halo, { backgroundColor: cls.color }]} />
          <Rooster appearance={player.appearance} size={132} />
        </View>

        <View style={{ flex: 1, gap: 6 }}>
          <Text style={styles.name} numberOfLines={1}>
            {player.name}
          </Text>
          <Text style={[styles.cls, { color: cls.color }]} numberOfLines={1}>
            {cls.emoji} {cls.name} · niv. {player.level}
          </Text>
          <View style={styles.stats}>
            <Stat icon="⚡" label="Puissans" value={fmt(kokPower(player))} />
            <Stat icon="❤️" label="PV" value={fmt(maxHp(f))} />
            <Stat icon="🗡️" label="Dégâts" value={`${w.min}–${w.max}`} />
            <Stat icon="🛡️" label="Armur" value={`${playerArmor(player)}`} />
          </View>
        </View>
      </View>

      <View style={styles.record}>
        <Text style={styles.recordItem}>🏆 {player.wins} V</Text>
        <Text style={styles.recordItem}>💀 {player.losses} D</Text>
        <Text style={styles.recordItem}>🎖️ {player.honor}</Text>
        <Text style={styles.recordItem}>#{player.rank} au rond</Text>
      </View>

      {code && (
        <View style={styles.codeBox}>
          <Text style={styles.codeLabel}>KOD PARRAINAZ</Text>
          <Text style={styles.code}>{code}</Text>
          <Text style={styles.codeHint}>
            Rentre sé kod-là : ou gagne 🌶️40 + 🌽500
          </Text>
        </View>
      )}
    </LinearGradient>
  );
}

function Stat({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <View style={styles.stat}>
      <Text style={{ fontSize: 12 }}>{icon}</Text>
      <Text style={styles.statLabel}>{label}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    width: 340,
    borderRadius: R.xl,
    borderWidth: 2,
    borderColor: 'rgba(255,201,60,0.35)',
    padding: 18,
    gap: 12,
  },
  header: { alignItems: 'center' },
  brand: {
    fontFamily: F.black,
    fontSize: 26,
    lineHeight: 33,
    color: C.gold,
    letterSpacing: 1,
  },
  tagline: { fontFamily: F.semi, fontSize: 11.5, lineHeight: 15, color: C.textDim },
  body: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  portrait: { width: 132, alignItems: 'center', justifyContent: 'center' },
  halo: {
    position: 'absolute',
    width: 108,
    height: 108,
    borderRadius: 54,
    opacity: 0.16,
  },
  name: { fontFamily: F.black, fontSize: 22, lineHeight: 28, color: C.text },
  cls: { fontFamily: F.bold, fontSize: 13.5, lineHeight: 18 },
  stats: { gap: 4 },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  statLabel: { fontFamily: F.semi, fontSize: 12, lineHeight: 16, color: C.textDim, flex: 1 },
  statValue: { fontFamily: F.black, fontSize: 13.5, lineHeight: 18, color: C.text },
  record: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: C.hairlineSoft,
  },
  recordItem: { fontFamily: F.bold, fontSize: 12.5, lineHeight: 17, color: C.textDim },
  codeBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,201,60,0.10)',
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: 'rgba(255,201,60,0.35)',
    paddingVertical: 8,
  },
  codeLabel: {
    fontFamily: F.black,
    fontSize: 9.5,
    lineHeight: 13,
    letterSpacing: 1.4,
    color: C.textFaint,
  },
  code: {
    fontFamily: F.black,
    fontSize: 26,
    lineHeight: 33,
    letterSpacing: 4,
    color: C.gold,
  },
  codeHint: { fontFamily: F.semi, fontSize: 11.5, lineHeight: 15, color: C.textDim },
});
