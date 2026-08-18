import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import DailyMissions from '../components/DailyMissions';
import { CompareLines, VerdictBadge } from '../components/ItemCompare';
import Rooster from '../components/Rooster';
import {
  Bar,
  Button,
  Card,
  Chip,
  GhostButton,
  SectionTitle,
  T,
} from '../components/ui';
import { ATTR_ICONS, ATTR_LABELS, CLASSES } from '../game/classes';
import {
  attrCost,
  fmt,
  maxHp,
  playerArmor,
  playerToFighter,
  playerWeapon,
  SLOT_ICONS,
  SLOT_LABELS,
  totalAttrs,
} from '../game/formulas';
import { RARITY_COLORS, RARITY_LABELS } from '../game/items';
import { compareToEquipped, kokPower } from '../game/power';
import { AttrId, Item, SlotId } from '../game/types';
import { useGame } from '../store/gameStore';
import { C, F, G, R } from '../theme';

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
  const attrMax = Math.max(...ATTRS.map((a) => attrs[a]), 1);
  const power = kokPower(player);
  // les améliorations d'abord : le joueur voit tout de suite quoi équiper
  const bag = [...player.inventory].sort(
    (a, b) => compareToEquipped(b, player).diff - compareToEquipped(a, player).diff
  );

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      {/* ─── Fiche ─── */}
      <Card glow={cls.color} style={{ paddingBottom: 10 }}>
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <View style={styles.portrait}>
            <View style={[styles.halo, { backgroundColor: cls.color }]} />
            <Rooster appearance={player.appearance} size={128} alive />
          </View>
          <View style={{ flex: 1, gap: 7 }}>
            <Text style={[styles.className, { color: cls.color }]} numberOfLines={1}>
              {cls.emoji} {cls.name}
            </Text>
            <StatTile icon="❤️" label="PV" value={fmt(maxHp(fighter))} tint={C.piment} />
            <StatTile
              icon="🗡️"
              label="Dégâts"
              value={`${weapon.min}–${weapon.max}`}
              tint={C.ember}
            />
            <StatTile icon="🛡️" label="Armure" value={`${playerArmor(player)}`} tint={C.lagoon} />
            <StatTile icon="⚡" label="Puissance" value={fmt(power)} tint={C.gold} />
          </View>
        </View>

        <View style={styles.recordRow}>
          <Chip label={`🏆 ${player.wins} V`} color={C.cane} />
          <Chip label={`💀 ${player.losses} D`} color={C.piment} />
          <Chip label={`#${player.rank} au rond`} color={C.gold} />
        </View>
        <Text style={styles.classDesc}>{cls.description}</Text>
      </Card>

      <DailyMissions />

      {/* ─── Attributs ─── */}
      <Card>
        <SectionTitle icon="💪">Attributs</SectionTitle>
        {ATTRS.map((a) => {
          const cost = attrCost(player.baseAttrs[a]);
          const bonus = attrs[a] - player.baseAttrs[a];
          const main = a === cls.mainAttr;
          return (
            <View key={a} style={styles.attrRow}>
              <View style={{ flex: 1, gap: 5 }}>
                <View style={styles.attrHead}>
                  <Text style={styles.attrName}>
                    {ATTR_ICONS[a]} {ATTR_LABELS[a]}
                    {main ? ' ★' : ''}
                  </Text>
                  <Text style={styles.attrValue}>
                    {player.baseAttrs[a]}
                    {bonus > 0 ? <Text style={styles.attrBonus}> +{bonus}</Text> : null}
                  </Text>
                </View>
                <Bar
                  value={attrs[a]}
                  max={attrMax}
                  variant={main ? 'gold' : 'slate'}
                  height={7}
                />
              </View>
              <Button
                size="sm"
                label={`+1  🌽${fmt(cost)}`}
                onPress={() => buyAttr(a)}
                disabled={player.grains < cost}
              />
            </View>
          );
        })}
      </Card>

      {/* ─── Équipement ─── */}
      <Card>
        <SectionTitle icon="🎽">Ékipman</SectionTitle>
        <View style={styles.slotGrid}>
          {SLOTS.map((s) => {
            const it = player.equipment[s];
            const col = it ? RARITY_COLORS[it.rarity] : null;
            return (
              <Pressable
                key={s}
                style={({ pressed }) => [
                  styles.slot,
                  col
                    ? { borderColor: col, backgroundColor: `${col}18`, shadowColor: col }
                    : null,
                  pressed && it ? { opacity: 0.7 } : null,
                ]}
                onPress={() => it && setSelected(it)}
              >
                <Text style={{ fontSize: 22, opacity: it ? 1 : 0.35 }}>{SLOT_ICONS[s]}</Text>
                <Text
                  style={[styles.slotLabel, col ? { color: col } : null]}
                  numberOfLines={1}
                >
                  {it ? it.name : SLOT_LABELS[s]}
                </Text>
              </Pressable>
            );
          })}
        </View>
      </Card>

      {/* ─── Inventaire ─── */}
      <Card>
        <SectionTitle icon="🎒">
          Sak — {player.inventory.length}/24
        </SectionTitle>
        {bag.length === 0 ? (
          <Text style={T.dim}>Sak lé vide, ti kok. Passe au Bazar !</Text>
        ) : (
          bag.map((it) => {
            const cmp = compareToEquipped(it, player);
            return (
            <View key={it.id} style={styles.invRow}>
              <Pressable
                onPress={() => setSelected(it)}
                style={[
                  styles.invIcon,
                  { borderColor: RARITY_COLORS[it.rarity], backgroundColor: `${RARITY_COLORS[it.rarity]}1A` },
                ]}
              >
                <Text style={{ fontSize: 18 }}>{SLOT_ICONS[it.slot]}</Text>
              </Pressable>
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={[styles.invName, { color: RARITY_COLORS[it.rarity] }]} numberOfLines={1}>
                  {it.name} <Text style={styles.invLevel}>niv.{it.level}</Text>
                </Text>
                <VerdictBadge cmp={cmp} />
                <Text style={styles.invStats} numberOfLines={2}>
                  {itemStats(it)}
                </Text>
              </View>
              <View style={{ gap: 5, alignItems: 'flex-end' }}>
                <Button
                  size="sm"
                  variant={cmp.diff > 0 ? 'cane' : 'slate'}
                  label="Ékipé"
                  onPress={() => equipItem(it)}
                />
                <GhostButton
                  label={`🌽${fmt(Math.round(it.price * 0.4))}`}
                  onPress={() => sellItem(it)}
                />
              </View>
            </View>
            );
          })
        )}
      </Card>

      {selected && (
        <Card glow={RARITY_COLORS[selected.rarity]}>
          <Text style={[styles.invName, { color: RARITY_COLORS[selected.rarity], fontSize: 16 }]}>
            {selected.name}
          </Text>
          <Chip
            label={RARITY_LABELS[selected.rarity]}
            color={RARITY_COLORS[selected.rarity]}
            style={{ alignSelf: 'flex-start', marginVertical: 6 }}
          />
          <Text style={styles.invStats}>{itemStats(selected)}</Text>
          <CompareLines cmp={compareToEquipped(selected, player)} />
          <View style={{ flexDirection: 'row', gap: 8, marginTop: 12, alignItems: 'center' }}>
            {player.equipment[selected.slot]?.id !== selected.id && (
              <Button
                size="sm"
                variant={compareToEquipped(selected, player).diff > 0 ? 'cane' : 'slate'}
                label="Ékipé"
                onPress={() => {
                  equipItem(selected);
                  setSelected(null);
                }}
              />
            )}
            <GhostButton label="Fermer" onPress={() => setSelected(null)} />
          </View>
        </Card>
      )}
    </ScrollView>
  );
}

function StatTile({
  icon,
  label,
  value,
  tint,
}: {
  icon: string;
  label: string;
  value: string;
  tint: string;
}) {
  return (
    <View style={styles.tile}>
      <LinearGradient
        colors={[`${tint}44`, `${tint}12`]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.tileIcon}
      >
        <Text style={{ fontSize: 13 }}>{icon}</Text>
      </LinearGradient>
      <Text style={styles.tileLabel}>{label}</Text>
      <Text style={styles.tileValue}>{value}</Text>
    </View>
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
  root: { flex: 1 },
  content: { padding: 14, paddingBottom: 40 },
  portrait: { width: 132, alignItems: 'center', justifyContent: 'center' },
  halo: {
    position: 'absolute',
    width: 108,
    height: 108,
    borderRadius: 54,
    opacity: 0.14,
    top: 12,
  },
  className: { fontFamily: F.black, fontSize: 19 },
  tile: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(6,3,12,0.4)',
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: C.hairlineSoft,
    paddingVertical: 5,
    paddingHorizontal: 7,
  },
  tileIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tileLabel: { fontFamily: F.semi, fontSize: 11, color: C.textFaint, flex: 1 },
  tileValue: { fontFamily: F.black, fontSize: 14, color: C.text },
  recordRow: { flexDirection: 'row', gap: 6, marginTop: 12, flexWrap: 'wrap' },
  classDesc: {
    fontFamily: F.regular,
    fontStyle: 'italic',
    fontSize: 12,
    color: C.textDim,
    marginTop: 10,
    lineHeight: 18,
  },
  attrRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 6 },
  attrHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  attrName: { fontFamily: F.bold, fontSize: 13.5, color: C.text },
  attrValue: { fontFamily: F.black, fontSize: 15, color: C.gold },
  attrBonus: { color: C.cane, fontSize: 13 },
  slotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  slot: {
    width: '22.7%',
    aspectRatio: 0.92,
    backgroundColor: 'rgba(6,3,12,0.45)',
    borderRadius: R.md,
    borderWidth: 1.5,
    borderColor: C.hairlineSoft,
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    gap: 3,
    shadowOpacity: 0.5,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 2 },
  },
  slotLabel: {
    fontFamily: F.semi,
    fontSize: 8.5,
    color: C.textFaint,
    textAlign: 'center',
  },
  invRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: C.hairlineSoft,
  },
  invIcon: {
    width: 38,
    height: 38,
    borderRadius: R.sm,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  invName: { fontFamily: F.black, fontSize: 13.5 },
  invLevel: { fontFamily: F.regular, fontSize: 11, color: C.textFaint },
  invStats: { fontFamily: F.regular, fontSize: 11.5, color: C.textDim, marginTop: 2 },
});
