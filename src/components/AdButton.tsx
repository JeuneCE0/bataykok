import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { AD_OFFERS, AdKind, MAX_ADS_PER_DAY } from '../game/progress';
import { useGame } from '../store/gameStore';
import { C, F, G, R, SHADOW } from '../theme';

const AD_SECONDS = 4;

/**
 * Pub récompensée. Le prototype simule le SDK (AdMob via RevenueCat en prod) :
 * même friction, même cadence, pour que l'équilibrage tienne dès maintenant.
 */
export default function AdButton({
  kind,
  label,
  full,
  onRewarded,
}: {
  kind: AdKind;
  label?: string;
  full?: boolean;
  onRewarded?: () => void;
}) {
  const watchAd = useGame((s) => s.watchAd);
  const adsToday = useGame((s) => s.adsToday);
  const adNextAt = useGame((s) => s.adNextAt);
  const offer = AD_OFFERS[kind];

  const [playing, setPlaying] = useState(false);
  const [left, setLeft] = useState(AD_SECONDS);
  const [now, setNow] = useState(Date.now());
  const pulse = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    if (!playing) return;
    setLeft(AD_SECONDS);
    const t = setInterval(() => setLeft((l) => l - 1), 1000);
    return () => clearInterval(t);
  }, [playing]);

  useEffect(() => {
    if (!playing || left > 0) return;
    if (watchAd(kind)) onRewarded?.();
    setPlaying(false);
  }, [left, playing, kind, watchAd, onRewarded]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 1200, useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 1200, useNativeDriver: true }),
      ])
    ).start();
  }, [pulse]);

  const waiting = Math.max(0, Math.ceil((adNextAt - now) / 1000));
  const outOfAds = adsToday >= MAX_ADS_PER_DAY;
  const disabled = outOfAds || waiting > 0;

  return (
    <>
      <Pressable
        onPress={() => setPlaying(true)}
        disabled={disabled}
        style={({ pressed }) => [
          styles.wrap,
          full ? { alignSelf: 'stretch' } : { alignSelf: 'flex-start' },
          disabled ? { opacity: 0.4 } : null,
          pressed && !disabled ? { transform: [{ translateY: 2 }] } : null,
        ]}
      >
        <Animated.View
          style={{
            opacity: disabled
              ? 1
              : pulse.interpolate({ inputRange: [0, 1], outputRange: [1, 0.82] }),
          }}
        >
          <LinearGradient
            colors={['#3EE3B3', '#12B886', '#0A8A66']}
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={[styles.btn, SHADOW.card]}
          >
            <Text style={styles.play}>▶</Text>
            <View style={{ flex: full ? 1 : 0 }}>
              <Text style={styles.title}>{label ?? offer.title}</Text>
              <Text style={styles.sub}>
                {outOfAds
                  ? 'Revient demain'
                  : waiting > 0
                    ? `Disponible dans ${waiting}s`
                    : `${offer.icon} ${offer.reward} · gratuit`}
              </Text>
            </View>
            <View style={styles.counter}>
              <Text style={styles.counterText}>
                {Math.max(0, MAX_ADS_PER_DAY - adsToday)}
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>
      </Pressable>

      <Modal visible={playing} transparent animationType="fade">
        <View style={styles.adRoot}>
          <LinearGradient colors={G.night} style={styles.adCard}>
            <Text style={styles.adTag}>PUBLICITÉ · SIMULATION PROTOTYPE</Text>
            <Text style={styles.adEmoji}>{offer.icon}</Text>
            <Text style={styles.adTitle}>{offer.title}</Text>
            <Text style={styles.adReward}>{offer.reward}</Text>
            <View style={styles.adTimer}>
              <Text style={styles.adTimerText}>{Math.max(0, left)}</Text>
            </View>
            <Text style={styles.adHint}>Ta récompense arrive…</Text>
          </LinearGradient>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  wrap: { borderRadius: R.md },
  btn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    borderRadius: R.md,
    paddingVertical: 9,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.35)',
  },
  play: { fontFamily: F.black, fontSize: 15, color: '#06301F' },
  title: { fontFamily: F.black, fontSize: 13.5, color: '#06301F' },
  sub: { fontFamily: F.semi, fontSize: 10.5, color: 'rgba(6,48,31,0.75)' },
  counter: {
    minWidth: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(6,48,31,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 5,
  },
  counterText: { fontFamily: F.black, fontSize: 11, color: '#06301F' },
  adRoot: {
    flex: 1,
    backgroundColor: 'rgba(4,2,8,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  adCard: {
    width: '100%',
    borderRadius: R.xl,
    borderWidth: 1,
    borderColor: C.hairline,
    padding: 28,
    alignItems: 'center',
    gap: 10,
  },
  adTag: {
    fontFamily: F.bold,
    fontSize: 9.5,
    letterSpacing: 1.4,
    color: C.textFaint,
  },
  adEmoji: { fontSize: 54 },
  adTitle: { fontFamily: F.black, fontSize: 22, color: C.gold },
  adReward: { fontFamily: F.semi, fontSize: 14, color: C.text },
  adTimer: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 3,
    borderColor: C.cane,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 6,
  },
  adTimerText: { fontFamily: F.black, fontSize: 24, color: C.cane },
  adHint: { fontFamily: F.regular, fontSize: 12, color: C.textDim },
});
