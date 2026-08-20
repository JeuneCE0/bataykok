import { LinearGradient } from 'expo-linear-gradient';
import React, { useEffect, useRef, useState } from 'react';
import { Animated, Modal, StyleSheet, Text, View } from 'react-native';
import Svg, { Circle, Defs, RadialGradient, Stop } from 'react-native-svg';

import { formatUntil, localDay, nextDailyReset } from '../game/day';
import { fmt } from '../game/formulas';
import { RARITY_COLORS, RARITY_LABELS } from '../game/items';
import { Offer, offerOfDay } from '../game/offers';
import { useT } from '../i18n/useT';
import { play } from '../lib/sound';
import { useGame } from '../store/gameStore';
import { BW, C, F, OUTLINE, R, SHADOW, SP, TEXT_OUTLINE } from '../theme';
import { Button, GhostButton } from './ui';

/**
 * Offre payante du jour.
 *
 * Le Bazar ne proposait qu'un pack de bienvenue permanent : rien qui donne une
 * raison de revenir un mardi plutôt qu'un lundi. Celle-ci se présente au
 * lancement, une par jour au plus, et affiche son compte à rebours — c'est la
 * rareté perçue qui fait l'offre, pas le montant de la remise.
 *
 * Aucun achat intégré n'est branché : le bouton l'annonce.
 */
export default function OfferModal() {
  const t = useT();
  const player = useGame((s) => s.player);
  const offersTaken = useGame((s) => s.offersTaken);
  const offerShownDay = useGame((s) => s.offerShownDay);
  const takeOffer = useGame((s) => s.takeOffer);
  const markOfferShown = useGame((s) => s.markOfferShown);

  const [offer, setOffer] = useState<Offer | null>(null);
  const [now, setNow] = useState(Date.now());
  const pop = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!player) return;
    const jour = localDay();
    if (offerShownDay === jour) return;
    const o = offerOfDay(player.level, offersTaken ?? [], jour);
    if (!o) return;
    // On marque tout de suite : une offre refusée ne doit pas revenir au
    // prochain rendu de l'écran.
    markOfferShown(jour);
    setOffer(o);
    play('confirm', 0.8);
    Animated.spring(pop, { toValue: 1, friction: 6, tension: 70, useNativeDriver: true }).start();
  }, [player, offersTaken, offerShownDay, markOfferShown, pop]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 30_000);
    return () => clearInterval(timer);
  }, []);

  if (!offer || !player) return <Modal visible={false} transparent animationType="fade" />;

  const fermer = () => setOffer(null);

  return (
    <Modal visible transparent animationType="fade" onRequestClose={fermer}>
      <View style={styles.root}>
        <Animated.View style={{ transform: [{ scale: pop }], width: '100%' }}>
          <LinearGradient
            colors={[`${offer.color}44`, '#140C20']}
            style={[styles.card, { borderColor: offer.color }]}
          >
            <View>
              {/* L'urgence en haut : un compte à rebours qui passe sous le pli
                  ne presse personne. */}
              <View style={styles.badgeRow}>
                <View style={[styles.badge, { backgroundColor: offer.color }]}>
                  <Text style={styles.badgeText}>{t('offer.badge')}</Text>
                </View>
                <View style={styles.saving}>
                  <Text style={styles.timerTop}>
                    ⏳ {formatUntil(nextDailyReset() - now)}
                  </Text>
                </View>
              </View>

              <Text style={styles.name}>{t(offer.nameKey)}</Text>
              <Text style={styles.pitch}>{t(offer.pitchKey)}</Text>

              <View style={styles.stage}>
                <Svg width={180} height={180} style={StyleSheet.absoluteFill}>
                  <Defs>
                    <RadialGradient id="og" cx="50%" cy="50%" r="50%">
                      <Stop offset="0" stopColor={offer.color} stopOpacity={0.6} />
                      <Stop offset="1" stopColor={offer.color} stopOpacity={0} />
                    </RadialGradient>
                  </Defs>
                  <Circle cx={90} cy={90} r={90} fill="url(#og)" />
                </Svg>
                <Text style={styles.icon}>{offer.icon}</Text>
                <View style={[styles.pedestal, { backgroundColor: offer.color }]} />
              </View>

              <Text style={styles.section}>{t('offer.contains')}</Text>
              <View style={styles.loot}>
                <Lot icon="🌶️" value={fmt(offer.piments)} />
                <Lot icon="🌽" value={fmt(offer.grains)} />
                {offer.itemRarity ? (
                  <Lot
                    icon="🎁"
                    value={RARITY_LABELS[offer.itemRarity]}
                    couleur={RARITY_COLORS[offer.itemRarity]}
                  />
                ) : null}
              </View>


            </View>

            {/* Hors du défilement : un prix qui passe sous le pli ne compare
                rien. */}
            <View style={styles.prices}>
              <Text style={styles.old}>{offer.oldPrice}</Text>
              <Text style={styles.now}>{offer.price}</Text>
              <View style={[styles.savingPill, { borderColor: offer.color }]}>
                <Text style={[styles.savingText, { color: offer.color }]}>
                  {t('offer.saving', { n: offer.saving })}
                </Text>
              </View>
            </View>

            <Button
              full
              size="lg"
              variant="cane"
              label={t('offer.take')}
              onPress={() => {
                takeOffer(offer.id);
                play('coin', 0.9);
                fermer();
              }}
              style={{ marginTop: SP.md }}
            />
            <Text style={styles.proto}>{t('offer.proto')}</Text>
            <GhostButton
              label={t('offer.later')}
              onPress={fermer}
              style={{ alignSelf: 'center', marginTop: SP.xs }}
            />
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}

function Lot({ icon, value, couleur }: { icon: string; value: string; couleur?: string }) {
  return (
    <View style={styles.lot}>
      <Text style={styles.lotIcon}>{icon}</Text>
      <Text style={[styles.lotValue, couleur ? { color: couleur } : null]} numberOfLines={1}>
        {value}
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'rgba(4,2,8,0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    maxHeight: '96%',
    borderRadius: R.xl,
    borderWidth: BW.thick,
    backgroundColor: '#140C20',
    padding: 16,
    ...SHADOW.float,
  },
  badgeRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' },
  badge: { borderRadius: R.pill, paddingHorizontal: 12, paddingVertical: 4 },
  badgeText: {
    fontFamily: F.black,
    fontSize: 11,
    lineHeight: 15,
    letterSpacing: 1,
    color: C.ink,
    includeFontPadding: false,
  },
  saving: {
    borderRadius: R.pill,
    borderWidth: BW.thick,
    borderColor: OUTLINE,
    backgroundColor: C.well,
    paddingHorizontal: 12,
    paddingVertical: 4,
  },
  savingText: { fontFamily: F.black, fontSize: 15, lineHeight: 20, includeFontPadding: false },
  name: {
    fontFamily: F.black,
    fontSize: 24,
    lineHeight: 32,
    color: C.text,
    textAlign: 'center',
    marginTop: 8,
    ...TEXT_OUTLINE,
  },
  pitch: {
    fontFamily: F.regular,
    fontSize: 13,
    lineHeight: 17,
    color: C.textDim,
    textAlign: 'center',
  },
  stage: { height: 96, alignItems: 'center', justifyContent: 'center' },
  icon: { fontSize: 44, lineHeight: 58 },
  pedestal: {
    position: 'absolute',
    bottom: 14,
    width: 92,
    height: 8,
    borderRadius: 4,
    opacity: 0.4,
  },
  section: {
    fontFamily: F.black,
    fontSize: 11,
    lineHeight: 15,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: C.textFaint,
    textAlign: 'center',
  },
  loot: { flexDirection: 'row', gap: 8, marginTop: 8 },
  // icône et valeur côte à côte : empilées, les trois capsules poussaient le
  // reste sous le pli
  lot: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    borderRadius: R.md,
    borderWidth: BW.thick,
    borderColor: OUTLINE,
    borderTopColor: 'rgba(0,0,0,0.85)',
    backgroundColor: C.well,
    paddingVertical: 8,
  },
  lotIcon: { fontSize: 17, lineHeight: 22 },
  lotValue: { fontFamily: F.black, fontSize: 13, lineHeight: 17, color: C.text },
  timerTop: {
    fontFamily: F.black,
    fontSize: 13,
    lineHeight: 17,
    color: C.gold,
    includeFontPadding: false,
  },
  savingPill: {
    borderRadius: R.pill,
    borderWidth: BW.thick,
    backgroundColor: C.well,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  prices: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 12 },
  old: {
    fontFamily: F.semi,
    fontSize: 17,
    lineHeight: 22,
    color: C.textFaint,
    textDecorationLine: 'line-through',
  },
  now: { fontFamily: F.black, fontSize: 31, lineHeight: 41, color: C.cane, ...TEXT_OUTLINE },
  proto: {
    fontFamily: F.regular,
    fontSize: 11,
    lineHeight: 15,
    color: C.textFaint,
    textAlign: 'center',
    marginTop: 4,
  },
});
