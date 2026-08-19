import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import {
  ACCESSORIES,
  BODY_COLORS,
  COMB_COLORS,
  COSMETICS,
  CosmeticKind,
  FREE_COUNTS,
  TAIL_PALETTES,
  ownsValue,
} from '../game/cosmetics';
import { fmt } from '../game/formulas';
import { RARITY_COLORS, RARITY_LABELS } from '../game/items';
import { auraColor } from '../game/power';
import { Appearance } from '../game/types';
import { useT } from '../i18n/useT';
import { play } from '../lib/sound';
import { useGame } from '../store/gameStore';
import { C, F, R, SHADOW } from '../theme';
import Rooster from './Rooster';
import { Button, Card, ScreenTitle, SectionTitle } from './ui';

const KINDS: { kind: CosmeticKind; icon: string; key: 'cosmetic.body' | 'cosmetic.comb' | 'cosmetic.tail' | 'cosmetic.accessory' }[] = [
  { kind: 'body', icon: '🎨', key: 'cosmetic.body' },
  { kind: 'comb', icon: '👑', key: 'cosmetic.comb' },
  { kind: 'tail', icon: '🪶', key: 'cosmetic.tail' },
  { kind: 'accessory', icon: '🕶️', key: 'cosmetic.accessory' },
];

/**
 * Plumage & parures.
 *
 * Le coq reste affiché en haut pendant tout le parcours : un cosmétique qu'on
 * ne voit pas sur soi avant de payer ne se vend pas. Toucher une vignette
 * l'essaie immédiatement — l'achat n'est demandé qu'ensuite.
 */
export default function CosmeticsShop() {
  const t = useT();
  const player = useGame((s) => s.player);
  const buyCosmetic = useGame((s) => s.buyCosmetic);
  const setAppearance = useGame((s) => s.setAppearance);
  const [tryOn, setTryOn] = useState<Partial<Appearance> | null>(null);
  if (!player) return null;

  const shown: Appearance = { ...player.appearance, ...(tryOn ?? {}) };
  const owned = player.cosmetics ?? [];

  /** Le cosmétique correspondant à une valeur, s'il est payant. */
  const defFor = (kind: CosmeticKind, value: string | number) =>
    COSMETICS.find((c) => c.kind === kind && c.value === value) ?? null;

  const apply = (kind: CosmeticKind, value: string | number) => {
    const field =
      kind === 'body' ? 'bodyColor' : kind === 'comb' ? 'combColor' : kind === 'tail' ? 'tailPalette' : 'accessory';
    const patch = { [field]: value } as Partial<Appearance>;
    play('tap', 0.6);
    if (ownsValue(kind, value, owned)) {
      setAppearance(patch);
      setTryOn(null);
    } else {
      // essayage : on montre avant de demander de payer
      setTryOn(patch);
    }
  };

  const pending = tryOn
    ? (() => {
        for (const { kind } of KINDS) {
          const field =
            kind === 'body' ? 'bodyColor' : kind === 'comb' ? 'combColor' : kind === 'tail' ? 'tailPalette' : 'accessory';
          const v = (tryOn as Record<string, string | number>)[field];
          if (v !== undefined) return defFor(kind, v);
        }
        return null;
      })()
    : null;

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <ScreenTitle title={t('cosmetic.shopTitle')} sub={t('cosmetic.shopSub')} accent={C.mystic} />

      <Card>
        <View style={styles.stage}>
          <Rooster appearance={shown} size={170} alive aura={auraColor(player)} />
        </View>
        {pending ? (
          <View style={styles.buyRow}>
            <View style={{ flex: 1 }}>
              <Text style={styles.pendingName}>{t(pending.nameKey)}</Text>
              <Text style={[styles.pendingRarity, { color: RARITY_COLORS[pending.rarity] }]}>
                {RARITY_LABELS[pending.rarity]}
              </Text>
            </View>
            <Button
              variant={pending.piments ? 'piment' : 'gold'}
              label={t('common.buy')}
              sub={pending.piments ? `🌶️ ${pending.piments}` : `🌽 ${fmt(pending.grains ?? 0)}`}
              disabled={
                (pending.grains ?? 0) > player.grains || (pending.piments ?? 0) > player.piments
              }
              onPress={() => {
                if (buyCosmetic(pending.id)) {
                  play('coin', 0.8);
                  setAppearance(tryOn!);
                  setTryOn(null);
                }
              }}
            />
          </View>
        ) : (
          <Text style={styles.hint}>{t('cosmetic.shopSub')}</Text>
        )}
      </Card>

      {KINDS.map(({ kind, icon, key }) => {
        const values: (string | number)[] =
          kind === 'body'
            ? BODY_COLORS
            : kind === 'comb'
              ? COMB_COLORS
              : kind === 'tail'
                ? TAIL_PALETTES.map((_, i) => i)
                : ACCESSORIES.map((_, i) => i);
        const current =
          kind === 'body'
            ? shown.bodyColor
            : kind === 'comb'
              ? shown.combColor
              : kind === 'tail'
                ? shown.tailPalette
                : shown.accessory;
        return (
          <Card key={kind} compact>
            <SectionTitle icon={icon}>{t(key)}</SectionTitle>
            <View style={styles.grid}>
              {values.map((v, i) => {
                const has = ownsValue(kind, v, owned);
                const def = defFor(kind, v);
                const on = current === v;
                return (
                  <Pressable
                    key={`${kind}${i}`}
                    onPress={() => apply(kind, v)}
                    style={({ pressed }) => [
                      styles.tile,
                      on && { borderColor: C.gold, borderWidth: 2.5 },
                      !has && !on && { borderColor: def ? RARITY_COLORS[def.rarity] : C.hairlineSoft },
                      pressed && { opacity: 0.7 },
                    ]}
                  >
                    <Swatch kind={kind} value={v} />
                    {!has && (
                      <View style={styles.priceTag}>
                        <Text style={styles.priceText} numberOfLines={1}>
                          {def?.piments ? `🌶️${def.piments}` : `🌽${fmt(def?.grains ?? 0)}`}
                        </Text>
                      </View>
                    )}
                    {on && <Text style={styles.tick}>✓</Text>}
                  </Pressable>
                );
              })}
            </View>
          </Card>
        );
      })}
    </ScrollView>
  );
}

function Swatch({ kind, value }: { kind: CosmeticKind; value: string | number }) {
  if (kind === 'body' || kind === 'comb') {
    return <View style={[styles.color, { backgroundColor: value as string }]} />;
  }
  if (kind === 'tail') {
    const pal = TAIL_PALETTES[value as number];
    return (
      <View style={styles.color}>
        {pal.map((c, i) => (
          <View key={i} style={{ flex: 1, backgroundColor: c }} />
        ))}
      </View>
    );
  }
  const ICONS = ['🚫', '🎗️', '🕶️', '👒', '📿', '👑', '⛑️', '🌺', '🥽'];
  return <Text style={{ fontSize: 26 }}>{ICONS[value as number] ?? '❔'}</Text>;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 14, paddingBottom: 40 },
  stage: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 6,
  },
  buyRow: { flexDirection: 'row', alignItems: 'center', gap: 12, marginTop: 8 },
  pendingName: { fontFamily: F.black, fontSize: 16, lineHeight: 21, color: C.text },
  pendingRarity: { fontFamily: F.bold, fontSize: 12.5, lineHeight: 17 },
  hint: {
    fontFamily: F.regular,
    fontSize: 12.5,
    lineHeight: 17,
    color: C.textFaint,
    textAlign: 'center',
    marginTop: 6,
  },
  grid: { flexDirection: 'row', flexWrap: 'wrap', gap: 9, marginTop: 4 },
  tile: {
    width: 62,
    height: 62,
    borderRadius: R.md,
    borderWidth: 1.5,
    borderColor: C.hairlineSoft,
    backgroundColor: 'rgba(6,3,12,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...SHADOW.card,
  },
  color: { width: 38, height: 38, borderRadius: 19, overflow: 'hidden' },
  priceTag: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 0,
    paddingVertical: 2,
    backgroundColor: 'rgba(6,3,12,0.88)',
  },
  priceText: {
    fontFamily: F.black,
    fontSize: 9.5,
    lineHeight: 13,
    color: C.gold,
    textAlign: 'center',
  },
  tick: { position: 'absolute', top: 2, right: 5, color: C.gold, fontSize: 12 },
});
