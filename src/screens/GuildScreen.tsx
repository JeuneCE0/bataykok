import React from 'react';
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
import {
  GUILD_GOLD_BONUS_PER_LEVEL,
  GUILD_XP_BONUS_PER_LEVEL,
  GUILDS,
  guildUpgradeCost,
} from '../game/guilds';
import { useGame } from '../store/gameStore';
import { C, F, R } from '../theme';

export default function GuildScreen() {
  const player = useGame((s) => s.player);
  const guildLevel = useGame((s) => s.guildLevel);
  const joinGuild = useGame((s) => s.joinGuild);
  const leaveGuild = useGame((s) => s.leaveGuild);
  const donateGuild = useGame((s) => s.donateGuild);

  if (!player) return null;
  const myGuild = GUILDS.find((g) => g.id === player.guildId);

  if (myGuild) {
    const cost = guildUpgradeCost(guildLevel);
    return (
      <ScrollView style={styles.root} contentContainerStyle={styles.content}>
        <View style={styles.crest}>
          <Text style={styles.crestEmblem}>{myGuild.emblem}</Text>
        </View>
        <ScreenTitle title={myGuild.name} sub={`« ${myGuild.motto} »`} />

        <Card glow={C.gold}>
          <SectionTitle icon="⭐">Niveau de l'écurie</SectionTitle>
          <View style={styles.levelRow}>
            <Text style={styles.guildLevel}>{guildLevel}</Text>
            <View style={{ flex: 1, gap: 8 }}>
              <BonusLine
                icon="✨"
                label="Bonus XP en quête"
                value={`+${guildLevel * GUILD_XP_BONUS_PER_LEVEL}%`}
                color={C.mystic}
                pct={Math.min(1, (guildLevel * GUILD_XP_BONUS_PER_LEVEL) / 100)}
                variant="mystic"
              />
              <BonusLine
                icon="🌽"
                label="Bonus grains en quête"
                value={`+${guildLevel * GUILD_GOLD_BONUS_PER_LEVEL}%`}
                color={C.gold}
                pct={Math.min(1, (guildLevel * GUILD_GOLD_BONUS_PER_LEVEL) / 100)}
                variant="gold"
              />
            </View>
          </View>
          <Button
            full
            style={{ marginTop: 14 }}
            icon="🔨"
            label={`Améliorer l'écurie · 🌽${fmt(cost)}`}
            onPress={() => donateGuild(cost)}
            disabled={player.grains < cost}
          />
        </Card>

        <Card>
          <SectionTitle icon="🐓">Membres</SectionTitle>
          <View style={[styles.memberRow, styles.meRow]}>
            <Text style={styles.memberMe}>🐓 {player.name}</Text>
            <Chip label="ou !" color={C.gold} active />
          </View>
          {myGuild.members.map((m) => (
            <View key={m} style={styles.memberRow}>
              <Text style={styles.member}>🐔 {m}</Text>
            </View>
          ))}
        </Card>

        <GhostButton
          label="Quitter l'écurie"
          onPress={leaveGuild}
          style={{ alignSelf: 'center', marginTop: 6 }}
        />
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <ScreenTitle
        title="Les Écuries"
        sub="Rejoins in n'écurie ptu reçoisr des bonus XP et grains !"
      />
      {GUILDS.map((g, gi) => (
        <FadeIn key={g.id} index={gi}>
        <Card>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
            <View style={styles.emblemBox}>
              <Text style={{ fontSize: 26 }}>{g.emblem}</Text>
            </View>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={styles.guildName}>{g.name}</Text>
              <Text style={styles.motto}>« {g.motto} »</Text>
              <Chip
                label={`${g.members.length + 1} membres`}
                color={C.lagoon}
                style={{ alignSelf: 'flex-start' }}
              />
            </View>
          </View>
          <Text style={styles.members} numberOfLines={1}>
            {g.members.slice(0, 3).join(' · ')}…
          </Text>
          <Button full label="Rejoindre" onPress={() => joinGuild(g.id)} />
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
  content: { padding: 14, paddingBottom: 40 },
  crest: { alignItems: 'center', marginTop: 6 },
  crestEmblem: {
    fontSize: 46,
    textShadowColor: 'rgba(255,201,60,0.5)',
    textShadowRadius: 20,
  },
  levelRow: { flexDirection: 'row', alignItems: 'center', gap: 14 },
  guildLevel: {
    fontFamily: F.black,
    fontSize: 44,
    color: C.gold,
    textShadowColor: 'rgba(255,201,60,0.45)',
    textShadowRadius: 16,
  },
  bonusHead: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  bonusLabel: { fontFamily: F.semi, fontSize: 13.5, lineHeight: 18, color: C.textDim },
  bonusValue: { fontFamily: F.black, fontSize: 15.5, lineHeight: 20 },
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
  guildName: { fontFamily: F.black, fontSize: 19, lineHeight: 25, color: C.text },
  motto: {
    fontFamily: F.regular,
    fontStyle: 'italic',
    fontSize: 13.5,
    lineHeight: 19,
    color: C.textDim,
  },
  members: { ...T.tiny, color: C.textFaint, marginVertical: 10 },
  memberRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: C.hairlineSoft,
  },
  meRow: { borderBottomColor: 'transparent' },
  member: { fontFamily: F.semi, fontSize: 14.5, lineHeight: 20, color: C.textDim },
  memberMe: { fontFamily: F.black, fontSize: 15, lineHeight: 20, color: C.gold },
});
