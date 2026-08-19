import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Modal, Pressable, ScrollView, StyleSheet, Switch, Text, View } from 'react-native';

import { LANGS, Lang } from '../i18n';
import { useT } from '../i18n/useT';
import { play, syncMusic } from '../lib/sound';
import { useGame } from '../store/gameStore';
import { C, F, R, SHADOW } from '../theme';
import { Button, Card, SectionTitle } from './ui';

/** Réglages du jeu : langue, son, compte. */
export default function SettingsModal({
  visible,
  onClose,
}: {
  visible: boolean;
  onClose: () => void;
}) {
  const t = useT();
  const lang = useGame((s) => s.lang);
  const setLang = useGame((s) => s.setLang);
  const sfxOn = useGame((s) => s.sfxOn);
  const musicOn = useGame((s) => s.musicOn);
  const setSfxOn = useGame((s) => s.setSfxOn);
  const setMusicOn = useGame((s) => s.setMusicOn);
  const toggleMute = useGame((s) => s.toggleMute);
  const onlineState = useGame((s) => s.onlineState);
  const allOff = !sfxOn && !musicOn;

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.root}>
        <LinearGradient colors={['#2A1A3D', '#0B0714']} style={styles.sheet}>
          <View style={styles.grip} />
          <Text style={styles.title}>{t('settings.title')}</Text>
          <Text style={styles.sub}>{t('settings.sub')}</Text>

          <ScrollView showsVerticalScrollIndicator={false} style={{ marginTop: 4 }}>
            <Card compact>
              <SectionTitle icon="🗣️">{t('settings.lang.section')}</SectionTitle>
              <View style={styles.langs}>
                {LANGS.map((l) => (
                  <LangCard
                    key={l.id}
                    {...l}
                    active={lang === l.id}
                    onPress={() => {
                      setLang(l.id as Lang);
                      play('tap');
                    }}
                  />
                ))}
              </View>
              <Text style={styles.hint}>{t('settings.lang.hint')}</Text>
            </Card>

            <Card compact>
              <SectionTitle icon="🔊">{t('settings.sound.section')}</SectionTitle>
              <Row
                label={t('settings.sound.sfx')}
                hint={t('settings.sound.sfxHint')}
                value={sfxOn}
                onChange={(v) => {
                  setSfxOn(v);
                  if (v) play('tap');
                }}
              />
              <Row
                label={t('settings.sound.music')}
                hint={t('settings.sound.musicHint')}
                value={musicOn}
                onChange={(v) => {
                  setMusicOn(v);
                  syncMusic();
                }}
              />
              <Button
                full
                variant={allOff ? 'cane' : 'slate'}
                icon={allOff ? '🔊' : '🔇'}
                label={allOff ? t('settings.sound.unmute') : t('settings.sound.muteAll')}
                onPress={() => {
                  const on = toggleMute();
                  syncMusic();
                  if (on) play('tap');
                }}
                style={{ marginTop: 12 }}
              />
              <Text style={styles.hint}>{t('settings.sound.hudHint')}</Text>
            </Card>

            <Card compact>
              <SectionTitle icon="👤">{t('settings.account.section')}</SectionTitle>
              <View style={styles.line}>
                <Text style={styles.lineLabel}>{t('settings.account.id')}</Text>
                <Text style={styles.lineValue}>
                  {onlineState === 'ok' ? '🟢' : onlineState === 'error' ? '🔴' : '⚪️'}{' '}
                  {onlineState === 'ok' ? 'en ligne' : t('settings.account.offline')}
                </Text>
              </View>
            </Card>
          </ScrollView>

          <Button full size="lg" label={t('common.close')} onPress={onClose} style={{ marginTop: 10 }} />
        </LinearGradient>
      </View>
    </Modal>
  );
}

function LangCard({
  label,
  sub,
  flag,
  active,
  onPress,
}: {
  label: string;
  sub: string;
  flag: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.lang,
        active && styles.langOn,
        pressed && { opacity: 0.75 },
      ]}
    >
      <Text style={styles.langFlag}>{flag}</Text>
      <Text style={[styles.langLabel, active && { color: C.gold }]} numberOfLines={1}>
        {label}
      </Text>
      <Text style={styles.langSub} numberOfLines={1}>
        {sub}
      </Text>
      {active ? <Text style={styles.langTick}>✓</Text> : null}
    </Pressable>
  );
}

function Row({
  label,
  hint,
  value,
  onChange,
}: {
  label: string;
  hint: string;
  value: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <Pressable style={styles.row} onPress={() => onChange(!value)}>
      <View style={{ flex: 1 }}>
        <Text style={styles.label}>{label}</Text>
        <Text style={styles.rowHint}>{hint}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onChange}
        trackColor={{ false: 'rgba(255,246,232,0.14)', true: C.cane }}
        thumbColor="#fff"
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: 'rgba(4,2,8,0.86)', justifyContent: 'flex-end' },
  sheet: {
    maxHeight: '92%',
    borderTopLeftRadius: R.xl,
    borderTopRightRadius: R.xl,
    borderTopWidth: 1,
    borderColor: C.hairline,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 26,
    ...SHADOW.float,
  },
  grip: {
    alignSelf: 'center',
    width: 44,
    height: 4,
    borderRadius: 2,
    backgroundColor: C.hairline,
    marginBottom: 12,
  },
  title: {
    fontFamily: F.black,
    fontSize: 24,
    lineHeight: 31,
    color: C.text,
    textAlign: 'center',
  },
  sub: {
    fontFamily: F.regular,
    fontSize: 13,
    lineHeight: 18,
    color: C.textDim,
    textAlign: 'center',
    marginBottom: 8,
  },
  langs: { flexDirection: 'row', gap: 10, marginTop: 4 },
  lang: {
    flex: 1,
    alignItems: 'center',
    gap: 2,
    paddingVertical: 14,
    paddingHorizontal: 8,
    borderRadius: R.lg,
    borderWidth: 1.5,
    borderColor: C.hairlineSoft,
    backgroundColor: 'rgba(6,3,12,0.45)',
  },
  langOn: { borderColor: C.gold, backgroundColor: 'rgba(255,201,60,0.10)' },
  langFlag: { fontSize: 26, lineHeight: 32 },
  langLabel: {
    fontFamily: F.black,
    fontSize: 14.5,
    lineHeight: 19,
    color: C.text,
    textAlign: 'center',
    includeFontPadding: false,
  },
  langSub: {
    fontFamily: F.regular,
    fontSize: 11.5,
    lineHeight: 15,
    color: C.textFaint,
    textAlign: 'center',
  },
  langTick: { position: 'absolute', top: 6, right: 8, color: C.gold, fontSize: 13 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: C.hairlineSoft,
  },
  label: { fontFamily: F.bold, fontSize: 15, lineHeight: 20, color: C.text },
  rowHint: { fontFamily: F.regular, fontSize: 12.5, lineHeight: 17, color: C.textDim },
  hint: {
    fontFamily: F.regular,
    fontSize: 12,
    lineHeight: 16,
    color: C.textFaint,
    marginTop: 8,
    textAlign: 'center',
  },
  line: { flexDirection: 'row', justifyContent: 'space-between', paddingVertical: 6 },
  lineLabel: { fontFamily: F.semi, fontSize: 14, lineHeight: 19, color: C.textDim },
  lineValue: { fontFamily: F.black, fontSize: 14, lineHeight: 19, color: C.text },
});
