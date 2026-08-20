import React, { useEffect, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import AdButton from '../components/AdButton';
import CombatView from '../components/CombatView';
import FadeIn from '../components/FadeIn';
import RewardOverlay, { RewardView } from '../components/RewardOverlay';
import Rooster from '../components/Rooster';
import {
  Button,
  Card,
  Chip,
  ScreenTitle,
  SectionTitle,
  Segmented,
  T,
  Well,
} from '../components/ui';
import { botToFighter, generateLadder } from '../game/bots';
import { CLASSES } from '../game/classes';
import { RARITY_COLORS } from '../game/items';
import { simulateCombat } from '../game/combat';
import { fmt, playerToFighter } from '../game/formulas';
import { fighterPower } from '../game/power';
import { BatayReward } from '../game/rewards';
import { Bot, CombatResult, Fighter } from '../game/types';
import { scheduleArenaReady } from '../lib/notifications';
import {
  fetchRivals,
  isOnlineEnabled,
  OnlineKok,
  onlineToFighter,
  submitResult,
} from '../lib/online';
import { TransKey } from '../i18n';
import { useT } from '../i18n/useT';
import { maxArenaTickets, useGame } from '../store/gameStore';
import { C, F, R } from '../theme';
import RankingScreen from './RankingScreen';
import HonorTier from '../components/HonorTier';
import { localDay } from '../game/day';
import { eventCombatMods, eventOfDay } from '../game/events';
import FriendDuel from '../components/FriendDuel';

const LADDER = generateLadder();
const ARENA_TICKET_SEC = 120;

function formatSec(sec: number): string {
  if (sec <= 0) return 'maintenant';
  if (sec < 60) return `${sec} s`;
  return `${Math.floor(sec / 60)} min ${String(sec % 60).padStart(2, '0')}`;
}

/** Lecture immédiate du rapport de force, pour choisir sa cible. */
function odds(mine: number, theirs: number): { key: TransKey; color: string } {
  const r = theirs > 0 ? mine / theirs : 2;
  if (r >= 1.25) return { key: 'rond.odds.easy', color: C.cane };
  if (r >= 0.95) return { key: 'rond.odds.even', color: C.gold };
  if (r >= 0.75) return { key: 'rond.odds.hard', color: C.ember };
  return { key: 'rond.odds.brutal', color: C.piment };
}

export default function ArenaScreen() {
  const t = useT();
  const player = useGame((s) => s.player);
  const ladderOrder = useGame((s) => s.ladderOrder);
  const arenaTickets = useGame((s) => s.arenaTickets);
  const nextTicketAt = useGame((s) => s.nextTicketAt);
  const regenTickets = useGame((s) => s.regenTickets);
  const applyArenaResult = useGame((s) => s.applyArenaResult);
  const buyArenaTicket = useGame((s) => s.buyArenaTicket);

  const [now, setNow] = useState(Date.now());
  const [view, setView] = useState<'batay' | 'palmares'>('batay');
  const [rivals, setRivals] = useState<OnlineKok[]>([]);
  const onlineState = useGame((s) => s.onlineState);
  const [fight, setFight] = useState<{
    me: Fighter;
    op: Fighter;
    opId: string;
    result: CombatResult;
    /** id du joueur réel affronté, le cas échéant */
    onlineId?: string;
  } | null>(null);
  const [reward, setReward] = useState<RewardView | null>(null);

  useEffect(() => {
    // affichage à la seconde ; la régénération des jetons n'a pas besoin
    // d'être plus fine non plus
    const t = setInterval(() => {
      setNow(Date.now());
      regenTickets();
    }, 1000);
    return () => clearInterval(t);
  }, [regenTickets]);

  // Les adversaires réels ne se chargent qu'une fois le snapshot publié :
  // interroger le classement avant que la session soit prête renvoyait une
  // liste vide, définitivement (l'effet ne tournait qu'au montage).
  useEffect(() => {
    if (!isOnlineEnabled || onlineState !== 'ok') return;
    let alive = true;
    void fetchRivals(3).then((r) => {
      if (alive) setRivals(r);
    });
    return () => {
      alive = false;
    };
  }, [onlineState]);

  if (!player) return null;

  if (fight) {
    return (
      <CombatView
        me={fight.me}
        op={fight.op}
        result={fight.result}
        onDone={() => {
          const won = fight.result.winner === 0;
          if (fight.onlineId) void submitResult(fight.onlineId, won);
          const r = applyArenaResult(won, fight.opId, {
            myPower: fighterPower(fight.me),
            opPower: fighterPower(fight.op),
            online: Boolean(fight.onlineId),
            opponentName: fight.op.name,
            opponentLevel: fight.op.level,
          });
          if (useGame.getState().arenaTickets === 0) {
            scheduleArenaReady(ARENA_TICKET_SEC);
          }
          setReward({
            won,
            title: won ? '🏆 VIKTOIR !' : '💀 DÉFÈT…',
            gold: r.gold,
            xp: r.xp,
            honor: r.honor,
            parts: r.parts,
            levels: r.levels,
            itemName: r.item?.name ?? null,
            itemColor: r.item ? RARITY_COLORS[r.item.rarity] : undefined,
            note: won
              ? r.streak >= 2
                ? `🔥 ${r.streak} victoires d’affilée`
                : null
              : 'Ton kok a pris un coup, mais il a appris. Entraîne-le !',
          });
          setFight(null);
        }}
      />
    );
  }

  const dayEvent = eventOfDay(new Date().toISOString().slice(0, 10));
  const maxTickets = maxArenaTickets(
    player.talents,
    dayEvent.kind === 'batay' ? 2 : 0
  );
  const refill = Math.max(0, Math.ceil((nextTicketAt - now) / 1000));
  const myIdx = ladderOrder.indexOf('me');
  const botById = new Map(LADDER.map((b) => [b.id, b]));
  const targets: Bot[] = [];
  for (let i = myIdx - 1; i >= 0 && targets.length < 3; i--) {
    const b = botById.get(ladderOrder[i]);
    if (b) targets.push(b);
  }

  const myPower = fighterPower(playerToFighter(player));

  const launchOnline = (k: OnlineKok) => {
    if (useGame.getState().arenaTickets <= 0) return;
    const me = playerToFighter(player);
    const op = onlineToFighter(k);
    setReward(null);
    setFight({
      me,
      op,
      // le classement local ne connaît pas les joueurs réels : aucun rang à échanger
      opId: 'online',
      onlineId: k.id,
      result: simulateCombat(me, op, eventCombatMods(eventOfDay(localDay()))),
    });
  };

  const launch = (bot: Bot) => {
    if (useGame.getState().arenaTickets <= 0) return;
    const me = playerToFighter(player);
    const op = botToFighter(bot);
    setReward(null);
    setFight({
      me,
      op,
      opId: bot.id,
      result: simulateCombat(me, op, eventCombatMods(eventOfDay(localDay()))),
    });
  };

  if (view === 'palmares') {
    return (
      <View style={{ flex: 1 }}>
        <Segmented
          value={view}
          onChange={setView}
          options={[
            { id: 'batay', label: `⚔️  ${t('rond.tab.fight')}` },
            { id: 'palmares', label: `🏆  ${t('rond.tab.ranking')}` },
          ]}
        />
        <RankingScreen
          onChallenge={(botId) => {
            const bot = LADDER.find((b) => b.id === botId);
            if (!bot) return;
            setView('batay');
            launch(bot);
          }}
        />
      </View>
    );
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <Segmented
        value={view}
        onChange={setView}
        options={[
          { id: 'batay', label: `⚔️  ${t('rond.tab.fight')}` },
          { id: 'palmares', label: `🏆  ${t('rond.tab.ranking')}` },
        ]}
      />
      <ScreenTitle
        title={t('rond.title')}
        sub={t('rond.sub')}
        accent={C.ember}
      />

      <RewardOverlay reward={reward} onClose={() => setReward(null)} />

      <HonorTier />
      <View style={styles.rankBanner}>
        <Chip label={t('rond.myRank', { n: myIdx + 1 })} color={C.gold} active />
        <Chip label={t('rond.honor', { n: player.honor })} color={C.mystic} />
      </View>

      <FriendDuel onDuel={launchOnline} />

      <Card compact>
        <View style={styles.ticketRow}>
          <View style={{ flexDirection: 'row', gap: 8 }}>
            {Array.from({ length: maxTickets }, (_, i) => (
              <View
                key={i}
                style={[
                  styles.ticket,
                  i < arenaTickets ? styles.ticketOn : styles.ticketOff,
                ]}
              >
                <Text style={{ fontSize: 17, opacity: i < arenaTickets ? 1 : 0.3 }}>
                  ⚔️
                </Text>
              </View>
            ))}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.ticketTitle}>
              {arenaTickets > 0
                ? t('rond.ticketsLeft', { n: arenaTickets })
                : t('rond.noFight')}
            </Text>
            <Text style={styles.ticketSub}>
              {arenaTickets >= maxTickets
                ? t('rond.ticketsFull')
                : arenaTickets === 0
                  ? t('rond.nextTicketOr', { t: formatSec(refill) })
                  : t('rond.nextTicket', { t: formatSec(refill) })}
            </Text>
          </View>
        </View>
      </Card>

      {arenaTickets <= 0 ? (
        <Card>
          <Text style={styles.cooldownLabel}>😤 {t('rond.catchBreath')}</Text>
          <Well style={{ alignItems: 'center' }}>
            <Text style={styles.cooldownTime}>{formatSec(refill)}</Text>
          </Well>
          <View style={{ gap: 8, marginTop: 12 }}>
            <AdButton kind="arena" full label={t('rond.adFight')} />
            <Button
              variant="piment"
              size="sm"
              icon="⏩"
              label={t('rond.instantTicket')}
              sub="🌶️ 1"
              onPress={buyArenaTicket}
              disabled={player.piments < 1}
            />
          </View>
        </Card>
      ) : targets.length === 0 ? (
        <Card glow={C.gold}>
          <Text style={styles.rewardTitle}>👑 {t('rond.numberOne')}</Text>
          <Text style={T.body}>{t('rond.numberOneSub')}</Text>
        </Card>
      ) : (
        targets.map((bot, bi) => {
          const rank = ladderOrder.indexOf(bot.id) + 1;
          const cls = CLASSES[bot.classId];
          const chance = odds(myPower, fighterPower(botToFighter(bot)));
          return (
            <FadeIn key={bot.id} index={bi}>
            <Card compact>
              <View style={styles.opRow}>
                <View style={styles.opPortrait}>
                  <View style={[styles.opHalo, { backgroundColor: cls.color }]} />
                  <Rooster appearance={bot.appearance} size={78} flip ground={false} />
                  <View style={styles.rankBadge}>
                    <Text style={styles.rankBadgeText}>#{rank}</Text>
                  </View>
                </View>
                <View style={{ flex: 1, gap: 4 }}>
                  <Text style={styles.opName} numberOfLines={1}>
                    {bot.name}
                  </Text>
                  <View style={{ flexDirection: 'row', gap: 4, flexWrap: 'wrap' }}>
                    <Chip icon={cls.emoji} label={cls.name} color={cls.color} />
                    <Chip label={`Niv. ${bot.level}`} color={C.textDim} />
                    <Chip label={t(chance.key)} color={chance.color} active />
                  </View>
                </View>
                <Button
                  variant="ember"
                  size="sm"
                  icon="⚔️"
                  label={t('rond.fight')}
                  onPress={() => launch(bot)}
                  disabled={arenaTickets <= 0}
                />
              </View>
            </Card>
            </FadeIn>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 12, paddingBottom: 32 },
  rankBanner: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'center',
    marginBottom: 8,
  },
  ticketRow: { flexDirection: 'row', alignItems: 'center', gap: 12 },
  ticket: {
    width: 36,
    height: 36,
    borderRadius: R.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ticketOn: {
    borderColor: C.ember,
    backgroundColor: 'rgba(255,90,31,0.16)',
  },
  ticketOff: {
    borderColor: C.hairlineSoft,
    backgroundColor: 'rgba(6,3,12,0.4)',
  },
  ticketTitle: { fontFamily: F.black, fontSize: 15, lineHeight: 20, color: C.text },
  ticketSub: { fontFamily: F.semi, fontSize: 12, lineHeight: 16, color: C.textDim },
  rewardTitle: {
    fontFamily: F.black,
    fontSize: 20,
    lineHeight: 26,
    color: C.gold,
    marginBottom: 4,
  },
  cooldownLabel: {
    fontFamily: F.bold,
    fontSize: 15,
    lineHeight: 20,
    color: C.text,
    marginBottom: 8,
  },
  cooldownTime: { fontFamily: F.black, fontSize: 31, lineHeight: 41, color: C.ember },
  opRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  opPortrait: { width: 78, height: 78, alignItems: 'center', justifyContent: 'center' },
  opHalo: {
    position: 'absolute',
    width: 64,
    height: 64,
    borderRadius: 32,
    opacity: 0.16,
  },
  rankBadge: {
    position: 'absolute',
    bottom: -2,
    left: -2,
    backgroundColor: 'rgba(6,3,12,0.9)',
    borderRadius: R.pill,
    borderWidth: 1,
    borderColor: C.hairline,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  rankBadgeText: {
    fontFamily: F.black,
    fontSize: 11,
    lineHeight: 15,
    color: C.gold,
    includeFontPadding: false,
    textAlign: 'center',
  },
  opName: { fontFamily: F.black, fontSize: 17, lineHeight: 22, color: C.text },
  gainRow: { flexDirection: 'row', gap: 16, flexWrap: 'wrap', marginBottom: 8 },
  gain: { fontFamily: F.black, fontSize: 15, lineHeight: 20, color: C.text },
  bonusRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  levelUp: { fontFamily: F.black, fontSize: 15, lineHeight: 20, color: C.gold, marginTop: 8 },
  streak: { fontFamily: F.black, fontSize: 13, lineHeight: 17, color: C.ember, marginTop: 8 },
  consolation: {
    fontFamily: F.regular,
    fontSize: 13,
    lineHeight: 17,
    color: C.textDim,
    marginTop: 8,
  },
});
