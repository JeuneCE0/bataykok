import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { fmt } from '../game/formulas';
import { DAILY_CHEST, missionGrains } from '../game/progress';
import { useGame } from '../store/gameStore';
import { C, F, G, R, SHADOW } from '../theme';
import { Bar, Button, Card, SectionTitle } from './ui';
import { useT } from '../i18n/useT';

/** Trois objectifs par jour + un coffre si le trio tombe. */
export default function DailyMissions() {
  const t = useT();
  const level = useGame((s) => s.player?.level ?? 1);
  const missions = useGame((s) => s.dailyMissions);
  const claimMission = useGame((s) => s.claimMission);
  const chestClaimed = useGame((s) => s.dailyChestClaimed);
  const claimChest = useGame((s) => s.claimDailyChest);

  const allClaimed = missions.length > 0 && missions.every((m) => m.claimed);

  return (
    <Card glow={allClaimed && !chestClaimed ? C.gold : undefined}>
      <SectionTitle icon="🎯">{t('daily.missions')}</SectionTitle>

      {missions.map((m) => {
        const ready = m.progress >= m.def.target;
        return (
          <View key={m.def.id} style={styles.row}>
            <View style={[styles.icon, m.claimed && { opacity: 0.4 }]}>
              <Text style={{ fontSize: 17 }}>{m.def.icon}</Text>
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <View style={styles.head}>
                <Text style={[styles.title, m.claimed && styles.done]} numberOfLines={1}>
                  {t(m.def.titleKey)}
                </Text>
                <Text style={styles.count}>
                  {Math.min(m.progress, m.def.target)}/{m.def.target}
                </Text>
              </View>
              <Bar
                value={m.progress}
                max={m.def.target}
                variant={m.claimed ? 'slate' : ready ? 'cane' : 'gold'}
                height={6}
              />
              <Text style={styles.reward}>
                {m.def.grains > 0 ? `🌽${fmt(missionGrains(m.def.grains, level))}` : ''}
                {m.def.piments > 0 ? `  🌶️${m.def.piments}` : ''}
              </Text>
            </View>
            {m.claimed ? (
              <Text style={styles.check}>✅</Text>
            ) : (
              <Button
                size="sm"
                variant={ready ? 'cane' : 'slate'}
                label={ready ? '🎁' : '…'}
                onPress={() => claimMission(m.def.id)}
                disabled={!ready}
              />
            )}
          </View>
        );
      })}

      <LinearGradient
        colors={
          allClaimed && !chestClaimed
            ? ['rgba(255,201,60,0.28)', 'rgba(255,90,31,0.08)']
            : ['rgba(255,246,232,0.05)', 'rgba(255,246,232,0.02)']
        }
        style={[styles.chest, allClaimed && !chestClaimed ? SHADOW.glowGold : null]}
      >
        <Text style={{ fontSize: 24 }}>{chestClaimed ? '📭' : '🧰'}</Text>
        <View style={{ flex: 1 }}>
          <Text style={styles.chestTitle}>{t('daily.chest')}</Text>
          <Text style={styles.chestSub}>
            {chestClaimed
              ? 'Déjà ouvert — retour demain !'
              : `Les 3 défis → 🌽${missionGrains(DAILY_CHEST.grains, level)} + 🌶️${DAILY_CHEST.piments}`}
          </Text>
        </View>
        <Button
          size="sm"
          variant={allClaimed && !chestClaimed ? 'gold' : 'slate'}
          label={chestClaimed ? 'Pris' : 'Ouvrir'}
          onPress={claimChest}
          disabled={!allClaimed || chestClaimed}
        />
      </LinearGradient>
    </Card>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: C.hairlineSoft,
  },
  icon: {
    width: 34,
    height: 34,
    borderRadius: R.sm,
    borderWidth: 1,
    borderColor: C.hairlineSoft,
    backgroundColor: 'rgba(6,3,12,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  head: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  title: { fontFamily: F.bold, fontSize: 15, lineHeight: 20, color: C.text, flex: 1 },
  done: { color: C.textFaint, textDecorationLine: 'line-through' },
  count: { fontFamily: F.black, fontSize: 13, lineHeight: 17, color: C.textDim },
  reward: { fontFamily: F.bold, fontSize: 12, lineHeight: 16, color: C.gold },
  check: { fontSize: 17 },
  chest: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    padding: 8,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: C.hairlineSoft,
  },
  chestTitle: { fontFamily: F.black, fontSize: 15, lineHeight: 20, color: C.text },
  chestSub: { fontFamily: F.regular, fontSize: 12, lineHeight: 16, color: C.textDim },
});
