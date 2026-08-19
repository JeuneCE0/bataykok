import { LinearGradient } from 'expo-linear-gradient';
import React, { useMemo, useState } from 'react';
import { Alert, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';

import AdButton from '../components/AdButton';
import FadeIn from '../components/FadeIn';
import { CompareLines, VerdictBadge } from '../components/ItemCompare';
import CosmeticsShop from '../components/CosmeticsShop';
import MarketScreen from './MarketScreen';
import {
  Button,
  Card,
  Chip,
  GhostButton,
  ScreenTitle,
  SectionTitle,
  Segmented,
  T,
} from '../components/ui';
import { ATTR_LABELS } from '../game/classes';
import { fmt, grainsPerPiment, SLOT_ICONS } from '../game/formulas';
import { RARITY_COLORS, RARITY_LABELS, itemStats } from '../game/items';
import { eventOfDay } from '../game/events';
import { compareToEquipped } from '../game/power';
import { SET_BY_ID } from '../game/sets';
import { TRANSPORTS } from '../game/transport';
import { AttrId, Item } from '../game/types';
import { useT } from '../i18n/useT';
import { useGame } from '../store/gameStore';
import { localDay } from '../game/day';
import { C, F, G, R } from '../theme';
import { itemLabel } from '../game/items';
import SetKits from '../components/SetKits';

const PIMENT_PACKS = [
  { piments: 50, price: '0,99 €', tag: null, bonus: 0 },
  { piments: 300, price: '4,99 €', tag: 'POPULÈR', bonus: 20 },
  { piments: 1000, price: '12,99 €', tag: 'MEILLÈR VALÈR', bonus: 60 },
];

export default function ShopScreen() {
  const t = useT();
  const [tab, setTab] = useState<'bazar' | 'plimaz' | 'lotel'>('bazar');
  const [open, setOpen] = useState<string | null>(null);
  const player = useGame((s) => s.player);
  const shop = useGame((s) => s.shop);
  const buyItem = useGame((s) => s.buyItem);
  const refreshShop = useGame((s) => s.refreshShop);
  const buyTransport = useGame((s) => s.buyTransport);
  const buyGrains = useGame((s) => s.buyGrains);
  const addPiments = useGame((s) => s.addPiments);
  const starterPackBought = useGame((s) => s.starterPackBought);
  const buyStarterPack = useGame((s) => s.buyStarterPack);
  const passUntil = useGame((s) => s.passUntil);
  const buyPass = useGame((s) => s.buyPass);
  const claimPassPiments = useGame((s) => s.claimPassPiments);
  const passClaimedDay = useGame((s) => s.passClaimedDay);
  const dayEvent = eventOfDay(localDay());
  const priceOf = (base: number) =>
    Math.round(base * (dayEvent.kind === 'shop' ? dayEvent.mult : 1));
  const shopWithCompare = useMemo(
    () =>
      player ? shop.map((it) => ({ it, cmp: compareToEquipped(it, player) })) : [],
    [shop, player]
  );

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

  const switcher = (
    <Segmented
      value={tab}
      onChange={setTab}
      options={[
        { id: 'bazar', label: '🛒  Bazar' },
        { id: 'plimaz', label: '🎨  Plimaz' },
        { id: 'lotel', label: '⚖️  Lotèl' },
      ]}
    />
  );

  if (tab === 'plimaz') {
    return (
      <View style={{ flex: 1 }}>
        {switcher}
        <CosmeticsShop />
      </View>
    );
  }

  if (tab === 'lotel') {
    return (
      <View style={{ flex: 1 }}>
        {switcher}
        <MarketScreen />
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
    {switcher}
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <ScreenTitle
        title={t('shop.title')}
        sub={t('shop.sub')}
      />

      <SetKits />

      <AdButton kind="grains" full />

      {shopWithCompare.map(({ it, cmp }, si) => {
        const col = RARITY_COLORS[it.rarity];
        return (
          <FadeIn key={it.id} index={si}>
          <Card glow={cmp.diff > 0 ? C.cane : undefined} compact>
            <View style={styles.itemRow}>
              <View style={[styles.itemIcon, { borderColor: col, backgroundColor: `${col}1A` }]}>
                <Text style={{ fontSize: 24 }}>{SLOT_ICONS[it.slot]}</Text>
              </View>
              <Pressable
                style={{ flex: 1, gap: 4 }}
                onPress={() => setOpen(open === it.id ? null : it.id)}
              >
                <Text style={[styles.itemName, { color: col }]} numberOfLines={1}>
                  {itemLabel(it, t)}
                </Text>
                <View style={styles.chipLine}>
                  <VerdictBadge cmp={cmp} />
                  {it.setId && SET_BY_ID[it.setId] && (
                    <Chip
                      label={SET_BY_ID[it.setId].icon}
                      color={SET_BY_ID[it.setId].color}
                    />
                  )}
                </View>
                <Text style={styles.itemStats} numberOfLines={2}>
                  {RARITY_LABELS[it.rarity]} · niv. {it.level} · {itemStats(it)}
                </Text>
                {open === it.id ? (
                  <CompareLines cmp={cmp} />
                ) : (
                  <Text style={styles.more}>Toucher pour comparer en détail</Text>
                )}
              </Pressable>
              <Button
                size="sm"
                variant={cmp.diff > 0 ? 'cane' : 'gold'}
                label={`🌽${fmt(priceOf(it.price))}`}
                onPress={() => buyItem({ ...it, price: priceOf(it.price) })}
                disabled={player.grains < priceOf(it.price)}
              />
            </View>
          </Card>
          </FadeIn>
        );
      })}
      <GhostButton
        icon="🔄"
        label={`${t('shop.reroll')} · 🌶️1`}
        onPress={() => refreshShop(true)}
        disabled={player.piments < 1}
        style={{ alignSelf: 'center', marginTop: 4 }}
      />

      {/* ─── Garage ─── */}
      <ScreenTitle
        title={t('shop.garage')}
        sub={t('shop.garageSub')}
        accent={C.lagoon}
      />
      {TRANSPORTS.map((tr, i) => {
        const owned = player.transport >= i;
        const active = player.transport === i;
        return (
          <Card key={tr.name} compact glow={active ? C.cane : undefined}>
            <View style={styles.itemRow}>
              <View style={styles.transportIcon}>
                <Text style={{ fontSize: 26 }}>{tr.emoji}</Text>
              </View>
              <View style={{ flex: 1, gap: 3 }}>
                <Text style={styles.itemName}>{tr.name}</Text>
                {tr.reduction > 0 && (
                  <Chip
                    label={t('shop.durationCut', { n: Math.round(tr.reduction * 100) })}
                    color={C.lagoon}
                    style={{ alignSelf: 'flex-start' }}
                  />
                )}
                <Text style={styles.itemStats}>{tr.flavor}</Text>
              </View>
              {owned ? (
                <Text style={[styles.owned, !active && { color: C.textFaint }]}>
                  {active ? '✅ Actif' : '✔️'}
                </Text>
              ) : (
                <Button
                  size="sm"
                  variant={tr.costPiments ? 'piment' : 'gold'}
                  label={tr.costGrains ? `🌽${fmt(tr.costGrains)}` : `🌶️${tr.costPiments}`}
                  onPress={() => buyTransport(i)}
                  disabled={
                    (tr.costGrains ? player.grains < tr.costGrains : false) ||
                    (tr.costPiments ? player.piments < tr.costPiments : false)
                  }
                />
              )}
            </View>
          </Card>
        );
      })}

      {/* ─── Piments ─── */}
      <ScreenTitle
        title={t('shop.piments')}
        sub={t('shop.pimentsSub')}
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

      <Card glow={passUntil > Date.now() ? C.cane : C.mystic}>
        <View style={styles.starterHead}>
          <Text style={[styles.starterTag, { color: C.mystic }]}>
            ABONMAN · 30 JOUR
          </Text>
          <Text style={styles.starterTitle}>Pass Ti Planteur</Text>
        </View>
        <View style={{ gap: 5, marginBottom: 12 }}>
          <Text style={styles.passLine}>🌶️ 20 piments chaque jour</Text>
          <Text style={styles.passLine}>✨ +10 % d'XP su tout</Text>
          <Text style={styles.passLine}>🧧 Coffre gratuit prioritèr</Text>
        </View>
        {passUntil > Date.now() ? (
          <>
            <Chip
              label={t('shop.passActive', { d: new Date(passUntil).toLocaleDateString('fr-FR') })}
              color={C.cane}
              active
              style={{ alignSelf: 'flex-start', marginBottom: 10 }}
            />
            <Button
              full
              variant="cane"
              label={
                passClaimedDay === localDay()
                  ? 'Piments du jour déjà pris'
                  : 'Récupérer 🌶️20 du jour'
              }
              disabled={passClaimedDay === localDay()}
              onPress={claimPassPiments}
            />
          </>
        ) : (
          <Button
            full
            variant="mystic"
            size="lg"
            label={t('shop.subscribe')}
              sub="6,99 € / mois"
            onPress={() =>
              Alert.alert(
                'Abonnement simulé 💳',
                'En prod : abonnement RevenueCat (6,99 €/mois). Pour le prototype, il est offert !',
                [
                  { text: 'Annuler', style: 'cancel' },
                  { text: 'Activer le pass', onPress: buyPass },
                ]
              )
            }
          />
        )}
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
            label={t('shop.takeOffer')}
                sub="−62 %"
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
                {p.bonus > 0 && <Chip label={t('shop.bonus', { n: p.bonus })} color={C.cane} />}
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
    </View>
  );
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
  chipLine: { flexDirection: 'row', gap: 5, flexWrap: 'wrap', alignItems: 'center' },
  more: { fontFamily: F.regular, fontSize: 11.5, lineHeight: 15, color: C.textFaint },
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
  passLine: { fontFamily: F.semi, fontSize: 14, lineHeight: 19, color: C.text },
});
