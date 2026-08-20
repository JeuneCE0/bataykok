import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import { Pressable, StyleSheet, Text, ViewStyle } from 'react-native';

import { play } from '../lib/sound';
import { BW, C, F, OUTLINE, R, SHADOW } from '../theme';

/**
 * Croix de fermeture, en haut à droite du panneau.
 *
 * Les fiches se fermaient par un bouton en bas — il fallait parcourir tout le
 * contenu pour sortir, et sur les panneaux longs il passait sous le pli. La
 * croix chevauche le coin : elle est au même endroit sur tous les panneaux, et
 * toujours visible.
 */
export default function CloseButton({
  onPress,
  style,
}: {
  onPress: () => void;
  style?: ViewStyle;
}) {
  return (
    <Pressable
      hitSlop={10}
      onPress={() => {
        play('tap', 0.6);
        onPress();
      }}
      style={({ pressed }) => [styles.wrap, style, pressed ? { opacity: 0.75 } : null]}
    >
      <LinearGradient
        colors={['#FF7A8F', '#FF3B5C', '#C4102F']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={styles.face}
      >
        <Text style={styles.x}>✕</Text>
      </LinearGradient>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    // À l'intérieur du bord : en débordant, la croix se faisait rogner par le
    // rayon du panneau et il n'en restait qu'un croissant rouge.
    top: 10,
    right: 10,
    zIndex: 10,
    borderRadius: R.md,
    borderWidth: BW.thick,
    borderColor: OUTLINE,
    overflow: 'hidden',
    ...SHADOW.card,
  },
  face: { width: 34, height: 34, alignItems: 'center', justifyContent: 'center' },
  x: {
    fontFamily: F.black,
    fontSize: 17,
    lineHeight: 22,
    color: '#FFF8F0',
    includeFontPadding: false,
    marginTop: -1,
  },
});
