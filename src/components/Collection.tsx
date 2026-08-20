import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  ALBUM_RARITIES,
  ALBUM_SIZE,
  ALBUM_SLOTS,
  albumKey,
  albumXpBonus,
} from '../game/album';
import { RARITY_COLORS, RARITY_LABELS } from '../game/items';
import { countSets, SETS, setBonusLabel, SET_THRESHOLDS } from '../game/sets';
import { useGame } from '../store/gameStore';
import { BW, C, F, R } from '../theme';
import { Bar, Card, Chip, SectionTitle } from './ui';
import { useT } from '../i18n/useT';
import ItemArt from './ItemArt';

/** {t('collection.album')} + panoplies : ce qu'on collectionne, et ce que ça rapporte. */
export default function Collection() {
  const t = useT();
  const player = useGame((s) => s.player);
  const album = useGame((s) => s.album);
  if (!player) return null;

  const owned = new Set(album);
  const counts = countSets(player.equipment);

  return (
    <>
      <Card>
        <SectionTitle icon="🧷">{t('collection.sets')}</SectionTitle>
        {SETS.map((def) => {
          const n = counts[def.id] ?? 0;
          const steps = SET_THRESHOLDS.filter((t) => n >= t).length;
          return (
            <View key={def.id} style={styles.setRow}>
              <Text style={{ fontSize: 20 }}>{def.icon}</Text>
              <View style={{ flex: 1, gap: 4 }}>
                <Text
                  style={[styles.setName, steps > 0 && { color: def.color }]}
                  numberOfLines={1}
                >
                  {def.name}
                </Text>
                <Bar
                  value={Math.min(n, 4)}
                  max={4}
                  variant={steps >= 2 ? 'gold' : steps === 1 ? 'cane' : 'slate'}
                  height={6}
                />
              </View>
              <View style={{ alignItems: 'flex-end', gap: 2 }}>
                <Text style={styles.setCount}>{n}/4</Text>
                {steps > 0 && (
                  <Text style={[styles.setBonus, { color: def.color }]}>
                    {setBonusLabel(def, player.level, steps)}
                  </Text>
                )}
              </View>
            </View>
          );
        })}
        <Text style={styles.hint}>{t('collection.sets.hint')}</Text>
      </Card>

      <Card>
        <View style={styles.albumHead}>
          <SectionTitle icon="📔">{t('collection.album')}</SectionTitle>
          <Chip
            label={`+${Math.round(albumXpBonus(album.length) * 100)} % XP`}
            color={C.mystic}
            active={album.length > 0}
          />
        </View>
        <Text style={styles.albumSub}>
          {t('collection.album.sub', { n: album.length, total: ALBUM_SIZE })}
        </Text>

        {/* Les cases se distinguaient par la couleur seule : la gamme se
            devinait, elle ne se lisait pas. */}
        <View style={styles.legend}>
          <View style={styles.gridIcon} />
          {ALBUM_RARITIES.map((r) => (
            <Text key={r} style={[styles.legendText, { color: RARITY_COLORS[r] }]}>
              {RARITY_LABELS[r].slice(0, 3)}
            </Text>
          ))}
        </View>

        <View style={styles.grid}>
          {ALBUM_SLOTS.map((slot) => (
            <View key={slot} style={styles.gridRow}>
              <View style={styles.gridIcon}>
                <ItemArt slot={slot} rarity="commun" size={20} />
              </View>
              {ALBUM_RARITIES.map((r) => {
                const has = owned.has(albumKey(slot, r));
                return (
                  <View
                    key={r}
                    style={[
                      styles.cell,
                      has
                        ? { borderColor: RARITY_COLORS[r], backgroundColor: `${RARITY_COLORS[r]}22` }
                        : null,
                    ]}
                  >
                    {/* Une case cochée montre la pièce dans le métal de sa
                        gamme : un ✓ ne dit pas ce qu'on a trouvé, et le Zalbum
                        est une collection — on doit voir ce qu'on collectionne. */}
                    {has ? (
                      <ItemArt slot={slot} rarity={r} size={22} />
                    ) : (
                      <Text style={styles.cellText}>·</Text>
                    )}
                  </View>
                );
              })}
            </View>
          ))}
        </View>
      </Card>
    </>
  );
}

const styles = StyleSheet.create({
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: C.hairlineSoft,
  },
  setName: { fontFamily: F.bold, fontSize: 13, lineHeight: 17, color: C.textDim },
  setCount: { fontFamily: F.black, fontSize: 13, lineHeight: 17, color: C.text },
  setBonus: { fontFamily: F.bold, fontSize: 11, lineHeight: 15 },
  hint: {
    fontFamily: F.regular,
    fontSize: 12,
    lineHeight: 16,
    color: C.textFaint,
    marginTop: 8,
  },
  albumHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  albumSub: {
    fontFamily: F.regular,
    fontSize: 12,
    lineHeight: 16,
    color: C.textDim,
    marginBottom: 8,
  },
  grid: { gap: 4 },
  gridRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  gridIcon: { width: 24, alignItems: 'center', justifyContent: 'center', opacity: 0.55 },
  legend: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 2 },
  legendText: {
    flex: 1,
    fontFamily: F.black,
    fontSize: 9,
    lineHeight: 12,
    letterSpacing: 0.6,
    textAlign: 'center',
    textTransform: 'uppercase',
    includeFontPadding: false,
  },
  cell: {
    flex: 1,
    // la case accueille désormais un dessin, pas une coche
    height: 32,
    borderRadius: R.sm,
    borderWidth: BW.thick,
    borderColor: 'rgba(6,3,12,0.7)',
    backgroundColor: 'rgba(6,3,12,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellText: { fontFamily: F.black, fontSize: 13, color: C.textFaint },
});
