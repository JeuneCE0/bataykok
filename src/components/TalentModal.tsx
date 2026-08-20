import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef } from 'react';
import { Animated, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { pendingTier } from '../game/talents';
import { useT } from '../i18n/useT';
import { useGame } from '../store/gameStore';
import { C, F, G, R, SHADOW } from '../theme';

/**
 * Choix de talent : bloquant et non refusable. C'est un cadeau, et surtout le
 * seul moment où le joueur décide de ce que devient son kok.
 */
export default function TalentModal() {
  const player = useGame((s) => s.player);
  const pickTalent = useGame((s) => s.pickTalent);
  const tier = player ? pendingTier(player.level, player.talents ?? []) : null;
  const pop = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!tier) return;
    pop.setValue(0);
    Animated.spring(pop, {
      toValue: 1,
      friction: 6,
      tension: 80,
      useNativeDriver: true,
    }).start();
  }, [tier, pop]);

  const t = useT();

  // Rendre la *même* Modal fermée plutôt que `null` : React réutilise alors
  // l'instance au lieu de la démonter. Démonter une Modal encore présentée
  // laissait sur iOS un fragment visible en filigrane sous tout le jeu.
  if (!player || !tier)
    return <Modal visible={false} transparent animationType="fade" />;

  return (
    <Modal visible transparent animationType="fade">
      <View style={styles.root}>
        <Animated.View
          style={{
            width: '100%',
            opacity: pop,
            transform: [
              { scale: pop.interpolate({ inputRange: [0, 1], outputRange: [0.9, 1] }) },
            ],
          }}
        >
          <LinearGradient colors={['#2A1A3D', '#0E0818']} style={styles.card}>
            <Text style={styles.kicker}>NIVO {tier.level} · TALAN</Text>
            <Text style={styles.title}>{t('talent.choose')}</Text>
            <Text style={styles.sub}>
              {t('talent.warn')}
            </Text>

            <View style={{ gap: 8, marginTop: 16 }}>
              {tier.choices.map((c) => (
                <Pressable
                  key={c.id}
                  onPress={() => pickTalent(c.id)}
                  style={({ pressed }) => [
                    styles.choice,
                    pressed ? { transform: [{ scale: 0.98 }], borderColor: C.gold } : null,
                  ]}
                >
                  <LinearGradient
                    colors={G.slate}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    style={styles.choiceIcon}
                  >
                    <Text style={{ fontSize: 20 }}>{c.icon}</Text>
                  </LinearGradient>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Text style={styles.choiceTitle}>{t(c.titleKey)}</Text>
                    <Text style={styles.choiceDesc}>{t(c.descKey)}</Text>
                  </View>
                  <Text style={styles.arrow}>›</Text>
                </Pressable>
              ))}
            </View>
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
    padding: 16,
  },
  card: {
    borderRadius: R.xl,
    borderWidth: 1,
    borderColor: C.hairline,
    padding: 24,
    ...SHADOW.float,
  },
  kicker: {
    fontFamily: F.black,
    fontSize: 11,
    lineHeight: 15,
    letterSpacing: 1.6,
    color: C.ember,
    textAlign: 'center',
  },
  title: {
    fontFamily: F.black,
    fontSize: 24,
    lineHeight: 32,
    color: C.gold,
    textAlign: 'center',
  },
  sub: {
    fontFamily: F.regular,
    fontSize: 13,
    lineHeight: 17,
    color: C.textDim,
    textAlign: 'center',
  },
  choice: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    padding: 12,
    borderRadius: R.lg,
    borderWidth: 1.5,
    borderColor: C.hairline,
    backgroundColor: 'rgba(6,3,12,0.5)',
  },
  choiceIcon: {
    width: 46,
    height: 46,
    borderRadius: R.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  choiceTitle: { fontFamily: F.black, fontSize: 17, lineHeight: 22, color: C.text },
  choiceDesc: { fontFamily: F.semi, fontSize: 13, lineHeight: 17, color: C.textDim },
  arrow: { fontFamily: F.black, fontSize: 24, color: C.gold },
});
