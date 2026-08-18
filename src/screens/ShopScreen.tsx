import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import { COLORS, GoldButton, Panel, Subtitle, Title } from '../components/ui';
import { fmt, grainsPerPiment, SLOT_ICONS } from '../game/formulas';
import { RARITY_COLORS, RARITY_LABELS } from '../game/items';
import { TRANSPORTS } from '../game/transport';
import { ATTR_LABELS } from '../game/classes';
import { AttrId, Item } from '../game/types';
import { useGame } from '../store/gameStore';

const PIMENT_PACKS = [
  { piments: 50, price: '0,99 €' },
  { piments: 300, price: '4,99 €' },
  { piments: 1000, price: '12,99 €' },
];

export default function ShopScreen() {
  const player = useGame((s) => s.player);
  const shop = useGame((s) => s.shop);
  const buyItem = useGame((s) => s.buyItem);
  const refreshShop = useGame((s) => s.refreshShop);
  const buyTransport = useGame((s) => s.buyTransport);
  const buyGrains = useGame((s) => s.buyGrains);
  const addPiments = useGame((s) => s.addPiments);

  if (!player) return null;

  const mockBuy = (n: number, price: string) => {
    Alert.alert(
      'Achat simulé 💳',
      `Dans la vraie app, ceci ouvrirait l'achat intégré App Store / Play Store (${price}). Pour le prototype, les piments sont offerts !`,
      [
        { text: 'Annuler', style: 'cancel' },
        { text: `Recevoir 🌶️${n}`, onPress: () => addPiments(n) },
      ]
    );
  };

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ paddingBottom: 40 }}>
      <Title>Bazar du Marché Forain</Title>
      <Subtitle>Ékipman fré du jour — arrivage chaque matin !</Subtitle>

      {shop.map((it) => (
        <Panel key={it.id} style={{ borderColor: RARITY_COLORS[it.rarity] }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <Text style={{ fontSize: 26 }}>{SLOT_ICONS[it.slot]}</Text>
            <View style={{ flex: 1 }}>
              <Text style={[styles.itemName, { color: RARITY_COLORS[it.rarity] }]}>
                {it.name}
              </Text>
              <Text style={styles.itemMeta}>
                {RARITY_LABELS[it.rarity]} · niv. {it.level}
              </Text>
              <Text style={styles.itemStats}>{itemStats(it)}</Text>
            </View>
            <GoldButton
              small
              label={`🌽${fmt(it.price)}`}
              onPress={() => buyItem(it)}
              disabled={player.grains < it.price}
            />
          </View>
        </Panel>
      ))}
      <GoldButton
        small
        color="#7f8c8d"
        label="🔄 Nouvel arrivage (🌶️1)"
        onPress={() => refreshShop(true)}
        disabled={player.piments < 1}
      />

      {/* Transports */}
      <Title>Garage Ti Kok</Title>
      <Subtitle>Va plus vite en quête ek in bon transport !</Subtitle>
      {TRANSPORTS.map((t, i) => {
        const owned = player.transport >= i;
        return (
          <Panel key={t.name}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
              <Text style={{ fontSize: 26 }}>{t.emoji}</Text>
              <View style={{ flex: 1 }}>
                <Text style={styles.itemName}>
                  {t.name}
                  {t.reduction > 0 ? ` · -${Math.round(t.reduction * 100)}% durée` : ''}
                </Text>
                <Text style={styles.itemStats}>{t.flavor}</Text>
              </View>
              {owned ? (
                <Text style={styles.owned}>{player.transport === i ? '✅ Actif' : '✔️'}</Text>
              ) : (
                <GoldButton
                  small
                  label={t.costGrains ? `🌽${fmt(t.costGrains)}` : `🌶️${t.costPiments}`}
                  onPress={() => buyTransport(i)}
                  disabled={
                    (t.costGrains ? player.grains < t.costGrains : false) ||
                    (t.costPiments ? player.piments < t.costPiments : false)
                  }
                />
              )}
            </View>
          </Panel>
        );
      })}

      {/* Piments */}
      <Title>La Kaz à Piments</Title>
      <Subtitle>La monnaie premium du kok batayeur 🌶️</Subtitle>
      <Panel>
        <Text style={styles.itemName}>Échanger des piments contre des grains</Text>
        <Text style={styles.itemStats}>
          1 🌶️ = 🌽{fmt(grainsPerPiment(player.level))} à ton niveau
        </Text>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 8 }}>
          <GoldButton small label="1 🌶️" onPress={() => buyGrains(1)} disabled={player.piments < 1} />
          <GoldButton small label="5 🌶️" onPress={() => buyGrains(5)} disabled={player.piments < 5} />
          <GoldButton small label="10 🌶️" onPress={() => buyGrains(10)} disabled={player.piments < 10} />
        </View>
      </Panel>
      {PIMENT_PACKS.map((p) => (
        <Panel key={p.piments}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Text style={[styles.itemName, { flex: 1 }]}>🌶️ ×{p.piments}</Text>
            <GoldButton small label={p.price} onPress={() => mockBuy(p.piments, p.price)} />
          </View>
        </Panel>
      ))}
    </ScrollView>
  );
}

function itemStats(it: Item): string {
  const parts: string[] = [];
  if (it.dmgMin) parts.push(`Dégâts ${it.dmgMin}–${it.dmgMax}`);
  if (it.armor) parts.push(`Armure +${it.armor}`);
  (Object.keys(it.bonuses) as AttrId[]).forEach((k) =>
    parts.push(`${ATTR_LABELS[k]} +${it.bonuses[k]}`)
  );
  return parts.join(' · ');
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg, padding: 14 },
  itemName: { color: COLORS.text, fontWeight: '800', fontSize: 14 },
  itemMeta: { color: COLORS.textDim, fontSize: 11, marginTop: 1 },
  itemStats: { color: COLORS.textDim, fontSize: 11, marginTop: 3 },
  owned: { color: COLORS.green, fontWeight: '800', fontSize: 13 },
});
