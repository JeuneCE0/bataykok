import React, { useEffect, useRef, useState } from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import Rooster from '../components/Rooster';
import { Bar, COLORS, GoldButton, Panel, Subtitle, Title } from '../components/ui';
import { botToFighter, generateLadder } from '../game/bots';
import { CLASSES } from '../game/classes';
import { simulateCombat } from '../game/combat';
import { fmt, maxHp, playerToFighter } from '../game/formulas';
import { Bot, CombatResult, Fighter } from '../game/types';
import { useGame } from '../store/gameStore';

const LADDER = generateLadder();

export default function ArenaScreen() {
  const player = useGame((s) => s.player);
  const ladderOrder = useGame((s) => s.ladderOrder);
  const arenaNextAt = useGame((s) => s.arenaNextAt);
  const applyArenaResult = useGame((s) => s.applyArenaResult);
  const skipArenaCooldown = useGame((s) => s.skipArenaCooldown);

  const [now, setNow] = useState(Date.now());
  const [fight, setFight] = useState<{
    me: Fighter;
    op: Fighter;
    opId: string;
    result: CombatResult;
  } | null>(null);
  const [rewardText, setRewardText] = useState<string | null>(null);

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 500);
    return () => clearInterval(t);
  }, []);

  if (!player) return null;

  if (fight) {
    return (
      <CombatView
        me={fight.me}
        op={fight.op}
        result={fight.result}
        onDone={() => {
          const won = fight.result.winner === 0;
          const r = applyArenaResult(won, fight.opId);
          setRewardText(
            won
              ? `🏆 VIKTOIR ! +🌽${fmt(r.gold)} · +${fmt(r.xp)} XP${
                  r.levels > 0 ? ' · 🎉 NIVEAU SUP !' : ''
                }`
              : '💀 Défèt... Ton kok i sar rouler dann poussière. Antrèn a li !'
          );
          setFight(null);
        }}
      />
    );
  }

  const cooldown = Math.max(0, Math.ceil((arenaNextAt - now) / 1000));
  const myIdx = ladderOrder.indexOf('me');
  const botById = new Map(LADDER.map((b) => [b.id, b]));
  // 3 adversaires : juste au-dessus de nous
  const targets: Bot[] = [];
  for (let i = myIdx - 1; i >= 0 && targets.length < 3; i--) {
    const b = botById.get(ladderOrder[i]);
    if (b) targets.push(b);
  }

  const launch = (bot: Bot) => {
    const me = playerToFighter(player);
    const op = botToFighter(bot);
    const result = simulateCombat(me, op);
    setRewardText(null);
    setFight({ me, op, opId: bot.id, result });
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ paddingBottom: 40 }}>
      <Title>Le Rond</Title>
      <Subtitle>Le gallodrome où les légendes i naît. Rang actuel : #{myIdx + 1}</Subtitle>

      {rewardText && (
        <Panel style={{ borderColor: rewardText.startsWith('🏆') ? COLORS.green : COLORS.red }}>
          <Text style={styles.reward}>{rewardText}</Text>
        </Panel>
      )}

      {cooldown > 0 ? (
        <Panel>
          <Text style={styles.cooldown}>
            😤 Ton kok i reprend son souffle... {cooldown}s
          </Text>
          <GoldButton
            small
            label="Passer l'attente (🌶️1)"
            onPress={skipArenaCooldown}
            disabled={player.piments < 1}
          />
        </Panel>
      ) : targets.length === 0 ? (
        <Panel>
          <Text style={styles.reward}>👑 Ou lé NUMÉRO UN ! Le roi du rond sé ou !</Text>
        </Panel>
      ) : (
        targets.map((bot) => {
          const rank = ladderOrder.indexOf(bot.id) + 1;
          const cls = CLASSES[bot.classId];
          return (
            <Panel key={bot.id}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Rooster appearance={bot.appearance} size={64} flip />
                <View style={{ flex: 1 }}>
                  <Text style={styles.botName}>
                    #{rank} — {bot.name}
                  </Text>
                  <Text style={styles.botInfo}>
                    {cls.emoji} {cls.name} · Niv. {bot.level}
                  </Text>
                </View>
                <GoldButton small label="⚔️ Batay !" onPress={() => launch(bot)} />
              </View>
            </Panel>
          );
        })
      )}
    </ScrollView>
  );
}

// ─── Vue de combat animée ────────────────────────────────────────────────

function CombatView({
  me,
  op,
  result,
  onDone,
}: {
  me: Fighter;
  op: Fighter;
  result: CombatResult;
  onDone: () => void;
}) {
  const [idx, setIdx] = useState(-1);
  const scrollRef = useRef<ScrollView>(null);
  const finished = idx >= result.rounds.length - 1;

  useEffect(() => {
    if (finished) return;
    const t = setInterval(() => {
      setIdx((i) => Math.min(i + 1, result.rounds.length - 1));
    }, 850);
    return () => clearInterval(t);
  }, [finished, result.rounds.length]);

  const hp: [number, number] =
    idx >= 0 ? result.rounds[idx].hpAfter : [maxHp(me), maxHp(op)];
  const lastRound = idx >= 0 ? result.rounds[idx] : null;

  return (
    <View style={styles.combatRoot}>
      <Title>⚔️ Batay !</Title>
      <View style={styles.fighters}>
        <View style={styles.fighterCol}>
          <Rooster appearance={me.appearance} size={110} />
          <Text style={styles.fighterName} numberOfLines={1}>
            {me.name}
          </Text>
          <Bar value={hp[0]} max={result.maxHp[0]} color={COLORS.green} label={`${fmt(hp[0])} PV`} />
        </View>
        <Text style={styles.vs}>VS</Text>
        <View style={styles.fighterCol}>
          <Rooster appearance={op.appearance} size={110} flip />
          <Text style={styles.fighterName} numberOfLines={1}>
            {op.name}
          </Text>
          <Bar value={hp[1]} max={result.maxHp[1]} color={COLORS.red} label={`${fmt(hp[1])} PV`} />
        </View>
      </View>

      {lastRound && (
        <Panel
          style={{
            borderColor:
              lastRound.kind === 'crit'
                ? COLORS.red
                : lastRound.attacker === 0
                ? COLORS.green
                : COLORS.panelBorder,
          }}
        >
          <Text style={styles.roundText}>
            {lastRound.text}
            {lastRound.damage > 0 ? `  (−${fmt(lastRound.damage)} PV)` : ''}
          </Text>
        </Panel>
      )}

      <ScrollView
        ref={scrollRef}
        style={styles.log}
        onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
      >
        {result.rounds.slice(0, idx + 1).map((r, i) => (
          <Text
            key={i}
            style={[
              styles.logLine,
              { color: r.attacker === 0 ? COLORS.green : COLORS.textDim },
            ]}
          >
            {r.text}
          </Text>
        ))}
      </ScrollView>

      {finished ? (
        <>
          <Text style={styles.resultText}>
            {result.winner === 0 ? '🏆 VIKTOIR POU OU !' : '💀 DÉFÈT...'}
          </Text>
          <GoldButton label="Retour au rond" onPress={onDone} />
        </>
      ) : (
        <GoldButton
          small
          color="#7f8c8d"
          label="⏩ Passer l'animation"
          onPress={() => setIdx(result.rounds.length - 1)}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg, padding: 14 },
  combatRoot: { flex: 1, backgroundColor: COLORS.bg, padding: 14 },
  reward: { color: COLORS.text, fontWeight: '800', fontSize: 14, lineHeight: 20 },
  cooldown: { color: COLORS.text, fontSize: 14, marginBottom: 10, fontWeight: '700' },
  botName: { color: COLORS.gold, fontWeight: '900', fontSize: 14 },
  botInfo: { color: COLORS.textDim, fontSize: 12, marginTop: 2 },
  fighters: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  fighterCol: { flex: 1, alignItems: 'center', gap: 4 },
  fighterName: { color: COLORS.text, fontWeight: '800', fontSize: 13 },
  vs: { color: COLORS.gold, fontWeight: '900', fontSize: 22, marginHorizontal: 8 },
  roundText: { color: COLORS.text, fontWeight: '700', fontSize: 14, lineHeight: 20 },
  log: {
    flex: 1,
    marginVertical: 8,
    backgroundColor: 'rgba(0,0,0,0.3)',
    borderRadius: 10,
    padding: 10,
  },
  logLine: { fontSize: 11, marginBottom: 4, lineHeight: 15 },
  resultText: {
    color: COLORS.gold,
    fontWeight: '900',
    fontSize: 20,
    textAlign: 'center',
    marginVertical: 8,
  },
});
