import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Modal, ScrollView, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

import { ATTR_ICONS, ATTR_LABELS } from '../game/classes';
import { fmt, SLOT_LABELS } from '../game/formulas';
import { RARITY_COLORS, RARITY_LABELS, itemLabel, resaleValue } from '../game/items';
import { ItemComparison } from '../game/power';
import { SET_BY_ID } from '../game/sets';
import { UNIQUE_BY_ID } from '../game/uniques';
import { AttrId, Item } from '../game/types';
import { TransKey } from '../i18n';
import { useT } from '../i18n/useT';
import { BW, C, F, OUTLINE, R, SHADOW, SP, TEXT_OUTLINE } from '../theme';
import ItemArt from './ItemArt';
import {Button } from './ui';
import CloseButton from './CloseButton';

/**
 * Fiche d'un objet, en grand.
 *
 * La tuile dit l'essentiel ; la fiche dit tout — chaque attribut ligne par
 * ligne, l'écart avec la pièce portée, la valeur de revente. Sans elle, un
 * joueur devait deviner ce que « Force +6 · Armure +12 » valait par rapport à
 * ce qu'il avait déjà sur le dos.
 */
export default function ItemDetail({
  item,
  cmp,
  onClose,
  primaryLabel,
  onPrimary,
  primaryDisabled,
  primaryVariant = 'gold',
  onSell,
  price,
}: {
  item: Item | null;
  cmp?: ItemComparison;
  onClose: () => void;
  primaryLabel?: string;
  onPrimary?: () => void;
  primaryDisabled?: boolean;
  primaryVariant?: 'gold' | 'cane' | 'piment' | 'slate';
  /** proposé seulement pour une pièce déjà dans le sak */
  onSell?: () => void;
  /** prix d'achat ; absent pour une pièce possédée */
  price?: number;
}) {
  const t = useT();
  if (!item) return <Modal visible={false} transparent animationType="fade" />;

  const col = RARITY_COLORS[item.rarity];
  const set = item.setId ? SET_BY_ID[item.setId] : null;
  const unique = item.uniqueId ? UNIQUE_BY_ID[item.uniqueId] : null;
  const attrs = Object.keys(item.bonuses) as AttrId[];

  return (
    <Modal visible transparent animationType="fade" onRequestClose={onClose}>
      <View style={styles.root}>
        <LinearGradient colors={[`${col}40`, '#140C20']} style={[styles.card, { borderColor: col }]}>
          <CloseButton onPress={onClose} />
          <ScrollView showsVerticalScrollIndicator={false}>
            <Text style={styles.name}>{itemLabel(item, t)}</Text>
            <Text style={[styles.rarity, { color: col }]}>
              {RARITY_LABELS[item.rarity]} · {t('common.level', { n: item.level })}
            </Text>

            <View style={styles.stage}>
              <Svg width={190} height={190} style={StyleSheet.absoluteFill}>
                <Defs>
                  <RadialGradient id="d" cx="50%" cy="50%" r="50%">
                    <Stop offset="0" stopColor={col} stopOpacity={0.5} />
                    <Stop offset="1" stopColor={col} stopOpacity={0} />
                  </RadialGradient>
                </Defs>
                <Circle cx={95} cy={95} r={95} fill="url(#d)" />
              </Svg>
              <ItemArt slot={item.slot} rarity={item.rarity} size={110} />
              <View style={[styles.pedestal, { backgroundColor: col }]} />
            </View>

            {unique ? (
              <Text style={styles.lore}>« {t(`unique.${unique.id}.lore` as TransKey)} »</Text>
            ) : null}

            <Section title={t('item.stats')} />
            <Line label={t('item.slot')} value={SLOT_LABELS[item.slot]} />
            {item.dmgMin ? (
              <Line
                label={`🗡️  ${t('profile.damage')}`}
                value={`${item.dmgMin}–${item.dmgMax}`}
                fort
              />
            ) : null}
            {item.armor ? (
              <Line label={`🛡️  ${t('profile.armor')}`} value={`+${item.armor}`} fort />
            ) : null}
            {attrs.map((k) => (
              <Line
                key={k}
                label={`${ATTR_ICONS[k]}  ${ATTR_LABELS[k]}`}
                value={`+${item.bonuses[k]}`}
                fort
              />
            ))}

            {set ? (
              <>
                <Section title={t('item.setPiece')} />
                <Line label={`${set.icon}  ${set.name}`} value={ATTR_LABELS[set.attr]} />
              </>
            ) : null}

            {cmp && cmp.deltas.length > 0 ? (
              <>
                <Section title={t('item.vsEquipped')} />
                {cmp.deltas.map((d) => (
                  <Line
                    key={d.label}
                    label={d.label}
                    value={`${d.delta > 0 ? '▲ +' : '▼ '}${d.delta}`}
                    couleur={d.delta > 0 ? C.cane : C.piment}
                  />
                ))}
              </>
            ) : null}

            <View style={styles.pills}>
              {price !== undefined ? (
                <View style={styles.pill}>
                  <Text style={styles.pillLabel}>{t('common.buy')}</Text>
                  <Text style={styles.pillValue}>🌽 {fmt(price)}</Text>
                </View>
              ) : null}
              <View style={styles.pill}>
                <Text style={styles.pillLabel}>{t('item.resale')}</Text>
                <Text style={styles.pillValue}>🌽 {fmt(resaleValue(item))}</Text>
              </View>
            </View>
          </ScrollView>

          {primaryLabel ? (
            <Button
              full
              size="lg"
              variant={primaryVariant}
              label={primaryLabel}
              disabled={primaryDisabled}
              onPress={onPrimary ?? (() => {})}
              style={{ marginTop: SP.md }}
            />
          ) : null}
          {onSell ? (
            <Button
              full
              variant="slate"
              label={`${t('common.sell')} · 🌽${fmt(resaleValue(item))}`}
              onPress={onSell}
              style={{ marginTop: SP.sm }}
            />
          ) : null}

        </LinearGradient>
      </View>
    </Modal>
  );
}

function Section({ title }: { title: string }) {
  return <Text style={styles.section}>{title}</Text>;
}

function Line({
  label,
  value,
  fort,
  couleur,
}: {
  label: string;
  value: string;
  fort?: boolean;
  couleur?: string;
}) {
  return (
    <View style={styles.line}>
      <Text style={styles.lineLabel} numberOfLines={1}>
        {label}
      </Text>
      <Text
        style={[styles.lineValue, fort && { color: C.text }, couleur ? { color: couleur } : null]}
      >
        {value}
      </Text>
    </View>
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
    width: '100%',
    maxHeight: '90%',
    // le dégradé du haut porte une alpha : sans fond opaque dessous, l'écran
    // transparaissait à travers la fiche
    backgroundColor: '#140C20',
    borderRadius: R.xl,
    borderWidth: BW.thick,
    padding: 16,
    ...SHADOW.float,
  },
  name: {
    fontFamily: F.black,
    fontSize: 20,
    lineHeight: 26,
    color: C.text,
    textAlign: 'center',
    ...TEXT_OUTLINE,
  },
  rarity: {
    fontFamily: F.black,
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
    textAlign: 'center',
    marginTop: 2,
  },
  stage: { height: 190, alignItems: 'center', justifyContent: 'center', marginVertical: 4 },
  pedestal: {
    position: 'absolute',
    bottom: 28,
    width: 96,
    height: 8,
    borderRadius: 4,
    opacity: 0.4,
  },
  lore: {
    fontFamily: F.regular,
    fontStyle: 'italic',
    fontSize: 13,
    lineHeight: 17,
    color: C.textDim,
    textAlign: 'center',
    marginBottom: 8,
  },
  section: {
    fontFamily: F.black,
    fontSize: 11,
    lineHeight: 15,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: C.textFaint,
    marginTop: 12,
    marginBottom: 4,
  },
  line: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: C.hairlineSoft,
    gap: 12,
  },
  lineLabel: { fontFamily: F.semi, fontSize: 13, lineHeight: 17, color: C.textDim, flex: 1 },
  lineValue: { fontFamily: F.black, fontSize: 15, lineHeight: 20, color: C.textDim },
  pills: { flexDirection: 'row', gap: 8, marginTop: 12 },
  pill: {
    flex: 1,
    alignItems: 'center',
    borderRadius: R.md,
    borderWidth: BW.thick,
    borderColor: OUTLINE,
    borderTopColor: 'rgba(0,0,0,0.85)',
    backgroundColor: C.well,
    paddingVertical: 8,
  },
  pillLabel: {
    fontFamily: F.black,
    fontSize: 11,
    lineHeight: 15,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    color: C.textFaint,
  },
  pillValue: { fontFamily: F.black, fontSize: 17, lineHeight: 22, color: C.gold, ...TEXT_OUTLINE },
});
