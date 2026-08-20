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
  // Tous les hooks avant le moindre retour : `currentStep` renvoie null dès
  // qu'une étape est franchie, et sortir plus tôt qu'au rendu précédent fait
  // compter moins de hooks à React — « Rendered fewer hooks than expected ».
  const t = useT();

  if (!player) return null;
  const step = currentStep({ player, stats, foundMitik, dungeonFloor, claimedSteps });
  if (!step) return null;

  const done = claimedSteps.length;
  const total = STEPS.length;

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
          <Text style={{ fontSize: 17 }}>{step.def.icon}</Text>
        </View>

        {/* Deux lignes au lieu de trois : le bandeau s'affiche sur *tous* les
            écrans, chaque ligne qu'il prend est prise à l'écran lui-même. Le
            compteur passe en pastille plutôt qu'en ligne à part. */}
        <View style={{ flex: 1, gap: 1 }}>
          <View style={styles.titleRow}>
            <Text style={styles.title} numberOfLines={1}>
              {t(step.def.titleKey)}
            </Text>
            <View style={styles.count}>
              <Text style={styles.countText}>
                {done}/{total}
              </Text>
            </View>
          </View>
          <Text style={styles.hint} numberOfLines={1}>
            {step.ready
              ? `🎁 ${step.def.grains > 0 ? `🌽${step.def.grains}` : ''} ${
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
    gap: 8,
    marginHorizontal: 12,
    marginTop: 8,
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderRadius: R.lg,
    borderWidth: 1,
  },
  icon: {
    width: 32,
    height: 32,
    borderRadius: R.sm,
    borderWidth: 1,
    borderColor: C.hairline,
    backgroundColor: 'rgba(6,3,12,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  count: {
    borderRadius: R.pill,
    borderWidth: 1,
    borderColor: C.hairline,
    backgroundColor: 'rgba(6,3,12,0.5)',
    paddingHorizontal: 8,
    paddingVertical: 1,
  },
  countText: {
    fontFamily: F.black,
    fontSize: 11,
    lineHeight: 15,
    color: C.textDim,
    includeFontPadding: false,
  },
  title: { fontFamily: F.black, fontSize: 15, lineHeight: 20, color: C.text, flex: 1 },
  hint: { fontFamily: F.regular, fontSize: 12, color: C.textDim, lineHeight: 17 },
  cta: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ctaText: { fontFamily: F.black, fontSize: 17, color: C.ink, marginTop: -2 },
});
