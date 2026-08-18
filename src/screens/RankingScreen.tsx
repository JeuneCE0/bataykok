import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { Card, Chip, ScreenTitle } from '../components/ui';
import { generateLadder } from '../game/bots';
import { CLASSES } from '../game/classes';
import { useGame } from '../store/gameStore';
import { C, F, R } from '../theme';

const LADDER = generateLadder();
const botById = new Map(LADDER.map((b) => [b.id, b]));
const MEDALS = ['🥇', '🥈', '🥉'];

export default function RankingScreen() {
  const player = useGame((s) => s.player);
  const ladderOrder = useGame((s) => s.ladderOrder);
  if (!player) return null;

  const myIdx = ladderOrder.indexOf('me');

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <ScreenTitle
        title="Palmarès"
        sub="Les meilleurs koks batayeurs de l'île"
      />
      <View style={styles.badges}>
        <Chip label={`Ton rang · #${myIdx + 1}`} color={C.gold} active />
        <Chip label={`Honneur ${player.honor}`} color={C.mystic} />
      </View>

      <Card>
        {ladderOrder.map((id, i) => {
          const isMe = id === 'me';
          const bot = botById.get(id);
          if (!isMe && !bot) return null;
          const name = isMe ? player.name : bot!.name;
          const level = isMe ? player.level : bot!.level;
          const cls = CLASSES[isMe ? player.classId : bot!.classId];

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
            <View key={id} style={[styles.row, isMe && styles.meRow]}>
              <View
                style={[
                  styles.rankBox,
                  i < 3 && { borderColor: C.gold, backgroundColor: 'rgba(255,201,60,0.12)' },
                  isMe && { borderColor: C.gold },
                ]}
              >
                <Text style={[styles.rank, i < 3 && { color: C.gold, fontSize: 15 }]}>
                  {i < 3 ? MEDALS[i] : `${i + 1}`}
                </Text>
              </View>
              <Text
                style={[styles.name, isMe && { color: C.gold }]}
                numberOfLines={1}
              >
                {name}
                {isMe ? ' (ou !)' : ''}
              </Text>
              <Text style={[styles.cls, { color: cls.color }]}>{cls.emoji}</Text>
              <Text style={styles.level}>niv. {level}</Text>
            </View>
          );
        })}
      </Card>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 14, paddingBottom: 40 },
  badges: { flexDirection: 'row', gap: 8, justifyContent: 'center', marginBottom: 6 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: C.hairlineSoft,
    gap: 10,
  },
  meRow: {
    backgroundColor: 'rgba(255,201,60,0.10)',
    borderRadius: R.sm,
    borderBottomColor: 'transparent',
  },
  rankBox: {
    width: 32,
    height: 28,
    borderRadius: R.sm,
    borderWidth: 1,
    borderColor: C.hairlineSoft,
    backgroundColor: 'rgba(6,3,12,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rank: { fontFamily: F.black, fontSize: 12, color: C.textDim },
  name: { fontFamily: F.bold, fontSize: 13.5, color: C.text, flex: 1 },
  cls: { fontSize: 15 },
  level: { fontFamily: F.semi, fontSize: 11.5, color: C.textFaint, width: 48, textAlign: 'right' },
  dots: { color: C.textFaint, textAlign: 'center', fontSize: 18, paddingVertical: 6 },
});
