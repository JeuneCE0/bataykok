import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import BattleLog from '../components/BattleLog';
import Collection from '../components/Collection';
import DailyMissions from '../components/DailyMissions';
import DayEventBanner from '../components/DayEventBanner';
import FreeChest from '../components/FreeChest';
import ReferralCard from '../components/ReferralCard';
import SoundSettings from '../components/SoundSettings';
import { CompareLines, VerdictBadge } from '../components/ItemCompare';
import Rooster from '../components/Rooster';
import {
  Bar,
  Button,
  Card,
  Chip,
  GhostButton,
  ScreenTitle,
  SectionTitle,
  Segmented,
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
import { SET_BY_ID } from '../game/sets';
import { TALENT_BY_ID } from '../game/talents';
import { AttrId, Item, SlotId } from '../game/types';
import { useGame } from '../store/gameStore';
import { C, F, G, R } from '../theme';

const ONLINE_LABEL: Record<'off' | 'sync' | 'ok' | 'error', string> = {
  off: '📴 Hors ligne',
  sync: '🔄 Synchronisation…',
  ok: '🌐 En ligne',
  error: '⚠️ Synchro impossible',
};

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
  const [bulk, setBulk] = useState(1);
  const [view, setView] = useState<'kok' | 'kaz'>('kok');
  const onlineState = useGame((s) => s.onlineState);
  const [flash, setFlash] = useState<string | null>(null);
  const equipBest = useGame((s) => s.equipBest);
  const sellJunk = useGame((s) => s.sellJunk);

  const say = (msg: string) => {
    setFlash(msg);
    setTimeout(() => setFlash(null), 2600);
  };

  if (!player) return null;
  const cls = CLASSES[player.classId];
  const attrs = totalAttrs(player);
  const fighter = playerToFighter(player);
  const weapon = playerWeapon(player);
  const attrMax = Math.max(...ATTRS.map((a) => attrs[a]), 1);
  const power = kokPower(player);
  const bulkCost = (a: AttrId) => {
    let total = 0;
    for (let i = 0; i < bulk; i++) total += attrCost(player.baseAttrs[a] + i);
    return total;
  };
  // un tri qui compare chaque objet à l'équipement : à ne refaire que si le
  // sak ou l'ékipman change, pas à chaque frappe dans un champ
  const bag = useMemo(
    () =>
      [...player.inventory].sort(
        (a, b) => compareToEquipped(b, player).diff - compareToEquipped(a, player).diff
      ),
    [player]
  );

  const switcher = (
    <Segmented
      value={view}
      onChange={setView}
      options={[
        { id: 'kok', label: '🐓  Mon Kok' },
        { id: 'kaz', label: '🏡  La Kaz' },
      ]}
    />
  );

  if (view === 'kaz') {
    return (
      <View style={{ flex: 1 }}>
        {switcher}
        <ScrollView style={styles.root} contentContainerStyle={styles.content}>
          <ScreenTitle title="La Kaz" sub="Tes rendez-vous du jour" />
          <View style={{ alignItems: 'center', marginBottom: 10 }}>
            <Chip
              label={ONLINE_LABEL[onlineState]}
              color={
                onlineState === 'ok'
                  ? C.cane
                  : onlineState === 'error'
                    ? C.piment
                    : C.textDim
              }
              active={onlineState === 'ok'}
            />
          </View>
          <DayEventBanner />
          <FreeChest />
          <DailyMissions />
          <BattleLog />
          <ReferralCard />
          <Collection />
          <SoundSettings />
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
    {switcher}
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      {flash && (
        <Card glow={C.cane} compact>
          <Text style={styles.flash}>{flash}</Text>
        </Card>
      )}
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

      {/* ─── Attributs ─── */}
      <Card>
        <View style={styles.sectionHead}>
          <SectionTitle icon="💪">Attributs</SectionTitle>
          <View style={{ flexDirection: 'row', gap: 6 }}>
            {[1, 5, 10].map((n) => (
              <Chip
                key={n}
                label={`×${n}`}
                color={C.gold}
                active={bulk === n}
                onPress={() => setBulk(n)}
              />
            ))}
          </View>
        </View>
        {ATTRS.map((a) => {
          const cost = bulkCost(a);
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
                label={`+${bulk}  🌽${fmt(cost)}`}
                onPress={() => buyAttr(a, bulk)}
                disabled={player.grains < cost}
              />
            </View>
          );
        })}
      </Card>

      {(player.talents ?? []).length > 0 && (
        <Card>
          <SectionTitle icon="🌟">Talan</SectionTitle>
          {(player.talents ?? []).map((id) => {
            const t = TALENT_BY_ID[id];
            if (!t) return null;
            return (
              <View key={id} style={styles.talentRow}>
                <Text style={{ fontSize: 18 }}>{t.icon}</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.talentName}>{t.title}</Text>
                  <Text style={styles.talentDesc}>{t.desc}</Text>
                </View>
              </View>
            );
          })}
        </Card>
      )}

      {/* ─── Équipement ─── */}
      <Card>
        <View style={styles.sectionHead}>
          <SectionTitle icon="🎽">Ékipman</SectionTitle>
          <Button
            size="sm"
            variant="cane"
            label="Équiper le meilleur"
            onPress={() => {
              const n = equipBest();
              say(
                n > 0
                  ? `✅ ${n} ékipman changé — out kok lé pli for !`
                  : 'Ton kok i port déjà lo mèy.'
              );
            }}
          />
        </View>
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
                  numberOfLines={2}
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
        <View style={styles.sectionHead}>
          <SectionTitle icon="🎒">Sak — {player.inventory.length}/24</SectionTitle>
          <GhostButton
            label="Vendre le surplus"
            onPress={() => {
              const r = sellJunk();
              say(
                r.count > 0
                  ? `💰 ${r.count} objè vandi · +🌽${fmt(r.grains)}`
                  : 'Rien à vendre : tout i sert encore.'
              );
            }}
          />
        </View>
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
                <View style={{ flexDirection: 'row', gap: 5, flexWrap: 'wrap' }}>
                  <VerdictBadge cmp={cmp} />
                  {it.setId && SET_BY_ID[it.setId] && (
                    <Chip
                      label={`${SET_BY_ID[it.setId].icon} ${SET_BY_ID[it.setId].name}`}
                      color={SET_BY_ID[it.setId].color}
                    />
                  )}
                </View>
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
    </View>
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
  sectionHead: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
    marginBottom: 4,
  },
  flash: { fontFamily: F.bold, fontSize: 14, lineHeight: 19, color: C.cane },
  talentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: C.hairlineSoft,
  },
  talentName: { fontFamily: F.black, fontSize: 14.5, lineHeight: 19, color: C.text },
  talentDesc: { fontFamily: F.regular, fontSize: 12.5, lineHeight: 17, color: C.textDim },
  portrait: { width: 132, alignItems: 'center', justifyContent: 'center' },
  halo: {
    position: 'absolute',
    width: 108,
    height: 108,
    borderRadius: 54,
    opacity: 0.14,
    top: 12,
  },
  className: { fontFamily: F.black, fontSize: 21, lineHeight: 27 },
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
  tileLabel: {
    fontFamily: F.bold,
    fontSize: 12.5,
    lineHeight: 17,
    color: C.textDim,
    flex: 1,
  },
  tileValue: { fontFamily: F.black, fontSize: 15.5, lineHeight: 20, color: C.text },
  recordRow: { flexDirection: 'row', gap: 6, marginTop: 12, flexWrap: 'wrap' },
  classDesc: {
    fontFamily: F.regular,
    fontSize: 13.5,
    color: C.textDim,
    marginTop: 12,
    lineHeight: 20,
  },
  attrRow: { flexDirection: 'row', alignItems: 'center', gap: 10, marginVertical: 6 },
  attrHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  attrName: { fontFamily: F.bold, fontSize: 15, lineHeight: 20, color: C.text },
  attrValue: { fontFamily: F.black, fontSize: 16.5, lineHeight: 21, color: C.gold },
  attrBonus: { color: C.cane, fontSize: 14 },
  slotGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  slot: {
    width: '22.7%',
    aspectRatio: 0.8,
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
    fontFamily: F.bold,
    fontSize: 10,
    lineHeight: 12.5,
    color: C.textDim,
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
  invName: { fontFamily: F.black, fontSize: 15, lineHeight: 20 },
  invLevel: { fontFamily: F.regular, fontSize: 12.5, color: C.textFaint },
  invStats: {
    fontFamily: F.regular,
    fontSize: 12.5,
    lineHeight: 17,
    color: C.textDim,
    marginTop: 2,
  },
});
