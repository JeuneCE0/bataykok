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
  StatGrid,
  StatRow,
  T,
  Well,
} from '../components/ui';
import { formatUntil, nextDailyReset } from '../game/day';
import { fmt } from '../game/formulas';
import { MAX_DODOS_PER_DAY, MAX_MOTIVATION } from '../game/quests';
import { TRANSPORTS } from '../game/transport';
import {
  askNotificationPermission,
  cancelQuestReminder,
  scheduleQuestDone,
} from '../lib/notifications';
import { useT } from '../i18n/useT';
import { useGame } from '../store/gameStore';
import { C, F, TEXT_OUTLINE } from '../theme';

export default function QuestScreen() {
  const t = useT();
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
    // l'affichage est à la seconde : inutile de réveiller l'écran deux fois par seconde
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  if (!player) return null;
  const transport = TRANSPORTS[player.transport];
  // une sauvegarde d'avant `startedAt` retombe sur la durée nominale
  const questDuration = activeQuest
    ? Math.max(
        1,
        Math.round(
          (activeQuest.endsAt - (activeQuest.startedAt ?? activeQuest.endsAt - activeQuest.quest.durationSec * 1000)) /
            1000
        )
      )
    : 1;
  const remaining = activeQuest
    ? Math.max(0, Math.ceil((activeQuest.endsAt - now) / 1000))
    : 0;

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <ScreenTitle
        title={t('quest.title')}
        sub={t('quest.sub')}
      />

      {/* Motivation */}
      <Card>
        <View style={styles.motivHead}>
          <SectionTitle icon="⚡">{t('quest.motivation')}</SectionTitle>
          <Text style={styles.motivValue}>
            {motivation}
            <Text style={styles.motivMax}> / {MAX_MOTIVATION}</Text>
          </Text>
        </View>
        <Bar value={motivation} max={MAX_MOTIVATION} variant="lagoon" height={16} />

        <Text style={styles.refillNote}>
          {motivation >= MAX_MOTIVATION
            ? t('quest.full')
            : t('quest.refillAt', { t: formatUntil(nextDailyReset() - now) })}
        </Text>

        <View style={styles.actions}>
          <Button
            style={styles.action}
            size="sm"
            icon="🍺"
            label={
              dodosToday >= MAX_DODOS_PER_DAY
                ? t('quest.dodoNone')
                : t('quest.dodo', { n: MAX_DODOS_PER_DAY - dodosToday })
            }
            sub={dodosToday >= MAX_DODOS_PER_DAY ? undefined : '🌶️ 1 · +20'}
            onPress={drinkDodo}
            disabled={dodosToday >= MAX_DODOS_PER_DAY || player.piments < 1}
          />
          <Button
            style={styles.action}
            size="sm"
            variant="ember"
            icon="⏫"
            label={t('quest.refill')}
            sub={`🌶️ 5 · +${MAX_MOTIVATION - motivation}`}
            onPress={refillMotivation}
            disabled={player.piments < 5 || motivation >= MAX_MOTIVATION}
          />
        </View>
        <AdButton kind="dodo" full />

        <View style={styles.transportRow}>
          <Text style={styles.transportLabel}>{t('quest.transport')}</Text>
          <Chip
            icon={transport.emoji}
            label={`${transport.name}${
              transport.reduction > 0
                ? ` · −${Math.round(transport.reduction * 100)}%`
                : ''
            }`}
            color={C.mystic}
          />
        </View>
      </Card>

      {activeQuest ? (
        <Card glow={C.gold}>
          <SectionTitle icon="⏳">{t('quest.active')}</SectionTitle>
          <Text style={styles.questTitle}>{t(activeQuest.quest.titleKey)}</Text>
          <Chip
            icon="📍"
            label={t(activeQuest.quest.placeKey)}
            color={C.lagoon}
            style={{ alignSelf: 'flex-start', marginTop: 8 }}
          />
          <Text style={styles.flavor}>{t(activeQuest.quest.flavorKey)}</Text>
          {remaining > 0 ? (
            <>
              <Well style={styles.timerWell}>
                <Text style={styles.timerCap}>{t('quest.timeLeft')}</Text>
                <Text style={styles.countdown}>{formatTime(remaining)}</Text>
                <Bar
                  value={questDuration - remaining}
                  max={questDuration}
                  variant="gold"
                  height={12}
                />
                <Text style={styles.timerSub}>
                  {t('quest.progress', {
                    pct: Math.round(((questDuration - remaining) / questDuration) * 100),
                  })}
                </Text>
              </Well>
              <GhostButton
                label={t('quest.abandon')}
                onPress={() => {
                  cancelQuest();
                  cancelQuestReminder();
                }}
                style={styles.abandon}
              />
            </>
          ) : (
            <Button
              full
              size="lg"
              variant="cane"
              icon="🎁"
              label={t('quest.collect')}
              onPress={() => {
                collectQuest();
                cancelQuestReminder();
              }}
              style={{ marginTop: 8 }}
            />
          )}
        </Card>
      ) : (
        <>
          {lastOutcome && (
            <Card glow={C.cane}>
              <SectionTitle icon="✅">{t('quest.last')}</SectionTitle>
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
                  ...(lastOutcome.key
                    ? [{ icon: '🗝️', value: 'In clé !', color: C.mystic }]
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
                  label={t('quest.doubleReward')}
                />
              )}
            </Card>
          )}

          {quests.map((q, qi) => (
            <FadeIn key={q.id} index={qi}>
            <Card>
              <View style={styles.questHead}>
                <Text style={styles.questTitle}>{t(q.titleKey)}</Text>
                <Chip icon="📍" label={t(q.placeKey)} color={C.lagoon} />
              </View>
              <Text style={styles.flavor}>{t(q.flavorKey)}</Text>
              <StatGrid
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
                {t('quest.perMinute', {
                  n: Math.round(
                    (q.gold / Math.max(1, q.durationSec * (1 - transport.reduction))) * 60
                  ),
                })}
              </Text>
              <Button
                full
                label={t('quest.go')}
                onPress={async () => {
                  startQuest(q);
                  await askNotificationPermission();
                  scheduleQuestDone(
                    Math.round(q.durationSec * (1 - transport.reduction)),
                    t(q.titleKey)
                  );
                }}
                disabled={motivation < q.motivationCost}
              />
            </Card>
            </FadeIn>
          ))}

          <GhostButton
            icon="🔄"
            label={t('quest.reroll')}
            onPress={rerollQuests}
            style={{ alignSelf: 'center', marginTop: 8 }}
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
  content: { padding: 12, paddingBottom: 32 },
  motivHead: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  motivValue: {
    fontFamily: F.black,
    fontSize: 20,
    lineHeight: 26,
    color: C.lagoon,
    marginBottom: 8,
  },
  motivMax: { fontFamily: F.semi, fontSize: 13, color: C.textDim },
  empty: {
    marginTop: 12,
    padding: 12,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255,90,31,0.35)',
    backgroundColor: 'rgba(255,90,31,0.10)',
    gap: 4,
  },
  emptyTitle: { fontFamily: F.black, fontSize: 15, lineHeight: 20, color: C.ember },
  emptyText: {
    fontFamily: F.regular,
    fontSize: 13,
    lineHeight: 17,
    color: C.textDim,
  },
  refillNote: {
    fontFamily: F.semi,
    fontSize: 12,
    lineHeight: 16,
    color: C.textFaint,
    textAlign: 'center',
    marginTop: 8,
  },
  // deux boutons de largeur égale : l'un ne doit pas écraser l'autre selon la
  // longueur de son libellé
  actions: { flexDirection: 'row', gap: 8, marginTop: 8, marginBottom: 8 },
  action: { flex: 1, alignSelf: 'auto' },
  transportRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: C.hairlineSoft,
  },
  transportLabel: {
    fontFamily: F.black,
    fontSize: 11,
    letterSpacing: 0.9,
    textTransform: 'uppercase',
    color: C.textFaint,
  },
  timerWell: { alignItems: 'center', gap: 8, paddingVertical: 16 },
  timerCap: {
    fontFamily: F.black,
    fontSize: 11,
    letterSpacing: 1.1,
    textTransform: 'uppercase',
    color: C.textFaint,
    includeFontPadding: false,
  },
  timerSub: {
    fontFamily: F.semi,
    fontSize: 12,
    lineHeight: 16,
    color: C.textDim,
    textAlign: 'center',
  },
  abandon: { alignSelf: 'center', marginTop: 12 },
  questHead: { gap: 8, alignItems: 'flex-start' },
  questTitle: { fontFamily: F.black, fontSize: 20, lineHeight: 26, color: C.text },
  flavor: {
    fontFamily: F.regular,
    fontSize: 13,
    color: C.textDim,
    marginVertical: 8,
    lineHeight: 21,
  },
  countdown: {
    fontFamily: F.black,
    ...TEXT_OUTLINE,
    fontSize: 31,
    lineHeight: 41,
    color: C.gold,
    letterSpacing: 1,
  },
  levelUp: { ...T.body, fontFamily: F.black, color: C.gold, marginTop: 8 },
  yield: {
    fontFamily: F.bold,
    fontSize: 12,
    lineHeight: 16,
    color: C.cane,
    textAlign: 'center',
    marginTop: 8,
    marginBottom: 12,
  },
});
