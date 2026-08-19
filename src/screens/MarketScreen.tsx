import React, { useCallback, useEffect, useState } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';

import FadeIn from '../components/FadeIn';
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
import { fmt, SLOT_ICONS } from '../game/formulas';
import { RARITY_COLORS, RARITY_LABELS } from '../game/items';
import { compareToEquipped } from '../game/power';
import { AttrId, Item } from '../game/types';
import {
  buyListing,
  cancelListing,
  claimSales,
  fetchListings,
  fetchQuote,
  Listing,
  MARKET_FEE,
  listItem,
  Quote,
} from '../lib/market';
import { useGame } from '../store/gameStore';
import { C, F, R } from '../theme';
import { CompareLines, VerdictBadge } from '../components/ItemCompare';

export default function MarketScreen() {
  const player = useGame((s) => s.player);
  const onlineState = useGame((s) => s.onlineState);
  const removeItem = useGame((s) => s.removeItem);
  const addItem = useGame((s) => s.addItem);
  const spendGrains = useGame((s) => s.spendGrains);
  const grantBonus = useGame((s) => s.grantBonus);

  const [view, setView] = useState<'buy' | 'sell'>('buy');
  const [listings, setListings] = useState<Listing[]>([]);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [selling, setSelling] = useState<Item | null>(null);
  const [price, setPrice] = useState('');
  const [quote, setQuote] = useState<Quote | null>(null);
  const [open, setOpen] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setListings(await fetchListings());
  }, []);

  useEffect(() => {
    if (onlineState !== 'ok') return;
    void reload();
    // les ventes conclues pendant l'absence se règlent ici
    void claimSales().then((sales) => {
      if (sales.length === 0) return;
      const total = sales.reduce((s, x) => s + Math.round(x.price * (1 - MARKET_FEE)), 0);
      grantBonus({ grains: total });
      setMsg(`💰 ${sales.length} ventes conclues — +🌽${fmt(total)} (commission ${MARKET_FEE * 100} %)`);
    });
  }, [onlineState, reload, grantBonus]);

  useEffect(() => {
    if (!selling) {
      setQuote(null);
      return;
    }
    void fetchQuote(selling).then(setQuote);
  }, [selling]);

  if (!player) return null;

  if (onlineState !== 'ok') {
    return (
      <ScrollView style={styles.root} contentContainerStyle={styles.content}>
        <ScreenTitle title="Lotèl dé Vant" sub="Acheter et vendre entre joueurs" accent={C.lagoon} />
        <Card>
          <Text style={T.dim}>
            L’hôtel ne fonctionne qu’en ligne. Dès que la connexion revient, les
            annonces apparaissent ici.
          </Text>
        </Card>
      </ScrollView>
    );
  }

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <ScreenTitle title="Lotèl dé Vant" sub="Acheter et vendre entre joueurs" accent={C.lagoon} />

      <Segmented
        value={view}
        onChange={setView}
        options={[
          { id: 'buy', label: '🛍️  Acheter' },
          { id: 'sell', label: '🏷️  Vendre' },
        ]}
      />

      {msg && (
        <Card glow={C.cane} compact>
          <Text style={styles.msg}>{msg}</Text>
          <GhostButton label="OK" onPress={() => setMsg(null)} style={{ marginTop: 8 }} />
        </Card>
      )}

      {view === 'buy' ? (
        <>
          <GhostButton
            icon="🔄"
            label="Rafraîchir"
            onPress={reload}
            style={{ alignSelf: 'center', marginVertical: 6 }}
          />
          {listings.length === 0 ? (
            <Card>
              <Text style={T.dim}>
                Pas encore d’annonce. Sois le premier à vendre quelque chose !
              </Text>
            </Card>
          ) : (
            listings.map((l, i) => {
              const col = RARITY_COLORS[l.item.rarity];
              const cmp = compareToEquipped(l.item, player);
              return (
                <FadeIn key={l.id} index={i}>
                  <Card glow={cmp.diff > 0 ? C.cane : undefined} compact>
                    <View style={styles.row}>
                      <View style={[styles.icon, { borderColor: col }]}>
                        <Text style={{ fontSize: 22 }}>{SLOT_ICONS[l.item.slot]}</Text>
                      </View>
                      <View style={{ flex: 1, gap: 4 }}>
                        <Text style={[styles.name, { color: col }]} numberOfLines={1}>
                          {l.item.name}
                        </Text>
                        <View style={styles.chips}>
                          <Chip label={RARITY_LABELS[l.item.rarity]} color={col} />
                          <VerdictBadge cmp={cmp} compact />
                        </View>
                        <Text style={styles.stats} numberOfLines={2}>
                          niv. {l.item.level} · {itemStats(l.item)}
                        </Text>
                        <Text style={styles.seller}>Vendu par {l.sellerName}</Text>
                        {open === l.id && <CompareLines cmp={cmp} />}
                      </View>
                      <View style={{ alignItems: 'flex-end', gap: 6 }}>
                        <Text style={styles.price}>🌽 {fmt(l.price)}</Text>
                        {l.isMine ? (
                          <GhostButton
                            label="Retirer"
                            onPress={async () => {
                              const it = await cancelListing(l.id);
                              if (it && addItem(it)) {
                                setMsg('Annonce retirée, objet remis dans ton sak.');
                                void reload();
                              }
                            }}
                          />
                        ) : (
                          <Button
                            size="sm"
                            variant={cmp.diff > 0 ? 'cane' : 'gold'}
                            label="Acheter"
                            disabled={player.grains < l.price || busy}
                            onPress={async () => {
                              setBusy(true);
                              const r = await buyListing(l.id);
                              if (!r.ok) {
                                setMsg(r.error);
                              } else if (!spendGrains(r.price)) {
                                setMsg('Pas assez de grains.');
                              } else if (!addItem(r.item)) {
                                grantBonus({ grains: r.price });
                                setMsg('Ton sak est plein — achat annulé.');
                              } else {
                                setMsg(`✅ ${r.item.name} est dans ton sak !`);
                              }
                              setBusy(false);
                              void reload();
                            }}
                          />
                        )}
                        <GhostButton
                          label={open === l.id ? 'Moins' : 'Détay'}
                          onPress={() => setOpen(open === l.id ? null : l.id)}
                        />
                      </View>
                    </View>
                  </Card>
                </FadeIn>
              );
            })
          )}
        </>
      ) : (
        <>
          <Card>
            <SectionTitle icon="🏷️">Sak — choisir un objet à vendre</SectionTitle>
            {player.inventory.length === 0 ? (
              <Text style={T.dim}>Ton sak est vide.</Text>
            ) : (
              player.inventory.map((it) => {
                const col = RARITY_COLORS[it.rarity];
                const on = selling?.id === it.id;
                return (
                  <View key={it.id} style={[styles.pick, on && { borderColor: col }]}>
                    <Text style={{ fontSize: 18 }}>{SLOT_ICONS[it.slot]}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={[styles.name, { color: col }]} numberOfLines={1}>
                        {it.name}
                      </Text>
                      <Text style={styles.stats}>
                        {RARITY_LABELS[it.rarity]} · niv. {it.level}
                      </Text>
                    </View>
                    <Button
                      size="sm"
                      variant={on ? 'cane' : 'slate'}
                      label={on ? '✓' : 'Choizi'}
                      onPress={() => {
                        setSelling(on ? null : it);
                        setPrice('');
                      }}
                    />
                  </View>
                );
              })
            )}
          </Card>

          {selling && (
            <Card glow={C.lagoon}>
              <SectionTitle icon="💰">Prix de vente</SectionTitle>
              <Text style={styles.quote}>
                {quote && quote.sales > 0
                  ? `Cote du marché : ~🌽${fmt(quote.median)} (${quote.sales} vant · de ${fmt(
                      quote.min
                    )} à ${fmt(quote.max)})`
                  : `Pas encore de vente comparable. Le Bazar rachète à 🌽${fmt(
                      Math.round(selling.price * 0.4)
                    )}.`}
              </Text>
              <View style={styles.priceRow}>
                <TextInput
                  style={styles.input}
                  value={price}
                  onChangeText={(t) => setPrice(t.replace(/[^0-9]/g, ''))}
                  placeholder={String(quote?.median ?? selling.price)}
                  placeholderTextColor={C.textFaint}
                  keyboardType="number-pad"
                  maxLength={8}
                />
                <Button
                  label="Mettre en vente"
                  disabled={!price || Number(price) < 1 || busy}
                  onPress={async () => {
                    const p = Number(price);
                    setBusy(true);
                    const ok = await listItem(selling, p);
                    setBusy(false);
                    if (!ok) {
                      setMsg('Mise en vente impossible.');
                      return;
                    }
                    removeItem(selling.id);
                    setSelling(null);
                    setPrice('');
                    setMsg(`🏷️ ${selling.name} est en vente pour 🌽${fmt(p)}.`);
                    void reload();
                  }}
                />
              </View>
              <Text style={styles.fee}>
                Commission de l’hôtel : {MARKET_FEE * 100} % sur la vente.
              </Text>
            </Card>
          )}
        </>
      )}
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
  row: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  icon: {
    width: 46,
    height: 46,
    borderRadius: R.md,
    borderWidth: 1.5,
    backgroundColor: 'rgba(6,3,12,0.45)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: { fontFamily: F.black, fontSize: 15.5, lineHeight: 20 },
  chips: { flexDirection: 'row', gap: 5, flexWrap: 'wrap', alignItems: 'center' },
  stats: { fontFamily: F.regular, fontSize: 12.5, lineHeight: 17, color: C.textDim },
  seller: { fontFamily: F.semi, fontSize: 11.5, lineHeight: 15, color: C.textFaint },
  price: { fontFamily: F.black, fontSize: 17, lineHeight: 22, color: C.gold },
  pick: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: C.hairlineSoft,
  },
  quote: { fontFamily: F.semi, fontSize: 13.5, lineHeight: 19, color: C.lagoon },
  priceRow: { flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 12 },
  input: {
    flex: 1,
    backgroundColor: 'rgba(6,3,12,0.55)',
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: C.hairline,
    color: C.text,
    paddingHorizontal: 14,
    paddingVertical: 11,
    fontSize: 16,
    fontFamily: F.black,
  },
  fee: { fontFamily: F.regular, fontSize: 12, lineHeight: 16, color: C.textFaint, marginTop: 8 },
  msg: { fontFamily: F.bold, fontSize: 13.5, lineHeight: 19, color: C.cane },
});
