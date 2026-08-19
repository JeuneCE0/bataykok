import React from 'react';
import { Pressable, StyleSheet, Switch, Text, View } from 'react-native';

import { play, syncMusic } from '../lib/sound';
import { useGame } from '../store/gameStore';
import { C, F } from '../theme';
import { Button, Card, SectionTitle } from './ui';

/** Réglages audio : certains jouent en silence, ça doit se couper en un geste. */
export default function SoundSettings() {
  const sfxOn = useGame((s) => s.sfxOn);
  const musicOn = useGame((s) => s.musicOn);
  const setSfxOn = useGame((s) => s.setSfxOn);
  const setMusicOn = useGame((s) => s.setMusicOn);
  const toggleMute = useGame((s) => s.toggleMute);
  const allOff = !sfxOn && !musicOn;

  return (
    <Card glow={allOff ? C.piment : undefined}>
      <SectionTitle icon="🔊">Son</SectionTitle>

      <Row
        label="Brui du zé"
        hint="Kou, piès, kofr, viktoir"
        value={sfxOn}
        onChange={(v) => {
          setSfxOn(v);
          if (v) play('tap');
        }}
      />
      <Row
        label="Mizik"
        hint="Boukl séga en fon"
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
        label={allOff ? 'Rémèt le son' : 'Koup tout le son'}
        onPress={() => {
          const on = toggleMute();
          syncMusic();
          if (on) play('tap');
        }}
        style={{ marginTop: 12 }}
      />
      <Text style={styles.hintAll}>
        Lo mèm bouton lé dan la bar du ho, pou koupé vitman.
      </Text>
    </Card>
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
        <Text style={styles.hint}>{hint}</Text>
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
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: C.hairlineSoft,
  },
  label: { fontFamily: F.bold, fontSize: 15, lineHeight: 20, color: C.text },
  hint: { fontFamily: F.regular, fontSize: 12.5, lineHeight: 17, color: C.textDim },
  hintAll: {
    fontFamily: F.regular,
    fontSize: 12,
    lineHeight: 16,
    color: C.textFaint,
    marginTop: 8,
    textAlign: 'center',
  },
});
