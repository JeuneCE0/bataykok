import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import AdButton from '../components/AdButton';
import CombatView from '../components/CombatView';
import FadeIn from '../components/FadeIn';
import RewardOverlay, { RewardView } from '../components/RewardOverlay';
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
import { useT } from '../i18n/useT';
import { useGame } from '../store/gameStore';
import { C, F, G, R, SHADOW } from '../theme';
import { localDay } from '../game/day';
import { eventCombatMods, eventOfDay } from '../game/events';

export default function DungeonScreen() {
  const t = useT();
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
  const [outcome, setOutcome] = useState<RewardView | null>(null);

  if (!player) return null;

  if (fight) {
    return (
      <CombatView
        me={fight.me}
        op={bossToFighter(fight.boss)}
        result={fight.result}
        onDone={() => {
          const won = fight.result.winner === 0;
          // part des PV retirés au gardien : ce qui reste au dernier round
          const last = fight.result.rounds[fight.result.rounds.length - 1];
          const maxBoss = fight.result.maxHp[1] || 1;
          const damage = Math.max(
            0,
            Math.min(1, 1 - Math.max(0, last?.hpAfter[1] ?? maxBoss) / maxBoss)
          );
          const r = applyBossResult(won, fight.boss.floor, damage);
          setOutcome({
            won,
            title: won ? '🏆 GARDIEN VINKU !' : '💀 SA LA PA PASSÉ…',
            gold: r?.grains ?? 0,
            xp: r?.xp ?? 0,
            piments: won ? fight.boss.reward.piments : 0,
            itemName: r?.item?.name ?? null,
            itemColor: r?.item ? RARITY_COLORS[r.item.rarity] : undefined,
            levels: r?.levels ?? 0,
            note: won
              ? null
              : `Tu lui as retiré ${Math.round(damage * 100)} % de sa vie. Renforce ton kok, puis reviens.`,
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
    setFight({
      me,
      boss,
      result: simulateCombat(
        me,
        bossToFighter(boss),
        eventCombatMods(eventOfDay(localDay()))
      ),
    });
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <ScreenTitle
        title={t('dungeon.title')}
        sub={t('dungeon.sub')}
        accent={C.mystic}
      />

      <RewardOverlay reward={outcome} onClose={() => setOutcome(null)} />

      {/* Clés */}
      <Card compact>
        <View style={styles.keyRow}>
          <View style={{ flexDirection: 'row', gap: 4 }}>
            {Array.from({ length: MAX_KEYS }, (_, i) => (
              <Text key={i} style={{ fontSize: 20, opacity: i < keys ? 1 : 0.22 }}>
                🗝️
              </Text>
            ))}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.keyTitle}>
              {keys > 0 ? t('dungeon.keys', { n: keys }) : t('dungeon.noKey')}
            </Text>
            <Text style={styles.keySub}>
              {t('dungeon.keySources')}
            </Text>
          </View>
          <Button
            size="sm"
            variant="piment"
            label={`🌶️${KEY_PIMENT_COST}`}
            onPress={buyKey}
            disabled={player.piments < KEY_PIMENT_COST || keys >= MAX_KEYS}
          />
        </View>
        {keys < MAX_KEYS && (
          <AdButton kind="key" full label={t('dungeon.adKey')} />
        )}
      </Card>

      {/* Progression */}
      <Card>
        <SectionTitle icon="🗺️">{t('dungeon.progress')}</SectionTitle>
        <Bar
          value={dungeonFloor}
          max={BOSSES.length}
          variant="mystic"
          height={16}
          label={t('dungeon.cleared_n', { n: dungeonFloor, total: BOSSES.length })}
        />
      </Card>

      {done && (
        <Card glow={C.gold}>
          <Text style={styles.outcomeTitle}>👑 La rout lé fini !</Text>
          <Text style={T.body}>
            {t('dungeon.allDone')}
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
                    <Text style={{ fontSize: 31 }}>🔒</Text>
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

                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={styles.bossName} numberOfLines={1}>
                    {locked ? '???' : boss.name}
                  </Text>
                  <Text style={styles.place} numberOfLines={1}>
                    📍 {boss.place}
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 4, flexWrap: 'wrap' }}>
                    <Chip label={t('common.level', { n: boss.level })} color={C.textDim} />
                    {!locked && (
                      <Chip icon={cls.emoji} label={cls.name} color={cls.color} />
                    )}
                    {cleared && <Chip label={t('dungeon.cleared')} color={C.cane} active />}
                    {current && (
                      <Chip
                        label={
                          ratio >= 1.1 ? 'À TA PORTÉE' : ratio >= 0.8 ? 'DUR' : 'TRÈS DUR'
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
                  <Text style={styles.flavor}>{t(boss.flavorKey)}</Text>
                  <LinearGradient
                    colors={['rgba(255,246,232,0.07)', 'rgba(255,246,232,0.02)']}
                    style={styles.rewardBox}
                  >
                    <Text style={styles.rewardLabel}>{t('dungeon.guaranteed')}</Text>
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
                    label={keys > 0 ? t('dungeon.fight') : t('dungeon.noKey')}
                    onPress={() => launch(boss)}
                    disabled={keys <= 0}
                    style={{ marginTop: 8, ...SHADOW.card }}
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
  content: { padding: 12, paddingBottom: 32 },
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
  gainRow: { flexDirection: 'row', gap: 16, flexWrap: 'wrap', marginBottom: 4 },
  gain: { fontFamily: F.black, fontSize: 15, lineHeight: 20, color: C.text },
  lootLine: { fontFamily: F.bold, fontSize: 13, lineHeight: 17, color: C.gold },
  damageLine: {
    fontFamily: F.regular,
    fontSize: 13,
    lineHeight: 17,
    color: C.textDim,
    marginBottom: 8,
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
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: R.pill,
    backgroundColor: 'rgba(6,3,12,0.92)',
    borderWidth: 1,
    borderColor: C.hairline,
  },
  floorText: {
    fontFamily: F.black,
    fontSize: 11,
    lineHeight: 15,
    color: C.mystic,
    includeFontPadding: false,
    textAlign: 'center',
  },
  bossName: { fontFamily: F.black, fontSize: 17, lineHeight: 22, color: C.text },
  place: { fontFamily: F.semi, fontSize: 12, lineHeight: 16, color: C.textDim },
  flavor: {
    fontFamily: F.regular,
    fontSize: 13,
    lineHeight: 17,
    color: C.textDim,
    marginTop: 8,
  },
  rewardBox: {
    marginTop: 8,
    padding: 8,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: C.hairlineSoft,
    gap: 8,
  },
  rewardLabel: {
    fontFamily: F.black,
    fontSize: 11,
    lineHeight: 15,
    letterSpacing: 1.2,
    color: C.textFaint,
  },
  rewardRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12 },
  rewardItem: { fontFamily: F.bold, fontSize: 13, lineHeight: 17, color: C.text },
});
