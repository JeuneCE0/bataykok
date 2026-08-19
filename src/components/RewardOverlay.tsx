import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Modal, StyleSheet, Text, View } from 'react-native';

import { fmt } from '../game/formulas';
import { RewardPart } from '../game/rewards';
import { play } from '../lib/sound';
import { C, F, G, R, SHADOW } from '../theme';
import { Button, Chip } from './ui';

export interface RewardView {
  won: boolean;
  title: string;
  gold: number;
  xp: number;
  honor?: number;
  piments?: number;
  itemName?: string | null;
  itemColor?: string;
  parts?: RewardPart[];
  levels?: number;
  note?: string | null;
}

/**
 * Le moment de paie. Les chiffres doivent se voir de l'autre bout de la pièce :
 * une victoire dont on ne lit pas la récompense ne récompense rien.
 */
export default function RewardOverlay({
  reward,
  onClose,
}: {
  reward: RewardView | null;
  onClose: () => void;
}) {
  const pop = useRef(new Animated.Value(0)).current;
  const shine = useRef(new Animated.Value(0)).current;
  const coins = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!reward) return;
    if (reward.gold > 0 || reward.xp > 0) play('coin', 0.9);
    pop.setValue(0);
    coins.setValue(0);
    Animated.parallel([
      Animated.spring(pop, {
        toValue: 1,
        friction: 5,
        tension: 90,
        useNativeDriver: true,
      }),
      Animated.timing(coins, {
        toValue: 1,
        duration: 620,
        delay: 160,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),
    ]).start();

    if (reward.won) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(shine, { toValue: 1, duration: 1300, useNativeDriver: true }),
          Animated.timing(shine, { toValue: 0, duration: 1300, useNativeDriver: true }),
        ])
      ).start();
    }
  }, [reward, pop, shine, coins]);

  const accent = reward?.won ? C.gold : C.piment;

  return (
    <Modal visible={!!reward} transparent animationType="fade" onRequestClose={onClose}>
      {reward ? (
      <View style={styles.root}>
        {reward.won && (
          <Animated.View
            pointerEvents="none"
            style={[
              styles.halo,
              {
                opacity: shine.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.12, 0.28],
                }),
                transform: [
                  {
                    scale: shine.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.9, 1.15],
                    }),
                  },
                ],
              },
            ]}
          />
        )}

        <Animated.View
          style={{
            width: '100%',
            opacity: pop,
            transform: [
              { scale: pop.interpolate({ inputRange: [0, 1], outputRange: [0.85, 1] }) },
            ],
          }}
        >
          <LinearGradient colors={['#2A1A3D', '#0B0714']} style={styles.card}>
            <LinearGradient
              colors={reward.won ? G.gold : G.piment}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[styles.banner, reward.won ? SHADOW.glowGold : SHADOW.card]}
            >
              <Text style={[styles.bannerText, { color: reward.won ? C.ink : '#FFF' }]}>
                {reward.title}
              </Text>
            </LinearGradient>

            {/* les gains, en très gros */}
            {/* l'animation ne porte que sur la position : un chiffre de gain
                ne doit jamais rester invisible si une séquence s'interrompt */}
            {(reward.gold > 0 || reward.xp > 0 || reward.piments) && (
            <Animated.View
              style={[
                styles.gains,
                {
                  transform: [
                    {
                      translateY: coins.interpolate({
                        inputRange: [0, 1],
                        outputRange: [16, 0],
                      }),
                    },
                  ],
                },
              ]}
            >
              {reward.gold > 0 && (
                <View style={styles.gain}>
                  <Text style={styles.gainIcon}>🌽</Text>
                  <Text style={[styles.gainValue, { color: C.gold }]}>
                    +{fmt(reward.gold)}
                  </Text>
                </View>
              )}
              {reward.xp > 0 && (
                <View style={styles.gain}>
                  <Text style={styles.gainIcon}>✨</Text>
                  <Text style={[styles.gainValue, { color: C.mystic }]}>
                    +{fmt(reward.xp)}
                  </Text>
                  <Text style={styles.gainUnit}>XP</Text>
                </View>
              )}
              {reward.piments ? (
                <View style={styles.gain}>
                  <Text style={styles.gainIcon}>🌶️</Text>
                  <Text style={[styles.gainValue, { color: C.piment }]}>
                    +{reward.piments}
                  </Text>
                </View>
              ) : null}
            </Animated.View>
            )}

            {reward.itemName && (
              <View
                style={[
                  styles.item,
                  { borderColor: reward.itemColor ?? C.gold },
                ]}
              >
                <Text style={{ fontSize: 22 }}>🎁</Text>
                <Text
                  style={[styles.itemName, { color: reward.itemColor ?? C.gold }]}
                  numberOfLines={2}
                >
                  {reward.itemName}
                </Text>
              </View>
            )}

            {typeof reward.honor === 'number' && reward.honor !== 0 && (
              <Text
                style={[
                  styles.honor,
                  { color: reward.honor > 0 ? C.cane : C.piment },
                ]}
              >
                🎖️ {reward.honor > 0 ? '+' : ''}
                {reward.honor} honneur
              </Text>
            )}

            {reward.parts && reward.parts.length > 0 && (
              <View style={styles.bonuses}>
                {reward.parts.map((b) => (
                  <Chip
                    key={b.label}
                    label={`${b.label} ×${b.mult.toFixed(2).replace('.', ',')}`}
                    color={accent}
                  />
                ))}
              </View>
            )}

            {reward.levels ? (
              <Text style={styles.levelUp}>🎉 NIVEAU SUPÉRIEUR !</Text>
            ) : null}
            {reward.note ? <Text style={styles.note}>{reward.note}</Text> : null}

            <Button
              full
              size="lg"
              variant={reward.won ? 'gold' : 'slate'}
              label="Continuer"
              onPress={onClose}
              style={{ marginTop: 16 }}
            />
          </LinearGradient>
        </Animated.View>
      </View>
      ) : null}
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'rgba(4,2,8,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 22,
  },
  halo: {
    position: 'absolute',
    width: 320,
    height: 320,
    borderRadius: 160,
    backgroundColor: C.gold,
  },
  card: {
    borderRadius: R.xl,
    borderWidth: 1,
    borderColor: C.hairline,
    padding: 22,
    alignItems: 'center',
    gap: 12,
  },
  banner: {
    paddingHorizontal: 26,
    paddingVertical: 10,
    borderRadius: R.pill,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  bannerText: {
    fontFamily: F.black,
    fontSize: 21,
    lineHeight: 26,
    textAlign: 'center',
    includeFontPadding: false,
  },
  gains: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', gap: 18 },
  gain: { flexDirection: 'row', alignItems: 'baseline', gap: 5 },
  gainIcon: { fontSize: 26 },
  gainValue: {
    fontFamily: F.black,
    fontSize: 40,
    lineHeight: 46,
    includeFontPadding: false,
  },
  gainUnit: { fontFamily: F.black, fontSize: 16, lineHeight: 21, color: C.textDim },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderWidth: 1.5,
    borderRadius: R.md,
    paddingVertical: 8,
    paddingHorizontal: 14,
    backgroundColor: 'rgba(6,3,12,0.5)',
    maxWidth: '100%',
  },
  itemName: { fontFamily: F.black, fontSize: 15, lineHeight: 20, flexShrink: 1 },
  honor: { fontFamily: F.black, fontSize: 16, lineHeight: 21 },
  bonuses: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', justifyContent: 'center' },
  levelUp: { fontFamily: F.black, fontSize: 17, lineHeight: 22, color: C.gold },
  note: {
    fontFamily: F.regular,
    fontSize: 13.5,
    lineHeight: 19,
    color: C.textDim,
    textAlign: 'center',
  },
});
