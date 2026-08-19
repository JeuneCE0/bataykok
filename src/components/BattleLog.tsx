import React, { useState } from 'react';
import { StyleSheet, Text, View } from 'react-native';

import { fmt } from '../game/formulas';
import { BattleLogEntry, useGame } from '../store/gameStore';
import { C, F, R } from '../theme';
import { Card, GhostButton, SectionTitle } from './ui';
import { useT } from '../i18n/useT';

const KIND: Record<BattleLogEntry['kind'], { icon: string; label: string }> = {
  attack: { icon: '⚔️', label: 'Batay' },
  defense: { icon: '🛡️', label: 'Défense' },
  dungeon: { icon: '🗝️', label: 'Gardien' },
};

const PREVIEW = 5;

/** Journal des batays : ce que le kok a fait, gagné et perdu. */
export default function BattleLog() {
  const t = useT();
  const log = useGame((s) => s.battleLog);
  const [all, setAll] = useState(false);

  if (log.length === 0) return null;
  const shown = all ? log : log.slice(0, PREVIEW);

  return (
    <Card>
      <SectionTitle icon="📜">{t('log.title')}</SectionTitle>
      {shown.map((e) => {
        const k = KIND[e.kind];
        return (
          <View key={e.id} style={styles.row}>
            <View
              style={[
                styles.icon,
                {
                  borderColor: e.won ? C.cane : C.piment,
                  backgroundColor: e.won
                    ? 'rgba(59,217,126,0.12)'
                    : 'rgba(255,59,92,0.12)',
                },
              ]}
            >
              <Text style={{ fontSize: 15 }}>{k.icon}</Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.name} numberOfLines={1}>
                {e.opponent}
              </Text>
              <Text style={styles.meta}>
                {k.label} · {e.won ? 'gagné' : 'perdu'} · {ago(e.at)}
              </Text>
            </View>
            <View style={{ alignItems: 'flex-end' }}>
              {e.gold > 0 && <Text style={styles.gold}>🌽 +{fmt(e.gold)}</Text>}
              {e.honorDelta !== 0 && (
                <Text
                  style={[
                    styles.honor,
                    { color: e.honorDelta > 0 ? C.cane : C.piment },
                  ]}
                >
                  🎖️ {e.honorDelta > 0 ? '+' : ''}
                  {e.honorDelta}
                </Text>
              )}
            </View>
          </View>
        );
      })}
      {log.length > PREVIEW && (
        <GhostButton
          label={all ? 'Voir moins' : `Voir tout (${log.length})`}
          onPress={() => setAll((v) => !v)}
          style={{ alignSelf: 'center', marginTop: 10 }}
        />
      )}
    </Card>
  );
}

function ago(at: number): string {
  const m = Math.max(0, Math.round((Date.now() - at) / 60000));
  if (m < 1) return "là mèm";
  if (m < 60) return `i fé ${m} min`;
  const h = Math.round(m / 60);
  if (h < 24) return `i fé ${h} h`;
  return `i fé ${Math.round(h / 24)} jour`;
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: C.hairlineSoft,
  },
  icon: {
    width: 34,
    height: 34,
    borderRadius: R.sm,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontFamily: F.bold, fontSize: 14.5, lineHeight: 19, color: C.text },
  meta: { fontFamily: F.regular, fontSize: 12, lineHeight: 16, color: C.textDim },
  gold: { fontFamily: F.bold, fontSize: 13, lineHeight: 17, color: C.gold },
  honor: { fontFamily: F.semi, fontSize: 12, lineHeight: 16 },
});
