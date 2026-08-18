import React, { useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import AdButton from '../components/AdButton';
import FadeIn from '../components/FadeIn';
import {
  Bar,
  Button,
  Card,
  Chip,
  GhostButton,
  ScreenTitle,
  SectionTitle,
  StatRow,
  T,
  Well,
} from '../components/ui';
import { fmt } from '../game/formulas';
import { MAX_DODOS_PER_DAY, MAX_MOTIVATION } from '../game/quests';
import { TRANSPORTS } from '../game/transport';
import {
  askNotificationPermission,
  cancelQuestReminder,
  scheduleQuestDone,
} from '../lib/notifications';
import { useGame } from '../store/gameStore';
import { C, F } from '../theme';

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
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <ScreenTitle
        title="Chez Mémé Zizine"
        sub="Le snack-bar des koks batayeurs — quêtes péi"
      />

      {/* Motivation */}
      <Card>
        <View style={styles.motivHead}>
          <SectionTitle icon="⚡">Motivation</SectionTitle>
          <Text style={styles.motivValue}>
            {motivation}
            <Text style={styles.motivMax}> / {MAX_MOTIVATION}</Text>
          </Text>
        </View>
        <Bar value={motivation} max={MAX_MOTIVATION} variant="lagoon" height={16} />
        <View style={styles.actions}>
          <Button
            size="sm"
            icon="🍺"
            label={`Dodo fraîche 🌶️1 · ${dodosToday}/${MAX_DODOS_PER_DAY}`}
            onPress={drinkDodo}
            disabled={dodosToday >= MAX_DODOS_PER_DAY || player.piments < 1}
          />
          <Button
            size="sm"
            variant="ember"
            label="Plein 🌶️5"
            onPress={refillMotivation}
            disabled={player.piments < 5 || motivation >= MAX_MOTIVATION}
          />
        </View>
        <AdButton kind="dodo" full />
        <View style={styles.transportRow}>
          <Chip
            label={`${transport.emoji} ${transport.name}${
              transport.reduction > 0
                ? ` · −${Math.round(transport.reduction * 100)}% durée`
                : ''
            }`}
            color={C.mystic}
          />
        </View>
      </Card>

      {activeQuest ? (
        <Card glow={C.gold}>
          <SectionTitle icon="⏳">Quête en cours</SectionTitle>
          <Text style={styles.questTitle}>{activeQuest.quest.title}</Text>
          <Chip
            label={`📍 ${activeQuest.quest.place}`}
            color={C.lagoon}
            style={{ alignSelf: 'flex-start', marginTop: 6 }}
          />
          <Text style={styles.flavor}>{activeQuest.quest.flavor}</Text>
          {remaining > 0 ? (
            <>
              <Well style={{ alignItems: 'center', gap: 8 }}>
                <Text style={styles.countdown}>{formatTime(remaining)}</Text>
                <Bar
                  value={activeQuest.quest.durationSec - remaining}
                  max={activeQuest.quest.durationSec}
                  variant="gold"
                  height={12}
                />
              </Well>
              <GhostButton
                label="Abandonner"
                onPress={() => {
                  cancelQuest();
                  cancelQuestReminder();
                }}
                style={{ marginTop: 10 }}
              />
            </>
          ) : (
            <Button
              full
              size="lg"
              variant="cane"
              icon="🎁"
              label="Récupérer la récompense !"
              onPress={() => {
                collectQuest();
                cancelQuestReminder();
              }}
              style={{ marginTop: 6 }}
            />
          )}
        </Card>
      ) : (
        <>
          {lastOutcome && (
            <Card glow={C.cane}>
              <SectionTitle icon="✅">Dernière quête</SectionTitle>
              <StatRow
                items={[
                  { icon: '🌽', value: `+${fmt(lastOutcome.gold)}`, color: C.gold },
                  { icon: '✨', value: `+${fmt(lastOutcome.xp)} XP`, color: C.mystic },
                  ...(lastOutcome.piments > 0
                    ? [{ icon: '🌶️', value: `+${lastOutcome.piments}`, color: C.piment }]
                    : []),
                  ...(lastOutcome.item
                    ? [{ icon: '🎁', value: lastOutcome.item.name, color: C.text }]
                    : []),
                ]}
              />
              {lastOutcome.levelsGained > 0 && (
                <Text style={styles.levelUp}>
                  🎉 NIVEAU {player.level} ! Bravo ti kok !
                </Text>
              )}
              {!lastOutcome.doubled && (
                <AdButton
                  kind="double"
                  full
                  label="Doubler cette récompense"
                />
              )}
            </Card>
          )}

          {quests.map((q, qi) => (
            <FadeIn key={q.id} index={qi}>
            <Card>
              <View style={styles.questHead}>
                <Text style={styles.questTitle}>{q.title}</Text>
                <Chip label={`📍 ${q.place}`} color={C.lagoon} />
              </View>
              <Text style={styles.flavor}>{q.flavor}</Text>
              <StatRow
                style={{ marginBottom: 8 }}
                items={[
                  {
                    icon: '⏱️',
                    value: formatTime(Math.round(q.durationSec * (1 - transport.reduction))),
                  },
                  { icon: '⚡', value: `${q.motivationCost}`, color: C.lagoon },
                  { icon: '🌽', value: fmt(q.gold), color: C.gold },
                  { icon: '✨', value: `${fmt(q.xp)} XP`, color: C.mystic },
                ]}
              />
              <Text style={styles.yield}>
                {Math.round(
                  (q.gold / Math.max(1, q.durationSec * (1 - transport.reduction))) * 60
                )}{' '}
                🌽 par minute
              </Text>
              <Button
                full
                label="Partir en quête"
                onPress={async () => {
                  startQuest(q);
                  await askNotificationPermission();
                  scheduleQuestDone(
                    Math.round(q.durationSec * (1 - transport.reduction)),
                    q.title
                  );
                }}
                disabled={motivation < q.motivationCost}
              />
            </Card>
            </FadeIn>
          ))}

          <GhostButton
            icon="🔄"
            label="Autres quêtes"
            onPress={rerollQuests}
            style={{ alignSelf: 'center', marginTop: 6 }}
          />
        </>
      )}
    </ScrollView>
  );
}

function formatTime(sec: number): string {
  if (sec < 60) return `${sec} s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return s === 0 ? `${m} min` : `${m} min ${String(s).padStart(2, '0')}`;
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 14, paddingBottom: 40 },
  motivHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  motivValue: {
    fontFamily: F.black,
    fontSize: 20,
    lineHeight: 26,
    color: C.lagoon,
    marginBottom: 8,
  },
  motivMax: { fontFamily: F.semi, fontSize: 13, color: C.textDim },
  actions: { flexDirection: 'row', gap: 8, marginTop: 12, flexWrap: 'wrap' },
  transportRow: { flexDirection: 'row', marginTop: 12 },
  questHead: { gap: 8, alignItems: 'flex-start' },
  questTitle: { fontFamily: F.black, fontSize: 19, lineHeight: 25, color: C.text },
  flavor: {
    fontFamily: F.regular,
    fontSize: 14,
    color: C.textDim,
    marginVertical: 10,
    lineHeight: 21,
  },
  countdown: {
    fontFamily: F.black,
    fontSize: 34,
    lineHeight: 42,
    color: C.gold,
    letterSpacing: 1,
  },
  levelUp: { ...T.body, fontFamily: F.black, color: C.gold, marginTop: 8 },
  yield: {
    fontFamily: F.bold,
    fontSize: 12.5,
    lineHeight: 17,
    color: C.cane,
    marginBottom: 12,
  },
});
