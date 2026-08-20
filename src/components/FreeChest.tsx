import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';

import { fmt } from '../game/formulas';
import { useGame } from '../store/gameStore';
import { C, F, G, R, SHADOW } from '../theme';
import ChestOpening, { ChestLoot } from './ChestOpening';
import { Button, Card, SectionTitle } from './ui';
import { useT } from '../i18n/useT';

/** {t('chest.free')} toutes les 4 h : la raison de rouvrir l'app entre deux quêtes. */
export default function FreeChest() {
  const t = useT();
  const chestNextAt = useGame((s) => s.chestNextAt);
  const openFreeChest = useGame((s) => s.openFreeChest);
  const [now, setNow] = useState(Date.now());
  const [loot, setLoot] = useState<ChestLoot | null>(null);
  const shake = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const ready = now >= chestNextAt;

  useEffect(() => {
    if (!ready) return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(shake, {
          toValue: 1,
          duration: 140,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(shake, {
          toValue: -1,
          duration: 140,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.timing(shake, {
          toValue: 0,
          duration: 140,
          easing: Easing.linear,
          useNativeDriver: true,
        }),
        Animated.delay(2200),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [ready, shake]);

  const remaining = Math.max(0, chestNextAt - now);

  return (
    <Card glow={ready ? C.gold : undefined}>
      <SectionTitle icon="🧧">{t('chest.free')}</SectionTitle>
      <View style={styles.row}>
        <Animated.View
          style={{
            transform: [
              {
                rotate: shake.interpolate({
                  inputRange: [-1, 1],
                  outputRange: ['-9deg', '9deg'],
                }),
              },
            ],
          }}
        >
          <LinearGradient
            colors={ready ? G.gold : G.slate}
            style={[styles.chest, ready ? SHADOW.glowGold : null]}
          >
            <Text style={{ fontSize: 31 }}>{ready ? '🧰' : '⏳'}</Text>
          </LinearGradient>
        </Animated.View>

        <View style={{ flex: 1, gap: 4 }}>
          <Text style={styles.title}>
            {ready ? t('chest.ready') : t('chest.brewing')}
          </Text>
          <Text style={styles.sub}>
            {ready
              ? t('chest.contents')
              : t('chest.availableIn', { t: formatLong(remaining) })}
          </Text>

        </View>

        <Button
          size="sm"
          variant={ready ? 'gold' : 'slate'}
          label={ready ? 'Ouvrir' : '…'}
          disabled={!ready}
          onPress={() => {
            const r = openFreeChest();
            if (r) setLoot(r);
          }}
        />
      </View>

      <ChestOpening loot={loot} onClose={() => setLoot(null)} />
    </Card>
  );
}

function formatLong(ms: number): string {
  const s = Math.ceil(ms / 1000);
  const h = Math.floor(s / 3600);
  const m = Math.floor((s % 3600) / 60);
  if (h > 0) return `${h} h ${String(m).padStart(2, '0')}`;
  if (m > 0) return `${m} min ${String(s % 60).padStart(2, '0')}`;
  return `${s} s`;
}

const styles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  chest: {
    width: 58,
    height: 58,
    borderRadius: R.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.3)',
  },
  title: { fontFamily: F.black, fontSize: 15, lineHeight: 20, color: C.text },
  sub: { fontFamily: F.regular, fontSize: 13, lineHeight: 17, color: C.textDim },
});
