import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { STEPS, TabId } from '../game/progress';
import { currentStep, useGame } from '../store/gameStore';
import { C, F, G, R, SHADOW } from '../theme';
import { useT } from '../i18n/useT';

/**
 * Le fil rouge du joueur : une seule prochaine action, toujours visible, qui
 * l'emmène au bon endroit. Disparaît quand le chemin est terminé.
 */
export default function StepBanner({ onGo }: { onGo: (tab: TabId) => void }) {
  const player = useGame((s) => s.player);
  const stats = useGame((s) => s.stats);
  const foundMitik = useGame((s) => s.foundMitik);
  const claimedSteps = useGame((s) => s.claimedSteps);
  const dungeonFloor = useGame((s) => s.dungeonFloor);
  const claimStep = useGame((s) => s.claimStep);

  if (!player) return null;
  const step = currentStep({ player, stats, foundMitik, dungeonFloor, claimedSteps });
  if (!step) return null;

  const done = claimedSteps.length;
  const total = STEPS.length;
  const t = useT();

  return (
    <Pressable
      onPress={() => (step.ready ? claimStep(step.def.id) : onGo(step.def.tab))}
      style={({ pressed }) => [pressed ? { opacity: 0.85 } : null]}
    >
      <LinearGradient
        colors={
          step.ready
            ? ['rgba(59,217,126,0.28)', 'rgba(59,217,126,0.08)']
            : ['rgba(255,201,60,0.20)', 'rgba(255,90,31,0.06)']
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.wrap,
          { borderColor: step.ready ? C.cane : 'rgba(255,201,60,0.35)' },
          SHADOW.card,
        ]}
      >
        <View style={[styles.icon, step.ready && { borderColor: C.cane }]}>
          <Text style={{ fontSize: 19 }}>{step.def.icon}</Text>
        </View>

        <View style={{ flex: 1, gap: 2 }}>
          <Text style={styles.kicker}>
            CHEMIN DU TI KOK · {done}/{total}
          </Text>
          <Text style={styles.title} numberOfLines={1}>
            {t(step.def.titleKey)}
          </Text>
          <Text style={styles.hint} numberOfLines={2}>
            {step.ready
              ? `Bravo ! Récupère ${step.def.grains > 0 ? `🌽${step.def.grains}` : ''} ${
                  step.def.piments > 0 ? `🌶️${step.def.piments}` : ''
                }`
              : t(step.def.hintKey)}
          </Text>
        </View>

        <LinearGradient
          colors={step.ready ? G.cane : G.gold}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={styles.cta}
        >
          <Text style={styles.ctaText}>{step.ready ? '🎁' : '›'}</Text>
        </LinearGradient>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginHorizontal: 12,
    marginTop: 8,
    padding: 10,
    borderRadius: R.lg,
    borderWidth: 1,
  },
  icon: {
    width: 40,
    height: 40,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: C.hairline,
    backgroundColor: 'rgba(6,3,12,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  kicker: {
    fontFamily: F.black,
    fontSize: 10,
    lineHeight: 14,
    letterSpacing: 1,
    color: C.textDim,
  },
  title: { fontFamily: F.black, fontSize: 16, lineHeight: 21, color: C.text },
  hint: { fontFamily: F.regular, fontSize: 12.5, color: C.textDim, lineHeight: 17 },
  cta: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: { fontFamily: F.black, fontSize: 18, color: C.ink, marginTop: -2 },
});
