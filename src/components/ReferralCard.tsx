import * as Sharing from 'expo-sharing';
import React, { useEffect, useRef, useState } from 'react';
import { Share, StyleSheet, Text, TextInput, View } from 'react-native';
import ViewShot, { captureRef } from 'react-native-view-shot';

import {
  claimReferralRewards,
  fetchReferralState,
  redeemReferral,
  REFEREE_BONUS,
  REFERRER_BONUS,
  ReferralState,
} from '../lib/referral';
import { useGame } from '../store/gameStore';
import { C, F, R } from '../theme';
import ProfileCard from './ProfileCard';
import { Button, Card, Chip, GhostButton, SectionTitle } from './ui';

/** Parrainage et partage du kok : inviter, et donner envie d'être invité. */
export default function ReferralCard() {
  const player = useGame((s) => s.player);
  const onlineState = useGame((s) => s.onlineState);
  const grantBonus = useGame((s) => s.grantBonus);

  const [state, setState] = useState<ReferralState | null>(null);
  const [input, setInput] = useState('');
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const shotRef = useRef<React.ComponentRef<typeof ViewShot>>(null);

  useEffect(() => {
    if (onlineState !== 'ok') return;
    let alive = true;
    void fetchReferralState().then((s) => {
      if (alive) setState(s);
    });
    // les filleuls arrivés depuis la dernière visite sont payés ici
    void claimReferralRewards().then((kids) => {
      if (!alive || kids.length === 0) return;
      grantBonus({
        grains: REFERRER_BONUS.grains * kids.length,
        piments: REFERRER_BONUS.piments * kids.length,
      });
      setMsg(
        `🎉 ${kids.length} nouvo fiyel ! +🌶️${REFERRER_BONUS.piments * kids.length}`
      );
    });
    return () => {
      alive = false;
    };
  }, [onlineState, grantBonus]);

  if (!player) return null;

  const shareText = (code: string | null) =>
    `Vien batay ek mwin su Batay Kok ! 🐓⚔️\n` +
    `Mon kok : ${player.name}, niv. ${player.level}.\n` +
    (code ? `Rentre mon kod parrainaz ${code} : ou gagne 🌶️${REFEREE_BONUS.piments} + 🌽${REFEREE_BONUS.grains} pou démaré.` : '');

  const shareImage = async () => {
    try {
      const uri = await captureRef(shotRef, { format: 'png', quality: 1 });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: 'image/png',
          dialogTitle: 'Partaz out kok',
        });
      } else {
        await Share.share({ message: shareText(state?.code ?? null) });
      }
    } catch {
      setMsg('Partaz inposib su sé téléfone-là.');
    }
  };

  return (
    <>
      {/* hors écran : la carte n'existe que pour être capturée */}
      <View style={styles.offscreen} pointerEvents="none">
        <ViewShot ref={shotRef}>
          <ProfileCard player={player} code={state?.code ?? null} />
        </ViewShot>
      </View>

      <Card glow={state?.code ? C.gold : undefined}>
        <SectionTitle icon="🤝">Parrainaz</SectionTitle>

        {onlineState !== 'ok' ? (
          <Text style={styles.offline}>
            Faut ète en lign pou parrainn. Out kod i arrive dès ke la konèksyon
            i mars.
          </Text>
        ) : (
          <>
            <Text style={styles.intro}>
              Chak fiyel i rapport 🌶️{REFERRER_BONUS.piments}. Li, li gagne
              🌶️{REFEREE_BONUS.piments} + 🌽{REFEREE_BONUS.grains}.
            </Text>

            {state?.code && (
              <View style={styles.codeRow}>
                <View style={styles.codeBox}>
                  <Text style={styles.codeLabel}>OUT KOD</Text>
                  <Text style={styles.code}>{state.code}</Text>
                </View>
                <View style={{ flex: 1, gap: 6 }}>
                  <Button
                    full
                    size="sm"
                    icon="📤"
                    label="Envoy lo kod"
                    onPress={() => Share.share({ message: shareText(state.code) })}
                  />
                  <Button
                    full
                    size="sm"
                    variant="mystic"
                    icon="🖼️"
                    label="Partaz out kok"
                    onPress={shareImage}
                  />
                </View>
              </View>
            )}

            <View style={styles.chips}>
              <Chip
                label={`${state?.godchildren ?? 0} fiyel`}
                color={C.cane}
                active={(state?.godchildren ?? 0) > 0}
              />
              {state?.referredBy && (
                <Chip label={`Parin : ${state.referredBy}`} color={C.mystic} />
              )}
            </View>

            {!state?.referredBy && (
              <View style={styles.redeem}>
                <TextInput
                  style={styles.input}
                  value={input}
                  onChangeText={(t) => setInput(t.toUpperCase())}
                  placeholder="KOD PARIN"
                  placeholderTextColor={C.textFaint}
                  autoCapitalize="characters"
                  maxLength={6}
                />
                <Button
                  size="sm"
                  label="Valid"
                  disabled={input.trim().length < 4 || busy}
                  onPress={async () => {
                    setBusy(true);
                    const r = await redeemReferral(input);
                    setBusy(false);
                    if (r.ok) {
                      grantBonus(REFEREE_BONUS);
                      setMsg(
                        `🎁 ${r.referrer} lé out parin ! +🌶️${REFEREE_BONUS.piments} +🌽${REFEREE_BONUS.grains}`
                      );
                      setInput('');
                      void fetchReferralState().then(setState);
                    } else {
                      setMsg(r.error);
                    }
                  }}
                />
              </View>
            )}
          </>
        )}

        {msg && <Text style={styles.msg}>{msg}</Text>}
        {msg && (
          <GhostButton
            label="OK"
            onPress={() => setMsg(null)}
            style={{ alignSelf: 'flex-start', marginTop: 8 }}
          />
        )}
      </Card>
    </>
  );
}

const styles = StyleSheet.create({
  offscreen: { position: 'absolute', left: -9999, top: -9999 },
  intro: { fontFamily: F.regular, fontSize: 13.5, lineHeight: 19, color: C.textDim },
  offline: { fontFamily: F.regular, fontSize: 13.5, lineHeight: 19, color: C.textDim },
  codeRow: { flexDirection: 'row', gap: 12, alignItems: 'center', marginTop: 12 },
  codeBox: {
    alignItems: 'center',
    backgroundColor: 'rgba(255,201,60,0.10)',
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: 'rgba(255,201,60,0.35)',
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  codeLabel: {
    fontFamily: F.black,
    fontSize: 9,
    lineHeight: 12,
    letterSpacing: 1.3,
    color: C.textFaint,
  },
  code: {
    fontFamily: F.black,
    fontSize: 21,
    lineHeight: 27,
    letterSpacing: 3,
    color: C.gold,
  },
  chips: { flexDirection: 'row', gap: 6, flexWrap: 'wrap', marginTop: 12 },
  redeem: { flexDirection: 'row', gap: 8, alignItems: 'center', marginTop: 12 },
  input: {
    flex: 1,
    backgroundColor: 'rgba(6,3,12,0.55)',
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: C.hairline,
    color: C.text,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 16,
    letterSpacing: 2,
    fontFamily: F.black,
  },
  msg: { fontFamily: F.bold, fontSize: 13.5, lineHeight: 19, color: C.cane, marginTop: 10 },
});
