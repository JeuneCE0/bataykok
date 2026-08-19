import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { formatUntil, nextDailyReset } from '../game/day';
import { DEAL_DISCOUNT, dealIndex, dealPrice } from '../game/shop';
import { fmt } from '../game/formulas';
import { RARITY_COLORS, RARITY_LABELS, itemLabel, itemStats } from '../game/items';
import { compareToEquipped } from '../game/power';
import { Item } from '../game/types';
import { useT } from '../i18n/useT';
import { useGame } from '../store/gameStore';
import { C, F, R, SHADOW } from '../theme';
import { VerdictBadge } from './ItemCompare';
import { Button } from './ui';


export default function DailyDeal({
  onBuy,
}: {
  onBuy: (item: Item, price: number) => void;
}) {
  const t = useT();
  const player = useGame((s) => s.player);
  const shop = useGame((s) => s.shop);
  const [now, setNow] = React.useState(Date.now());

  React.useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);

  if (!player || shop.length === 0) return null;
  // l'affaire tombe sur ce qui sert le plus au joueur, pas sur un tirage
  const idx = dealIndex(shop.map((x) => compareToEquipped(x, player).diff));
  const it = shop[idx];
  if (!it) return null;

  const plein = it.price;
  const remise = dealPrice(plein);
  const col = RARITY_COLORS[it.rarity];
  const cmp = compareToEquipped(it, player);

  return (
    <LinearGradient
      colors={['rgba(255,201,60,0.18)', 'rgba(255,90,31,0.10)']}
      style={[styles.card, { borderColor: `${col}88` }]}
    >
      <View style={styles.head}>
        <View style={styles.badge}>
          <Text style={styles.badgeText}>{t('deal.badge')}</Text>
        </View>
        <Text style={styles.timer} numberOfLines={1}>
          ⏳ {formatUntil(nextDailyReset() - now)}
        </Text>
      </View>

      <View style={styles.row}>
        <View style={{ flex: 1, gap: 4 }}>
          <Text style={[styles.name, { color: col }]} numberOfLines={2}>
            {itemLabel(it, t)}
          </Text>
          <Text style={styles.meta} numberOfLines={2}>
            {RARITY_LABELS[it.rarity]} · {t('common.level', { n: it.level })}
          </Text>
          <Text style={styles.stats} numberOfLines={2}>
            {itemStats(it)}
          </Text>
          <View style={styles.badges}>
            <VerdictBadge cmp={cmp} compact />
            <Text style={styles.scarce}>{t('deal.onlyOne')}</Text>
          </View>
        </View>

        <View style={styles.buyCol}>
          <Text style={styles.strike}>🌽{fmt(plein)}</Text>
          <Button
            variant="gold"
            size="sm"
            label={`🌽${fmt(remise)}`}
            sub={t('deal.off', { n: Math.round(DEAL_DISCOUNT * 100) })}
            disabled={player.grains < remise || player.inventory.length >= 24}
            onPress={() => onBuy(it, remise)}
          />
        </View>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  card: {
    marginBottom: 12,
    padding: 13,
    borderRadius: R.lg,
    borderWidth: 1.5,
    gap: 10,
    ...SHADOW.card,
  },
  head: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  badge: {
    backgroundColor: C.gold,
    borderRadius: R.pill,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  badgeText: {
    fontFamily: F.black,
    fontSize: 10.5,
    lineHeight: 15,
    letterSpacing: 0.9,
    color: C.ink,
    includeFontPadding: false,
  },
  timer: { fontFamily: F.black, fontSize: 12.5, lineHeight: 17, color: C.gold },
  row: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  name: { fontFamily: F.black, fontSize: 15.5, lineHeight: 20, includeFontPadding: false },
  meta: { fontFamily: F.semi, fontSize: 12, lineHeight: 16, color: C.textDim },
  stats: { fontFamily: F.regular, fontSize: 12, lineHeight: 16, color: C.textFaint },
  badges: { flexDirection: 'row', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginTop: 2 },
  scarce: { fontFamily: F.black, fontSize: 10.5, lineHeight: 14, color: C.piment },
  buyCol: { alignItems: 'center', gap: 4 },
  strike: {
    fontFamily: F.semi,
    fontSize: 12,
    lineHeight: 16,
    color: C.textFaint,
    textDecorationLine: 'line-through',
  },
});
