import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { RANK_TIERS, honorFloor, nextTier, tierForHonor } from '../game/ranks';
import { useT } from '../i18n/useT';
import { useGame } from '../store/gameStore';
import { C, F, R } from '../theme';
import { Bar } from './ui';
import RankBadge from './RankBadge';

/**
 * Palier d'honneur du joueur.
 *
 * Le rang seul ne dit rien de rassurant : il bouge à chaque batay et ne se
 * garde pas. Le palier, lui, est acquis — c'est ce qu'on montre, avec le
 * plancher en toutes lettres, pour qu'une mauvaise série cesse d'être vécue
 * comme la perte de tout.
 */
export default function HonorTier() {
  const t = useT();
  const player = useGame((s) => s.player);
  if (!player) return null;

  const peak = player.honorPeak ?? player.honor;
  const tier = tierForHonor(player.honor);
  const next = nextTier(player.honor);
  const floor = honorFloor(peak);

  return (
    <View style={[styles.card, { borderColor: `${tier.color}55` }]}>
      <View style={styles.head}>
        <RankBadge tier={tier} index={RANK_TIERS.indexOf(tier)} size={46} />
        <View style={{ flex: 1 }}>
          <Text style={[styles.name, { color: tier.color }]} numberOfLines={1}>
            {t(tier.nameKey)}
          </Text>
          <Text style={styles.honor} numberOfLines={1}>
            🎖️ {player.honor}
          </Text>
        </View>
        {floor > 0 ? (
          <View style={[styles.floorPill, { borderColor: `${tier.color}77` }]}>
            <Text style={[styles.floorText, { color: tier.color }]} numberOfLines={1}>
              🛡️ {floor}
            </Text>
          </View>
        ) : null}
      </View>

      {next ? (
        <>
          <Bar
            value={player.honor - tier.floor}
            max={Math.max(1, next.floor - tier.floor)}
            variant="gold"
            height={9}
          />
          <Text style={styles.hint} numberOfLines={2}>
            {t('rank.next', { name: t(next.nameKey), n: next.floor })}
          </Text>
        </>
      ) : (
        <Text style={styles.hint}>{t('rank.top')}</Text>
      )}
      {floor > 0 ? (
        <Text style={styles.secured} numberOfLines={2}>
          {t('rank.secured', { n: floor })}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: 12,
    marginBottom: 8,
    padding: 12,
    gap: 8,
    borderRadius: R.lg,
    borderWidth: 1.5,
    backgroundColor: 'rgba(6,3,12,0.45)',
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  name: {
    fontFamily: F.black,
    fontSize: 15,
    lineHeight: 20,
    includeFontPadding: false,
  },
  honor: { fontFamily: F.bold, fontSize: 13, lineHeight: 17, color: C.textDim },
  floorPill: {
    borderWidth: 1.5,
    borderRadius: R.pill,
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(6,3,12,0.6)',
  },
  floorText: { fontFamily: F.black, fontSize: 12, lineHeight: 16, includeFontPadding: false },
  hint: {
    fontFamily: F.semi,
    fontSize: 12,
    lineHeight: 16,
    color: C.textDim,
    textAlign: 'center',
  },
  secured: {
    fontFamily: F.regular,
    fontSize: 11,
    lineHeight: 15,
    color: C.textFaint,
    textAlign: 'center',
  },
});
