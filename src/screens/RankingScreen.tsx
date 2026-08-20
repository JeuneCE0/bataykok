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
import { BW, C, F, OUTLINE, R, TEXT_OUTLINE } from '../theme';
import HonorTier from '../components/HonorTier';

const LADDER = generateLadder();
const botById = new Map(LADDER.map((b) => [b.id, b]));
/** Or, argent, bronze : le podium se voit à la couleur du socle, pas à un emoji. */
const PODIUM = ['#FFC93C', '#D8DEE9', '#C98A5B'];

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
              tier: t(tierForRank(seasonPending.rank).labelKey),
            })}
          </Text>
          <Button
            full
            style={{ marginTop: 8 }}
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
              {t('season.atYourRank', { tier: t(tier.labelKey) })} → 🌽{fmt(tier.grains)} · 🌶️
              {tier.piments}
            </Text>
          </View>
        </View>
      </Card>

      {/* Chaque rang est une carte à part entière : en lignes séparées par
          des filets, le classement se lisait comme un tableur. */}
      {ladderOrder.map((id, i) => {
        const isMe = id === 'me';
        const bot = botById.get(id);
        if (!isMe && !bot) return null;
        const name = isMe ? player.name : bot!.name;
        const level = isMe ? player.level : bot!.level;
        const honor = isMe ? player.honor : Math.max(0, 400 - (i + 1) * 5);
        const cls = CLASSES[isMe ? player.classId : bot!.classId];
        const podium = i < 3 ? PODIUM[i] : null;

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
              pressed && { opacity: 0.75 },
            ]}
          >
            <View
              style={[
                styles.rankBox,
                podium ? { backgroundColor: podium, borderColor: OUTLINE } : null,
                isMe && !podium ? { borderColor: C.gold } : null,
              ]}
            >
              <Text style={[styles.rank, podium ? { color: C.ink } : null]}>{i + 1}</Text>
            </View>

            <View style={[styles.crest, { borderColor: cls.color }]}>
              <Text style={styles.crestEmoji}>{cls.emoji}</Text>
            </View>

            <View style={{ flex: 1, gap: 2 }}>
              <Text style={[styles.name, isMe && { color: C.gold }]} numberOfLines={1}>
                {name}
                {isMe ? ` ${t('profile.me')}` : ''}
              </Text>
              <Text style={[styles.cls, { color: cls.color }]} numberOfLines={1}>
                {cls.name}
              </Text>
            </View>

            <View style={styles.stats}>
              <Text style={styles.statHonor} numberOfLines={1}>
                🎖️ {fmt(honor)}
              </Text>
              <Text style={styles.statLevel} numberOfLines={1}>
                {t('common.level', { n: level })}
              </Text>
            </View>
          </Pressable>
        );
      })}

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
  content: { padding: 12, paddingBottom: 32 },
  badges: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginBottom: 8 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
    paddingHorizontal: 8,
    marginBottom: 8,
    borderRadius: R.md,
    borderWidth: BW.thick,
    borderColor: OUTLINE,
    backgroundColor: 'rgba(33,22,50,0.7)',
    gap: 8,
  },
  meRow: {
    backgroundColor: 'rgba(255,201,60,0.14)',
    borderColor: C.gold,
  },
  rankBox: {
    width: 36,
    height: 36,
    borderRadius: R.sm,
    borderWidth: BW.thick,
    borderColor: OUTLINE,
    backgroundColor: 'rgba(6,3,12,0.55)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rank: {
    fontFamily: F.black,
    fontSize: 15,
    lineHeight: 20,
    color: C.textDim,
    includeFontPadding: false,
    textAlign: 'center',
  },
  crest: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: BW.thick,
    backgroundColor: 'rgba(6,3,12,0.5)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  crestEmoji: { fontSize: 17, lineHeight: 22, includeFontPadding: false },
  name: {
    fontFamily: F.black,
    fontSize: 15,
    lineHeight: 20,
    color: C.text,
    includeFontPadding: false,
    ...TEXT_OUTLINE,
  },
  cls: { fontFamily: F.semi, fontSize: 11, lineHeight: 15 },
  stats: { alignItems: 'flex-end', gap: 2 },
  statHonor: { fontFamily: F.black, fontSize: 13, lineHeight: 17, color: C.mystic },
  statLevel: { fontFamily: F.semi, fontSize: 11, lineHeight: 15, color: C.textFaint },
  seasonRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  seasonTitle: { fontFamily: F.black, fontSize: 15, lineHeight: 20, color: C.text },
  seasonSub: { fontFamily: F.semi, fontSize: 12, lineHeight: 16, color: C.textDim },
  dots: { color: C.textFaint, textAlign: 'center', fontSize: 17, paddingVertical: 8 },
});
