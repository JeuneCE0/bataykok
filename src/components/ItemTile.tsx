import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

import { fmt, SLOT_ICONS } from '../game/formulas';
import { RARITY_COLORS, RARITY_LABELS, itemLabel, itemStats } from '../game/items';
import { ItemComparison } from '../game/power';
import { SET_BY_ID } from '../game/sets';
import { Item } from '../game/types';
import { useT } from '../i18n/useT';
import { BW, C, F, OUTLINE, R, SHADOW, SP, TEXT_OUTLINE } from '../theme';
import { VerdictBadge } from './ItemCompare';
import { Button } from './ui';

/**
 * Tuile d'objet.
 *
 * Les objets s'affichaient en lignes : une petite icône, du texte, un bouton —
 * lisible, mais sans présence. Un objet doit se voir comme un objet. D'où
 * l'anatomie retenue : le nom en haut, la pièce **grande et centrée sur un
 * éclat de sa gamme**, un socle qui la pose, et le prix en gros chiffre dans
 * une pastille enfoncée. Le badge de niveau chevauche le bord — c'est ce qui
 * empêche la tuile de ressembler à une case de tableau.
 */
export default function ItemTile({
  item,
  cmp,
  price,
  strikePrice,
  actionLabel,
  actionVariant = 'gold',
  onAction,
  onPress,
  disabled,
  badge,
  width,
}: {
  item: Item;
  cmp?: ItemComparison;
  /** prix affiché ; omis pour une pièce déjà possédée */
  price?: number;
  /** ancien prix barré (promotion) */
  strikePrice?: number;
  actionLabel?: string;
  actionVariant?: 'gold' | 'cane' | 'piment' | 'slate';
  onAction?: () => void;
  onPress?: () => void;
  disabled?: boolean;
  /** pastille en haut à droite — stock, gamme, quantité… */
  badge?: string;
  width?: number | string;
}) {
  const t = useT();
  const col = RARITY_COLORS[item.rarity];
  const set = item.setId ? SET_BY_ID[item.setId] : null;

  return (
    <View style={[styles.wrap, width !== undefined ? { width: width as number } : null]}>
      <Pressable onPress={onPress} disabled={!onPress}>
        <LinearGradient
          colors={[`${col}26`, 'rgba(12,7,20,0.92)']}
          start={{ x: 0.5, y: 0 }}
          end={{ x: 0.5, y: 1 }}
          style={[styles.tile, { borderColor: col }]}
        >
          <Text style={styles.name} numberOfLines={2}>
            {itemLabel(item, t)}
          </Text>
          <Text style={[styles.rarity, { color: col }]} numberOfLines={1}>
            {RARITY_LABELS[item.rarity]}
          </Text>

          {/* l'éclat derrière la pièce : c'est lui qui la fait exister */}
          <View style={styles.stage}>
            <Svg width={78} height={78} style={styles.burst}>
              <Defs>
                <RadialGradient id={`b${item.id}`} cx="50%" cy="50%" r="50%">
                  <Stop offset="0" stopColor={col} stopOpacity={0.55} />
                  <Stop offset="0.6" stopColor={col} stopOpacity={0.18} />
                  <Stop offset="1" stopColor={col} stopOpacity={0} />
                </RadialGradient>
              </Defs>
              <Circle cx={39} cy={39} r={39} fill={`url(#b${item.id})`} />
            </Svg>
            <Text style={styles.icon}>{SLOT_ICONS[item.slot]}</Text>
            <View style={[styles.pedestal, { backgroundColor: col }]} />
          </View>

          <Text style={styles.stats} numberOfLines={2}>
            {itemStats(item)}
          </Text>

          {set ? (
            <Text style={[styles.set, { color: set.color }]} numberOfLines={1}>
              {set.icon} {set.name}
            </Text>
          ) : null}

          {cmp ? (
            <View style={styles.verdict}>
              <VerdictBadge cmp={cmp} compact />
            </View>
          ) : null}

          {price !== undefined ? (
            <View style={styles.priceWell}>
              {strikePrice !== undefined ? (
                <Text style={styles.strike}>🌽{fmt(strikePrice)}</Text>
              ) : null}
              <Text style={styles.price}>🌽 {fmt(price)}</Text>
            </View>
          ) : null}

          {actionLabel ? (
            <Button
              full
              size="sm"
              variant={actionVariant}
              label={actionLabel}
              onPress={onAction ?? (() => {})}
              disabled={disabled}
              style={{ marginTop: SP.sm }}
            />
          ) : null}
        </LinearGradient>
      </Pressable>

      {badge ? (
        <View style={[styles.badge, { borderColor: col }]}>
          <Text style={styles.badgeText} numberOfLines={1}>
            {badge}
          </Text>
        </View>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: { flex: 1, ...SHADOW.card },
  tile: {
    flex: 1,
    borderRadius: R.lg,
    borderWidth: BW.thick,
    paddingHorizontal: SP.sm,
    paddingTop: SP.md,
    paddingBottom: SP.sm,
    alignItems: 'center',
    gap: SP.xs,
  },
  name: {
    fontFamily: F.black,
    fontSize: 13,
    lineHeight: 17,
    height: 34, // deux lignes, toujours — sinon les tuiles se décalent
    color: C.text,
    textAlign: 'center',
    includeFontPadding: false,
    ...TEXT_OUTLINE,
  },
  rarity: {
    fontFamily: F.black,
    fontSize: 11,
    lineHeight: 15,
    letterSpacing: 0.6,
    textTransform: 'uppercase',
    includeFontPadding: false,
  },
  stage: {
    height: 76,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: SP.xs,
  },
  burst: { position: 'absolute' },
  icon: { fontSize: 31, lineHeight: 41 },
  // le socle pose la pièce au lieu de la laisser flotter
  pedestal: {
    position: 'absolute',
    bottom: 4,
    width: 52,
    height: 6,
    borderRadius: 3,
    opacity: 0.45,
  },
  stats: {
    fontFamily: F.semi,
    fontSize: 11,
    lineHeight: 15,
    height: 30,
    color: C.textDim,
    textAlign: 'center',
  },
  set: { fontFamily: F.black, fontSize: 11, lineHeight: 15 },
  verdict: { marginTop: SP.xxs },
  // pastille enfoncée : le prix n'est pas actionnable, il ne doit pas ressortir
  priceWell: {
    marginTop: SP.sm,
    alignSelf: 'stretch',
    alignItems: 'center',
    borderRadius: R.md,
    borderWidth: BW.thick,
    borderColor: OUTLINE,
    borderTopColor: 'rgba(0,0,0,0.85)',
    backgroundColor: C.well,
    paddingVertical: SP.xs,
  },
  strike: {
    fontFamily: F.semi,
    fontSize: 11,
    lineHeight: 15,
    color: C.textFaint,
    textDecorationLine: 'line-through',
  },
  price: {
    fontFamily: F.black,
    fontSize: 17,
    lineHeight: 22,
    color: C.gold,
    includeFontPadding: false,
    ...TEXT_OUTLINE,
  },
  // le badge chevauche le bord : sans ça la tuile ressemble à une case de tableau
  badge: {
    position: 'absolute',
    top: -8,
    right: -4,
    borderRadius: R.pill,
    borderWidth: BW.thick,
    backgroundColor: '#160D22',
    paddingHorizontal: SP.sm,
    paddingVertical: 2,
  },
  badgeText: {
    fontFamily: F.black,
    fontSize: 11,
    lineHeight: 15,
    color: C.text,
    includeFontPadding: false,
  },
});
