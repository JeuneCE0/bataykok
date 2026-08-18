import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';

import { COLORS, Panel, Subtitle, Title } from '../components/ui';
import { generateLadder } from '../game/bots';
import { CLASSES } from '../game/classes';
import { useGame } from '../store/gameStore';

const LADDER = generateLadder();
const botById = new Map(LADDER.map((b) => [b.id, b]));

export default function RankingScreen() {
  const player = useGame((s) => s.player);
  const ladderOrder = useGame((s) => s.ladderOrder);
  if (!player) return null;

  const myIdx = ladderOrder.indexOf('me');

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ paddingBottom: 40 }}>
      <Title>Palmarès du Rond</Title>
      <Subtitle>
        Les meilleurs koks batayeurs de l'île · Honneur : {player.honor}
      </Subtitle>
      <Panel>
        {ladderOrder.map((id, i) => {
          const isMe = id === 'me';
          const bot = botById.get(id);
          if (!isMe && !bot) return null;
          const name = isMe ? player.name : bot!.name;
          const level = isMe ? player.level : bot!.level;
          const cls = CLASSES[isMe ? player.classId : bot!.classId];
          // n'affiche que le top 15 + la zone autour du joueur
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
              <Text style={[styles.rank, i < 3 && { color: COLORS.gold }]}>
                {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : `#${i + 1}`}
              </Text>
              <Text
                style={[styles.name, isMe && { color: COLORS.gold }]}
                numberOfLines={1}
              >
                {name} {isMe ? '(ou !)' : ''}
              </Text>
              <Text style={styles.cls}>{cls.emoji}</Text>
              <Text style={styles.level}>niv. {level}</Text>
            </View>
          );
        })}
      </Panel>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg, padding: 14 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255,255,255,0.06)',
    gap: 8,
  },
  meRow: {
    backgroundColor: 'rgba(244,196,48,0.12)',
    borderRadius: 8,
    paddingHorizontal: 6,
  },
  rank: { color: COLORS.textDim, fontWeight: '900', width: 44, fontSize: 13 },
  name: { color: COLORS.text, fontWeight: '700', flex: 1, fontSize: 13 },
  cls: { fontSize: 14 },
  level: { color: COLORS.textDim, fontSize: 12, width: 50, textAlign: 'right' },
  dots: { color: COLORS.textDim, textAlign: 'center', fontSize: 16, paddingVertical: 4 },
});
