import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Modal, Pressable, StyleSheet, Text, View } from 'react-native';

import { AD_OFFERS, AdKind, MAX_ADS_PER_DAY } from '../game/progress';
import { montrerPub, pubsReelles } from '../lib/ads';
import { trackEvent } from '../lib/analytics';
import { useGame } from '../store/gameStore';
import { C, F, G, R, SHADOW } from '../theme';
import { useT } from '../i18n/useT';

const AD_SECONDS = 4;

/**
 * Pub récompensée.
 *
 * Sur un build natif, c'est une vraie vidéo AdMob et la récompense n'est
 * versée que si Google confirme qu'elle est allée au bout. Sans le SDK (Expo
 * Go), on retombe sur la simulation : même friction, même cadence, pour que
 * l'équilibrage reste travaillable sans build.
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
  const t = useT();
  const watchAd = useGame((s) => s.watchAd);
  const adsToday = useGame((s) => s.adsToday);
  const adNextAt = useGame((s) => s.adNextAt);
  const offer = AD_OFFERS[kind];

  const [playing, setPlaying] = useState(false);
  const [chargement, setChargement] = useState(false);
  const [left, setLeft] = useState(AD_SECONDS);
  const [now, setNow] = useState(Date.now());
  const pulse = useRef(new Animated.Value(0)).current;

  // ne tourner que pendant l'attente : sans cooldown, ce minuteur réveillait
  // l'écran chaque seconde pour rien — et il y a plusieurs boutons par écran
  useEffect(() => {
    if (adNextAt <= Date.now()) return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [adNextAt]);

  useEffect(() => {
    if (!playing) return;
    setLeft(AD_SECONDS);
    const t = setInterval(() => setLeft((l) => l - 1), 1000);
    return () => clearInterval(t);
  }, [playing]);

  useEffect(() => {
    if (!playing || left > 0) return;
    encaisser();
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
  const disabled = outOfAds || waiting > 0 || chargement;

  const encaisser = () => {
    if (!watchAd(kind)) return;
    trackEvent('ad_completed', { kind });
    onRewarded?.();
  };

  const lancer = async () => {
    trackEvent('ad_started', { kind });
    if (!pubsReelles) {
      setPlaying(true);
      return;
    }
    setChargement(true);
    // une pub refusée, coupée ou indisponible ne donne rien — et ne dit rien
    // non plus : le bouton redevient simplement cliquable
    const vue = await montrerPub(kind);
    setChargement(false);
    if (vue) encaisser();
  };

  return (
    <>
      <Pressable
        onPress={() => void lancer()}
        disabled={disabled}
        style={({ pressed }) => [
          styles.wrap,
          full ? { alignSelf: 'stretch' } : { alignSelf: 'flex-start' },
          disabled ? { opacity: 0.9 } : null,
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
            colors={
              disabled
                ? ['#4A4056', '#332C3E', '#241F2C']
                : ['#3EE3B3', '#12B886', '#0A8A66']
            }
            start={{ x: 0, y: 0 }}
            end={{ x: 0, y: 1 }}
            style={[styles.btn, SHADOW.card]}
          >
            <Text style={[styles.play, disabled && { color: C.textDim }]}>
              {disabled ? '⏳' : '▶'}
            </Text>
            <View style={{ flex: full ? 1 : 0 }}>
              <Text style={[styles.title, disabled && { color: C.text }]}>
                {label ?? offer.title}
              </Text>
              <Text style={[styles.sub, disabled && { color: C.textDim }]}>
                {outOfAds
                  ? t('ad.outOfAds')
                  : chargement
                    ? t('ad.loading')
                    : waiting > 0
                      ? t('ad.waiting', { n: waiting })
                      : `${offer.icon} ${offer.reward} · gratuit`}
              </Text>
            </View>
            <View style={[styles.counter, disabled && styles.counterOff]}>
              <Text style={[styles.counterText, disabled && { color: C.textDim }]}>
                {Math.max(0, MAX_ADS_PER_DAY - adsToday)}
              </Text>
            </View>
          </LinearGradient>
        </Animated.View>
      </Pressable>

      <Modal visible={playing} transparent animationType="fade">
        <View style={styles.adRoot}>
          <LinearGradient colors={G.night} style={styles.adCard}>
            <Text style={styles.adTag}>{t('ad.badge')}</Text>
            <Text style={styles.adEmoji}>{offer.icon}</Text>
            <Text style={styles.adTitle}>{offer.title}</Text>
            <Text style={styles.adReward}>{offer.reward}</Text>
            <View style={styles.adTimer}>
              <Text style={styles.adTimerText}>{Math.max(0, left)}</Text>
            </View>
            <Text style={styles.adHint}>{t('ad.incoming')}</Text>
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
    gap: 8,
    borderRadius: R.md,
    minHeight: 52,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.35)',
  },
  play: { fontFamily: F.black, fontSize: 15, color: '#06301F' },
  title: {
    fontFamily: F.black,
    fontSize: 15,
    lineHeight: 20,
    color: '#06301F',
    includeFontPadding: false,
  },
  sub: {
    fontFamily: F.bold,
    fontSize: 12,
    lineHeight: 16,
    color: 'rgba(6,48,31,0.82)',
    includeFontPadding: false,
  },
  counter: {
    minWidth: 24,
    height: 24,
    borderRadius: 10,
    backgroundColor: 'rgba(6,48,31,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  counterOff: { backgroundColor: 'rgba(6,3,12,0.45)' },
  counterText: {
    fontFamily: F.black,
    fontSize: 12,
    lineHeight: 16,
    color: '#06301F',
    includeFontPadding: false,
    textAlign: 'center',
  },
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
    padding: 24,
    alignItems: 'center',
    gap: 8,
  },
  adTag: {
    fontFamily: F.bold,
    fontSize: 11,
    letterSpacing: 1.4,
    color: C.textFaint,
  },
  adEmoji: { fontSize: 44 },
  adTitle: { fontFamily: F.black, fontSize: 20, color: C.gold },
  adReward: { fontFamily: F.semi, fontSize: 13, color: C.text },
  adTimer: {
    width: 58,
    height: 58,
    borderRadius: 29,
    borderWidth: 3,
    borderColor: C.cane,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  adTimerText: { fontFamily: F.black, fontSize: 24, color: C.cane },
  adHint: { fontFamily: F.regular, fontSize: 12, color: C.textDim },
});
