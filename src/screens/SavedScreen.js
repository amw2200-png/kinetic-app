import React, { useState, useCallback } from 'react';
import {
  View, Text, StyleSheet, FlatList,
  TouchableOpacity, SafeAreaView, Alert,
} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { C } from '../data/theme';
import { getPlans, savePlans } from '../data/storage';
import { EXERCISES } from '../data/exercises';
import { SectionHeader, MonoLabel, NeonBtn } from '../components/UI';

export default function SavedScreen({ onLoadToBuilder, onLoadToTracker }) {
  const [plans, setPlans] = useState([]);

  useFocusEffect(
    useCallback(() => { loadPlans(); }, [])
  );

  async function loadPlans() {
    const saved = await getPlans();
    setPlans(saved);
  }

  async function deletePlan(id) {
    Alert.alert('Delete Plan', 'This cannot be undone.', [
      { text: 'Cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        const updated = plans.filter(p => p.id !== id);
        await savePlans(updated);
        setPlans(updated);
      }},
    ]);
  }

  function hydrateplan(p) {
    return p.exercises
      .map(e => { const ex = EXERCISES.find(x => x.id === e.exId); return ex ? { ex, sets: e.sets, reps: e.reps } : null; })
      .filter(Boolean);
  }

  function renderPlan({ item: p }) {
    return (
      <View style={styles.planCard}>
        <View style={styles.planInfo}>
          <Text style={styles.planName}>{p.name}</Text>
          <Text style={styles.planMeta}>{p.count} exercises · Saved {p.date}</Text>
          {/* Exercise preview chips */}
          <View style={styles.previewRow}>
            {p.exercises.slice(0, 5).map((e, i) => {
              const ex = EXERCISES.find(x => x.id === e.exId);
              return ex ? (
                <View key={i} style={styles.previewChip}>
                  <Text style={styles.previewChipTxt}>{ex.icon} {ex.name.split(' ')[0]}</Text>
                </View>
              ) : null;
            })}
            {p.exercises.length > 5 && (
              <View style={styles.previewChip}>
                <Text style={styles.previewChipTxt}>+{p.exercises.length - 5}</Text>
              </View>
            )}
          </View>
        </View>
        <View style={styles.planActions}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => onLoadToTracker(hydrateplan(p))}>
            <Text style={styles.actionBtnTxt}>▶</Text>
            <Text style={styles.actionBtnLabel}>TRACK</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} onPress={() => onLoadToBuilder(hydrateplan(p), p.name)}>
            <Text style={styles.actionBtnTxt}>✏️</Text>
            <Text style={styles.actionBtnLabel}>EDIT</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={() => deletePlan(p.id)}>
            <Text style={[styles.actionBtnTxt, { color: C.red }]}>🗑️</Text>
            <Text style={[styles.actionBtnLabel, { color: C.red }]}>DEL</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <SectionHeader title="SAVED" sub={`// ${plans.length} SAVED PLANS`} />
      </View>

      {plans.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyIcon}>💾</Text>
          <Text style={styles.emptyTitle}>NO SAVED PLANS</Text>
          <Text style={styles.emptySub}>
            Build a plan in the Builder tab or generate one in Suggest, then save it here.
          </Text>
        </View>
      ) : (
        <FlatList
          data={plans}
          keyExtractor={p => String(p.id)}
          renderItem={renderPlan}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 4 },
  listContent: { padding: 16, paddingBottom: 40 },

  planCard: {
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    padding: 14, marginBottom: 10,
    flexDirection: 'row', alignItems: 'flex-start',
  },
  planInfo: { flex: 1 },
  planName: { color: C.text, fontFamily: 'monospace', fontSize: 13, fontWeight: '700', letterSpacing: 0.5 },
  planMeta: { color: C.muted, fontSize: 10, fontFamily: 'monospace', marginTop: 3, marginBottom: 8 },

  previewRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  previewChip: {
    backgroundColor: C.muted2, borderWidth: 1, borderColor: C.border,
    paddingHorizontal: 6, paddingVertical: 2,
  },
  previewChipTxt: { color: C.muted, fontFamily: 'monospace', fontSize: 9 },

  planActions: { gap: 8, marginLeft: 10 },
  actionBtn: { alignItems: 'center', width: 42, paddingVertical: 6, borderWidth: 1, borderColor: C.border },
  actionBtnTxt: { fontSize: 16 },
  actionBtnLabel: { fontFamily: 'monospace', fontSize: 8, color: C.muted, letterSpacing: 0.8, marginTop: 2 },
  deleteBtn: { borderColor: C.red + '44' },

  emptyBox: {
    margin: 16, padding: 50, alignItems: 'center',
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderStyle: 'dashed',
  },
  emptyIcon: { fontSize: 48, marginBottom: 14 },
  emptyTitle: { color: C.neon, fontWeight: '800', letterSpacing: 2, fontSize: 14, marginBottom: 8 },
  emptySub: { color: C.muted, fontSize: 12, textAlign: 'center', fontFamily: 'monospace', lineHeight: 18 },
});
