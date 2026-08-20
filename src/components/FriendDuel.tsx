import React, { useEffect, useState } from 'react';
import { Share, StyleSheet, Text, TextInput, View } from 'react-native';

import { CLASSES } from '../game/classes';
import { OnlineKok, findKokByCode } from '../lib/online';
import { fetchReferralState } from '../lib/referral';
import { isOnlineEnabled } from '../lib/supabase';
import { useT } from '../i18n/useT';
import { BW, C, F, OUTLINE, R, SP } from '../theme';
import Rooster from './Rooster';
import { Button, Card, Chip, GhostButton, SectionTitle } from './ui';

/**
 * Duel entre amis.
 *
 * Le code de parrainage ne servait qu'à inviter : deux joueurs qui se
 * connaissaient n'avaient aucun moyen de s'affronter, le rond ne proposant que
 * les voisins de classement. Le même code sert désormais d'adresse de duel.
 */
export default function FriendDuel({ onDuel }: { onDuel: (k: OnlineKok) => void }) {
  const t = useT();
  const [code, setCode] = useState('');
  const [monCode, setMonCode] = useState<string | null>(null);
  const [trouve, setTrouve] = useState<OnlineKok | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!isOnlineEnabled) return;
    void fetchReferralState().then((r) => setMonCode(r?.code ?? null));
  }, []);

  if (!isOnlineEnabled) return null;

  return (
    <Card>
      <SectionTitle icon="🤝">{t('duel.title')}</SectionTitle>
      <Text style={styles.sub}>{t('duel.sub')}</Text>

      {monCode ? (
        <View style={styles.mine}>
          <Text style={styles.mineLabel}>{t('duel.myCode')}</Text>
          <View style={styles.codeBox}>
            <Text style={styles.code} selectable>
              {monCode}
            </Text>
          </View>
          <GhostButton
            icon="📤"
            label={t('referral.send')}
            onPress={() =>
              void Share.share({
                message: `Batay Kok — défie mon kok avec mon code : ${monCode}`,
              })
            }
          />
        </View>
      ) : null}

      <View style={styles.searchRow}>
        <TextInput
          style={styles.input}
          value={code}
          onChangeText={(v) => setCode(v.toUpperCase().replace(/[^A-Z0-9]/g, ''))}
          placeholder={t('duel.placeholder')}
          placeholderTextColor={C.textFaint}
          autoCapitalize="characters"
          maxLength={12}
        />
        <Button
          size="sm"
          label={t('duel.search')}
          disabled={busy || code.length < 4}
          onPress={async () => {
            setBusy(true);
            setMsg(null);
            const k = await findKokByCode(code);
            setBusy(false);
            if (!k) {
              setTrouve(null);
              setMsg(t('duel.notFound'));
              return;
            }
            setTrouve(k);
          }}
        />
      </View>

      {msg ? <Text style={styles.msg}>{msg}</Text> : null}

      {trouve ? (
        <View style={styles.found}>
          <Rooster appearance={trouve.appearance} size={64} ground={false} />
          <View style={{ flex: 1, gap: 4 }}>
            <Text style={styles.name} numberOfLines={1}>
              {trouve.name}
            </Text>
            <Chip
              icon={CLASSES[trouve.classId].emoji}
              label={t('common.level', { n: trouve.level })}
              color={CLASSES[trouve.classId].color}
              style={{ alignSelf: 'flex-start' }}
            />
          </View>
          <Button
            variant="ember"
            icon="⚔️"
            label={t('rond.challenge')}
            onPress={() => {
              onDuel(trouve);
              setTrouve(null);
              setCode('');
            }}
          />
        </View>
      ) : null}
    </Card>
  );
}

const styles = StyleSheet.create({
  sub: { fontFamily: F.regular, fontSize: 13, lineHeight: 17, color: C.textDim, marginTop: 2 },
  mine: { alignItems: 'center', gap: SP.sm, marginTop: SP.md },
  mineLabel: {
    fontFamily: F.black,
    fontSize: 11,
    lineHeight: 15,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: C.textFaint,
  },
  codeBox: {
    borderRadius: R.md,
    borderWidth: BW.thick,
    borderColor: OUTLINE,
    borderTopColor: 'rgba(0,0,0,0.85)',
    backgroundColor: C.well,
    paddingHorizontal: SP.lg,
    paddingVertical: SP.sm,
  },
  code: {
    fontFamily: F.black,
    fontSize: 24,
    lineHeight: 32,
    letterSpacing: 3,
    color: C.gold,
    includeFontPadding: false,
  },
  searchRow: { flexDirection: 'row', gap: SP.sm, alignItems: 'center', marginTop: SP.md },
  input: {
    flex: 1,
    borderRadius: R.md,
    borderWidth: BW.thick,
    borderColor: OUTLINE,
    backgroundColor: C.well,
    paddingHorizontal: SP.md,
    paddingVertical: SP.sm,
    fontFamily: F.black,
    fontSize: 15,
    letterSpacing: 2,
    color: C.text,
  },
  msg: {
    fontFamily: F.semi,
    fontSize: 13,
    lineHeight: 17,
    color: C.piment,
    textAlign: 'center',
    marginTop: SP.sm,
  },
  found: { flexDirection: 'row', alignItems: 'center', gap: SP.md, marginTop: SP.md },
  name: { fontFamily: F.black, fontSize: 15, lineHeight: 20, color: C.text },
});
