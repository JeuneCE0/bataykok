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
import { useT } from '../i18n/useT';

/** {t('referral.title')} et partage du kok : inviter, et donner envie d'être invité. */
export default function ReferralCard() {
  const t = useT();
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
        `🎉 ${kids.length} nouveaux filleuls ! +🌶️${REFERRER_BONUS.piments * kids.length}`
      );
    });
    return () => {
      alive = false;
    };
  }, [onlineState, grantBonus]);

  if (!player) return null;

  const shareText = (code: string | null) =>
    `Viens te battre avec moi sur Batay Kok ! 🐓⚔️\n` +
    `Mon kok : ${player.name}, niv. ${player.level}.\n` +
    (code ? `Entre mon code de parrainage ${code} : tu reçois 🌶️${REFEREE_BONUS.piments} + 🌽${REFEREE_BONUS.grains} pour démarrer.` : '');

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
      setMsg('Partage impossible sur cet appareil.');
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
        <SectionTitle icon="🤝">{t('referral.title')}</SectionTitle>

        {onlineState !== 'ok' ? (
          <Text style={styles.offline}>
            Il faut être en ligne pour parrainer. Ton code arrive dès que la
            connexion revient.
          </Text>
        ) : (
          <>
            <Text style={styles.intro}>
              Chaque filleul rapporte 🌶️{REFERRER_BONUS.piments}. Lui, il reçoit
              🌶️{REFEREE_BONUS.piments} + 🌽{REFEREE_BONUS.grains}.
            </Text>

            {state?.code && (
              <View style={styles.codeRow}>
                <View style={styles.codeBox}>
                  <Text style={styles.codeLabel}>{t('referral.code')}</Text>
                  <Text style={styles.code}>{state.code}</Text>
                </View>
                <View style={{ flex: 1, gap: 6 }}>
                  <Button
                    full
                    size="sm"
                    icon="📤"
                    label={t('referral.send')}
                    onPress={() => Share.share({ message: shareText(state.code) })}
                  />
                  <Button
                    full
                    size="sm"
                    variant="mystic"
                    icon="🖼️"
                    label={t('referral.share')}
                    onPress={shareImage}
                  />
                </View>
              </View>
            )}

            <View style={styles.chips}>
              <Chip
                label={t('referral.godchildren', { n: state?.godchildren ?? 0 })}
                color={C.cane}
                active={(state?.godchildren ?? 0) > 0}
              />
              {state?.referredBy && (
                <Chip label={t('referral.parent', { name: state.referredBy })} color={C.mystic} />
              )}
            </View>

            {!state?.referredBy && (
              <View style={styles.redeem}>
                <TextInput
                  style={styles.input}
                  value={input}
                  onChangeText={(t) => setInput(t.toUpperCase())}
                  placeholder="{t('referral.parentCode')}"
                  placeholderTextColor={C.textFaint}
                  autoCapitalize="characters"
                  maxLength={6}
                />
                <Button
                  size="sm"
                  label={t('referral.validate')}
                  disabled={input.trim().length < 4 || busy}
                  onPress={async () => {
                    setBusy(true);
                    const r = await redeemReferral(input);
                    setBusy(false);
                    if (r.ok) {
                      grantBonus(REFEREE_BONUS);
                      setMsg(
                        `🎁 ${r.referrer} est ton parrain ! +🌶️${REFEREE_BONUS.piments} +🌽${REFEREE_BONUS.grains}`
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
