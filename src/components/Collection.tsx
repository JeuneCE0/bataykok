import React from 'react';
import { StyleSheet, Text, View } from 'react-native';

import {
  ALBUM_RARITIES,
  ALBUM_SIZE,
  ALBUM_SLOTS,
  albumKey,
  albumXpBonus,
} from '../game/album';
import { SLOT_ICONS } from '../game/formulas';
import { RARITY_COLORS } from '../game/items';
import { countSets, SETS, setBonusLabel, SET_THRESHOLDS } from '../game/sets';
import { useGame } from '../store/gameStore';
import { C, F, R } from '../theme';
import { Bar, Card, Chip, SectionTitle } from './ui';

/** Zalbum + panoplies : ce qu'on collectionne, et ce que ça rapporte. */
export default function Collection() {
  const player = useGame((s) => s.player);
  const album = useGame((s) => s.album);
  if (!player) return null;

  const owned = new Set(album);
  const counts = countSets(player.equipment);

  return (
    <>
      <Card>
        <SectionTitle icon="🧷">Panoplies</SectionTitle>
        {SETS.map((def) => {
          const n = counts[def.id] ?? 0;
          const steps = SET_THRESHOLDS.filter((t) => n >= t).length;
          return (
            <View key={def.id} style={styles.setRow}>
              <Text style={{ fontSize: 19 }}>{def.icon}</Text>
              <View style={{ flex: 1, gap: 3 }}>
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
        <Text style={styles.hint}>
          2 pièces = bonus · 4 pièces = bonus doublé
        </Text>
      </Card>

      <Card>
        <View style={styles.albumHead}>
          <SectionTitle icon="📔">Zalbum</SectionTitle>
          <Chip
            label={`+${Math.round(albumXpBonus(album.length) * 100)} % XP`}
            color={C.mystic}
            active={album.length > 0}
          />
        </View>
        <Text style={styles.albumSub}>
          {album.length}/{ALBUM_SIZE} découvert · chaque case = +1 % d'XP pou touzour
        </Text>

        <View style={styles.grid}>
          {ALBUM_SLOTS.map((slot) => (
            <View key={slot} style={styles.gridRow}>
              <Text style={styles.gridIcon}>{SLOT_ICONS[slot]}</Text>
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
                    <Text style={[styles.cellText, has && { color: RARITY_COLORS[r] }]}>
                      {has ? '✓' : '·'}
                    </Text>
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
    gap: 10,
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: C.hairlineSoft,
  },
  setName: { fontFamily: F.bold, fontSize: 14, lineHeight: 19, color: C.textDim },
  setCount: { fontFamily: F.black, fontSize: 13, lineHeight: 17, color: C.text },
  setBonus: { fontFamily: F.bold, fontSize: 11.5, lineHeight: 15 },
  hint: {
    fontFamily: F.regular,
    fontSize: 12,
    lineHeight: 16,
    color: C.textFaint,
    marginTop: 10,
  },
  albumHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  albumSub: {
    fontFamily: F.regular,
    fontSize: 12.5,
    lineHeight: 17,
    color: C.textDim,
    marginBottom: 10,
  },
  grid: { gap: 5 },
  gridRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  gridIcon: { fontSize: 16, width: 24 },
  cell: {
    flex: 1,
    height: 26,
    borderRadius: R.sm,
    borderWidth: 1,
    borderColor: C.hairlineSoft,
    backgroundColor: 'rgba(6,3,12,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cellText: { fontFamily: F.black, fontSize: 13, color: C.textFaint },
});
