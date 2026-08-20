import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import FadeIn from '../components/FadeIn';
import {
  Bar,
  Button,
  Card,
  Chip,
  GhostButton,
  ScreenTitle,
  SectionTitle,
  T,
} from '../components/ui';
import { fmt } from '../game/formulas';
import { CLASSES } from '../game/classes';
import {
  GUILDS,
  GUILD_BONUS_SCALE,
  GUILD_GOLD_BONUS_PER_LEVEL,
  GUILD_XP_BONUS_PER_LEVEL,
  donationTiers,
} from '../game/guilds';
import {
  GuildBoardRow,
  RosterRow,
  fetchGuildBoard,
  fetchRoster,
} from '../lib/guild';
import { useT } from '../i18n/useT';
import { useGame } from '../store/gameStore';
import { C, F, R } from '../theme';

export default function GuildScreen() {
  const t = useT();
  const player = useGame((s) => s.player);
  const guildLevel = useGame((s) => s.guildLevel);
  const joinGuild = useGame((s) => s.joinGuild);
  const leaveGuild = useGame((s) => s.leaveGuild);
  const donateGuild = useGame((s) => s.donateGuild);
  const setGuildLevel = useGame((s) => s.setGuildLevel);

  const [board, setBoard] = useState<GuildBoardRow[]>([]);
  const [roster, setRoster] = useState<RosterRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const guildId = player?.guildId ?? null;

  // Le tableau est partagé : il faut le relire, pas le déduire du local.
  const refresh = useCallback(async () => {
    const b = await fetchGuildBoard();
    setBoard(b);
    if (guildId) {
      const mine = b.find((g) => g.key === guildId);
      if (mine) setGuildLevel(mine.level);
      setRoster(await fetchRoster(guildId));
    } else {
      setRoster([]);
    }
  }, [guildId, setGuildLevel]);

  useEffect(() => {
    void refresh();
    // Le serveur n'apprend l'écurie qu'au prochain envoi du snapshot : sans ce
    // second passage, on venait de rejoindre et le tableau ne nous comptait
    // pas encore.
    const t = setTimeout(() => void refresh(), 2500);
    return () => clearTimeout(t);
  }, [refresh]);

  if (!player) return null;
  const myGuild = GUILDS.find((g) => g.id === player.guildId);
  const mine = board.find((g) => g.key === player.guildId) ?? null;

  if (myGuild) {
    return (
      <ScrollView style={styles.root} contentContainerStyle={styles.content}>
        <View style={styles.crest}>
          <Text style={styles.crestEmblem}>{myGuild.emblem}</Text>
        </View>
        <ScreenTitle title={myGuild.name} sub={`« ${myGuild.motto} »`} />

        <Card glow={C.gold}>
          <SectionTitle icon="⭐">{t('guild.level')}</SectionTitle>
          <View style={styles.levelRow}>
            <Text style={styles.guildLevel}>{guildLevel}</Text>
            <View style={{ flex: 1, gap: 8 }}>
              <BonusLine
                icon="✨"
                label={t('guild.xpBonus')}
                value={`+${guildLevel * GUILD_XP_BONUS_PER_LEVEL}%`}
                color={C.mystic}
                pct={Math.min(1, (guildLevel * GUILD_XP_BONUS_PER_LEVEL) / GUILD_BONUS_SCALE)}
                variant="mystic"
              />
              <BonusLine
                icon="🌽"
                label={t('guild.goldBonus')}
                value={`+${guildLevel * GUILD_GOLD_BONUS_PER_LEVEL}%`}
                color={C.gold}
                pct={Math.min(1, (guildLevel * GUILD_GOLD_BONUS_PER_LEVEL) / GUILD_BONUS_SCALE)}
                variant="gold"
              />
            </View>
          </View>
        </Card>

        <Card>
          <SectionTitle icon="🪙">{t('guild.pot')}</SectionTitle>
          <Text style={styles.potHint}>{t('guild.potHint')}</Text>
          {mine ? (
            <>
              <Bar
                value={mine.pot}
                max={Math.max(1, mine.threshold)}
                variant="gold"
                height={14}
                label={`${fmt(mine.pot)} / ${fmt(mine.threshold)}`}
              />
              <View style={styles.donateRow}>
                {donationTiers(player.grains).map((montant) => (
                  <Button
                    key={montant}
                    style={styles.donateBtn}
                    size="sm"
                    label={`🌽${fmt(montant)}`}
                    disabled={busy || player.grains < montant}
                    onPress={async () => {
                      setBusy(true);
                      const res = await donateGuild(montant);
                      setBusy(false);
                      if (!res) {
                        setMsg(t('guild.donateLimit'));
                        return;
                      }
                      setMsg(res.leveled ? t('guild.levelUp', { n: res.level }) : null);
                      void refresh();
                    }}
                  />
                ))}
              </View>
              {msg ? <Text style={styles.msg}>{msg}</Text> : null}
            </>
          ) : (
            <Text style={styles.potHint}>{t('guild.offline')}</Text>
          )}
        </Card>

        <Card>
          <SectionTitle icon="🐓">{t('guild.topDonors')}</SectionTitle>
          {roster.length === 0 ? (
            <Text style={styles.potHint}>{t('guild.empty')}</Text>
          ) : (
            roster.map((m) => (
              <View
                key={m.id}
                style={[styles.memberRow, m.name === player.name && styles.meRow]}
              >
                <Text style={styles.member} numberOfLines={1}>
                  {CLASSES[m.classId]?.emoji ?? '🐔'} {m.name}
                </Text>
                <Text style={styles.donated} numberOfLines={1}>
                  🌽 {fmt(m.donated)}
                </Text>
              </View>
            ))
          )}
        </Card>

        <GhostButton
          label={t('guild.leave')}
          onPress={leaveGuild}
          style={{ alignSelf: 'center', marginTop: 8 }}
        />
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <ScreenTitle
        title={t('guild.title')}
        sub={t('guild.sub')}
      />
      {GUILDS.map((g, gi) => (
        <FadeIn key={g.id} index={gi}>
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={styles.emblemBox}>
              <Text style={{ fontSize: 24 }}>{g.emblem}</Text>
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={styles.guildName}>{g.name}</Text>
              <Text style={styles.motto}>« {g.motto} »</Text>
              <View style={styles.guildChips}>
                <Chip
                  label={t('guild.membersCount', { n: board.find((b) => b.key === g.id)?.members ?? 0 })}
                  color={C.lagoon}
                />
                <Chip
                  label={t('common.level', { n: board.find((b) => b.key === g.id)?.level ?? 1 })}
                  color={C.gold}
                />
              </View>
            </View>
          </View>
          <Button full label={t('guild.join')} onPress={() => joinGuild(g.id)} />
        </Card>
        </FadeIn>
      ))}
    </ScrollView>
  );
}

function BonusLine({
  icon,
  label,
  value,
  color,
  pct,
  variant,
}: {
  icon: string;
  label: string;
  value: string;
  color: string;
  pct: number;
  variant: 'gold' | 'mystic';
}) {
  return (
    <View style={{ gap: 4 }}>
      <View style={styles.bonusHead}>
        <Text style={styles.bonusLabel}>
          {icon} {label}
        </Text>
        <Text style={[styles.bonusValue, { color }]}>{value}</Text>
      </View>
      <Bar value={pct} max={1} variant={variant} height={7} />
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 12, paddingBottom: 32 },
  crest: { alignItems: 'center', marginTop: 8 },
  crestEmblem: {
    fontSize: 44,
    textShadowColor: 'rgba(255,201,60,0.5)',
    textShadowRadius: 20,
  },
  levelRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  guildLevel: {
    fontFamily: F.black,
    fontSize: 44,
    color: C.gold,
    textShadowColor: 'rgba(255,201,60,0.45)',
    textShadowRadius: 16,
  },
  bonusHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bonusLabel: { fontFamily: F.semi, fontSize: 13, lineHeight: 17, color: C.textDim },
  bonusValue: { fontFamily: F.black, fontSize: 15, lineHeight: 20 },
  emblemBox: {
    width: 54,
    height: 54,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: C.hairline,
    backgroundColor: 'rgba(6,3,12,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  guildName: { fontFamily: F.black, fontSize: 20, lineHeight: 26, color: C.text },
  motto: {
    fontFamily: F.regular,
    fontStyle: 'italic',
    fontSize: 13,
    lineHeight: 17,
    color: C.textDim,
  },
  members: { ...T.tiny, color: C.textFaint, marginVertical: 8 },
  potHint: {
    fontFamily: F.regular,
    fontSize: 12,
    lineHeight: 16,
    color: C.textDim,
    marginBottom: 8,
  },
  donateRow: { flexDirection: 'row', gap: 8, marginTop: 12 },
  donateBtn: { flex: 1, alignSelf: 'auto' },
  msg: {
    fontFamily: F.black,
    fontSize: 13,
    lineHeight: 17,
    color: C.gold,
    textAlign: 'center',
    marginTop: 8,
  },
  donated: { fontFamily: F.bold, fontSize: 12, lineHeight: 16, color: C.gold },
  guildChips: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: C.hairlineSoft,
  },
  meRow: { borderBottomColor: 'transparent' },
  member: { fontFamily: F.semi, fontSize: 15, lineHeight: 20, color: C.textDim },
  memberMe: { fontFamily: F.black, fontSize: 15, lineHeight: 20, color: C.gold },
});
