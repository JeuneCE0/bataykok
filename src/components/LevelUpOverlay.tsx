import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Animated, Easing, Modal, StyleSheet, Text, View } from 'react-native';

import { play } from '../lib/sound';
import { useGame } from '../store/gameStore';
import { C, F, G, R, SHADOW } from '../theme';

const CONFETTI = ['🌽', '🌶️', '✦', '🪶', '⭐', '✧'];

/** Le moment de fierté : un niveau gagné doit s'entendre depuis la cuisine. */
export default function LevelUpOverlay() {
  const level = useGame((s) => s.player?.level ?? 0);
  const prev = useRef(level);
  const [show, setShow] = useState(false);
  const pop = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (level > prev.current && prev.current > 0) setShow(true);
    prev.current = level;
  }, [level]);

  useEffect(() => {
    if (!show) return;
    play('levelup');
    pop.setValue(0);
    Animated.sequence([
      Animated.spring(pop, {
        toValue: 1,
        friction: 5,
        tension: 90,
        useNativeDriver: true,
      }),
      Animated.delay(1500),
      Animated.timing(pop, {
        toValue: 0,
        duration: 260,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => setShow(false));
  }, [show, pop]);

  // Rendre la *même* Modal fermée plutôt que `null` : React réutilise alors
  // l'instance au lieu de la démonter. Démonter une Modal encore présentée
  // laissait sur iOS un fragment visible en filigrane sous tout le jeu.
  if (!show)
    return <Modal visible={false} transparent animationType="none" />;

  return (
    <Modal visible transparent animationType="none">
      <View style={styles.root} pointerEvents="none">
        <Confetti />
        <Animated.View
          style={{
            opacity: pop,
            transform: [
              { scale: pop.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) },
            ],
          }}
        >
          <LinearGradient
            colors={G.gold}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={[styles.badge, SHADOW.glowGold]}
          >
            <Text style={styles.kicker}>NIVO SUPÉRIÈR</Text>
            <Text style={styles.level}>{level}</Text>
            <Text style={styles.sub}>Out kok i vien pli for !</Text>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}

function Confetti() {
  const parts = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => ({
        anim: new Animated.Value(0),
        char: CONFETTI[i % CONFETTI.length],
        x: (i % 8) * 48 - 170 + (i % 3) * 14,
        delay: (i % 6) * 70,
        size: 16 + (i % 4) * 5,
      })),
    []
  );

  useEffect(() => {
    Animated.parallel(
      parts.map((p) =>
        Animated.timing(p.anim, {
          toValue: 1,
          duration: 1700,
          delay: p.delay,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        })
      )
    ).start();
  }, [parts]);

  return (
    <View style={styles.confetti} pointerEvents="none">
      {parts.map((p, i) => (
        <Animated.Text
          key={i}
          style={{
            position: 'absolute',
            fontSize: p.size,
            opacity: p.anim.interpolate({
              inputRange: [0, 0.7, 1],
              outputRange: [1, 0.9, 0],
            }),
            transform: [
              { translateX: p.x },
              {
                translateY: p.anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: [-260, 320],
                }),
              },
              {
                rotate: p.anim.interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', `${(i % 2 ? 1 : -1) * 320}deg`],
                }),
              },
            ],
          }}
        >
          {p.char}
        </Animated.Text>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(4,2,8,0.55)',
  },
  confetti: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  badge: {
    paddingHorizontal: 44,
    paddingVertical: 22,
    borderRadius: R.xl,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.5)',
    alignItems: 'center',
  },
  kicker: {
    fontFamily: F.black,
    fontSize: 11,
    letterSpacing: 2,
    color: 'rgba(42,18,6,0.75)',
  },
  level: { fontFamily: F.black, fontSize: 64, color: C.ink, marginVertical: -6 },
  sub: { fontFamily: F.bold, fontSize: 14, color: 'rgba(42,18,6,0.85)' },
});
