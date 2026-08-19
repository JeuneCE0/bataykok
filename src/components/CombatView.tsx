import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Animated,
  Easing,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import { CLASSES } from '../game/classes';
import { fmt, maxHp } from '../game/formulas';
import { CombatResult, CombatRound, Fighter } from '../game/types';
import { play } from '../lib/sound';
import { useGame } from '../store/gameStore';
import { C, F, G, R, SHADOW } from '../theme';
import Rooster from './Rooster';
import { Button, GhostButton, Well } from './ui';
import { useT } from '../i18n/useT';

const ROUND_MS = 720;
/** Un critique fige l'image : c'est ce qui donne du poids au coup. */
const HITSTOP_MS = 150;
/** Le coup final s'étire — on doit voir tomber l'adversaire. */
const FINAL_MS = 1150;

// ─── Scène de combat, partagée par le rond et les donjons ────────────────

const KIND_STYLE: Record<
  CombatRound['kind'],
  { tag: string | null; color: string; big?: boolean }
> = {
  hit: { tag: null, color: C.text },
  crit: { tag: 'KOU KRITIK !', color: C.gold, big: true },
  block: { tag: 'BLOKÉ !', color: C.lagoon },
  dodge: { tag: 'ESQUIV !', color: C.cane },
  comet: { tag: 'BOUL DE FÉ !', color: C.ember, big: true },
  chain: { tag: 'ANCHÈNMAN !', color: C.piment },
  melody: { tag: 'SÉGA !', color: C.mystic },
};

export default function CombatView({
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
  const t = useT();
  const [idx, setIdx] = useState(-1);
  const scrollRef = useRef<ScrollView>(null);
  const finished = idx >= result.rounds.length - 1;
  const setCombatActive = useGame((s) => s.setCombatActive);

  useEffect(() => {
    setCombatActive(true);
    return () => setCombatActive(false);
  }, [setCombatActive]);

  // une paire d'animations par combattant (gauche = 0, droite = 1)
  const anim = useMemo(
    () => [0, 1].map(() => ({
      lunge: new Animated.Value(0),
      shake: new Animated.Value(0),
      flash: new Animated.Value(0),
      squash: new Animated.Value(1),
    })),
    []
  );
  const dmgY = useRef(new Animated.Value(0)).current;
  const dmgOp = useRef(new Animated.Value(0)).current;
  const tagScale = useRef(new Animated.Value(0)).current;
  const winScale = useRef(new Animated.Value(0)).current;
  const [burst, setBurst] = useState<{ side: 0 | 1; token: number } | null>(null);
  /** secousse de la scène — seul le combattant touché tremblait jusqu'ici */
  const quake = useRef(new Animated.Value(0)).current;

  // Cadence variable plutôt qu'un intervalle fixe : chaque round dure selon ce
  // qu'il vaut. Un `setInterval` régulier donnait à tous les coups le même
  // poids, y compris au dernier.
  useEffect(() => {
    if (finished) return;
    const r = result.rounds[Math.max(0, idx)];
    const dernier = idx >= result.rounds.length - 2;
    const dur =
      dernier ? FINAL_MS : r && (r.kind === 'crit' || r.kind === 'comet') ? ROUND_MS + HITSTOP_MS : ROUND_MS;
    const t = setTimeout(
      () => setIdx((i) => Math.min(i + 1, result.rounds.length - 1)),
      dur
    );
    return () => clearTimeout(t);
  }, [finished, idx, result.rounds]);

  // Chorégraphie d'un round : bond → impact → recul + dégâts flottants
  useEffect(() => {
    if (idx < 0) return;
    const r = result.rounds[idx];
    const att = r.attacker;
    const def: 0 | 1 = att === 0 ? 1 : 0;
    const dir = att === 0 ? 1 : -1;
    const hard = r.kind === 'crit' || r.kind === 'comet';

    anim.forEach((a) => {
      a.lunge.setValue(0);
      a.shake.setValue(0);
      a.flash.setValue(0);
    });
    dmgY.setValue(0);
    dmgOp.setValue(0);
    tagScale.setValue(0);

    const missed = r.kind === 'block' || r.kind === 'dodge';
    play(missed ? 'dodge' : hard ? 'crit' : 'hit', missed ? 0.7 : 1);

    // l'amplitude suit la part de vie emportée : un coup qui compte se sent
    const part = r.damage / Math.max(1, maxHp(def === 0 ? me : op));
    const force = missed ? 0 : Math.min(1, 0.25 + part * 3.2) * (hard ? 1.35 : 1);
    if (force > 0) {
      quake.setValue(0);
      Animated.sequence([
        Animated.timing(quake, {
          toValue: force,
          duration: 45,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
        Animated.spring(quake, {
          toValue: 0,
          friction: 3.6,
          tension: 220,
          useNativeDriver: true,
        }),
      ]).start();
    }

    Animated.sequence([
      Animated.timing(anim[att].lunge, {
        toValue: dir * (hard ? 34 : 24),
        duration: 130,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.spring(anim[att].lunge, {
          toValue: 0,
          friction: 5,
          tension: 90,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(anim[def].shake, {
            toValue: dir * (missed ? -14 : hard ? 16 : 10),
            duration: 70,
            useNativeDriver: true,
          }),
          Animated.spring(anim[def].shake, {
            toValue: 0,
            friction: 3.2,
            tension: 140,
            useNativeDriver: true,
          }),
        ]),
        Animated.sequence([
          Animated.timing(anim[def].flash, {
            toValue: missed ? 0 : hard ? 0.85 : 0.5,
            duration: 60,
            useNativeDriver: true,
          }),
          Animated.timing(anim[def].flash, {
            toValue: 0,
            duration: 260,
            useNativeDriver: true,
          }),
        ]),
        Animated.spring(tagScale, {
          toValue: 1,
          friction: 4,
          tension: 120,
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(dmgOp, { toValue: 1, duration: 90, useNativeDriver: true }),
          Animated.parallel([
            Animated.timing(dmgY, {
              toValue: -58,
              duration: 620,
              easing: Easing.out(Easing.quad),
              useNativeDriver: true,
            }),
            Animated.timing(dmgOp, {
              toValue: 0,
              duration: 620,
              delay: 120,
              useNativeDriver: true,
            }),
          ]),
        ]),
      ]),
    ]).start();

    if (!missed) setBurst({ side: def, token: idx });
  }, [idx, result.rounds, anim, dmgOp, dmgY, tagScale]);

  useEffect(() => {
    if (!finished) return;
    play(result.winner === 0 ? 'victory' : 'defeat');
    winScale.setValue(0);
    Animated.spring(winScale, {
      toValue: 1,
      friction: 4,
      tension: 80,
      useNativeDriver: true,
    }).start();
  }, [finished, winScale, result.winner]);

  const hp: [number, number] =
    idx >= 0 ? result.rounds[idx].hpAfter : [maxHp(me), maxHp(op)];
  const round = idx >= 0 ? result.rounds[idx] : null;
  const kind = round ? KIND_STYLE[round.kind] : null;
  const dmgSide = round ? (round.attacker === 0 ? 1 : 0) : 0;

  return (
    <View style={styles.combatRoot}>
      {/* Scène */}
      <LinearGradient
        colors={['rgba(255,90,31,0.16)', 'rgba(10,7,19,0)']}
        style={styles.stageGlow}
      />
      <Animated.View
        style={[
          styles.scene,
          {
            transform: [
              {
                translateX: quake.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, 9],
                }),
              },
              {
                translateY: quake.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, -5],
                }),
              },
            ],
          },
        ]}
      >
      <View style={styles.stageHead}>
        <Text style={styles.stageTitle}>⚔️ BATAY DANN ROND</Text>
        <Text style={styles.roundCount}>
          Tour {Math.max(1, idx + 1)} / {result.rounds.length}
        </Text>
      </View>

      <View style={styles.fightersWrap}>
      <LinearGradient
        colors={['rgba(255,138,61,0.26)', 'rgba(255,138,61,0.06)', 'transparent']}
        style={styles.ringFloor}
        pointerEvents="none"
      />
      <View style={styles.fighters}>
        <FighterSide
          fighter={me}
          hp={hp[0]}
          maxHpValue={result.maxHp[0]}
          anim={anim[0]}
          burst={burst?.side === 0 ? burst.token : null}
          side="left"
          barVariant="cane"
        />

        <View style={styles.vsWrap}>
          <LinearGradient colors={G.ember} style={styles.vsBadge}>
            <Text style={styles.vsText}>VS</Text>
          </LinearGradient>
        </View>

        <FighterSide
          fighter={op}
          hp={hp[1]}
          maxHpValue={result.maxHp[1]}
          anim={anim[1]}
          burst={burst?.side === 1 ? burst.token : null}
          side="right"
          barVariant="piment"
        />

        {/* dégâts flottants au-dessus du défenseur */}
        {round && round.damage > 0 && (
          <Animated.Text
            style={[
              styles.floatDmg,
              dmgSide === 0 ? { left: '12%' } : { right: '12%' },
              {
                color: round.kind === 'crit' ? C.gold : '#FFF',
                fontSize: round.kind === 'crit' ? 34 : 26,
                opacity: dmgOp,
                transform: [{ translateY: dmgY }],
              },
            ]}
          >
            −{fmt(round.damage)}
          </Animated.Text>
        )}
      </View>
      </View>

      {/* Bannière du coup */}
      <View style={styles.bannerZone}>
        {kind?.tag && (
          <Animated.Text
            style={[
              styles.kindTag,
              {
                color: kind.color,
                fontSize: kind.big ? 26 : 20,
                textShadowColor: kind.color,
                transform: [{ scale: tagScale }],
              },
            ]}
          >
            {kind.tag}
          </Animated.Text>
        )}
        {round && (
          <Text style={styles.roundText} numberOfLines={2}>
            {round.text}
          </Text>
        )}
      </View>
      </Animated.View>

      {/* Journal */}
      <Well style={{ flex: 1, minHeight: 130, maxHeight: 230, marginBottom: 12 }}>
        <ScrollView
          ref={scrollRef}
          onContentSizeChange={() => scrollRef.current?.scrollToEnd({ animated: true })}
        >
          {result.rounds.slice(0, idx + 1).map((r, i) => (
            <Text
              key={i}
              style={[
                styles.logLine,
                { color: r.attacker === 0 ? C.cane : C.textDim },
              ]}
            >
              {r.text}
              {r.damage > 0 ? `  (−${fmt(r.damage)})` : ''}
            </Text>
          ))}
        </ScrollView>
      </Well>

      {finished ? (
        <View style={{ gap: 10, alignItems: 'center' }}>
          <Animated.View style={{ transform: [{ scale: winScale }] }}>
            <LinearGradient
              colors={result.winner === 0 ? G.gold : G.slate}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                styles.winBanner,
                result.winner === 0 ? SHADOW.glowGold : SHADOW.card,
              ]}
            >
              <Text
                style={[
                  styles.winText,
                  { color: result.winner === 0 ? C.ink : C.text },
                ]}
              >
                {result.winner === 0 ? '🏆 VIKTOIR POU OU !' : '💀 DÉFÈT…'}
              </Text>
            </LinearGradient>
          </Animated.View>
          <Button
            full
            size="lg"
            variant={result.winner === 0 ? 'gold' : 'slate'}
            label={t('combat.back')}
            onPress={onDone}
          />
        </View>
      ) : (
        <GhostButton
          icon="⏩"
          label={t('combat.skip')}
          onPress={() => setIdx(result.rounds.length - 1)}
          style={{ alignSelf: 'center' }}
        />
      )}
    </View>
  );
}

function FighterSide({
  fighter,
  hp,
  maxHpValue,
  anim,
  burst,
  side,
  barVariant,
}: {
  fighter: Fighter;
  hp: number;
  maxHpValue: number;
  anim: {
    lunge: Animated.Value;
    shake: Animated.Value;
    flash: Animated.Value;
    squash: Animated.Value;
  };
  burst: number | null;
  side: 'left' | 'right';
  barVariant: 'cane' | 'piment';
}) {
  const pct = Math.max(0, Math.min(1, maxHpValue > 0 ? hp / maxHpValue : 0));
  const width = useRef(new Animated.Value(pct)).current;
  const cls = CLASSES[fighter.classId];
  const ko = hp <= 0;
  const koAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(width, {
      toValue: pct,
      duration: 320,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: false,
    }).start();
  }, [pct, width]);

  useEffect(() => {
    if (!ko) return;
    Animated.spring(koAnim, {
      toValue: 1,
      friction: 4,
      tension: 60,
      useNativeDriver: true,
    }).start();
  }, [ko, koAnim]);

  return (
    <View style={styles.fighterCol}>
      <Animated.View
        style={{
          opacity: koAnim.interpolate({
            inputRange: [0, 1],
            outputRange: [1, 0.55],
          }),
          transform: [
            { translateX: Animated.add(anim.lunge, anim.shake) },
            { scale: anim.squash },
            {
              rotate: koAnim.interpolate({
                inputRange: [0, 1],
                outputRange: ['0deg', side === 'right' ? '-72deg' : '72deg'],
              }),
            },
            {
              translateY: koAnim.interpolate({
                inputRange: [0, 1],
                outputRange: [0, 16],
              }),
            },
          ],
        }}
      >
        <View style={[styles.fighterHalo, { backgroundColor: cls.color }]} />
        <Rooster
          appearance={fighter.appearance}
          size={116}
          flip={side === 'right'}
          alive
        />
        {/* flash d'impact */}
        <Animated.View
          pointerEvents="none"
          style={[styles.flash, { opacity: anim.flash }]}
        />
        {burst !== null && <Burst key={burst} />}
      </Animated.View>

      {ko && (
        <Animated.Text
          style={[
            styles.koStars,
            {
              opacity: koAnim,
              transform: [
                { scale: koAnim.interpolate({ inputRange: [0, 1], outputRange: [0.4, 1] }) },
              ],
            },
          ]}
        >
          💫 KO
        </Animated.Text>
      )}

      <Text style={styles.fighterName} numberOfLines={1}>
        {fighter.name}
      </Text>

      <View style={styles.hpTrack}>
        <Animated.View
          style={[
            StyleSheet.absoluteFill,
            {
              width: width.interpolate({
                inputRange: [0, 1],
                outputRange: ['0%', '100%'],
              }),
            },
          ]}
        >
          <LinearGradient
            colors={G[barVariant]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={{ flex: 1, borderRadius: 7 }}
          />
        </Animated.View>
        <Text style={styles.hpText}>{fmt(Math.max(0, Math.round(hp)))} PV</Text>
      </View>
    </View>
  );
}

/** Gerbe de plumes/étincelles à l'impact. */
function Burst() {
  const p = useMemo(
    () => PARTICLES.map(() => new Animated.Value(0)),
    []
  );

  useEffect(() => {
    Animated.stagger(
      18,
      p.map((v) =>
        Animated.timing(v, {
          toValue: 1,
          duration: 480,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        })
      )
    ).start();
  }, [p]);

  return (
    <View pointerEvents="none" style={styles.burst}>
      {PARTICLES.map((part, i) => (
        <Animated.Text
          key={i}
          style={{
            position: 'absolute',
            fontSize: part.size,
            opacity: p[i].interpolate({
              inputRange: [0, 0.65, 1],
              outputRange: [1, 0.9, 0],
            }),
            transform: [
              {
                translateX: p[i].interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, part.x],
                }),
              },
              {
                translateY: p[i].interpolate({
                  inputRange: [0, 1],
                  outputRange: [0, part.y],
                }),
              },
              {
                rotate: p[i].interpolate({
                  inputRange: [0, 1],
                  outputRange: ['0deg', `${part.rot}deg`],
                }),
              },
            ],
          }}
        >
          {part.char}
        </Animated.Text>
      ))}
    </View>
  );
}

const PARTICLES = [
  { char: '✦', x: -34, y: -30, rot: 160, size: 14 },
  { char: '🪶', x: 30, y: -26, rot: -140, size: 13 },
  { char: '✦', x: 40, y: 14, rot: 200, size: 11 },
  { char: '🪶', x: -40, y: 10, rot: 120, size: 12 },
  { char: '✧', x: 6, y: -44, rot: 90, size: 15 },
  { char: '✦', x: -14, y: 34, rot: -90, size: 12 },
];

const styles = StyleSheet.create({
  combatRoot: { flex: 1, padding: 14, paddingTop: 20 },
  scene: { flex: 1, justifyContent: 'center', gap: 4 },
  stageGlow: { position: 'absolute', top: 0, left: 0, right: 0, height: 220 },
  stageHead: { alignItems: 'center', marginBottom: 6 },
  stageTitle: {
    fontFamily: F.black,
    fontSize: 21,
    lineHeight: 27,
    color: C.ember,
    letterSpacing: 0.8,
  },
  roundCount: { fontFamily: F.bold, fontSize: 12.5, lineHeight: 17, color: C.textDim },
  fightersWrap: { justifyContent: 'flex-end' },
  ringFloor: {
    position: 'absolute',
    left: '2%',
    right: '2%',
    bottom: 34,
    height: 130,
    borderRadius: 300,
    transform: [{ scaleY: 0.38 }],
  },
  fighters: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  fighterCol: { flex: 1, alignItems: 'center', gap: 6 },
  fighterHalo: {
    position: 'absolute',
    alignSelf: 'center',
    top: 14,
    width: 96,
    height: 96,
    borderRadius: 48,
    opacity: 0.13,
  },
  flash: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FF3B5C',
    borderRadius: 60,
  },
  burst: {
    position: 'absolute',
    top: '45%',
    left: '45%',
    width: 1,
    height: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  fighterName: { fontFamily: F.black, fontSize: 15, lineHeight: 20, color: C.text },
  koStars: {
    position: 'absolute',
    top: 6,
    fontFamily: F.black,
    fontSize: 20,
    color: C.gold,
    textShadowColor: 'rgba(0,0,0,0.85)',
    textShadowRadius: 6,
  },
  hpTrack: {
    width: '94%',
    height: 18,
    borderRadius: 8,
    backgroundColor: 'rgba(6,3,12,0.65)',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.6)',
    overflow: 'hidden',
    justifyContent: 'center',
  },
  hpText: {
    fontFamily: F.black,
    fontSize: 11.5,
    color: '#fff',
    textAlign: 'center',
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowRadius: 3,
  },
  vsWrap: { paddingTop: 44 },
  vsBadge: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
    ...SHADOW.glowEmber,
  },
  vsText: { fontFamily: F.black, fontSize: 14, color: '#FFF8F0' },
  floatDmg: {
    position: 'absolute',
    top: 26,
    fontFamily: F.black,
    textShadowColor: 'rgba(0,0,0,0.9)',
    textShadowRadius: 6,
    textShadowOffset: { width: 0, height: 2 },
  },
  bannerZone: { minHeight: 64, alignItems: 'center', justifyContent: 'center', gap: 2 },
  kindTag: {
    fontFamily: F.black,
    letterSpacing: 1,
    textShadowRadius: 14,
    textShadowOffset: { width: 0, height: 0 },
  },
  roundText: {
    fontFamily: F.semi,
    fontSize: 14.5,
    color: C.text,
    textAlign: 'center',
    lineHeight: 20,
  },
  logLine: { fontFamily: F.regular, fontSize: 13, marginBottom: 4, lineHeight: 18 },
  winBanner: {
    paddingHorizontal: 26,
    paddingVertical: 12,
    borderRadius: R.pill,
    borderWidth: 2,
    borderColor: 'rgba(255,255,255,0.35)',
  },
  winText: { fontFamily: F.black, fontSize: 20, letterSpacing: 0.5 },
});
