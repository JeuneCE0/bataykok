import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  ViewStyle,
} from 'react-native';

export const COLORS = {
  bg: '#1a0f08',
  bgLight: '#2b1a0e',
  panel: '#3a2415',
  panelBorder: '#8a5a2b',
  gold: '#f4c430',
  goldDark: '#c9971e',
  text: '#f5e6ce',
  textDim: '#c9a97a',
  green: '#2ecc71',
  red: '#e74c3c',
  blue: '#3498db',
  purple: '#9b59b6',
};

export function Panel({
  children,
  style,
}: {
  children: React.ReactNode;
  style?: ViewStyle;
}) {
  return <View style={[styles.panel, style]}>{children}</View>;
}

export function GoldButton({
  label,
  onPress,
  disabled,
  small,
  color,
}: {
  label: string;
  onPress: () => void;
  disabled?: boolean;
  small?: boolean;
  color?: string;
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[
        styles.btn,
        small && styles.btnSmall,
        color ? { backgroundColor: color } : null,
        disabled && styles.btnDisabled,
      ]}
      activeOpacity={0.7}
    >
      <Text style={[styles.btnText, small && styles.btnTextSmall]}>{label}</Text>
    </TouchableOpacity>
  );
}

export function Bar({
  value,
  max,
  color,
  label,
  height = 16,
}: {
  value: number;
  max: number;
  color: string;
  label?: string;
  height?: number;
}) {
  const pct = Math.max(0, Math.min(1, max > 0 ? value / max : 0));
  return (
    <View style={[styles.barOuter, { height }]}>
      <View
        style={[
          styles.barInner,
          { width: `${pct * 100}%`, backgroundColor: color },
        ]}
      />
      {label ? <Text style={styles.barLabel}>{label}</Text> : null}
    </View>
  );
}

export function Title({ children }: { children: React.ReactNode }) {
  return <Text style={styles.title}>{children}</Text>;
}

export function Subtitle({ children }: { children: React.ReactNode }) {
  return <Text style={styles.subtitle}>{children}</Text>;
}

const styles = StyleSheet.create({
  panel: {
    backgroundColor: COLORS.panel,
    borderColor: COLORS.panelBorder,
    borderWidth: 2,
    borderRadius: 12,
    padding: 12,
    marginVertical: 6,
  },
  btn: {
    backgroundColor: COLORS.gold,
    borderRadius: 10,
    paddingVertical: 12,
    paddingHorizontal: 18,
    alignItems: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'rgba(0,0,0,0.35)',
  },
  btnSmall: { paddingVertical: 7, paddingHorizontal: 12 },
  btnDisabled: { opacity: 0.4 },
  btnText: {
    color: '#3a2000',
    fontWeight: '800',
    fontSize: 15,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  btnTextSmall: { fontSize: 12 },
  barOuter: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 8,
    overflow: 'hidden',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255,255,255,0.15)',
  },
  barInner: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    borderRadius: 8,
  },
  barLabel: {
    color: '#fff',
    fontSize: 10,
    fontWeight: '700',
    textAlign: 'center',
    textShadowColor: '#000',
    textShadowRadius: 2,
  },
  title: {
    color: COLORS.gold,
    fontSize: 22,
    fontWeight: '900',
    textTransform: 'uppercase',
    letterSpacing: 1,
    textAlign: 'center',
    marginVertical: 6,
  },
  subtitle: {
    color: COLORS.textDim,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: 6,
  },
});
