import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Alert, ScrollView, StyleSheet, Text, View } from 'react-native';

import AdButton from '../components/AdButton';
import FadeIn from '../components/FadeIn';
import { CompareLines, VerdictBadge } from '../components/ItemCompare';
import {
  Button,
  Card,
  Chip,
  GhostButton,
  ScreenTitle,
  SectionTitle,
  T,
} from '../components/ui';
import { ATTR_LABELS } from '../game/classes';
import { fmt, grainsPerPiment, SLOT_ICONS } from '../game/formulas';
import { RARITY_COLORS, RARITY_LABELS } from '../game/items';
import { compareToEquipped } from '../game/power';
import { TRANSPORTS } from '../game/transport';
import { AttrId, Item } from '../game/types';
import { useGame } from '../store/gameStore';
import { C, F, G, R } from '../theme';

const PIMENT_PACKS = [
  { piments: 50, price: '0,99 €', tag: null, bonus: 0 },
  { piments: 300, price: '4,99 €', tag: 'POPULÈR', bonus: 20 },
  { piments: 1000, price: '12,99 €', tag: 'MEILLÈR VALÈR', bonus: 60 },
];

export default function ShopScreen() {
  const player = useGame((s) => s.player);
  const shop = useGame((s) => s.shop);
  const buyItem = useGame((s) => s.buyItem);
  const refreshShop = useGame((s) => s.refreshShop);
  const buyTransport = useGame((s) => s.buyTransport);
  const buyGrains = useGame((s) => s.buyGrains);
  const addPiments = useGame((s) => s.addPiments);
  const starterPackBought = useGame((s) => s.starterPackBought);
  const buyStarterPack = useGame((s) => s.buyStarterPack);

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
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <ScreenTitle
        title="Bazar Forain"
        sub="Ékipman fré du jour — arrivage chaque matin !"
      />

      <AdButton kind="grains" full />

      {shop.map((it, si) => {
        const col = RARITY_COLORS[it.rarity];
        const cmp = compareToEquipped(it, player);
        return (
          <FadeIn key={it.id} index={si}>
          <Card glow={cmp.diff > 0 ? C.cane : col} compact>
            <View style={styles.itemRow}>
              <View style={[styles.itemIcon, { borderColor: col, backgroundColor: `${col}1A` }]}>
                <Text style={{ fontSize: 24 }}>{SLOT_ICONS[it.slot]}</Text>
              </View>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={[styles.itemName, { color: col }]} numberOfLines={1}>
                  {it.name}
                </Text>
                <View style={{ flexDirection: 'row', gap: 5, flexWrap: 'wrap', alignItems: 'center' }}>
                  <Chip label={RARITY_LABELS[it.rarity]} color={col} />
                  <Chip label={`niv. ${it.level}`} color={C.textDim} />
                  <VerdictBadge cmp={cmp} />
                </View>
                <Text style={styles.itemStats} numberOfLines={2}>
                  {itemStats(it)}
                </Text>
                <CompareLines cmp={cmp} />
              </View>
              <Button
                size="sm"
                variant={cmp.diff > 0 ? 'cane' : 'gold'}
                label={`🌽${fmt(it.price)}`}
                onPress={() => buyItem(it)}
                disabled={player.grains < it.price}
              />
            </View>
          </Card>
          </FadeIn>
        );
      })}
      <GhostButton
        icon="🔄"
        label="Nouvel arrivage · 🌶️1"
        onPress={() => refreshShop(true)}
        disabled={player.piments < 1}
        style={{ alignSelf: 'center', marginTop: 4 }}
      />

      {/* ─── Garage ─── */}
      <ScreenTitle
        title="Garage Ti Kok"
        sub="Va plus vite en quête ek in bon transport !"
        accent={C.lagoon}
      />
      {TRANSPORTS.map((t, i) => {
        const owned = player.transport >= i;
        const active = player.transport === i;
        return (
          <Card key={t.name} compact glow={active ? C.cane : undefined}>
            <View style={styles.itemRow}>
              <View style={styles.transportIcon}>
                <Text style={{ fontSize: 26 }}>{t.emoji}</Text>
              </View>
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={styles.itemName}>{t.name}</Text>
                {t.reduction > 0 && (
                  <Chip
                    label={`−${Math.round(t.reduction * 100)}% de durée`}
                    color={C.lagoon}
                    style={{ alignSelf: 'flex-start' }}
                  />
                )}
                <Text style={styles.itemStats}>{t.flavor}</Text>
              </View>
              {owned ? (
                <Text style={[styles.owned, !active && { color: C.textFaint }]}>
                  {active ? '✅ Actif' : '✔️'}
                </Text>
              ) : (
                <Button
                  size="sm"
                  variant={t.costPiments ? 'piment' : 'gold'}
                  label={t.costGrains ? `🌽${fmt(t.costGrains)}` : `🌶️${t.costPiments}`}
                  onPress={() => buyTransport(i)}
                  disabled={
                    (t.costGrains ? player.grains < t.costGrains : false) ||
                    (t.costPiments ? player.piments < t.costPiments : false)
                  }
                />
              )}
            </View>
          </Card>
        );
      })}

      {/* ─── Piments ─── */}
      <ScreenTitle
        title="La Kaz à Piments"
        sub="La monnaie premium du kok batayeur"
        accent={C.piment}
      />
      <Card>
        <SectionTitle icon="🔥">Piments → grains</SectionTitle>
        <Text style={T.dim}>
          1 🌶️ = 🌽{fmt(grainsPerPiment(player.level))} à ton niveau
        </Text>
        <View style={{ flexDirection: 'row', gap: 8, marginTop: 10 }}>
          {[1, 5, 10].map((n) => (
            <Button
              key={n}
              size="sm"
              label={`${n} 🌶️`}
              onPress={() => buyGrains(n)}
              disabled={player.piments < n}
            />
          ))}
        </View>
      </Card>

      {!starterPackBought && (
        <Card glow={C.ember}>
          <View style={styles.starterHead}>
            <Text style={styles.starterTag}>OFFRE DE BIENVENUE · UNE SEULE FOI</Text>
            <Text style={styles.starterTitle}>Pak Ti Batayeur</Text>
          </View>
          <View style={styles.starterGrid}>
            <View style={styles.starterItem}>
              <Text style={{ fontSize: 26 }}>🌶️</Text>
              <Text style={styles.starterVal}>300</Text>
            </View>
            <Text style={styles.plus}>+</Text>
            <View style={styles.starterItem}>
              <Text style={{ fontSize: 26 }}>🌽</Text>
              <Text style={styles.starterVal}>1 500</Text>
            </View>
            <View style={{ flex: 1 }} />
            <View style={{ alignItems: 'flex-end' }}>
              <Text style={styles.oldPrice}>7,99 €</Text>
              <Text style={styles.newPrice}>2,99 €</Text>
            </View>
          </View>
          <Button
            full
            variant="ember"
            size="lg"
            label="Prendre l'offre · −62 %"
            onPress={() =>
              Alert.alert(
                'Achat simulé 💳',
                'En prod : achat intégré App Store / Play Store (2,99 €). Pour le prototype, le pack est offert !',
                [
                  { text: 'Annuler', style: 'cancel' },
                  { text: 'Recevoir le pack', onPress: buyStarterPack },
                ]
              )
            }
          />
        </Card>
      )}

      {PIMENT_PACKS.map((p) => (
        <Card key={p.piments} compact glow={p.tag ? C.piment : undefined}>
          <View style={styles.itemRow}>
            <LinearGradient colors={G.piment} style={styles.packIcon}>
              <Text style={{ fontSize: 20 }}>🌶️</Text>
            </LinearGradient>
            <View style={{ flex: 1, gap: 4 }}>
              <Text style={styles.itemName}>×{p.piments} piments</Text>
              <View style={{ flexDirection: 'row', gap: 5, flexWrap: 'wrap' }}>
                {p.tag && <Chip label={p.tag} color={C.gold} active />}
                {p.bonus > 0 && <Chip label={`+${p.bonus} % ofèr`} color={C.cane} />}
              </View>
            </View>
            <Button
              size="sm"
              variant="piment"
              label={p.price}
              onPress={() => mockBuy(p.piments, p.price)}
            />
          </View>
        </Card>
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
  root: { flex: 1 },
  content: { padding: 14, paddingBottom: 40 },
  itemRow: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  itemIcon: {
    width: 46,
    height: 46,
    borderRadius: R.md,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  transportIcon: {
    width: 46,
    height: 46,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: C.hairlineSoft,
    backgroundColor: 'rgba(6,3,12,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  packIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  itemName: { fontFamily: F.black, fontSize: 16.5, lineHeight: 21, color: C.text },
  itemStats: {
    fontFamily: F.regular,
    fontSize: 12.5,
    lineHeight: 17,
    color: C.textDim,
  },
  owned: { fontFamily: F.black, fontSize: 14, lineHeight: 19, color: C.cane },
  starterHead: { marginBottom: 10 },
  starterTag: {
    fontFamily: F.black,
    fontSize: 9.5,
    letterSpacing: 1.3,
    color: C.ember,
  },
  starterTitle: { fontFamily: F.black, fontSize: 23, lineHeight: 30, color: C.gold },
  starterGrid: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 14,
  },
  starterItem: { alignItems: 'center' },
  starterVal: { fontFamily: F.black, fontSize: 14, color: C.text },
  plus: { fontFamily: F.black, fontSize: 18, color: C.textFaint },
  oldPrice: {
    fontFamily: F.semi,
    fontSize: 12,
    color: C.textFaint,
    textDecorationLine: 'line-through',
  },
  newPrice: { fontFamily: F.black, fontSize: 20, color: C.cane },
});
