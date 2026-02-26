import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { C } from '../data/theme';

// ── Neon primary button ──
export function NeonBtn({ label, onPress, style, disabled, color }) {
  const bg = color || C.neon;
  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={[styles.neonBtn, { backgroundColor: disabled ? C.border : bg }, style]}
      activeOpacity={0.8}
    >
      <Text style={[styles.neonBtnTxt, { color: disabled ? C.muted : '#000' }]}>{label}</Text>
    </TouchableOpacity>
  );
}

// ── Outline button ──
export function OutlineBtn({ label, onPress, color, style }) {
  const c = color || C.red;
  return (
    <TouchableOpacity onPress={onPress} style={[styles.outlineBtn, { borderColor: c }, style]} activeOpacity={0.8}>
      <Text style={[styles.outlineBtnTxt, { color: c }]}>{label}</Text>
    </TouchableOpacity>
  );
}

// ── Section header ──
export function SectionHeader({ title, sub }) {
  return (
    <View style={styles.sectionHeader}>
      <Text style={styles.sectionTitle}>{title}</Text>
      {sub ? <Text style={styles.sectionSub}>{sub}</Text> : null}
    </View>
  );
}

// ── Equipment tag ──
export function EqTag({ eq }) {
  const cfg = {
    bw:   { label: 'BODYWEIGHT', color: C.neon,   bg: 'rgba(0,255,136,0.08)' },
    band: { label: 'BAND',       color: C.blue,   bg: 'rgba(0,200,255,0.08)' },
    db:   { label: 'DUMBBELL',   color: C.orange, bg: 'rgba(255,140,66,0.08)' },
  };
  const t = cfg[eq] || cfg.bw;
  return (
    <View style={[styles.tag, { borderColor: t.color + '66', backgroundColor: t.bg }]}>
      <Text style={[styles.tagTxt, { color: t.color }]}>{t.label}</Text>
    </View>
  );
}

// ── Muscle tag ──
export function MuscleTag({ label }) {
  return (
    <View style={[styles.tag, { borderColor: C.border }]}>
      <Text style={[styles.tagTxt, { color: C.muted }]}>{label.toUpperCase()}</Text>
    </View>
  );
}

// ── Trackable badge ──
export function TrackBadge() {
  return (
    <View style={[styles.tag, { borderColor: C.neon + '55', backgroundColor: 'rgba(0,255,136,0.06)' }]}>
      <Text style={[styles.tagTxt, { color: C.neon }]}>📷 AI TRACK</Text>
    </View>
  );
}

// ── Card container ──
export function Card({ children, style }) {
  return <View style={[styles.card, style]}>{children}</View>;
}

// ── Mono label ──
export function MonoLabel({ text, color, size, style }) {
  return (
    <Text style={[styles.monoLabel, { color: color || C.muted, fontSize: size || 10 }, style]}>
      {text}
    </Text>
  );
}

// ── Divider ──
export function Divider() {
  return <View style={styles.divider} />;
}

// ── Loading spinner ──
export function Spinner() {
  return <ActivityIndicator color={C.neon} size="large" />;
}

// ── Filter chip ──
export function FilterChip({ label, active, onPress, activeColor }) {
  const ac = activeColor || C.neon;
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.filterChip,
        active && { borderColor: ac, backgroundColor: ac + '18' },
      ]}
      activeOpacity={0.7}
    >
      <Text style={[styles.filterChipTxt, active && { color: ac }]}>{label}</Text>
    </TouchableOpacity>
  );
}

// ── Stat box ──
export function StatBox({ value, label, color }) {
  return (
    <View style={styles.statBox}>
      <Text style={[styles.statVal, { color: color || C.neon }]}>{value}</Text>
      <Text style={styles.statLbl}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  neonBtn: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
    marginBottom: 6,
  },
  neonBtnTxt: {
    fontFamily: 'monospace',
    fontWeight: '800',
    fontSize: 14,
    letterSpacing: 2,
    color: '#000',
  },
  outlineBtn: {
    paddingVertical: 13,
    paddingHorizontal: 20,
    alignItems: 'center',
    borderWidth: 1,
    marginBottom: 6,
    backgroundColor: 'transparent',
  },
  outlineBtnTxt: {
    fontFamily: 'monospace',
    fontWeight: '700',
    fontSize: 13,
    letterSpacing: 1.5,
  },
  sectionHeader: { marginBottom: 16 },
  sectionTitle: {
    fontSize: 26,
    fontWeight: '900',
    color: C.neon,
    letterSpacing: 3,
    textTransform: 'uppercase',
  },
  sectionSub: {
    fontSize: 10,
    color: C.muted,
    fontFamily: 'monospace',
    letterSpacing: 1,
    marginTop: 3,
  },
  card: {
    backgroundColor: C.card,
    borderWidth: 1,
    borderColor: C.border,
    padding: 14,
    marginBottom: 8,
  },
  tag: {
    borderWidth: 1,
    paddingHorizontal: 7,
    paddingVertical: 2,
    marginRight: 4,
    marginBottom: 4,
  },
  tagTxt: {
    fontSize: 9,
    fontFamily: 'monospace',
    letterSpacing: 0.8,
    fontWeight: '600',
  },
  monoLabel: {
    fontFamily: 'monospace',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  divider: {
    height: 1,
    backgroundColor: C.border,
    marginVertical: 10,
  },
  filterChip: {
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 11,
    paddingVertical: 6,
    marginRight: 6,
    marginBottom: 6,
  },
  filterChipTxt: {
    fontFamily: 'monospace',
    fontSize: 10,
    color: C.muted,
    letterSpacing: 0.8,
    textTransform: 'uppercase',
  },
  statBox: {
    flex: 1,
    backgroundColor: 'rgba(0,255,136,0.03)',
    borderWidth: 1,
    borderColor: C.border,
    alignItems: 'center',
    paddingVertical: 10,
    marginHorizontal: 2,
  },
  statVal: {
    fontSize: 24,
    fontWeight: '900',
    color: C.neon,
    lineHeight: 26,
  },
  statLbl: {
    fontSize: 9,
    color: C.muted,
    fontFamily: 'monospace',
    letterSpacing: 1,
    marginTop: 2,
    textTransform: 'uppercase',
  },
});
