import React, { useState, useMemo } from 'react';
import {
  View, Text, StyleSheet, FlatList, TouchableOpacity,
  TextInput, ScrollView, SafeAreaView,
} from 'react-native';
import { C } from '../data/theme';
import { EXERCISES, CATEGORIES } from '../data/exercises';
import { EqTag, MuscleTag, TrackBadge, FilterChip, SectionHeader, MonoLabel } from '../components/UI';

export default function LibraryScreen({ workoutPlan, onToggleExercise }) {
  const [eqFilter, setEqFilter] = useState('all');
  const [muscleFilter, setMuscleFilter] = useState('');
  const [search, setSearch] = useState('');

  const filtered = useMemo(() => {
    return EXERCISES.filter(ex => {
      if (eqFilter !== 'all' && ex.eq !== eqFilter) return false;
      if (muscleFilter && ex.cat !== muscleFilter) return false;
      if (search) {
        const q = search.toLowerCase();
        return ex.name.toLowerCase().includes(q)
          || ex.muscle.toLowerCase().includes(q)
          || ex.cat.includes(q);
      }
      return true;
    });
  }, [eqFilter, muscleFilter, search]);

  const selectedIds = workoutPlan.map(i => i.ex.id);

  const EQ_FILTERS = [
    { key: 'all',  label: 'ALL',        color: C.neon   },
    { key: 'bw',   label: '🏃 BW',      color: C.neon   },
    { key: 'band', label: '🎗️ BANDS',   color: C.blue   },
    { key: 'db',   label: '🏋️ DUMBBELLS', color: C.orange },
  ];

  const MUSCLE_FILTERS = ['', ...CATEGORIES];
  const MUSCLE_LABELS = { '': 'ALL', chest: 'CHEST', back: 'BACK', shoulders: 'SHOULDERS', arms: 'ARMS', legs: 'LEGS', glutes: 'GLUTES', core: 'CORE', cardio: 'CARDIO' };

  function renderExCard({ item: ex }) {
    const selected = selectedIds.includes(ex.id);
    return (
      <TouchableOpacity
        style={[styles.exCard, selected && styles.exCardSelected]}
        onPress={() => onToggleExercise(ex)}
        activeOpacity={0.75}
      >
        {selected && <Text style={styles.checkMark}>✓</Text>}
        <View style={styles.exCardTop}>
          <Text style={styles.exIcon}>{ex.icon}</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.exName}>{ex.name}</Text>
            <Text style={styles.exMuscle}>{ex.muscle}</Text>
          </View>
        </View>
        <View style={styles.exTags}>
          <EqTag eq={ex.eq} />
          <MuscleTag label={ex.cat} />
          {ex.tracked && <TrackBadge />}
        </View>
      </TouchableOpacity>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <SectionHeader title="LIBRARY" sub={`// ${filtered.length} OF ${EXERCISES.length} EXERCISES`} />
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <TextInput
          style={styles.searchInput}
          value={search}
          onChangeText={setSearch}
          placeholder="SEARCH BY NAME, MUSCLE..."
          placeholderTextColor={C.muted}
          autoCorrect={false}
          autoCapitalize="none"
        />
      </View>

      {/* Equipment filter */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.filterRow} contentContainerStyle={styles.filterContent}>
        {EQ_FILTERS.map(f => (
          <FilterChip
            key={f.key}
            label={f.label}
            active={eqFilter === f.key}
            onPress={() => setEqFilter(f.key)}
            activeColor={f.color}
          />
        ))}
        <View style={styles.filterDivider} />
        {MUSCLE_FILTERS.map(m => (
          <FilterChip
            key={m}
            label={MUSCLE_LABELS[m]}
            active={muscleFilter === m}
            onPress={() => setMuscleFilter(m)}
          />
        ))}
      </ScrollView>

      {/* Add to plan hint */}
      {workoutPlan.length > 0 && (
        <View style={styles.planHint}>
          <Text style={styles.planHintTxt}>
            {workoutPlan.length} exercise{workoutPlan.length !== 1 ? 's' : ''} in plan · Tap to add/remove
          </Text>
        </View>
      )}

      {/* Exercise list */}
      <FlatList
        data={filtered}
        keyExtractor={ex => ex.id}
        renderItem={renderExCard}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.emptyTxt}>// NO EXERCISES MATCH YOUR FILTERS</Text>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: C.bg },
  header: { paddingHorizontal: 16, paddingTop: 16, paddingBottom: 4 },

  searchWrap: { paddingHorizontal: 16, marginBottom: 4 },
  searchInput: {
    backgroundColor: C.card,
    borderWidth: 1, borderColor: C.border,
    color: C.text,
    fontFamily: 'monospace',
    fontSize: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    letterSpacing: 0.5,
  },

  filterRow: { maxHeight: 80 },
  filterContent: { paddingHorizontal: 16, paddingBottom: 8, flexDirection: 'row', flexWrap: 'wrap' },
  filterDivider: { width: 1, backgroundColor: C.border, marginHorizontal: 8, marginVertical: 4 },

  planHint: {
    marginHorizontal: 16, marginBottom: 6,
    backgroundColor: C.neonDim, borderWidth: 1, borderColor: C.neon + '44',
    padding: 8,
  },
  planHintTxt: { fontFamily: 'monospace', fontSize: 10, color: C.neon, letterSpacing: 0.5 },

  listContent: { paddingHorizontal: 16, paddingBottom: 40 },

  exCard: {
    backgroundColor: C.card,
    borderWidth: 1, borderColor: C.border,
    padding: 12, marginBottom: 8,
    position: 'relative',
  },
  exCardSelected: { borderColor: C.neon, backgroundColor: 'rgba(0,255,136,0.06)' },

  checkMark: {
    position: 'absolute', top: 10, right: 12,
    color: C.neon, fontSize: 16, fontWeight: '900',
  },

  exCardTop: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 8 },
  exIcon: { fontSize: 22, marginTop: 2 },
  exName: {
    color: C.text, fontFamily: 'monospace', fontSize: 12,
    letterSpacing: 0.5, fontWeight: '700', marginBottom: 2,
  },
  exMuscle: { color: C.muted, fontSize: 11 },

  exTags: { flexDirection: 'row', flexWrap: 'wrap' },

  emptyTxt: {
    color: C.muted, fontFamily: 'monospace', fontSize: 11,
    textAlign: 'center', padding: 40, letterSpacing: 1,
  },
});
