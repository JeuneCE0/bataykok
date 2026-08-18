import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Bar, COLORS, GoldButton, Panel, Subtitle, Title } from '../components/ui';
import { fmt } from '../game/formulas';
import { MAX_DODOS_PER_DAY, MAX_MOTIVATION } from '../game/quests';
import { TRANSPORTS } from '../game/transport';
import { useGame } from '../store/gameStore';

export default function QuestScreen() {
  const player = useGame((s) => s.player);
  const quests = useGame((s) => s.quests);
  const activeQuest = useGame((s) => s.activeQuest);
  const motivation = useGame((s) => s.motivation);
  const dodosToday = useGame((s) => s.dodosToday);
  const startQuest = useGame((s) => s.startQuest);
  const collectQuest = useGame((s) => s.collectQuest);
  const cancelQuest = useGame((s) => s.cancelQuest);
  const rerollQuests = useGame((s) => s.rerollQuests);
  const drinkDodo = useGame((s) => s.drinkDodo);
  const refillMotivation = useGame((s) => s.refillMotivation);
  const lastOutcome = useGame((s) => s.lastOutcome);

  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, []);

  if (!player) return null;
  const transport = TRANSPORTS[player.transport];
  const remaining = activeQuest
    ? Math.max(0, Math.ceil((activeQuest.endsAt - now) / 1000))
    : 0;

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ paddingBottom: 40 }}>
      <Title>Chez Mémé Zizine</Title>
      <Subtitle>Le snack-bar des koks batayeurs — quêtes péi</Subtitle>

      <Panel>
        <Text style={styles.motivLabel}>
          ⚡ Motivation : {motivation}/{MAX_MOTIVATION}
        </Text>
        <Bar value={motivation} max={MAX_MOTIVATION} color={COLORS.blue} />
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
          <GoldButton
            small
            label={`🍺 Dodo fraîche (🌶️1) ${dodosToday}/${MAX_DODOS_PER_DAY}`}
            onPress={drinkDodo}
            disabled={dodosToday >= MAX_DODOS_PER_DAY || player.piments < 1}
          />
          <GoldButton
            small
            color="#e67e22"
            label="Plein (🌶️5)"
            onPress={refillMotivation}
            disabled={player.piments < 5 || motivation >= MAX_MOTIVATION}
          />
        </View>
        <Text style={styles.transport}>
          {transport.emoji} Transport : {transport.name}
          {transport.reduction > 0
            ? ` (-${Math.round(transport.reduction * 100)}% de durée)`
            : ''}
        </Text>
      </Panel>

      {activeQuest ? (
        <Panel style={{ borderColor: COLORS.gold }}>
          <Text style={styles.questTitle}>⏳ {activeQuest.quest.title}</Text>
          <Text style={styles.place}>📍 {activeQuest.quest.place}</Text>
          <Text style={styles.flavor}>{activeQuest.quest.flavor}</Text>
          {remaining > 0 ? (
            <>
              <Bar
                value={activeQuest.quest.durationSec - remaining}
                max={activeQuest.quest.durationSec}
                color={COLORS.green}
                label={`${remaining}s restantes`}
                height={20}
              />
              <View style={{ marginTop: 10 }}>
                <GoldButton small color="#7f8c8d" label="Abandonner" onPress={cancelQuest} />
              </View>
            </>
          ) : (
            <GoldButton label="🎁 Récupérer la récompense !" onPress={() => collectQuest()} />
          )}
        </Panel>
      ) : (
        <>
          {lastOutcome && (
            <Panel style={{ borderColor: COLORS.green }}>
              <Text style={styles.outcome}>
                ✅ Dernière quête : +🌽{fmt(lastOutcome.gold)} · +{fmt(lastOutcome.xp)} XP
                {lastOutcome.piments > 0 ? ` · +🌶️${lastOutcome.piments}` : ''}
                {lastOutcome.item ? ` · 🎁 ${lastOutcome.item.name}` : ''}
                {lastOutcome.levelsGained > 0
                  ? `\n🎉 NIVEAU ${player.level} ! Bravo ti kok !`
                  : ''}
              </Text>
            </Panel>
          )}
          {quests.map((q) => (
            <Panel key={q.id}>
              <Text style={styles.questTitle}>{q.title}</Text>
              <Text style={styles.place}>📍 {q.place}</Text>
              <Text style={styles.flavor}>{q.flavor}</Text>
              <Text style={styles.rewards}>
                ⏱️ {Math.round(q.durationSec * (1 - transport.reduction))}s · ⚡
                {q.motivationCost} · 🌽{fmt(q.gold)} · ✨{fmt(q.xp)} XP
              </Text>
              <GoldButton
                small
                label="Partir en quête"
                onPress={() => startQuest(q)}
                disabled={motivation < q.motivationCost}
              />
            </Panel>
          ))}
          <GoldButton small color="#7f8c8d" label="🔄 Autres quêtes" onPress={rerollQuests} />
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg, padding: 14 },
  motivLabel: { color: COLORS.text, fontWeight: '800', marginBottom: 6 },
  transport: { color: COLORS.textDim, fontSize: 12, marginTop: 10 },
  questTitle: { color: COLORS.gold, fontWeight: '900', fontSize: 16 },
  place: { color: COLORS.text, fontSize: 12, marginTop: 2, fontWeight: '700' },
  flavor: { color: COLORS.textDim, fontSize: 12, fontStyle: 'italic', marginVertical: 6 },
  rewards: { color: COLORS.text, fontSize: 12, marginBottom: 8 },
  outcome: { color: COLORS.text, fontSize: 13, fontWeight: '700', lineHeight: 20 },
});
