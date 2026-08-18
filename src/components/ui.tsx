import { LinearGradient } from 'expo-linear-gradient';
import React from 'react';
import {
  Pressable,
  StyleSheet,
  Text,
  TextStyle,
  View,
  ViewStyle,
} from 'react-native';

import { play } from '../lib/sound';
import { C, F, G, GradientKey, R, SHADOW, TYPO } from '../theme';

// ─── Surfaces ────────────────────────────────────────────────────────────

export function Card({
  children,
  style,
  glow,
  tint,
  compact,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
  /** couleur du liseré + halo (rareté, état, classe…) */
  glow?: string;
  /** teinte de fond très légère */
  tint?: string;
  compact?: boolean;
}) {
  return (
    <View
      style={[
        styles.cardWrap,
        SHADOW.card,
        glow ? { shadowColor: glow, shadowOpacity: 0.35 } : null,
        style,
      ]}
    >
      <LinearGradient
        colors={G.card}
        start={{ x: 0, y: 0 }}
        end={{ x: 0.6, y: 1 }}
        style={[
          styles.card,
          compact ? { padding: 10 } : null,
          glow ? { borderColor: glow } : null,
          tint ? { backgroundColor: tint } : null,
        ]}
      >
        {/* liseré lumineux : donne le relief « verre » */}
        <View pointerEvents="none" style={styles.cardShine} />
        {children}
      </LinearGradient>
    </View>
  );
}

/** Renfoncement sombre : jauges, logs, zones de saisie. */
export function Well({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  return <View style={[styles.well, style]}>{children}</View>;
}

// ─── Boutons ─────────────────────────────────────────────────────────────

type BtnSize = 'sm' | 'md' | 'lg';

export function Button({
  label,
  onPress,
  disabled,
  variant = 'gold',
  size = 'md',
  icon,
  full,
  style,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  variant?: GradientKey;
  size?: BtnSize;
  icon?: string;
  full?: boolean;
  style?: ViewStyle;
}) {
  const pad =
    size === 'lg'
      ? { paddingVertical: 15, paddingHorizontal: 24 }
      : size === 'sm'
        ? { paddingVertical: 8, paddingHorizontal: 12 }
        : { paddingVertical: 11, paddingHorizontal: 16 };
  const font = size === 'lg' ? 18 : size === 'sm' ? 13 : 15;
  // un bouton éteint doit rester lisible : on change de couleur plutôt que
  // de baisser l'opacité, qui délavait le texte sur les fonds clairs
  const grad = disabled ? G.slate : G[variant];
  const light = !disabled && (variant === 'gold' || variant === 'cane');

  return (
    <Pressable
      onPress={() => {
        play(variant === 'piment' || variant === 'ember' ? 'confirm' : 'tap', 0.7);
        onPress();
      }}
      disabled={disabled}
      style={({ pressed }) => [
        styles.btnBase,
        { backgroundColor: grad[2] },
        full ? { alignSelf: 'stretch' } : { alignSelf: 'flex-start' },
        disabled ? { opacity: 0.75 } : null,
        pressed && !disabled ? styles.btnPressed : null,
        style,
      ]}
    >
      {({ pressed }) => (
        <LinearGradient
          colors={grad}
          start={{ x: 0, y: 0 }}
          end={{ x: 0, y: 1 }}
          style={[
            styles.btnFace,
            pad,
            { marginBottom: pressed && !disabled ? 0 : size === 'sm' ? 2 : 3 },
          ]}
        >
          <Text
            style={[
              styles.btnText,
              {
                fontSize: font,
                lineHeight: font * 1.25,
                color: disabled ? C.textDim : light ? C.ink : '#FFF8F0',
              },
            ]}
            numberOfLines={1}
          >
            {icon ? `${icon}  ` : ''}
            {label}
          </Text>
        </LinearGradient>
      )}
    </Pressable>
  );
}

/** Bouton discret, pour les actions secondaires (annuler, reroll…). */
export function GhostButton({
  label,
  onPress,
  disabled,
  icon,
  style,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  icon?: string;
  style?: ViewStyle;
}) {
  return (
    <Pressable
      onPress={() => {
        play('tap', 0.5);
        onPress();
      }}
      disabled={disabled}
      style={({ pressed }) => [
        styles.ghost,
        disabled ? { opacity: 0.35 } : null,
        pressed && !disabled ? { backgroundColor: C.cardStrong } : null,
        style,
      ]}
    >
      <Text style={styles.ghostText} numberOfLines={1}>
        {icon ? `${icon}  ` : ''}
        {label}
      </Text>
    </Pressable>
  );
}

// ─── Jauges ──────────────────────────────────────────────────────────────

export function Bar({
  value,
  max,
  variant = 'cane',
  label,
  height = 14,
}: {
  value: number;
  max: number;
  variant?: GradientKey;
  label?: string;
  height?: number;
}) {
  const pct = Math.max(0, Math.min(1, max > 0 ? value / max : 0));
  return (
    <View style={[styles.barOuter, { height, borderRadius: height / 2 }]}>
      <LinearGradient
        colors={G[variant]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          StyleSheet.absoluteFill,
          { width: `${pct * 100}%`, borderRadius: height / 2 },
        ]}
      />
      {/* reflet supérieur */}
      <View
        pointerEvents="none"
        style={[
          styles.barGloss,
          { width: `${pct * 100}%`, height: height * 0.4, borderRadius: height },
        ]}
      />
      {label ? (
        <Text
          style={[
            styles.barLabel,
            { fontSize: height > 16 ? 12.5 : 11, lineHeight: height + 2 },
          ]}
        >
          {label}
        </Text>
      ) : null}
    </View>
  );
}

// ─── Typographie & pastilles ─────────────────────────────────────────────

export function ScreenTitle({
  title,
  sub,
  accent = C.gold,
}: {
  title: string;
  sub?: string;
  accent?: string;
}) {
  return (
    <View style={styles.screenTitle}>
      <Text style={[TYPO.display, { color: accent }]}>{title}</Text>
      {sub ? (
        <Text style={styles.screenSub} numberOfLines={2}>
          {sub}
        </Text>
      ) : null}
      <View style={styles.titleRule}>
        <LinearGradient
          colors={['transparent', accent, 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={{ flex: 1, height: 2, borderRadius: 1, opacity: 0.65 }}
        />
      </View>
    </View>
  );
}

export function SectionTitle({
  children,
  icon,
}: {
  children: React.ReactNode;
  icon?: string;
}) {
  return (
    <View style={styles.sectionTitle}>
      {icon ? <Text style={{ fontSize: 15 }}>{icon}</Text> : null}
      <Text style={TYPO.label}>{children}</Text>
    </View>
  );
}

export function Chip({
  label,
  color = C.textDim,
  active,
  onPress,
  style,
}: {
  label: string;
  color?: string;
  active?: boolean;
  onPress?: () => void;
  style?: ViewStyle;
}) {
  const body = (
    <View
      style={[
        styles.chip,
        active
          ? { backgroundColor: color, borderColor: color }
          : { borderColor: 'rgba(255,246,232,0.16)' },
        style,
      ]}
    >
      <Text
        style={[styles.chipText, { color: active ? C.ink : color }]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </View>
  );
  return onPress ? (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => (pressed ? { opacity: 0.7 } : null)}
    >
      {body}
    </Pressable>
  ) : (
    body
  );
}

/** Ligne d'information dense : « ⏱️ 45 s · ⚡ 12 · 🌽 340 ». */
export function StatRow({
  items,
  style,
}: {
  items: { icon: string; value: string; color?: string }[];
  style?: ViewStyle;
}) {
  return (
    <View style={[styles.statRow, style]}>
      {items.map((it, i) => (
        <View key={i} style={styles.stat}>
          <Text style={{ fontSize: 13.5 }}>{it.icon}</Text>
          <Text style={[styles.statValue, it.color ? { color: it.color } : null]}>
            {it.value}
          </Text>
        </View>
      ))}
    </View>
  );
}

/** Bascule entre deux lectures d'un même onglet — évite les écrans fleuves. */
export function Segmented<T extends string>({
  value,
  onChange,
  options,
}: {
  value: T;
  onChange: (v: T) => void;
  options: { id: T; label: string }[];
}) {
  return (
    <View style={styles.segWrap}>
      {options.map((o) => {
        const on = o.id === value;
        return (
          <Pressable
            key={o.id}
            onPress={() => onChange(o.id)}
            style={[styles.segBtn, on && styles.segBtnOn]}
          >
            <Text style={[styles.segText, on && styles.segTextOn]} numberOfLines={1}>
              {o.label}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

export const T = TYPO;

const styles = StyleSheet.create({
  cardWrap: { borderRadius: R.lg, marginVertical: 6 },
  card: {
    borderRadius: R.lg,
    borderWidth: 1,
    borderColor: C.hairline,
    padding: 14,
    overflow: 'hidden',
  },
  cardShine: {
    position: 'absolute',
    top: 0,
    left: 12,
    right: 12,
    height: 1,
    backgroundColor: 'rgba(255,255,255,0.22)',
  },
  well: {
    backgroundColor: C.well,
    borderRadius: R.md,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.5)',
    padding: 10,
  },
  btnBase: { borderRadius: R.md, overflow: 'hidden' },
  btnFace: {
    borderRadius: R.md,
    alignItems: 'center',
    justifyContent: 'center',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.35)',
  },
  btnPressed: { transform: [{ translateY: 2 }] },
  btnText: {
    fontFamily: F.black,
    letterSpacing: 0.4,
    textAlign: 'center',
    includeFontPadding: false,
    textShadowColor: 'rgba(0,0,0,0.18)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 1,
  } as TextStyle,
  ghost: {
    alignSelf: 'flex-start',
    minHeight: 34,
    justifyContent: 'center',
    paddingHorizontal: 14,
    borderRadius: R.pill,
    borderWidth: 1,
    borderColor: C.hairline,
    backgroundColor: C.card,
  },
  ghostText: {
    fontFamily: F.bold,
    fontSize: 13,
    lineHeight: 16,
    color: C.textDim,
    textAlign: 'center',
    includeFontPadding: false,
  },
  barOuter: {
    backgroundColor: 'rgba(6,3,12,0.6)',
    overflow: 'hidden',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.55)',
  },
  barGloss: {
    position: 'absolute',
    top: 1,
    left: 2,
    backgroundColor: 'rgba(255,255,255,0.28)',
  },
  barLabel: {
    fontFamily: F.black,
    color: '#fff',
    textAlign: 'center',
    includeFontPadding: false,
    textShadowColor: 'rgba(0,0,0,0.85)',
    textShadowRadius: 3,
    textShadowOffset: { width: 0, height: 1 },
  } as TextStyle,
  screenTitle: { alignItems: 'center', marginTop: 4, marginBottom: 10 },
  screenSub: {
    fontFamily: F.regular,
    fontSize: 14,
    lineHeight: 20,
    color: C.textDim,
    textAlign: 'center',
    marginTop: -2,
  },
  titleRule: { flexDirection: 'row', width: 140, marginTop: 8 },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 7,
    marginBottom: 10,
  },
  chip: {
    paddingHorizontal: 11,
    // Baloo 2 assoit sa ligne de base très bas : avec un lineHeight généreux
    // le glyphe remonte et le texte paraît collé au bord haut. On centre donc
    // dans une hauteur fixe plutôt que de jouer sur le padding.
    minHeight: 26,
    borderRadius: R.pill,
    borderWidth: 1,
    backgroundColor: 'rgba(6,3,12,0.35)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chipText: {
    fontFamily: F.bold,
    fontSize: 12.5,
    lineHeight: 15,
    letterSpacing: 0.2,
    textAlign: 'center',
    includeFontPadding: false,
  },
  statRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, alignItems: 'center' },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statValue: { fontFamily: F.bold, fontSize: 14, lineHeight: 19, color: C.text },
  segWrap: {
    flexDirection: 'row',
    gap: 4,
    marginHorizontal: 14,
    marginTop: 10,
    padding: 4,
    borderRadius: R.pill,
    backgroundColor: 'rgba(6,3,12,0.5)',
    borderWidth: 1,
    borderColor: C.hairlineSoft,
  },
  segBtn: {
    flex: 1,
    minHeight: 36,
    borderRadius: R.pill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  segBtnOn: { backgroundColor: 'rgba(255,201,60,0.18)' },
  segText: {
    fontFamily: F.bold,
    fontSize: 13.5,
    lineHeight: 17,
    color: C.textDim,
    textAlign: 'center',
    includeFontPadding: false,
  },
  segTextOn: { fontFamily: F.black, color: C.gold },
});
