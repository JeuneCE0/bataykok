import React, { useState } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import Rooster from '../components/Rooster';
import { COLORS, GoldButton, Panel, Title } from '../components/ui';
import { ATTR_ICONS, ATTR_LABELS, CLASSES } from '../game/classes';
import {
  attrCost,
  fmt,
  maxHp,
  playerToFighter,
  playerWeapon,
  playerArmor,
  SLOT_ICONS,
  SLOT_LABELS,
  totalAttrs,
} from '../game/formulas';
import { RARITY_COLORS, RARITY_LABELS } from '../game/items';
import { AttrId, Item, SlotId } from '../game/types';
import { useGame } from '../store/gameStore';

const ATTRS: AttrId[] = ['force', 'adresse', 'esprit', 'endurance', 'chance'];
const SLOTS: SlotId[] = [
  'arme',
  'tete',
  'torse',
  'pattes',
  'amulette',
  'anneau',
  'ceinture',
  'grigri',
];

export default function CharacterScreen() {
  const player = useGame((s) => s.player);
  const buyAttr = useGame((s) => s.buyAttr);
  const equipItem = useGame((s) => s.equipItem);
  const sellItem = useGame((s) => s.sellItem);
  const [selected, setSelected] = useState<Item | null>(null);

  if (!player) return null;
  const cls = CLASSES[player.classId];
  const attrs = totalAttrs(player);
  const fighter = playerToFighter(player);
  const weapon = playerWeapon(player);

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ paddingBottom: 40 }}>
      <Title>Mon Kok</Title>

      <Panel>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Rooster appearance={player.appearance} size={130} />
          <View style={{ flex: 1, marginLeft: 8 }}>
            <Text style={[styles.className, { color: cls.color }]}>
              {cls.emoji} {cls.name}
            </Text>
            <Text style={styles.info}>❤️ PV : {fmt(maxHp(fighter))}</Text>
            <Text style={styles.info}>
              🗡️ Dégâts : {weapon.min}–{weapon.max}
            </Text>
            <Text style={styles.info}>🛡️ Armure : {playerArmor(player)}</Text>
            <Text style={styles.info}>
              🏆 {player.wins} V / {player.losses} D — Rang #{player.rank}
            </Text>
          </View>
        </View>
        <Text style={styles.classDesc}>{cls.description}</Text>
      </Panel>

      {/* Attributs */}
      <Panel>
        <Text style={styles.sectionTitle}>Attributs</Text>
        {ATTRS.map((a) => {
          const cost = attrCost(player.baseAttrs[a]);
          const bonus = attrs[a] - player.baseAttrs[a];
          return (
            <View key={a} style={styles.attrRow}>
              <Text style={styles.attrName}>
                {ATTR_ICONS[a]} {ATTR_LABELS[a]}
                {a === cls.mainAttr ? ' ★' : ''}
              </Text>
              <Text style={styles.attrValue}>
                {player.baseAttrs[a]}
                {bonus > 0 ? <Text style={{ color: COLORS.green }}> +{bonus}</Text> : null}
              </Text>
              <GoldButton
                small
                label={`+1 (🌽${fmt(cost)})`}
                onPress={() => buyAttr(a)}
                disabled={player.grains < cost}
              />
            </View>
          );
        })}
      </Panel>

      {/* Équipement */}
      <Panel>
        <Text style={styles.sectionTitle}>Ékipman</Text>
        <View style={styles.slotGrid}>
          {SLOTS.map((s) => {
            const it = player.equipment[s];
            return (
              <TouchableOpacity
                key={s}
                style={[styles.slot, it && { borderColor: RARITY_COLORS[it.rarity] }]}
                onPress={() => it && setSelected(it)}
              >
                <Text style={{ fontSize: 20 }}>{SLOT_ICONS[s]}</Text>
                <Text style={styles.slotLabel} numberOfLines={1}>
                  {it ? it.name : SLOT_LABELS[s]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </Panel>

      {/* Inventaire */}
      <Panel>
        <Text style={styles.sectionTitle}>
          Sak (inventaire) — {player.inventory.length}/24
        </Text>
        {player.inventory.length === 0 ? (
          <Text style={styles.info}>Sak lé vide, ti kok.</Text>
        ) : (
          player.inventory.map((it) => (
            <View key={it.id} style={styles.invRow}>
              <Text style={{ fontSize: 18 }}>{SLOT_ICONS[it.slot]}</Text>
              <View style={{ flex: 1 }}>
                <Text style={[styles.invName, { color: RARITY_COLORS[it.rarity] }]}>
                  {it.name} <Text style={styles.invLevel}>niv.{it.level}</Text>
                </Text>
                <Text style={styles.invStats}>{itemStats(it)}</Text>
              </View>
              <GoldButton small label="Ékipé" onPress={() => equipItem(it)} />
              <GoldButton
                small
                color="#7f8c8d"
                label={`🌽${fmt(Math.round(it.price * 0.4))}`}
                onPress={() => sellItem(it)}
              />
            </View>
          ))
        )}
      </Panel>

      {selected && (
        <Panel style={{ borderColor: RARITY_COLORS[selected.rarity] }}>
          <Text style={[styles.invName, { color: RARITY_COLORS[selected.rarity] }]}>
            {selected.name} — {RARITY_LABELS[selected.rarity]}
          </Text>
          <Text style={styles.invStats}>{itemStats(selected)}</Text>
          <GoldButton small label="Fermer" onPress={() => setSelected(null)} />
        </Panel>
      )}
    </ScrollView>
  );
}

function itemStats(it: Item): string {
  const parts: string[] = [];
  if (it.dmgMin) parts.push(`Dégâts ${it.dmgMin}–${it.dmgMax}`);
  if (it.armor) parts.push(`Armure +${it.armor}`);
  (Object.keys(it.bonuses) as AttrId[]).forEach((k) => {
    parts.push(`${ATTR_LABELS[k]} +${it.bonuses[k]}`);
  });
  return parts.join(' · ');
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg, padding: 14 },
  className: { fontSize: 18, fontWeight: '900' },
  info: { color: COLORS.text, fontSize: 13, marginTop: 3 },
  classDesc: { color: COLORS.textDim, fontSize: 12, marginTop: 8, fontStyle: 'italic' },
  sectionTitle: { color: COLORS.gold, fontWeight: '900', fontSize: 15, marginBottom: 8 },
  attrRow: { flexDirection: 'row', alignItems: 'center', marginVertical: 4, gap: 8 },
  attrName: { color: COLORS.text, fontWeight: '700', fontSize: 14, flex: 1 },
  attrValue: { color: COLORS.gold, fontWeight: '900', fontSize: 16, width: 70, textAlign: 'right' },
  slotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  slot: {
    width: '22.5%',
    aspectRatio: 0.9,
    backgroundColor: 'rgba(0,0,0,0.35)',
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#555',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
  },
  slotLabel: { color: COLORS.textDim, fontSize: 9, textAlign: 'center', marginTop: 3 },
  invRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.08)',
  },
  invName: { fontWeight: '800', fontSize: 13 },
  invLevel: { color: COLORS.textDim, fontWeight: '400', fontSize: 11 },
  invStats: { color: COLORS.textDim, fontSize: 11, marginTop: 2 },
});
