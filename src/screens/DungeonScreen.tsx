import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import CombatView from '../components/CombatView';
import FadeIn from '../components/FadeIn';
import Rooster from '../components/Rooster';
import {
  Bar,
  Button,
  Card,
  Chip,
  ScreenTitle,
  SectionTitle,
  T,
} from '../components/ui';
import { CLASSES } from '../game/classes';
import { simulateCombat } from '../game/combat';
import { Boss, BOSSES, bossToFighter, KEY_PIMENT_COST, MAX_KEYS } from '../game/dungeons';
import { fmt, playerToFighter } from '../game/formulas';
import { RARITY_COLORS, RARITY_LABELS } from '../game/items';
import { fighterPower } from '../game/power';
import { CombatResult, Fighter } from '../game/types';
import { useGame } from '../store/gameStore';
import { C, F, G, R, SHADOW } from '../theme';

export default function DungeonScreen() {
  const player = useGame((s) => s.player);
  const keys = useGame((s) => s.keys);
  const dungeonFloor = useGame((s) => s.dungeonFloor);
  const buyKey = useGame((s) => s.buyKey);
  const applyBossResult = useGame((s) => s.applyBossResult);

  const [fight, setFight] = useState<{
    me: Fighter;
    boss: Boss;
    result: CombatResult;
  } | null>(null);
  const [outcome, setOutcome] = useState<{ won: boolean; text: string } | null>(null);

  if (!player) return null;

  if (fight) {
    return (
      <CombatView
        me={fight.me}
        op={bossToFighter(fight.boss)}
        result={fight.result}
        onDone={() => {
          const won = fight.result.winner === 0;
          const r = applyBossResult(won, fight.boss.floor);
          setOutcome({
            won,
            text: won
              ? `+🌽${fmt(r?.grains ?? 0)} · +${fmt(r?.xp ?? 0)} XP · 🌶️${
                  fight.boss.reward.piments
                }${r?.item ? ` · 🎁 ${r.item.name}` : ''}`
              : `${fight.boss.name} la tienbo. Va renforsi out kok, pi revien.`,
          });
          setFight(null);
        }}
      />
    );
  }

  const myPower = fighterPower(playerToFighter(player));
  const nextFloor = dungeonFloor + 1;
  const done = dungeonFloor >= BOSSES.length;

  const launch = (boss: Boss) => {
    if (keys <= 0) return;
    const me = playerToFighter(player);
    setOutcome(null);
    setFight({ me, boss, result: simulateCombat(me, bossToFighter(boss)) });
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <ScreenTitle
        title="Rout dé Sirk"
        sub="13 gardien su la rout. Chak étaz i pass in sèl foi."
        accent={C.mystic}
      />

      {/* Clés */}
      <Card compact>
        <View style={styles.keyRow}>
          <View style={{ flexDirection: 'row', gap: 5 }}>
            {Array.from({ length: MAX_KEYS }, (_, i) => (
              <Text key={i} style={{ fontSize: 19, opacity: i < keys ? 1 : 0.22 }}>
                🗝️
              </Text>
            ))}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.keyTitle}>
              {keys > 0 ? `${keys} clé dan out pòch` : 'Pu de clé'}
            </Text>
            <Text style={styles.keySub}>In clé gratui chak jour · in clé par tentativ</Text>
          </View>
          <Button
            size="sm"
            variant="piment"
            label={`🌶️${KEY_PIMENT_COST}`}
            onPress={buyKey}
            disabled={player.piments < KEY_PIMENT_COST || keys >= MAX_KEYS}
          />
        </View>
      </Card>

      {/* Progression */}
      <Card>
        <SectionTitle icon="🗺️">Progresyon</SectionTitle>
        <Bar
          value={dungeonFloor}
          max={BOSSES.length}
          variant="mystic"
          height={16}
          label={`${dungeonFloor} / ${BOSSES.length} gardien vinku`}
        />
      </Card>

      {outcome && (
        <Card glow={outcome.won ? C.cane : C.piment}>
          <Text
            style={[styles.outcomeTitle, { color: outcome.won ? C.cane : C.piment }]}
          >
            {outcome.won ? '🏆 GARDIEN VINKU !' : '💀 SA LA PA PASSÉ…'}
          </Text>
          <Text style={T.body}>{outcome.text}</Text>
        </Card>
      )}

      {done && (
        <Card glow={C.gold}>
          <Text style={styles.outcomeTitle}>👑 La rout lé fini !</Text>
          <Text style={T.body}>
            Ou la vinkri les 13 gardien. Out kok i rentre dan la légende.
          </Text>
        </Card>
      )}

      {BOSSES.map((boss, i) => {
        const cleared = boss.floor <= dungeonFloor;
        const current = boss.floor === nextFloor;
        const locked = boss.floor > nextFloor;
        const cls = CLASSES[boss.classId];
        const bossPower = fighterPower(bossToFighter(boss));
        const ratio = bossPower > 0 ? myPower / bossPower : 0;

        return (
          <FadeIn key={boss.floor} index={i}>
            <Card
              glow={current ? C.mystic : cleared ? C.cane : undefined}
              style={locked ? { opacity: 0.45 } : undefined}
              compact={!current}
            >
              <View style={styles.bossRow}>
                <View style={styles.portrait}>
                  <View style={[styles.halo, { backgroundColor: cls.color }]} />
                  {locked ? (
                    <Text style={{ fontSize: 32 }}>🔒</Text>
                  ) : (
                    <Rooster
                      appearance={boss.appearance}
                      size={current ? 84 : 62}
                      flip
                      ground={false}
                    />
                  )}
                  <View style={styles.floorBadge}>
                    <Text style={styles.floorText}>{boss.floor}</Text>
                  </View>
                </View>

                <View style={{ flex: 1, gap: 5 }}>
                  <Text style={styles.bossName} numberOfLines={1}>
                    {locked ? '???' : boss.name}
                  </Text>
                  <Text style={styles.place} numberOfLines={1}>
                    📍 {boss.place}
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 5, flexWrap: 'wrap' }}>
                    <Chip label={`Niv. ${boss.level}`} color={C.textDim} />
                    {!locked && (
                      <Chip label={`${cls.emoji} ${cls.name}`} color={cls.color} />
                    )}
                    {cleared && <Chip label="✓ VINKU" color={C.cane} active />}
                    {current && (
                      <Chip
                        label={
                          ratio >= 1.1 ? 'À TA PORTÉ' : ratio >= 0.8 ? 'DIR' : 'TRÈ DIR'
                        }
                        color={ratio >= 1.1 ? C.cane : ratio >= 0.8 ? C.gold : C.piment}
                        active
                      />
                    )}
                  </View>
                </View>
              </View>

              {current && (
                <>
                  <Text style={styles.flavor}>{boss.flavor}</Text>
                  <LinearGradient
                    colors={['rgba(255,246,232,0.07)', 'rgba(255,246,232,0.02)']}
                    style={styles.rewardBox}
                  >
                    <Text style={styles.rewardLabel}>RÉKONPANS GARANTI</Text>
                    <View style={styles.rewardRow}>
                      <Text style={styles.rewardItem}>🌽 {fmt(boss.reward.grains)}</Text>
                      <Text style={styles.rewardItem}>✨ {fmt(boss.reward.xp)}</Text>
                      <Text style={styles.rewardItem}>🌶️ {boss.reward.piments}</Text>
                      <Text
                        style={[
                          styles.rewardItem,
                          { color: RARITY_COLORS[boss.reward.rarity] },
                        ]}
                      >
                        🎁 {RARITY_LABELS[boss.reward.rarity]}
                      </Text>
                    </View>
                  </LinearGradient>
                  <Button
                    full
                    size="lg"
                    variant="mystic"
                    icon="🗝️"
                    label={keys > 0 ? 'Rentre dann étaz' : 'Pu de clé'}
                    onPress={() => launch(boss)}
                    disabled={keys <= 0}
                    style={{ marginTop: 10, ...SHADOW.card }}
                  />
                </>
              )}
            </Card>
          </FadeIn>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 14, paddingBottom: 40 },
  keyRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  keyTitle: { fontFamily: F.black, fontSize: 15, lineHeight: 20, color: C.text },
  keySub: { fontFamily: F.semi, fontSize: 12, lineHeight: 16, color: C.textDim },
  outcomeTitle: {
    fontFamily: F.black,
    fontSize: 20,
    lineHeight: 26,
    color: C.gold,
    marginBottom: 4,
  },
  bossRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  portrait: { width: 86, height: 86, alignItems: 'center', justifyContent: 'center' },
  halo: {
    position: 'absolute',
    width: 70,
    height: 70,
    borderRadius: 35,
    opacity: 0.16,
  },
  floorBadge: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    minWidth: 22,
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: R.pill,
    backgroundColor: 'rgba(6,3,12,0.92)',
    borderWidth: 1,
    borderColor: C.hairline,
  },
  floorText: { fontFamily: F.black, fontSize: 11, lineHeight: 15, color: C.mystic },
  bossName: { fontFamily: F.black, fontSize: 17.5, lineHeight: 23, color: C.text },
  place: { fontFamily: F.semi, fontSize: 12.5, lineHeight: 17, color: C.textDim },
  flavor: {
    fontFamily: F.regular,
    fontSize: 13.5,
    lineHeight: 19,
    color: C.textDim,
    marginTop: 10,
  },
  rewardBox: {
    marginTop: 10,
    padding: 10,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: C.hairlineSoft,
    gap: 6,
  },
  rewardLabel: {
    fontFamily: F.black,
    fontSize: 9.5,
    lineHeight: 13,
    letterSpacing: 1.2,
    color: C.textFaint,
  },
  rewardRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  rewardItem: { fontFamily: F.bold, fontSize: 13.5, lineHeight: 18, color: C.text },
});
