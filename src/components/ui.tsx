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
import { BW, C, F, G, GradientKey, OUTLINE, R, SHADOW, SP, TYPO } from '../theme';

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
          compact ? { padding: 8 } : null,
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
  sub,
  onPress,
  disabled,
  variant = 'gold',
  size = 'md',
  icon,
  full,
  style,
}: {
  label: string;
  /** seconde ligne : le coût, le gain — ce qui allongeait le libellé principal */
  sub?: string;
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
      ? { paddingVertical: 16, paddingHorizontal: 24 }
      : size === 'sm'
        ? { paddingVertical: 8, paddingHorizontal: 12 }
        : { paddingVertical: 12, paddingHorizontal: 16 };
  const font = size === 'lg' ? 18 : size === 'sm' ? 13 : 15;
  // un bouton éteint doit rester lisible : on change de couleur plutôt que
  // de baisser l'opacité, qui délavait le texte sur les fonds clairs
  const grad = disabled ? G.slate : G[variant];
  // Le blanc ne passe que sur les dégradés sombres. Sur ember, piment, mystic
  // et lagoon il tombait sous 3,4:1 — l'encre foncée y donne 5 à 8,7:1.
  const light = !disabled && variant !== 'slate';

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
          <View style={styles.btnRow}>
            {/* l'emoji garde sa propre boîte de ligne : mêlé au libellé, ses
                métriques faisaient dériver le texte vers le haut du bouton */}
            {icon ? (
              <Text style={[styles.btnIcon, { fontSize: font, lineHeight: font * 1.25 }]}>
                {icon}
              </Text>
            ) : null}
            <View style={styles.btnLabels}>
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
                {label}
              </Text>
              {sub ? (
                <Text
                  style={[
                    styles.btnSub,
                    {
                      fontSize: font * 0.78,
                      lineHeight: font * 1.02,
                      color: disabled ? C.textFaint : light ? 'rgba(42,18,6,0.72)' : 'rgba(255,248,240,0.8)',
                    },
                  ]}
                  numberOfLines={1}
                >
                  {sub}
                </Text>
              ) : null}
            </View>
          </View>
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
  icon,
  label,
  color = C.textDim,
  active,
  onPress,
  style,
}: {
  /** rendu dans son propre Text : mêler un emoji au libellé décentre la pilule */
  icon?: string;
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
          ? { backgroundColor: color, borderColor: OUTLINE, borderWidth: BW.thick }
          : { borderColor: 'rgba(255,246,232,0.16)' },
        style,
      ]}
    >
      {icon ? <Text style={styles.chipIcon}>{icon}</Text> : null}
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
          <Text style={{ fontSize: 13 }}>{it.icon}</Text>
          <Text style={[styles.statValue, it.color ? { color: it.color } : null]}>
            {it.value}
          </Text>
        </View>
      ))}
    </View>
  );
}

/**
 * Grille de statistiques à cellules égales. `StatRow` aligne à gauche avec des
 * écarts fixes : les largeurs d'emoji étant inégales, les colonnes ne tombaient
 * jamais en face les unes des autres d'une carte à l'autre. Ici chaque cellule
 * occupe la même fraction de la largeur et centre son contenu.
 */
export function StatGrid({
  items,
  style,
}: {
  items: { icon: string; value: string; color?: string }[];
  style?: ViewStyle;
}) {
  return (
    <View style={[styles.statGrid, style]}>
      {items.map((it, i) => (
        <View key={i} style={styles.statCell}>
          <Text style={styles.statCellIcon}>{it.icon}</Text>
          <Text
            style={[styles.statCellValue, it.color ? { color: it.color } : null]}
            numberOfLines={1}
          >
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
  cardWrap: { borderRadius: R.lg, marginVertical: 8 },
  card: {
    borderRadius: R.lg,
    // La carte est sombre sur fond sombre : un contour noir n'y ferait rien.
    // C'est le liseré clair (cardShine) et l'ombre portée qui la détachent.
    borderWidth: BW.hair,
    borderColor: C.hairline,
    padding: SP.lg,
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
  // Renfoncement : tout ce qui n'est pas actionnable s'enfonce au lieu de
  // ressortir. C'est ce qui distingue au premier regard une jauge d'un bouton.
  well: {
    backgroundColor: C.well,
    borderRadius: R.md,
    borderWidth: BW.thick,
    borderColor: OUTLINE,
    borderTopColor: 'rgba(0,0,0,0.85)',
    padding: SP.md,
  },
  btnBase: {
    borderRadius: R.md,
    overflow: 'hidden',
    borderWidth: BW.thick,
    borderColor: OUTLINE,
  },
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
    // le liseré tient le texte lisible sur n'importe quel dégradé
    textShadowColor: 'rgba(6,3,12,0.35)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 2,
  } as TextStyle,
  ghost: {
    alignSelf: 'flex-start',
    minHeight: 34,
    justifyContent: 'center',
    paddingHorizontal: 12,
    borderRadius: R.pill,
    borderWidth: 1,
    borderColor: C.hairline,
    backgroundColor: C.card,
  },
  ghostText: {
    fontFamily: F.bold,
    fontSize: 13,
    lineHeight: 17,
    color: C.textDim,
    textAlign: 'center',
    includeFontPadding: false,
  },
  btnRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8 },
  btnIcon: { includeFontPadding: false },
  btnLabels: { alignItems: 'center', flexShrink: 1 },
  btnSub: {
    fontFamily: F.semi,
    textAlign: 'center',
    includeFontPadding: false,
    marginTop: 2,
  },
  barOuter: {
    // sans cela, un parent en `alignItems: 'center'` réduit la barre à sa
    // largeur de contenu — c'est-à-dire zéro, ses enfants étant absolus
    alignSelf: 'stretch',
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
  screenTitle: { alignItems: 'center', marginTop: 4, marginBottom: 8 },
  screenSub: {
    fontFamily: F.regular,
    fontSize: 13,
    lineHeight: 17,
    color: C.textDim,
    textAlign: 'center',
    marginTop: -2,
  },
  titleRule: { flexDirection: 'row', width: 140, marginTop: 8 },
  sectionTitle: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  chip: {
    flexDirection: 'row',
    gap: 4,
    paddingHorizontal: 12,
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
    fontSize: 12,
    lineHeight: 16,
    letterSpacing: 0.2,
    textAlign: 'center',
    includeFontPadding: false,
  },
  // l'emoji porte sa propre police : sa boîte de ligne doit rester la sienne
  chipIcon: { fontSize: 12, lineHeight: 16, includeFontPadding: false },
  statRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, alignItems: 'center' },
  statGrid: {
    flexDirection: 'row',
    borderRadius: R.md,
    backgroundColor: 'rgba(6,3,12,0.4)',
    borderWidth: 1,
    borderColor: C.hairlineSoft,
    paddingVertical: 8,
  },
  statCell: { flex: 1, alignItems: 'center', gap: 4 },
  statCellIcon: { fontSize: 13, lineHeight: 17, includeFontPadding: false },
  statCellValue: {
    fontFamily: F.black,
    fontSize: 13,
    lineHeight: 17,
    color: C.text,
    textAlign: 'center',
    includeFontPadding: false,
  },
  stat: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  statValue: { fontFamily: F.bold, fontSize: 13, lineHeight: 17, color: C.text },
  segWrap: {
    flexDirection: 'row',
    gap: 4,
    marginHorizontal: 12,
    marginTop: 8,
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
    fontSize: 13,
    lineHeight: 17,
    color: C.textDim,
    textAlign: 'center',
    includeFontPadding: false,
  },
  segTextOn: { fontFamily: F.black, color: C.gold },
});
