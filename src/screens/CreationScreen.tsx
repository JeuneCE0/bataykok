import { LinearGradient } from 'expo-linear-gradient';
import React, { useState } from 'react';
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

import Rooster from '../components/Rooster';
import { Button, Card, Chip, SectionTitle, T } from '../components/ui';
import {
} from '../game/bots';
import {
  ACCESSORIES,
  BODY_COLORS,
  COMB_COLORS,
  FREE_COUNTS,
  TAIL_PALETTES,
} from '../game/cosmetics';
import { ATTR_LABELS, CLASS_LIST } from '../game/classes';
import { randomKokName } from '../game/names';
import { Appearance } from '../game/types';
import { useT } from '../i18n/useT';
import { useGame } from '../store/gameStore';
import { C, F, R, SHADOW, shade } from '../theme';

export default function CreationScreen() {
  const t = useT();
  const createPlayer = useGame((s) => s.createPlayer);
  const [classIdx, setClassIdx] = useState(0);
  const [name, setName] = useState(randomKokName());
  const [appearance, setAppearance] = useState<Appearance>({
    bodyColor: BODY_COLORS[0],
    combColor: COMB_COLORS[0],
    tailPalette: 0,
    accessory: 0,
  });

  const cls = CLASS_LIST[classIdx];
  const prev = () => setClassIdx((classIdx - 1 + CLASS_LIST.length) % CLASS_LIST.length);
  const next = () => setClassIdx((classIdx + 1) % CLASS_LIST.length);

  return (
    <ScrollView style={styles.root} contentContainerStyle={styles.content}>
      <View style={styles.header}>
        <Text style={styles.brand}>BATAY KOK</Text>
        <Text style={styles.tagline}>{t('creation.tagline')}</Text>
      </View>

      {/* Sélecteur de classe */}
      <View style={styles.classRow}>
        {CLASS_LIST.map((c, i) => {
          const on = i === classIdx;
          return (
            <Pressable key={c.id} onPress={() => setClassIdx(i)}>
              <LinearGradient
                colors={
                  on
                    ? [shade(c.color, 45), c.color, shade(c.color, -45)]
                    : ['rgba(255,246,232,0.10)', 'rgba(255,246,232,0.03)']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 0.6, y: 1 }}
                style={[
                  styles.classDot,
                  on
                    ? {
                        borderColor: '#fff',
                        shadowColor: c.color,
                        shadowOpacity: 0.75,
                        shadowRadius: 12,
                        shadowOffset: { width: 0, height: 4 },
                        transform: [{ scale: 1.08 }],
                      }
                    : { borderColor: C.hairline },
                ]}
              >
                <Text style={{ fontSize: 20, opacity: on ? 1 : 0.5 }}>{c.emoji}</Text>
              </LinearGradient>
            </Pressable>
          );
        })}
      </View>

      {/* Scène : le coq sur son podium */}
      <Card glow={cls.color} style={{ paddingTop: 2 }}>
        <View style={styles.stage}>
          <View
            style={[
              styles.halo,
              { backgroundColor: cls.color, shadowColor: cls.color },
            ]}
          />
          <Arrow dir="left" onPress={prev} />
          <Rooster appearance={appearance} size={168} alive />
          <Arrow dir="right" onPress={next} />
        </View>

        <Text style={[styles.className, { color: cls.color }]}>
          {cls.emoji} {cls.name}
        </Text>
        <Text style={styles.classSub}>{t(cls.subtitleKey)}</Text>

        <View style={styles.chipRow}>
          <Chip icon="★" label={ATTR_LABELS[cls.mainAttr]} color={C.gold} />
          <Chip label={t(cls.subtitleKey)} color={cls.color} />
        </View>

        <Text style={styles.desc}>{t(cls.descriptionKey)}</Text>
        <Text style={styles.flavor}>« {t(cls.flavorKey)} »</Text>
      </Card>

      {/* Apparence */}
      <Card>
        <SectionTitle icon="🎨">{t('creation.appearance')}</SectionTitle>

        <Text style={styles.optLabel}>{t('creation.bodyColor')}</Text>
        <View style={styles.swatchRow}>
          {BODY_COLORS.slice(0, FREE_COUNTS.body).map((c) => (
            <Swatch
              key={c}
              color={c}
              active={appearance.bodyColor === c}
              onPress={() => setAppearance({ ...appearance, bodyColor: c })}
            />
          ))}
        </View>

        <Text style={styles.optLabel}>{t('creation.combColor')}</Text>
        <View style={styles.swatchRow}>
          {COMB_COLORS.slice(0, FREE_COUNTS.comb).map((c) => (
            <Swatch
              key={c}
              color={c}
              active={appearance.combColor === c}
              onPress={() => setAppearance({ ...appearance, combColor: c })}
            />
          ))}
        </View>

        <Text style={styles.optLabel}>{t('creation.tail')}</Text>
        <View style={styles.swatchRow}>
          {TAIL_PALETTES.slice(0, FREE_COUNTS.tail).map((p, i) => (
            <Pressable
              key={i}
              onPress={() => setAppearance({ ...appearance, tailPalette: i })}
              style={[
                styles.palette,
                appearance.tailPalette === i ? styles.swatchOn : null,
              ]}
            >
              {p.map((c) => (
                <View key={c} style={{ flex: 1, backgroundColor: c }} />
              ))}
            </Pressable>
          ))}
        </View>

        <Text style={styles.optLabel}>{t('creation.accessory')}</Text>
        <View style={styles.swatchRow}>
          {ACCESSORIES.slice(0, FREE_COUNTS.accessory).map((a, i) => (
            <Chip
              key={a}
              label={a}
              color={C.gold}
              active={appearance.accessory === i}
              onPress={() => setAppearance({ ...appearance, accessory: i })}
            />
          ))}
        </View>
      </Card>

      {/* Nom */}
      <Card>
        <SectionTitle icon="📛">{t('creation.name')}</SectionTitle>
        <View style={{ flexDirection: 'row', gap: 8, alignItems: 'center' }}>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            maxLength={20}
            placeholder="Ti Zorro"
            placeholderTextColor={C.textFaint}
          />
          <Button label="🎲" size="sm" onPress={() => setName(randomKokName())} />
        </View>
      </Card>

      <Button
        label={t('creation.go')}
        icon="⚔️"
        variant="ember"
        size="lg"
        full
        style={{ marginTop: 8, ...SHADOW.glowEmber }}
        onPress={() => createPlayer(name, cls.id, appearance)}
        disabled={!name.trim()}
      />
    </ScrollView>
  );
}

function Arrow({ dir, onPress }: { dir: 'left' | 'right'; onPress: () => void }) {
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [styles.arrow, pressed ? { opacity: 0.6 } : null]}
    >
      <Text style={styles.arrowText}>{dir === 'left' ? '‹' : '›'}</Text>
    </Pressable>
  );
}

function Swatch({
  color,
  active,
  onPress,
}: {
  color: string;
  active: boolean;
  onPress: () => void;
}) {
  return (
    <Pressable
      onPress={onPress}
      style={[styles.swatch, { backgroundColor: color }, active ? styles.swatchOn : null]}
    />
  );
}

const styles = StyleSheet.create({
  root: { flex: 1 },
  content: { padding: 12, paddingBottom: 32 },
  header: { alignItems: 'center', marginTop: 8, marginBottom: 12 },
  brand: {
    fontFamily: F.black,
    fontSize: 44,
    color: C.gold,
    letterSpacing: 1,
    textShadowColor: 'rgba(255,90,31,0.55)',
    textShadowRadius: 18,
    textShadowOffset: { width: 0, height: 4 },
  },
  tagline: {
    fontFamily: F.semi,
    fontSize: 13,
    color: C.textDim,
    marginTop: -6,
    textAlign: 'center',
  },
  classRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginBottom: 8,
  },
  classDot: {
    width: 46,
    height: 46,
    borderRadius: 23,
    borderWidth: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stage: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
  },
  halo: {
    position: 'absolute',
    alignSelf: 'center',
    top: 26,
    width: 150,
    height: 150,
    borderRadius: 75,
    opacity: 0.16,
    shadowOpacity: 0.9,
    shadowRadius: 40,
  },
  arrow: {
    width: 38,
    height: 46,
    borderRadius: R.md,
    backgroundColor: 'rgba(6,3,12,0.5)',
    borderWidth: 1,
    borderColor: C.hairline,
    alignItems: 'center',
    justifyContent: 'center',
  },
  arrowText: { fontFamily: F.black, fontSize: 24, color: C.gold, marginTop: -6 },
  className: { fontFamily: F.black, fontSize: 24, textAlign: 'center', marginTop: 8 },
  classSub: {
    fontFamily: F.semi,
    fontSize: 13,
    color: C.textDim,
    textAlign: 'center',
    marginTop: -4,
  },
  chipRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 8,
    marginVertical: 8,
    flexWrap: 'wrap',
  },
  desc: { ...T.body, textAlign: 'center', lineHeight: 20 },
  flavor: {
    fontFamily: F.regular,
    fontStyle: 'italic',
    fontSize: 12,
    color: C.textFaint,
    textAlign: 'center',
    marginTop: 8,
  },
  optLabel: {
    fontFamily: F.semi,
    fontSize: 12,
    color: C.textFaint,
    marginTop: 12,
    marginBottom: 8,
  },
  swatchRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', alignItems: 'center' },
  swatch: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.45)',
  },
  swatchOn: {
    borderColor: '#fff',
    borderWidth: 2.5,
    shadowColor: '#fff',
    shadowOpacity: 0.6,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 0 },
    transform: [{ scale: 1.1 }],
  },
  palette: {
    width: 46,
    height: 30,
    borderRadius: 10,
    overflow: 'hidden',
    flexDirection: 'row',
    borderWidth: 2,
    borderColor: 'rgba(0,0,0,0.45)',
  },
  input: {
    flex: 1,
    backgroundColor: 'rgba(6,3,12,0.55)',
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: C.hairline,
    color: C.text,
    paddingHorizontal: 12,
    paddingVertical: 12,
    fontSize: 15,
    fontFamily: F.bold,
  },
});
