import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ATTR_LABELS } from '../game/classes';
import { fmt } from '../game/formulas';
import { RARITY_COLORS, RARITY_LABELS } from '../game/items';
import { expectedRarity } from '../game/reference';
import { SETS, SetDef, SET_THRESHOLDS } from '../game/sets';
import { useT } from '../i18n/useT';
import { play } from '../lib/sound';
import { useGame } from '../store/gameStore';
import { C, F, R, SHADOW } from '../theme';
import Rooster from './Rooster';
import { Button, Card, SectionTitle } from './ui';

/**
 * Panoplies toutes faites.
 *
 * Assembler une panoplie pièce par pièce demande une chance déraisonnable : un
 * objet sur cinq appartient à un set, et il en faut quatre du même. Les vendre
 * complètes donne un objectif atteignable à la dépense — et le look assorti
 * rend l'achat visible, ce que huit pièces de statistiques ne font pas.
 */
export default function SetKits() {
  const t = useT();
  const player = useGame((s) => s.player);
  const setKitPrice = useGame((s) => s.setKitPrice);
  const [preview, setPreview] = useState<SetDef | null>(null);
  if (!player) return null;

  const gamme = expectedRarity(player.level);

  return (
    <>
      <Card>
        <SectionTitle icon="🎽">{t('setkit.title')}</SectionTitle>
        <Text style={styles.sub}>{t('setkit.sub')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
          <View style={styles.row}>
            {SETS.map((def) => {
              const price = setKitPrice(def.id);
              return (
                <Pressable
                  key={def.id}
                  onPress={() => {
                    play('tap', 0.6);
                    setPreview(def);
                  }}
                  style={({ pressed }) => [
                    styles.kit,
                    { borderColor: def.color },
                    pressed && { opacity: 0.75 },
                  ]}
                >
                  <Text style={{ fontSize: 31 }}>{def.icon}</Text>
                  <Text style={[styles.kitName, { color: def.color }]} numberOfLines={2}>
                    {def.name}
                  </Text>
                  <Text style={styles.kitPrice} numberOfLines={1}>
                    🌽 {fmt(price)}
                  </Text>
                </Pressable>
              );
            })}
          </View>
        </ScrollView>
      </Card>

      <PreviewModal def={preview} gamme={gamme} onClose={() => setPreview(null)} />
    </>
  );
}

function PreviewModal({
  def,
  gamme,
  onClose,
}: {
  def: SetDef | null;
  gamme: ReturnType<typeof expectedRarity>;
  onClose: () => void;
}) {
  const t = useT();
  const player = useGame((s) => s.player);
  const buySetKit = useGame((s) => s.buySetKit);
  const setKitPrice = useGame((s) => s.setKitPrice);

  if (!def || !player)
    return <Modal visible={false} transparent animationType="fade" />;

  const price = setKitPrice(def.id);
  const bonus2 = Math.round(def.perLevel * (player.level + 2));
  const bonus4 = bonus2 * 2;

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.root}>
        <LinearGradient colors={['#2A1A3D', '#0B0714']} style={styles.card}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={[styles.title, { color: def.color }]}>
              {def.icon} {def.name}
            </Text>
            <View style={styles.stage}>
              {/* le coq porte déjà le look : on achète ce qu'on voit */}
              <Rooster
                appearance={{ ...player.appearance, ...def.look }}
                size={168}
                alive
                aura={RARITY_COLORS[gamme]}
              />
            </View>

            <View style={styles.pills}>
              <View style={[styles.pill, { borderColor: RARITY_COLORS[gamme] }]}>
                <Text style={[styles.pillText, { color: RARITY_COLORS[gamme] }]}>
                  8 × {RARITY_LABELS[gamme]}
                </Text>
              </View>
              <View style={[styles.pill, { borderColor: def.color }]}>
                <Text style={[styles.pillText, { color: def.color }]}>{t('setkit.lookIncluded')}</Text>
              </View>
            </View>

            <View style={styles.bonusBox}>
              <Text style={styles.bonusLine}>
                {SET_THRESHOLDS[0]} pièces → +{bonus2} {ATTR_LABELS[def.attr]}
              </Text>
              <Text style={[styles.bonusLine, { color: C.gold }]}>
                {SET_THRESHOLDS[1]} pièces → +{bonus4} {ATTR_LABELS[def.attr]}
              </Text>
            </View>
            <Text style={styles.warn}>{t('setkit.replaces')}</Text>
          </ScrollView>

          <Button
            full
            size="lg"
            label={t('common.buy')}
            sub={`🌽 ${fmt(price)}`}
            disabled={player.grains < price}
            onPress={() => {
              if (buySetKit(def.id)) {
                play('coin', 0.9);
                onClose();
              }
            }}
            style={{ marginTop: 8 }}
          />
          <Button full variant="slate" label={t('common.close')} onPress={onClose} style={{ marginTop: 8 }} />
        </LinearGradient>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  sub: { fontFamily: F.regular, fontSize: 12, lineHeight: 16, color: C.textDim, marginTop: 2 },
  row: { flexDirection: 'row', gap: 8, paddingRight: 4 },
  kit: {
    width: 104,
    alignItems: 'center',
    gap: 4,
    paddingVertical: 12,
    paddingHorizontal: 8,
    borderRadius: R.lg,
    borderWidth: 1.5,
    backgroundColor: 'rgba(6,3,12,0.5)',
    ...SHADOW.card,
  },
  kitName: {
    fontFamily: F.black,
    fontSize: 12,
    lineHeight: 16,
    textAlign: 'center',
    includeFontPadding: false,
  },
  kitPrice: { fontFamily: F.bold, fontSize: 12, lineHeight: 16, color: C.gold },
  root: {
    flex: 1,
    backgroundColor: 'rgba(4,2,8,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    width: '100%',
    maxHeight: '88%',
    borderRadius: R.xl,
    borderWidth: 1,
    borderColor: C.hairline,
    padding: 16,
    ...SHADOW.float,
  },
  title: {
    fontFamily: F.black,
    fontSize: 20,
    lineHeight: 26,
    textAlign: 'center',
  },
  stage: { alignItems: 'center', paddingVertical: 4 },
  pills: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginTop: 4 },
  pill: {
    borderWidth: 1.5,
    borderRadius: R.pill,
    paddingHorizontal: 12,
    paddingVertical: 4,
    backgroundColor: 'rgba(6,3,12,0.5)',
  },
  pillText: { fontFamily: F.black, fontSize: 12, lineHeight: 16, includeFontPadding: false },
  bonusBox: {
    marginTop: 12,
    padding: 12,
    borderRadius: R.md,
    backgroundColor: 'rgba(6,3,12,0.5)',
    borderWidth: 1,
    borderColor: C.hairlineSoft,
    gap: 4,
  },
  bonusLine: {
    fontFamily: F.bold,
    fontSize: 13,
    lineHeight: 17,
    color: C.text,
    textAlign: 'center',
  },
  warn: {
    fontFamily: F.regular,
    fontSize: 12,
    lineHeight: 16,
    color: C.textFaint,
    textAlign: 'center',
    marginTop: 8,
  },
});
