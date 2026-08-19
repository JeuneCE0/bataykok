import React, { useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import KokProfileModal, { KokProfile } from '../components/KokProfileModal';
import { Button, Card, Chip, ScreenTitle } from '../components/ui';
import { fmt } from '../game/formulas';
import { SEASON_MS, tierForRank } from '../game/seasons';
import { botToFighter, generateLadder } from '../game/bots';
import { CLASSES } from '../game/classes';
import { playerArmor, playerToFighter, playerWeapon, totalAttrs } from '../game/formulas';
import { useT } from '../i18n/useT';
import { useGame } from '../store/gameStore';
import { C, F, R } from '../theme';
import HonorTier from '../components/HonorTier';

const LADDER = generateLadder();
const botById = new Map(LADDER.map((b) => [b.id, b]));
const MEDALS = ['🥇', '🥈', '🥉'];

export default function RankingScreen({
  onChallenge,
}: {
  /** fourni par Le Rond : le palmarès n'a pas de moteur de combat à lui */
  onChallenge?: (botId: string) => void;
} = {}) {
  const player = useGame((s) => s.player);
  const ladderOrder = useGame((s) => s.ladderOrder);
  const seasonStart = useGame((s) => s.seasonStart);
  const seasonNo = useGame((s) => s.seasonNo);
  const seasonPending = useGame((s) => s.seasonPending);
  const claimSeason = useGame((s) => s.claimSeason);
  const t = useT();
  const [profile, setProfile] = useState<KokProfile | null>(null);
  const [challengeId, setChallengeId] = useState<string | null>(null);
  const arenaTickets = useGame((s) => s.arenaTickets);
  if (!player) return null;

  const openProfile = (id: string, rank: number) => {
    setChallengeId(id === 'me' ? null : id);
    if (id === 'me') {
      const f = playerToFighter(player);
      const w = playerWeapon(player);
      setProfile({
        name: player.name,
        classId: player.classId,
        level: player.level,
        appearance: player.appearance,
        attrs: totalAttrs(player),
        weaponMin: w.min,
        weaponMax: w.max,
        armor: playerArmor(player),
        honor: player.honor,
        wins: player.wins,
        losses: player.losses,
        rank,
        guildId: player.guildId,
        equipment: player.equipment,
        isMe: true,
      });
      return;
    }
    const bot = botById.get(id);
    if (!bot) return;
    const f = botToFighter(bot);
    setProfile({
      name: bot.name,
      classId: bot.classId,
      level: bot.level,
      appearance: bot.appearance,
      attrs: f.attrs,
      weaponMin: f.weaponMin,
      weaponMax: f.weaponMax,
      armor: f.armor,
      // les bots n'ont pas d'historique propre : on montre ce qui a du sens
      honor: Math.max(0, 400 - rank * 5),
      wins: Math.max(0, 90 - rank),
      losses: Math.max(0, rank),
      rank,
    });
  };

  const myIdx = ladderOrder.indexOf('me');
  const tier = tierForRank(myIdx + 1);
  const daysLeft = Math.max(
    0,
    Math.ceil((seasonStart + SEASON_MS - Date.now()) / 86_400_000)
  );

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <ScreenTitle
        title={t('ranking.title')}
        sub={t('ranking.sub')}
      />
      <HonorTier />
      <View style={styles.badges}>
        <Chip label={t('rond.myRank', { n: myIdx + 1 })} color={C.gold} active />
        <Chip label={t('rond.honor', { n: player.honor })} color={C.mystic} />
      </View>

      {seasonPending && (
        <Card glow={C.gold}>
          <Text style={styles.seasonTitle}>
            🏁 {t('season.over', { n: seasonPending.season })}
          </Text>
          <Text style={styles.seasonSub}>
            {t('season.finished', {
              n: seasonPending.rank,
              tier: tierForRank(seasonPending.rank).label,
            })}
          </Text>
          <Button
            full
            style={{ marginTop: 10 }}
            label={t('season.claim')}
            sub={`🌽 ${fmt(tierForRank(seasonPending.rank).grains)} · 🌶️ ${
              tierForRank(seasonPending.rank).piments
            }`}
            onPress={claimSeason}
          />
        </Card>
      )}

      <Card compact>
        <View style={styles.seasonRow}>
          <Text style={{ fontSize: 20 }}>{tier.icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.seasonTitle}>
              {t('season.current', { n: seasonNo, d: daysLeft })}
            </Text>
            <Text style={styles.seasonSub}>
              {t('season.atYourRank', { tier: tier.label })} → 🌽{fmt(tier.grains)} · 🌶️
              {tier.piments}
            </Text>
          </View>
        </View>
      </Card>

      <Card>
        {ladderOrder.map((id, i) => {
          const isMe = id === 'me';
          const bot = botById.get(id);
          if (!isMe && !bot) return null;
          const name = isMe ? player.name : bot!.name;
          const level = isMe ? player.level : bot!.level;
          const cls = CLASSES[isMe ? player.classId : bot!.classId];

          // top 15 + la zone autour du joueur
          if (i > 14 && Math.abs(i - myIdx) > 3 && i < ladderOrder.length - 1) {
            if (i === 15 && myIdx > 18) {
              return (
                <Text key={id} style={styles.dots}>
                  ⋯
                </Text>
              );
            }
            return null;
          }

          return (
            <Pressable
              key={id}
              onPress={() => openProfile(id, i + 1)}
              style={({ pressed }) => [
                styles.row,
                isMe && styles.meRow,
                pressed && { opacity: 0.6 },
              ]}
            >
              <View
                style={[
                  styles.rankBox,
                  i < 3 && { borderColor: C.gold, backgroundColor: 'rgba(255,201,60,0.12)' },
                  isMe && { borderColor: C.gold },
                ]}
              >
                <Text style={[styles.rank, i < 3 && { color: C.gold, fontSize: 15 }]}>
                  {i < 3 ? MEDALS[i] : `${i + 1}`}
                </Text>
              </View>
              <Text
                style={[styles.name, isMe && { color: C.gold }]}
                numberOfLines={1}
              >
                {name}
                {isMe ? ` ${t('profile.me')}` : ''}
              </Text>
              <Text style={[styles.cls, { color: cls.color }]}>{cls.emoji}</Text>
              <Text style={styles.level}>niv. {level}</Text>
              <Text style={styles.chevron}>›</Text>
            </Pressable>
          );
        })}
      </Card>

      <KokProfileModal
        profile={profile}
        onClose={() => setProfile(null)}
        onChallenge={
          onChallenge && challengeId
            ? () => {
                const id = challengeId;
                setProfile(null);
                onChallenge(id);
              }
            : undefined
        }
        challengeDisabled={arenaTickets <= 0}
        challengeHint={
          arenaTickets > 0
            ? t('rond.tickets', { n: arenaTickets, s: arenaTickets > 1 ? 's' : '' })
            : t('rond.noTickets')
        }
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 14, paddingBottom: 40 },
  badges: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginBottom: 6 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 9,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: C.hairlineSoft,
    gap: 10,
  },
  meRow: {
    backgroundColor: 'rgba(255,201,60,0.10)',
    borderRadius: R.sm,
    borderBottomColor: 'transparent',
  },
  rankBox: {
    width: 32,
    height: 28,
    borderRadius: R.sm,
    borderWidth: 1,
    borderColor: C.hairlineSoft,
    backgroundColor: 'rgba(6,3,12,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rank: {
    fontFamily: F.black,
    fontSize: 13.5,
    lineHeight: 17,
    color: C.textDim,
    includeFontPadding: false,
    textAlign: 'center',
  },
  name: { fontFamily: F.bold, fontSize: 15, lineHeight: 20, color: C.text, flex: 1 },
  cls: { fontSize: 16 },
  level: {
    fontFamily: F.semi,
    fontSize: 12.5,
    lineHeight: 17,
    color: C.textDim,
    width: 52,
    textAlign: 'right',
  },
  seasonRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  seasonTitle: { fontFamily: F.black, fontSize: 15, lineHeight: 20, color: C.text },
  seasonSub: { fontFamily: F.semi, fontSize: 12.5, lineHeight: 17, color: C.textDim },
  chevron: { fontFamily: F.black, fontSize: 20, color: C.textFaint, marginLeft: -2 },
  dots: { color: C.textFaint, textAlign: 'center', fontSize: 18, paddingVertical: 6 },
});
