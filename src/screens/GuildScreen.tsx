import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { COLORS, GoldButton, Panel, Subtitle, Title } from '../components/ui';
import { fmt } from '../game/formulas';
import {
  GUILD_GOLD_BONUS_PER_LEVEL,
  GUILD_XP_BONUS_PER_LEVEL,
  GUILDS,
  guildUpgradeCost,
} from '../game/guilds';
import { useGame } from '../store/gameStore';

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
      <ScrollView style={styles.root} contentContainerStyle={{ paddingBottom: 40 }}>
        <Title>
          {myGuild.emblem} {myGuild.name}
        </Title>
        <Subtitle>« {myGuild.motto} »</Subtitle>

        <Panel style={{ borderColor: COLORS.gold }}>
          <Text style={styles.bonusTitle}>Niveau de l'écurie : {guildLevel}</Text>
          <Text style={styles.bonus}>
            ✨ Bonus XP : +{guildLevel * GUILD_XP_BONUS_PER_LEVEL}% sur les quêtes
          </Text>
          <Text style={styles.bonus}>
            🌽 Bonus grains : +{guildLevel * GUILD_GOLD_BONUS_PER_LEVEL}% sur les quêtes
          </Text>
          <View style={{ marginTop: 10 }}>
            <GoldButton
              small
              label={`Améliorer l'écurie (🌽${fmt(cost)})`}
              onPress={() => donateGuild(cost)}
              disabled={player.grains < cost}
            />
          </View>
        </Panel>

        <Panel>
          <Text style={styles.bonusTitle}>Membres</Text>
          <View style={styles.memberRow}>
            <Text style={styles.memberMe}>🐓 {player.name} (ou !)</Text>
          </View>
          {myGuild.members.map((m) => (
            <View key={m} style={styles.memberRow}>
              <Text style={styles.member}>🐔 {m}</Text>
            </View>
          ))}
        </Panel>

        <GoldButton small color="#7f8c8d" label="Quitter l'écurie" onPress={leaveGuild} />
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ paddingBottom: 40 }}>
      <Title>Les Écuries</Title>
      <Subtitle>
        Rejoins in n'écurie de koks pou gagner des bonus XP et grains !
      </Subtitle>
      {GUILDS.map((g) => (
        <Panel key={g.id}>
          <Text style={styles.guildName}>
            {g.emblem} {g.name}
          </Text>
          <Text style={styles.motto}>« {g.motto} »</Text>
          <Text style={styles.members}>
            {g.members.length + 1} membres · {g.members.slice(0, 3).join(', ')}...
          </Text>
          <GoldButton small label="Rejoindre" onPress={() => joinGuild(g.id)} />
        </Panel>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg, padding: 14 },
  guildName: { color: COLORS.gold, fontWeight: '900', fontSize: 17 },
  motto: { color: COLORS.textDim, fontStyle: 'italic', fontSize: 12, marginVertical: 4 },
  members: { color: COLORS.text, fontSize: 12, marginBottom: 8 },
  bonusTitle: { color: COLORS.gold, fontWeight: '900', fontSize: 15, marginBottom: 6 },
  bonus: { color: COLORS.text, fontSize: 13, marginTop: 3 },
  memberRow: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.07)',
  },
  member: { color: COLORS.text, fontSize: 13 },
  memberMe: { color: COLORS.gold, fontSize: 13, fontWeight: '800' },
});
