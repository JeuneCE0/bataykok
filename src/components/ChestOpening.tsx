import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useRef } from 'react';
import { Animated, Easing, Modal, StyleSheet, Text, View } from 'react-native';

import { fmt } from '../game/formulas';
import { RARITY_COLORS, RARITY_LABELS } from '../game/items';
import { Item } from '../game/types';
import { play } from '../lib/sound';
import { C, F, G, R, SHADOW } from '../theme';
import { Button } from './ui';

export interface ChestLoot {
  grains: number;
  piments: number;
  item: Item | null;
}

/**
 * Ouverture de coffre. Trois temps : le coffre tremble et gonfle, la lumière
 * explose, la récompense se pose. Le tout dure moins de deux secondes — au
 * delà, on saute l'animation au lieu de la savourer.
 */
export default function ChestOpening({
  loot,
  onClose,
}: {
  loot: ChestLoot | null;
  onClose: () => void;
}) {
  const shake = useRef(new Animated.Value(0)).current;
  const chest = useRef(new Animated.Value(0)).current;
  const burst = useRef(new Animated.Value(0)).current;
  const reveal = useRef(new Animated.Value(0)).current;
  const halo = useRef(new Animated.Value(0)).current;

  const rays = useMemo(
    () => Array.from({ length: 12 }, (_, i) => (i * 360) / 12),
    []
  );
  const sparks = useMemo(
    () =>
      Array.from({ length: 14 }, (_, i) => ({
        angle: (i * 360) / 14 + (i % 3) * 7,
        dist: 90 + (i % 4) * 34,
        size: 13 + (i % 3) * 6,
        char: ['✦', '✧', '🌟', '🪶'][i % 4],
      })),
    []
  );

  useEffect(() => {
    if (!loot) return;
    play('chest');
    shake.setValue(0);
    chest.setValue(0);
    burst.setValue(0);
    reveal.setValue(0);
    halo.setValue(0);

    Animated.sequence([
      // 1. le coffre s'agite, de plus en plus fort
      Animated.timing(shake, {
        toValue: 1,
        duration: 850,
        easing: Easing.linear,
        useNativeDriver: true,
      }),
      // 2. il gonfle puis s'ouvre d'un coup
      Animated.parallel([
        Animated.timing(chest, {
          toValue: 1,
          duration: 260,
          easing: Easing.back(2.2),
          useNativeDriver: true,
        }),
        Animated.timing(burst, {
          toValue: 1,
          duration: 620,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      // 3. la récompense se pose
      Animated.spring(reveal, {
        toValue: 1,
        friction: 5,
        tension: 70,
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(halo, { toValue: 1, duration: 1400, useNativeDriver: true }),
        Animated.timing(halo, { toValue: 0, duration: 1400, useNativeDriver: true }),
      ])
    ).start();
  }, [loot, shake, chest, burst, reveal, halo]);

  if (!loot) return null;

  const rare = loot.item ? RARITY_COLORS[loot.item.rarity] : C.gold;
  const label = loot.item
    ? loot.item.name
    : loot.piments > 0
      ? `${loot.piments} piments`
      : `${fmt(loot.grains)} grains`;
  const icon = loot.item ? '🎁' : loot.piments > 0 ? '🌶️' : '🌽';

  return (
    <Modal visible transparent animationType="fade">
      <View style={styles.root}>
        {/* halo pulsé derrière toute la scène */}
        <Animated.View
          pointerEvents="none"
          style={[
            styles.halo,
            {
              backgroundColor: rare,
              opacity: halo.interpolate({
                inputRange: [0, 1],
                outputRange: [0.14, 0.3],
              }),
              transform: [
                {
                  scale: halo.interpolate({
                    inputRange: [0, 1],
                    outputRange: [0.85, 1.12],
                  }),
                },
              ],
            },
          ]}
        />

        {/* rayons qui jaillissent à l'ouverture */}
        {rays.map((a, i) => (
          <Animated.View
            key={i}
            pointerEvents="none"
            style={[
              styles.ray,
              {
                backgroundColor: rare,
                opacity: burst.interpolate({
                  inputRange: [0, 0.4, 1],
                  outputRange: [0, 0.55, 0],
                }),
                transform: [
                  { rotate: `${a}deg` },
                  {
                    scaleY: burst.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0.2, 1.6],
                    }),
                  },
                ],
              },
            ]}
          />
        ))}

        {/* étincelles projetées */}
        {sparks.map((s, i) => {
          const rad = (s.angle * Math.PI) / 180;
          return (
            <Animated.Text
              key={i}
              pointerEvents="none"
              style={{
                position: 'absolute',
                fontSize: s.size,
                opacity: burst.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [0, 1, 0],
                }),
                transform: [
                  {
                    translateX: burst.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, Math.cos(rad) * s.dist],
                    }),
                  },
                  {
                    translateY: burst.interpolate({
                      inputRange: [0, 1],
                      outputRange: [0, Math.sin(rad) * s.dist],
                    }),
                  },
                  {
                    scale: burst.interpolate({
                      inputRange: [0, 0.6, 1],
                      outputRange: [0.4, 1.2, 0.7],
                    }),
                  },
                ],
              }}
            >
              {s.char}
            </Animated.Text>
          );
        })}

        {/* le coffre */}
        <Animated.View
          style={{
            opacity: chest.interpolate({
              inputRange: [0, 0.6, 1],
              outputRange: [1, 1, 0],
            }),
            transform: [
              {
                translateX: shake.interpolate({
                  inputRange: [0, 0.15, 0.3, 0.45, 0.6, 0.75, 0.9, 1],
                  outputRange: [0, -6, 7, -9, 10, -12, 13, 0],
                }),
              },
              {
                rotate: shake.interpolate({
                  inputRange: [0, 0.3, 0.6, 0.9, 1],
                  outputRange: ['0deg', '-5deg', '5deg', '-7deg', '0deg'],
                }),
              },
              {
                scale: chest.interpolate({
                  inputRange: [0, 0.5, 1],
                  outputRange: [1, 1.45, 2.2],
                }),
              },
            ],
          }}
        >
          <Text style={styles.chest}>🧰</Text>
        </Animated.View>

        {/* la récompense */}
        <Animated.View
          style={[
            styles.rewardWrap,
            {
              opacity: reveal,
              transform: [
                { scale: reveal.interpolate({ inputRange: [0, 1], outputRange: [0.5, 1] }) },
              ],
            },
          ]}
        >
          <LinearGradient
            colors={[`${rare}44`, 'rgba(10,7,19,0.92)']}
            style={[styles.rewardCard, { borderColor: rare }, SHADOW.float]}
          >
            <Text style={styles.rewardIcon}>{icon}</Text>
            <Text style={[styles.rewardLabel, { color: rare }]}>{label}</Text>
            {loot.item && (
              <Text style={styles.rarity}>
                {RARITY_LABELS[loot.item.rarity]} · niv. {loot.item.level}
              </Text>
            )}
            {!loot.item && loot.grains > 0 && loot.piments > 0 && (
              <Text style={styles.rarity}>🌽 {fmt(loot.grains)}</Text>
            )}
          </LinearGradient>

          <Button
            full
            size="lg"
            label="Empocher !"
            onPress={onClose}
            style={{ marginTop: 18 }}
          />
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'rgba(4,2,8,0.94)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  halo: {
    position: 'absolute',
    width: 280,
    height: 280,
    borderRadius: 140,
  },
  ray: {
    position: 'absolute',
    width: 4,
    height: 190,
    borderRadius: 2,
  },
  chest: { fontSize: 96 },
  rewardWrap: { position: 'absolute', alignItems: 'center', width: '100%' },
  rewardCard: {
    alignItems: 'center',
    paddingVertical: 22,
    paddingHorizontal: 28,
    borderRadius: R.xl,
    borderWidth: 2,
    minWidth: 240,
    gap: 4,
  },
  rewardIcon: { fontSize: 54 },
  rewardLabel: {
    fontFamily: F.black,
    fontSize: 22,
    lineHeight: 29,
    textAlign: 'center',
  },
  rarity: { fontFamily: F.semi, fontSize: 13, lineHeight: 18, color: C.textDim },
});
