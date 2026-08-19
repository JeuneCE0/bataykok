import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Modal, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ATTR_ICONS, ATTR_LABELS, CLASSES } from '../game/classes';
import { fmt, maxHp, SLOT_ICONS, SLOT_LABELS } from '../game/formulas';
import { GUILDS } from '../game/guilds';
import { RARITY_COLORS } from '../game/items';
import { AttrId, Attributes, ClassId, Item, SlotId } from '../game/types';
import { C, F, R, SHADOW } from '../theme';
import Rooster from './Rooster';
import { Button, Card, Chip, GhostButton, SectionTitle } from './ui';

const ATTRS: AttrId[] = ['force', 'adresse', 'esprit', 'endurance', 'chance'];
const SLOTS: SlotId[] = [
  'arme', 'tete', 'torse', 'pattes', 'amulette', 'anneau', 'ceinture', 'grigri',
];

export interface KokProfile {
  name: string;
  classId: ClassId;
  level: number;
  appearance: { bodyColor: string; combColor: string; tailPalette: number; accessory: number };
  attrs: Attributes;
  weaponMin: number;
  weaponMax: number;
  armor: number;
  honor: number;
  wins: number;
  losses: number;
  rank: number;
  guildId?: string | null;
  /** connu seulement pour son propre kok */
  equipment?: Partial<Record<SlotId, Item>>;
  isMe?: boolean;
}

/** Fiche d'un kok du palmarès : ce qu'on sait de lui avant de l'attaquer. */
export default function KokProfileModal({
  profile,
  onClose,
  onChallenge,
  challengeDisabled,
  challengeHint,
}: {
  profile: KokProfile | null;
  onClose: () => void;
  /** absent = fiche en lecture seule (son propre kok, ou hors du rond) */
  onChallenge?: () => void;
  challengeDisabled?: boolean;
  challengeHint?: string;
}) {
  if (!profile) return null;
  const cls = CLASSES[profile.classId];
  const guild = profile.guildId
    ? GUILDS.find((g) => g.id === profile.guildId)
    : null;
  const hp = maxHp({
    name: profile.name,
    level: profile.level,
    classId: profile.classId,
    attrs: profile.attrs,
    weaponMin: profile.weaponMin,
    weaponMax: profile.weaponMax,
    armor: profile.armor,
    appearance: profile.appearance,
  });

  return (
    <Modal visible transparent animationType="fade">
      <View style={styles.root}>
        <LinearGradient colors={['#2A1A3D', '#0B0714']} style={styles.card}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.head}>
              <View style={styles.portrait}>
                <View style={[styles.halo, { backgroundColor: cls.color }]} />
                <Rooster appearance={profile.appearance} size={116} />
              </View>
              <View style={{ flex: 1, gap: 6 }}>
                <Text style={styles.name} numberOfLines={1}>
                  {profile.name}
                  {profile.isMe ? ' (ou !)' : ''}
                </Text>
                <Text style={[styles.cls, { color: cls.color }]} numberOfLines={1}>
                  {cls.emoji} {cls.name}
                </Text>
                <View style={styles.chips}>
                  <Chip label={`Niv. ${profile.level}`} color={C.gold} active />
                  <Chip label={`#${profile.rank}`} color={C.textDim} />
                </View>
              </View>
            </View>

            <View style={styles.record}>
              <Chip icon="🏆" label={`${profile.wins} V`} color={C.cane} />
              <Chip icon="💀" label={`${profile.losses} D`} color={C.piment} />
              <Chip icon="🎖️" label={`${profile.honor}`} color={C.mystic} />
            </View>

            <Card compact>
              <SectionTitle icon="⚔️">Statistiques de combat</SectionTitle>
              <Line label="❤️  PV" value={fmt(hp)} />
              <Line label="🗡️  Dégâts" value={`${profile.weaponMin}–${profile.weaponMax}`} />
              <Line label="🛡️  Armure" value={`${profile.armor}`} />
            </Card>

            <Card compact>
              <SectionTitle icon="💪">Attributs</SectionTitle>
              {ATTRS.map((a) => (
                <Line
                  key={a}
                  label={`${ATTR_ICONS[a]}  ${ATTR_LABELS[a]}${a === cls.mainAttr ? ' ★' : ''}`}
                  value={`${profile.attrs[a]}`}
                  highlight={a === cls.mainAttr}
                />
              ))}
            </Card>

            {profile.equipment && (
              <Card compact>
                <SectionTitle icon="🎽">Ékipman</SectionTitle>
                <View style={styles.slots}>
                  {SLOTS.map((sl) => {
                    const it = profile.equipment?.[sl];
                    const col = it ? RARITY_COLORS[it.rarity] : null;
                    return (
                      <View
                        key={sl}
                        style={[styles.slot, col ? { borderColor: col } : null]}
                      >
                        <Text style={{ fontSize: 18, opacity: it ? 1 : 0.3 }}>
                          {SLOT_ICONS[sl]}
                        </Text>
                        <Text
                          style={[styles.slotLabel, col ? { color: col } : null]}
                          numberOfLines={2}
                        >
                          {it ? it.name : SLOT_LABELS[sl]}
                        </Text>
                      </View>
                    );
                  })}
                </View>
              </Card>
            )}

            {guild && (
              <Card compact>
                <SectionTitle icon="🏠">Écurie</SectionTitle>
                <Text style={styles.guild}>
                  {guild.emblem} {guild.name}
                </Text>
                <Text style={styles.motto}>« {guild.motto} »</Text>
              </Card>
            )}

            {!profile.equipment && !profile.isMe && (
              <Text style={styles.hint}>
                L’ékipman d’un adversaire reste secret — tu ne vois que ce qu’il vaut
                au combat.
              </Text>
            )}
          </ScrollView>

          {onChallenge && !profile.isMe ? (
            <View style={styles.footer}>
              <Button
                full
                size="lg"
                variant="ember"
                icon="⚔️"
                label="Défier"
                sub={challengeHint}
                disabled={challengeDisabled}
                onPress={onChallenge}
              />
              <GhostButton label="Fermer" onPress={onClose} style={{ alignSelf: 'center' }} />
            </View>
          ) : (
            <Button full size="lg" label="Fermer" onPress={onClose} style={{ marginTop: 12 }} />
          )}
        </LinearGradient>
      </View>
    </Modal>
  );
}

function Line({
  label,
  value,
  highlight,
}: {
  label: string;
  value: string;
  highlight?: boolean;
}) {
  return (
    <View style={styles.line}>
      <Text style={styles.lineLabel}>{label}</Text>
      <Text style={[styles.lineValue, highlight && { color: C.gold }]}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'rgba(4,2,8,0.9)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 18,
  },
  card: {
    width: '100%',
    maxHeight: '88%',
    borderRadius: R.xl,
    borderWidth: 1,
    borderColor: C.hairline,
    padding: 18,
    ...SHADOW.float,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  portrait: { width: 116, alignItems: 'center', justifyContent: 'center' },
  halo: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    opacity: 0.16,
  },
  name: { fontFamily: F.black, fontSize: 21, lineHeight: 27, color: C.text },
  cls: { fontFamily: F.bold, fontSize: 14, lineHeight: 19 },
  chips: { flexDirection: 'row', gap: 6, flexWrap: 'wrap' },
  record: { flexDirection: 'row', gap: 6, justifyContent: 'center', marginVertical: 12 },
  line: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 5,
  },
  lineLabel: { fontFamily: F.semi, fontSize: 14, lineHeight: 19, color: C.textDim },
  lineValue: { fontFamily: F.black, fontSize: 15, lineHeight: 20, color: C.text },
  slots: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  slot: {
    width: '22.5%',
    aspectRatio: 0.8,
    borderRadius: R.md,
    borderWidth: 1.5,
    borderColor: C.hairlineSoft,
    backgroundColor: 'rgba(6,3,12,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 4,
    gap: 3,
  },
  slotLabel: {
    fontFamily: F.bold,
    fontSize: 9.5,
    lineHeight: 12,
    color: C.textDim,
    textAlign: 'center',
  },
  guild: { fontFamily: F.black, fontSize: 16, lineHeight: 21, color: C.text },
  motto: {
    fontFamily: F.regular,
    fontStyle: 'italic',
    fontSize: 13,
    lineHeight: 18,
    color: C.textDim,
  },
  footer: { marginTop: 12, gap: 8 },
  hint: {
    fontFamily: F.regular,
    fontSize: 12.5,
    lineHeight: 17,
    color: C.textFaint,
    marginTop: 10,
    textAlign: 'center',
  },
});
