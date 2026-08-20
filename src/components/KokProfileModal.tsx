import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Modal, ScrollView, StyleSheet, Text, View } from 'react-native';

import { ATTR_ICONS, ATTR_LABELS, CLASSES } from '../game/classes';
import { fmt, maxHp, SLOT_ICONS, SLOT_LABELS } from '../game/formulas';
import { GUILDS } from '../game/guilds';
import { RARITY_COLORS } from '../game/items';
import { AttrId, Attributes, ClassId, Item, SlotId } from '../game/types';
import { useT } from '../i18n/useT';
import { C, F, R, SHADOW } from '../theme';
import Rooster from './Rooster';
import {Button, Card, Chip, SectionTitle } from './ui';
import ItemArt from './ItemArt';
import CloseButton from './CloseButton';

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
  const t = useT();
  // Rendre la *même* Modal fermée plutôt que `null` : React réutilise alors
  // l'instance au lieu de la démonter. Démonter une Modal encore présentée
  // laissait sur iOS un fragment visible en filigrane sous tout le jeu.
  if (!profile)
    return <Modal visible={false} transparent animationType="fade" />;
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
          <CloseButton onPress={onClose} />
          <ScrollView showsVerticalScrollIndicator={false}>
            <View style={styles.head}>
              <View style={styles.portrait}>
                <View style={[styles.halo, { backgroundColor: cls.color }]} />
                <Rooster appearance={profile.appearance} size={116} />
              </View>
              <View style={{ flex: 1, gap: 8 }}>
                <Text style={styles.name} numberOfLines={1}>
                  {profile.name}
                  {profile.isMe ? ` ${t('profile.me')}` : ''}
                </Text>
                <Text style={[styles.cls, { color: cls.color }]} numberOfLines={1}>
                  {cls.emoji} {cls.name}
                </Text>
                <View style={styles.chips}>
                  <Chip label={t('common.level', { n: profile.level })} color={C.gold} active />
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
              <SectionTitle icon="⚔️">{t('profile.combatStats')}</SectionTitle>
              <Line label={`❤️  ${t('profile.hp')}`} value={fmt(hp)} />
              <Line label={`🗡️  ${t('profile.damage')}`} value={`${profile.weaponMin}–${profile.weaponMax}`} />
              <Line label={`🛡️  ${t('profile.armor')}`} value={`${profile.armor}`} />
            </Card>

            <Card compact>
              <SectionTitle icon="💪">{t('kok.attrs')}</SectionTitle>
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
                <SectionTitle icon="🎽">{t('kok.equipment')}</SectionTitle>
                <View style={styles.slots}>
                  {SLOTS.map((sl) => {
                    const it = profile.equipment?.[sl];
                    const col = it ? RARITY_COLORS[it.rarity] : null;
                    return (
                      <View
                        key={sl}
                        style={[styles.slot, col ? { borderColor: col } : null]}
                      >
                        {it ? (
                          <ItemArt slot={sl} rarity={it.rarity} size={26} />
                        ) : (
                          <Text style={{ fontSize: 17, opacity: 0.3 }}>{SLOT_ICONS[sl]}</Text>
                        )}
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
                <SectionTitle icon="🏠">{t('profile.guild')}</SectionTitle>
                <Text style={styles.guild}>
                  {guild.emblem} {guild.name}
                </Text>
                <Text style={styles.motto}>« {guild.motto} »</Text>
              </Card>
            )}

            {!profile.equipment && !profile.isMe && (
              <Text style={styles.hint}>
                {t('profile.secret')}
              </Text>
            )}
          </ScrollView>

          {onChallenge && !profile.isMe ? (
            <Button
              full
              size="lg"
              variant="ember"
              icon="⚔️"
              label={t('rond.challenge')}
              sub={challengeHint}
              disabled={challengeDisabled}
              onPress={onChallenge}
              style={{ marginTop: 12 }}
            />
          ) : null}
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
    padding: 16,
  },
  card: {
    width: '100%',
    maxHeight: '88%',
    borderRadius: R.xl,
    borderWidth: 1,
    borderColor: C.hairline,
    padding: 16,
    ...SHADOW.float,
  },
  head: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  portrait: { width: 116, alignItems: 'center', justifyContent: 'center' },
  halo: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    opacity: 0.16,
  },
  name: { fontFamily: F.black, fontSize: 20, lineHeight: 26, color: C.text },
  cls: { fontFamily: F.bold, fontSize: 13, lineHeight: 17 },
  chips: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  record: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginVertical: 12 },
  line: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  lineLabel: { fontFamily: F.semi, fontSize: 13, lineHeight: 17, color: C.textDim },
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
    gap: 4,
  },
  slotLabel: {
    fontFamily: F.bold,
    fontSize: 11,
    lineHeight: 15,
    color: C.textDim,
    textAlign: 'center',
  },
  guild: { fontFamily: F.black, fontSize: 15, lineHeight: 20, color: C.text },
  motto: {
    fontFamily: F.regular,
    fontStyle: 'italic',
    fontSize: 13,
    lineHeight: 17,
    color: C.textDim,
  },
  footer: { marginTop: 12, gap: 8 },
  hint: {
    fontFamily: F.regular,
    fontSize: 12,
    lineHeight: 16,
    color: C.textFaint,
    marginTop: 8,
    textAlign: 'center',
  },
});
