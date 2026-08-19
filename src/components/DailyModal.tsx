import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, Modal, StyleSheet, Text, View } from 'react-native';

import { STREAK_REWARDS } from '../game/progress';
import { useGame } from '../store/gameStore';
import { localDay } from '../game/day';
import { C, F, G, R, SHADOW } from '../theme';
import { Button } from './ui';

function today(): string {
  return localDay();
}

/** Rendez-vous quotidien : la série de connexions, récompense croissante. */
export default function DailyModal() {
  const player = useGame((s) => s.player);
  const loginStreak = useGame((s) => s.loginStreak);
  const streakClaimedDay = useGame((s) => s.streakClaimedDay);
  const claimStreak = useGame((s) => s.claimStreak);

  const open = !!player && streakClaimedDay !== today();
  const [got, setGot] = useState<{ grains: number; piments: number } | null>(null);
  const scale = useRef(new Animated.Value(0.9)).current;

  useEffect(() => {
    if (!open) return;
    scale.setValue(0.9);
    Animated.spring(scale, {
      toValue: 1,
      friction: 6,
      tension: 90,
      useNativeDriver: true,
    }).start();
  }, [open, scale]);

  // Rendre la *même* Modal fermée plutôt que `null` : React réutilise alors
  // l'instance au lieu de la démonter. Démonter une Modal encore présentée
  // laissait sur iOS un fragment visible en filigrane sous tout le jeu.
  if (!open)
    return <Modal visible={false} transparent animationType="fade" />;
  const idx = ((loginStreak - 1) % 7 + 7) % 7;

  return (
    <Modal visible transparent animationType="fade">
      <View style={styles.root}>
        <Animated.View style={{ transform: [{ scale }], width: '100%' }}>
          <LinearGradient colors={['#241533', '#0E0818']} style={styles.card}>
            <Text style={styles.kicker}>KABAR DU JOUR</Text>
            <Text style={styles.title}>Jour {loginStreak} d'affilée</Text>
            <Text style={styles.sub}>
              Reviens chaque jour : la récompense i mont, i mont, i mont…
            </Text>

            <View style={styles.grid}>
              {STREAK_REWARDS.map((r, i) => {
                const isToday = i === idx;
                const passed = i < idx;
                return (
                  <View
                    key={r.day}
                    style={[
                      styles.day,
                      passed && styles.dayPassed,
                      isToday && styles.dayToday,
                    ]}
                  >
                    <Text style={[styles.dayNum, isToday && { color: C.ink }]}>
                      J{r.day}
                    </Text>
                    <Text style={styles.dayIcon}>
                      {r.piments > 0 ? '🌶️' : '🌽'}
                    </Text>
                    <Text style={[styles.dayVal, isToday && { color: C.ink }]}>
                      {r.piments > 0 && r.grains > 0
                        ? `${r.piments}+`
                        : r.piments > 0
                          ? r.piments
                          : r.grains}
                    </Text>
                  </View>
                );
              })}
            </View>

            {got ? (
              <Text style={styles.got}>
                🎉 +{got.grains > 0 ? `🌽${got.grains} ` : ''}
                {got.piments > 0 ? `🌶️${got.piments}` : ''}
              </Text>
            ) : null}

            <Button
              full
              size="lg"
              variant={got ? 'slate' : 'gold'}
              label={got ? 'Anon batayé !' : 'Récupérer'}
              onPress={() => {
                if (got) {
                  setGot(null);
                  return;
                }
                const r = claimStreak();
                if (r) setGot(r);
              }}
              style={{ marginTop: 14 }}
            />
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'rgba(4,2,8,0.88)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 22,
  },
  card: {
    borderRadius: R.xl,
    borderWidth: 1,
    borderColor: C.hairline,
    padding: 22,
    alignItems: 'center',
    ...SHADOW.float,
  },
  kicker: {
    fontFamily: F.black,
    fontSize: 10,
    letterSpacing: 1.6,
    color: C.ember,
  },
  title: { fontFamily: F.black, fontSize: 26, color: C.gold, marginTop: 2 },
  sub: {
    fontFamily: F.regular,
    fontSize: 12.5,
    color: C.textDim,
    textAlign: 'center',
    marginTop: 2,
    marginBottom: 14,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 7, justifyContent: 'center' },
  day: {
    width: 62,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: C.hairlineSoft,
    backgroundColor: 'rgba(6,3,12,0.45)',
    alignItems: 'center',
    paddingVertical: 7,
    gap: 1,
  },
  dayPassed: { opacity: 0.42, borderColor: C.cane },
  dayToday: {
    backgroundColor: C.gold,
    borderColor: '#fff',
    ...SHADOW.glowGold,
  },
  dayNum: { fontFamily: F.black, fontSize: 11, color: C.textDim },
  dayIcon: { fontSize: 15 },
  dayVal: { fontFamily: F.black, fontSize: 12, color: C.text },
  got: { fontFamily: F.black, fontSize: 17, color: C.cane, marginTop: 14 },
});
