import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, Modal, ScrollView, StyleSheet, Text, View } from 'react-native';

import { CLASSES } from '../game/classes';
import { fmt } from '../game/formulas';
import { useGame } from '../store/gameStore';
import { C, F, R, SHADOW } from '../theme';
import { Button, Chip } from './ui';

/**
 * Ce qui s'est passé pendant l'absence. Le snapshot du kok se bat tout seul :
 * sans ce rapport, le joueur verrait son honneur bouger sans savoir pourquoi.
 */
export default function DefenseReport() {
  const defenses = useGame((s) => s.pendingDefenses);
  const clearDefenses = useGame((s) => s.clearDefenses);
  const pop = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (defenses.length === 0) return;
    pop.setValue(0);
    Animated.spring(pop, {
      toValue: 1,
      friction: 6,
      tension: 85,
      useNativeDriver: true,
    }).start();
  }, [defenses.length, pop]);

  // Rendre la *même* Modal fermée plutôt que `null` : React réutilise alors
  // l'instance au lieu de la démonter. Démonter une Modal encore présentée
  // laissait sur iOS un fragment visible en filigrane sous tout le jeu.
  if (defenses.length === 0)
    return <Modal visible={false} transparent animationType="fade" />;

  const won = defenses.filter((d) => d.defended).length;
  const gold = defenses.reduce((s, d) => s + d.gold, 0);
  const xp = defenses.reduce((s, d) => s + d.xp, 0);
  const honor = defenses.reduce((s, d) => s + d.honorDelta, 0);

  return (
    <Modal visible transparent animationType="fade">
      <View style={styles.root}>
        <Animated.View
          style={{
            width: '100%',
            maxHeight: '86%',
            opacity: pop,
            transform: [
              { scale: pop.interpolate({ inputRange: [0, 1], outputRange: [0.92, 1] }) },
            ],
          }}
        >
          <LinearGradient colors={['#2A1A3D', '#0E0818']} style={styles.card}>
            <Text style={styles.kicker}>PENDANT TON ABSENCE</Text>
            <Text style={styles.title}>
              {defenses.length} combats sur ton kok
            </Text>
            <Text style={styles.sub}>
              {won === defenses.length
                ? 'Ton kok a tout repoussé. Beau travail !'
                : won === 0
                  ? "Personne n’a été repoussé. Il faut renforcer ton kok."
                  : `${won} défenses gagnées sur ${defenses.length}.`}
            </Text>

            <View style={styles.totals}>
              <Text style={styles.total}>🌽 +{fmt(gold)}</Text>
              <Text style={styles.total}>✨ +{fmt(xp)} XP</Text>
              <Text
                style={[
                  styles.total,
                  { color: honor >= 0 ? C.cane : C.piment },
                ]}
              >
                🎖️ {honor >= 0 ? '+' : ''}
                {honor}
              </Text>
            </View>

            <ScrollView style={{ marginTop: 6 }}>
              {defenses.map((d) => {
                const cls = CLASSES[d.attackerClass];
                return (
                  <View key={d.id} style={styles.row}>
                    <View
                      style={[
                        styles.badge,
                        {
                          borderColor: d.defended ? C.cane : C.piment,
                          backgroundColor: d.defended
                            ? 'rgba(59,217,126,0.14)'
                            : 'rgba(255,59,92,0.14)',
                        },
                      ]}
                    >
                      <Text style={{ fontSize: 17 }}>{d.defended ? '🛡️' : '💀'}</Text>
                    </View>
                    <View style={{ flex: 1, gap: 3 }}>
                      <Text style={styles.name} numberOfLines={1}>
                        {d.attackerName}
                      </Text>
                      <View style={{ flexDirection: 'row', gap: 5, flexWrap: 'wrap' }}>
                        <Chip icon={cls.emoji} label={`niv. ${d.attackerLevel}`} color={cls.color} />
                        <Chip
                          label={d.defended ? 'Repoussé' : 'Battu'}
                          color={d.defended ? C.cane : C.piment}
                        />
                      </View>
                    </View>
                    <View style={{ alignItems: 'flex-end' }}>
                      <Text style={styles.gain}>🌽 +{fmt(d.gold)}</Text>
                      <Text style={styles.honor}>
                        🎖️ {d.honorDelta >= 0 ? '+' : ''}
                        {d.honorDelta}
                      </Text>
                    </View>
                  </View>
                );
              })}
            </ScrollView>

            <Button
              full
              size="lg"
              label="Bien reçu"
              onPress={clearDefenses}
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
    backgroundColor: 'rgba(4,2,8,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  card: {
    borderRadius: R.xl,
    borderWidth: 1,
    borderColor: C.hairline,
    padding: 20,
    ...SHADOW.float,
  },
  kicker: {
    fontFamily: F.black,
    fontSize: 10.5,
    lineHeight: 14,
    letterSpacing: 1.6,
    color: C.ember,
    textAlign: 'center',
  },
  title: {
    fontFamily: F.black,
    fontSize: 24,
    lineHeight: 31,
    color: C.gold,
    textAlign: 'center',
  },
  sub: {
    fontFamily: F.regular,
    fontSize: 13.5,
    lineHeight: 19,
    color: C.textDim,
    textAlign: 'center',
    marginBottom: 12,
  },
  totals: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 16,
    flexWrap: 'wrap',
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: C.hairlineSoft,
  },
  total: { fontFamily: F.black, fontSize: 16, lineHeight: 21, color: C.text },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: C.hairlineSoft,
  },
  badge: {
    width: 38,
    height: 38,
    borderRadius: R.sm,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontFamily: F.black, fontSize: 15, lineHeight: 20, color: C.text },
  gain: { fontFamily: F.bold, fontSize: 13.5, lineHeight: 18, color: C.gold },
  honor: { fontFamily: F.semi, fontSize: 12.5, lineHeight: 17, color: C.textDim },
});
