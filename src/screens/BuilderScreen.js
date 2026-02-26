import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView, TextInput,
  TouchableOpacity, SafeAreaView, Alert,
} from 'react-native';
import { C } from '../data/theme';
import { savePlans, getPlans } from '../data/storage';
import { NeonBtn, OutlineBtn, SectionHeader, Card, MonoLabel, Divider, StatBox } from '../components/UI';

const MUSCLE_GROUPS = ['Chest','Back','Shoulders','Arms','Legs','Glutes','Core','Cardio'];

export default function BuilderScreen({ workoutPlan, setWorkoutPlan, onLoadToTracker }) {
  const [planName, setPlanName] = useState('');

  function updateItem(i, field, val) {
    const updated = [...workoutPlan];
    updated[i] = { ...updated[i], [field]: Math.max(1, parseInt(val) || 1) };
    setWorkoutPlan(updated);
  }

  function removeItem(i) {
    const updated = workoutPlan.filter((_, idx) => idx !== i);
    setWorkoutPlan(updated);
  }

  function moveItem(i, dir) {
    const updated = [...workoutPlan];
    const target = i + dir;
    if (target < 0 || target >= updated.length) return;
    [updated[i], updated[target]] = [updated[target], updated[i]];
    setWorkoutPlan(updated);
  }

  async function handleSave() {
    if (!workoutPlan.length) { Alert.alert('Empty Plan', 'Add exercises from the Library first.'); return; }
    const name = planName.trim() || `My Workout ${new Date().toLocaleDateString()}`;
    const plans = await getPlans();
    const newPlan = {
      id: Date.now(),
      name,
      exercises: workoutPlan.map(i => ({ exId: i.ex.id, sets: i.sets, reps: i.reps })),
      date: new Date().toLocaleDateString(),
      count: workoutPlan.length,
    };
    await savePlans([newPlan, ...plans]);
    Alert.alert('Saved!', `"${name}" has been saved.`);
  }

  function handleLoadToTracker() {
    if (!workoutPlan.length) { Alert.alert('Empty Plan', 'Add exercises from the Library first.'); return; }
    onLoadToTracker(workoutPlan);
  }

  function handleClear() {
    Alert.alert('Clear Plan', 'Remove all exercises from the plan?', [
      { text: 'Cancel' },
      { text: 'Clear', style: 'destructive', onPress: () => { setWorkoutPlan([]); setPlanName(''); } },
    ]);
  }

  // Overview stats
  const totalSets = workoutPlan.reduce((s, i) => s + i.sets, 0);
  const estMin = Math.round(totalSets * 2.5);
  const equips = [...new Set(workoutPlan.map(i => i.ex.eq === 'bw' ? 'BW' : i.ex.eq === 'band' ? 'BAND' : 'DB'))].join(' · ') || '—';

  // Muscle coverage
  const muscleCounts = {};
  MUSCLE_GROUPS.forEach(m => muscleCounts[m] = 0);
  workoutPlan.forEach(item => {
    item.ex.muscles.forEach(m => {
      const k = m.charAt(0).toUpperCase() + m.slice(1);
      if (muscleCounts[k] !== undefined) muscleCounts[k]++;
    });
  });
  const maxCount = Math.max(...Object.values(muscleCounts), 1);

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <SectionHeader title="BUILDER" sub="// CUSTOMIZE SETS & REPS · SAVE & LOAD" />
        </View>

        {/* Plan name */}
        <View style={styles.section}>
          <TextInput
            style={styles.nameInput}
            value={planName}
            onChangeText={setPlanName}
            placeholder="NAME YOUR WORKOUT..."
            placeholderTextColor={C.muted2}
            maxLength={40}
          />
        </View>

        {/* Empty state */}
        {workoutPlan.length === 0 ? (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>🏗️</Text>
            <Text style={styles.emptyTitle}>PLAN IS EMPTY</Text>
            <Text style={styles.emptySub}>Go to the Library tab and tap exercises to add them here</Text>
          </View>
        ) : (
          <>
            {/* Exercise list */}
            <View style={styles.section}>
              <MonoLabel text={`// ${workoutPlan.length} EXERCISES`} color={C.muted} size={10} style={{ marginBottom: 10 }} />
              {workoutPlan.map((item, i) => (
                <View key={item.ex.id + i} style={styles.workoutItem}>
                  <Text style={styles.itemNum}>{String(i + 1).padStart(2, '0')}</Text>
                  <View style={styles.itemInfo}>
                    <Text style={styles.itemName}>{item.ex.icon} {item.ex.name}</Text>
                    <Text style={styles.itemMuscle}>{item.ex.muscle}</Text>
                  </View>
                  <View style={styles.itemControls}>
                    <View style={styles.inputRow}>
                      <Text style={styles.inputLabel}>SETS</Text>
                      <TextInput
                        style={styles.numInput}
                        value={String(item.sets)}
                        onChangeText={v => updateItem(i, 'sets', v)}
                        keyboardType="number-pad"
                        maxLength={2}
                        selectTextOnFocus
                      />
                    </View>
                    <View style={styles.inputRow}>
                      <Text style={styles.inputLabel}>REPS</Text>
                      <TextInput
                        style={styles.numInput}
                        value={String(item.reps)}
                        onChangeText={v => updateItem(i, 'reps', v)}
                        keyboardType="number-pad"
                        maxLength={3}
                        selectTextOnFocus
                      />
                    </View>
                  </View>
                  <View style={styles.itemActions}>
                    <TouchableOpacity onPress={() => moveItem(i, -1)} style={styles.moveBtn}>
                      <Text style={styles.moveBtnTxt}>↑</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => moveItem(i, 1)} style={styles.moveBtn}>
                      <Text style={styles.moveBtnTxt}>↓</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => removeItem(i)} style={styles.removeBtn}>
                      <Text style={styles.removeBtnTxt}>✕</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>

            {/* Overview card */}
            <View style={[styles.section, { marginTop: 4 }]}>
              <Card>
                <MonoLabel text="PLAN OVERVIEW" color={C.neon} size={11} style={{ marginBottom: 10, letterSpacing: 2 }} />
                <View style={styles.statsRow}>
                  <StatBox value={workoutPlan.length} label="Exercises" />
                  <StatBox value={totalSets} label="Total Sets" />
                  <StatBox value={`${estMin}m`} label="Est. Time" />
                </View>
                <View style={styles.equipRow}>
                  <MonoLabel text="EQUIPMENT:" color={C.muted} size={10} />
                  <Text style={styles.equipVal}>{equips}</Text>
                </View>
              </Card>
            </View>

            {/* Muscle coverage */}
            <View style={styles.section}>
              <Card>
                <MonoLabel text="MUSCLE COVERAGE" color={C.neon} size={11} style={{ marginBottom: 12, letterSpacing: 2 }} />
                {MUSCLE_GROUPS.map(m => (
                  <View key={m} style={styles.barRow}>
                    <View style={styles.barLabelRow}>
                      <Text style={styles.barLabel}>{m}</Text>
                      <Text style={styles.barCount}>{muscleCounts[m]}</Text>
                    </View>
                    <View style={styles.barTrack}>
                      <View style={[styles.barFill, { width: `${(muscleCounts[m] / maxCount) * 100}%` }]} />
                    </View>
                  </View>
                ))}
              </Card>
            </View>
          </>
        )}

        {/* Action buttons */}
        <View style={styles.section}>
          <NeonBtn label="▶ LOAD INTO TRACKER" onPress={handleLoadToTracker} color={C.blue} />
          <NeonBtn label="💾 SAVE PLAN" onPress={handleSave} color={C.purple} />
          {workoutPlan.length > 0 && (
            <OutlineBtn label="CLEAR PLAN" onPress={handleClear} color={C.red} />
          )}
        </View>

        <View style={{ height: 40 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  scroll: { flex: 1 },
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 4 },
  section: { paddingHorizontal: 16, marginBottom: 8 },

  nameInput: {
    backgroundColor: 'transparent',
    borderBottomWidth: 1, borderColor: C.border,
    color: C.neon, fontWeight: '900', fontSize: 20,
    letterSpacing: 2, paddingVertical: 8,
    marginBottom: 4,
  },

  emptyBox: {
    margin: 16, padding: 40, alignItems: 'center',
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderStyle: 'dashed',
  },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { color: C.neon, fontWeight: '800', letterSpacing: 2, fontSize: 14, marginBottom: 6 },
  emptySub: { color: C.muted, fontSize: 12, textAlign: 'center', fontFamily: 'monospace' },

  workoutItem: {
    flexDirection: 'row', alignItems: 'center', gap: 10,
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    padding: 12, marginBottom: 6,
  },
  itemNum: { fontSize: 18, fontWeight: '900', color: C.muted2, minWidth: 26, textAlign: 'center' },
  itemInfo: { flex: 1 },
  itemName: { color: C.text, fontFamily: 'monospace', fontSize: 11, letterSpacing: 0.5, fontWeight: '700' },
  itemMuscle: { color: C.muted, fontSize: 10, marginTop: 2 },

  itemControls: { gap: 4 },
  inputRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  inputLabel: { fontFamily: 'monospace', fontSize: 9, color: C.muted, letterSpacing: 1, width: 30, textAlign: 'right' },
  numInput: {
    backgroundColor: 'transparent', borderWidth: 1, borderColor: C.border,
    color: C.neon, fontWeight: '900', fontSize: 15,
    width: 38, textAlign: 'center', paddingVertical: 3,
  },

  itemActions: { gap: 3 },
  moveBtn: { padding: 3 },
  moveBtnTxt: { color: C.muted, fontSize: 14, fontWeight: '700' },
  removeBtn: { padding: 3 },
  removeBtnTxt: { color: C.muted, fontSize: 13 },

  statsRow: { flexDirection: 'row', gap: 0, marginBottom: 10 },

  equipRow: { flexDirection: 'row', alignItems: 'center', gap: 8, marginTop: 4 },
  equipVal: { color: C.text, fontFamily: 'monospace', fontSize: 11, letterSpacing: 1 },

  barRow: { marginBottom: 7 },
  barLabelRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 3 },
  barLabel: { fontFamily: 'monospace', fontSize: 9, color: C.muted, letterSpacing: 1, textTransform: 'uppercase' },
  barCount: { fontFamily: 'monospace', fontSize: 9, color: C.muted },
  barTrack: { height: 2, backgroundColor: C.border },
  barFill: { height: 2, backgroundColor: C.neon },
});
