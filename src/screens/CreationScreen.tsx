import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';

import Rooster from '../components/Rooster';
import { COLORS, GoldButton, Panel, Subtitle, Title } from '../components/ui';
import {
  ACCESSORIES,
  BODY_COLORS,
  COMB_COLORS,
  TAIL_PALETTES,
} from '../game/bots';
import { CLASS_LIST } from '../game/classes';
import { randomKokName } from '../game/names';
import { Appearance } from '../game/types';
import { useGame } from '../store/gameStore';

export default function CreationScreen() {
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

  const prev = () =>
    setClassIdx((classIdx - 1 + CLASS_LIST.length) % CLASS_LIST.length);
  const next = () => setClassIdx((classIdx + 1) % CLASS_LIST.length);

  return (
    <ScrollView style={styles.root} contentContainerStyle={{ paddingBottom: 40 }}>
      <Title>Batay Kok</Title>
      <Subtitle>Kréé out kok, ti kok. Le rond i attend a ou !</Subtitle>

      {/* Sélecteur de classe, façon carrousel */}
      <View style={styles.classIcons}>
        {CLASS_LIST.map((c, i) => (
          <TouchableOpacity
            key={c.id}
            onPress={() => setClassIdx(i)}
            style={[
              styles.classIcon,
              i === classIdx && { borderColor: COLORS.gold, backgroundColor: c.color },
            ]}
          >
            <Text style={{ fontSize: 20 }}>{c.emoji}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Panel>
        <View style={styles.carousel}>
          <TouchableOpacity onPress={prev} style={styles.arrow}>
            <Text style={styles.arrowText}>◀</Text>
          </TouchableOpacity>
          <View style={{ alignItems: 'center', flex: 1 }}>
            <Rooster appearance={appearance} size={150} />
          </View>
          <TouchableOpacity onPress={next} style={styles.arrow}>
            <Text style={styles.arrowText}>▶</Text>
          </TouchableOpacity>
        </View>
        <Text style={[styles.className, { color: cls.color }]}>
          {cls.emoji} {cls.name}
        </Text>
        <Text style={styles.classSub}>{cls.subtitle}</Text>
        <Text style={styles.attr}>
          ATTRIBUT PRINCIPAL : <Text style={{ color: COLORS.gold }}>{cls.mainAttrLabel}</Text>
        </Text>
        <Text style={styles.desc}>{cls.description}</Text>
        <Text style={styles.flavor}>« {cls.flavor} »</Text>
      </Panel>

      {/* Apparence */}
      <Panel>
        <Text style={styles.sectionTitle}>🎨 Plimaz (apparence)</Text>
        <Text style={styles.optionLabel}>Couleur du corps</Text>
        <View style={styles.swatchRow}>
          {BODY_COLORS.map((c) => (
            <TouchableOpacity
              key={c}
              onPress={() => setAppearance({ ...appearance, bodyColor: c })}
              style={[
                styles.swatch,
                { backgroundColor: c },
                appearance.bodyColor === c && styles.swatchSelected,
              ]}
            />
          ))}
        </View>
        <Text style={styles.optionLabel}>Couleur de la crête</Text>
        <View style={styles.swatchRow}>
          {COMB_COLORS.map((c) => (
            <TouchableOpacity
              key={c}
              onPress={() => setAppearance({ ...appearance, combColor: c })}
              style={[
                styles.swatch,
                { backgroundColor: c },
                appearance.combColor === c && styles.swatchSelected,
              ]}
            />
          ))}
        </View>
        <Text style={styles.optionLabel}>Plumes de queue</Text>
        <View style={styles.swatchRow}>
          {TAIL_PALETTES.map((p, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => setAppearance({ ...appearance, tailPalette: i })}
              style={[
                styles.paletteSwatch,
                appearance.tailPalette === i && styles.swatchSelected,
              ]}
            >
              {p.map((c) => (
                <View key={c} style={{ flex: 1, backgroundColor: c }} />
              ))}
            </TouchableOpacity>
          ))}
        </View>
        <Text style={styles.optionLabel}>Accessoire</Text>
        <View style={styles.swatchRow}>
          {ACCESSORIES.map((a, i) => (
            <TouchableOpacity
              key={a}
              onPress={() => setAppearance({ ...appearance, accessory: i })}
              style={[
                styles.accessoryChip,
                appearance.accessory === i && {
                  backgroundColor: COLORS.gold,
                },
              ]}
            >
              <Text
                style={[
                  styles.accessoryText,
                  appearance.accessory === i && { color: '#3a2000' },
                ]}
              >
                {a}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </Panel>

      {/* Nom */}
      <Panel>
        <Text style={styles.sectionTitle}>📛 Nom de ton kok</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            maxLength={20}
            placeholder="Ti Zorro"
            placeholderTextColor={COLORS.textDim}
          />
          <GoldButton small label="🎲" onPress={() => setName(randomKokName())} />
        </View>
      </Panel>

      <GoldButton
        label="Rentre dann rond !"
        onPress={() => createPlayer(name, cls.id, appearance)}
        disabled={!name.trim()}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: COLORS.bg, padding: 14 },
  classIcons: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    marginVertical: 6,
    flexWrap: 'wrap',
  },
  classIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#222',
    borderWidth: 2,
    borderColor: '#555',
    alignItems: 'center',
    justifyContent: 'center',
  },
  carousel: { flexDirection: 'row', alignItems: 'center' },
  arrow: {
    padding: 10,
    backgroundColor: COLORS.gold,
    borderRadius: 8,
  },
  arrowText: { fontSize: 18, fontWeight: '900', color: '#3a2000' },
  className: {
    fontSize: 24,
    fontWeight: '900',
    textAlign: 'center',
    marginTop: 6,
  },
  classSub: {
    color: COLORS.textDim,
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 6,
  },
  attr: {
    color: COLORS.text,
    fontWeight: '800',
    textAlign: 'center',
    fontSize: 13,
    marginBottom: 6,
  },
  desc: { color: COLORS.text, textAlign: 'center', fontSize: 13, lineHeight: 19 },
  flavor: {
    color: COLORS.textDim,
    textAlign: 'center',
    fontStyle: 'italic',
    fontSize: 12,
    marginTop: 8,
  },
  sectionTitle: {
    color: COLORS.gold,
    fontWeight: '900',
    fontSize: 15,
    marginBottom: 8,
  },
  optionLabel: { color: COLORS.textDim, fontSize: 12, marginTop: 8, marginBottom: 4 },
  swatchRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap' },
  swatch: {
    width: 34,
    height: 34,
    borderRadius: 17,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  swatchSelected: { borderColor: COLORS.gold, borderWidth: 3 },
  paletteSwatch: {
    width: 44,
    height: 30,
    borderRadius: 8,
    overflow: 'hidden',
    flexDirection: 'row',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  accessoryChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: '#222',
    borderRadius: 14,
  },
  accessoryText: { color: COLORS.text, fontSize: 12, fontWeight: '700' },
  input: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.panelBorder,
    color: COLORS.text,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    fontWeight: '700',
  },
});
