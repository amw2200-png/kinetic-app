import React, { useState } from 'react';
import {
  View, Text, StyleSheet, ScrollView,
  TouchableOpacity, SafeAreaView,
} from 'react-native';
import { C } from '../data/theme';
import { EXERCISES } from '../data/exercises';
import { NeonBtn, SectionHeader, MonoLabel, EqTag } from '../components/UI';

const CONFIGS = {
  goal:  { label: 'Goal',      options: ['STRENGTH','HYPERTROPHY','ENDURANCE','FAT LOSS'] },
  equip: { label: 'Equipment', options: ['BODYWEIGHT','BANDS','DUMBBELLS','ALL'] },
  focus: { label: 'Focus',     options: ['FULL BODY','UPPER','LOWER','PUSH','PULL','CORE'] },
  level: { label: 'Level',     options: ['BEGINNER','INTERMEDIATE','ADVANCED'] },
  dur:   { label: 'Duration',  options: ['20 MIN','30–45 MIN','60 MIN'] },
};

const DEFAULTS = { goal:'HYPERTROPHY', equip:'BODYWEIGHT', focus:'FULL BODY', level:'INTERMEDIATE', dur:'30–45 MIN' };

const BEGINNER_EXCLUDE = ['pistolsq','pullup','chinup','archerpushup','dbmanmaker','dbthrusters','boxjump'];
const FOCUS_CATS = {
  'FULL BODY': ['chest','back','shoulders','arms','legs','glutes','core'],
  'UPPER':     ['chest','back','shoulders','arms','core'],
  'LOWER':     ['legs','glutes','core'],
  'PUSH':      ['chest','shoulders','arms','legs'],
  'PULL':      ['back','arms','core'],
  'CORE':      ['core','cardio'],
};
const EQ_MAP = { BODYWEIGHT:'bw', BANDS:'band', DUMBBELLS:'db', ALL:null };
const COUNT_MAP = { '20 MIN':4, '30–45 MIN':7, '60 MIN':10 };
const SR_MAP = {
  STRENGTH:    { sets:4, reps:5,  rest:'3 min'  },
  HYPERTROPHY: { sets:3, reps:10, rest:'90 sec' },
  ENDURANCE:   { sets:3, reps:20, rest:'45 sec' },
  'FAT LOSS':  { sets:4, reps:15, rest:'30 sec' },
};

export default function SuggestScreen({ onSendToBuilder, onLoadToTracker }) {
  const [sel, setSel] = useState({ ...DEFAULTS });
  const [plan, setPlan] = useState([]);

  function pick(group, val) {
    setSel(s => ({ ...s, [group]: val }));
  }

  function generate() {
    const { goal, equip, focus, level, dur } = sel;
    const count = COUNT_MAP[dur] || 7;
    const sr = SR_MAP[goal] || SR_MAP.HYPERTROPHY;
    const eqType = EQ_MAP[equip];
    const cats = FOCUS_CATS[focus] || FOCUS_CATS['FULL BODY'];

    let pool = EXERCISES.filter(ex => {
      if (eqType && ex.eq !== eqType) return false;
      if (!cats.includes(ex.cat)) return false;
      if (level === 'BEGINNER' && BEGINNER_EXCLUDE.includes(ex.id)) return false;
      return true;
    }).sort(() => Math.random() - 0.5);

    const chosen = [];
    cats.forEach(cat => {
      const m = pool.find(ex => ex.cat === cat && !chosen.find(c => c.id === ex.id));
      if (m) chosen.push(m);
    });
    const rem = pool.filter(ex => !chosen.find(c => c.id === ex.id)).sort(() => Math.random() - 0.5);
    let ri = 0;
    while (chosen.length < count && ri < rem.length) chosen.push(rem[ri++]);

    const result = chosen.slice(0, count).map(ex => ({ ex, sets: sr.sets, reps: sr.reps, rest: sr.rest }));
    setPlan(result);
  }

  const eqColor = (eq) => eq === 'bw' ? C.neon : eq === 'band' ? C.blue : C.orange;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.header}>
          <SectionHeader title="SUGGEST" sub="// CONFIGURE · GENERATE · GO" />
        </View>

        {/* Config options */}
        {Object.entries(CONFIGS).map(([key, cfg]) => (
          <View key={key} style={styles.optGroup}>
            <MonoLabel text={cfg.label} color={C.muted} size={10} style={{ marginBottom: 8, letterSpacing: 2 }} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {cfg.options.map(opt => {
                const active = sel[key] === opt;
                let ac = C.neon;
                if (key === 'equip') {
                  if (opt === 'BANDS') ac = C.blue;
                  else if (opt === 'DUMBBELLS') ac = C.orange;
                }
                return (
                  <TouchableOpacity
                    key={opt}
                    style={[styles.chip, active && { borderColor: ac, backgroundColor: ac + '18' }]}
                    onPress={() => pick(key, opt)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.chipTxt, active && { color: ac }]}>{opt}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>
        ))}

        {/* Generate button */}
        <View style={styles.section}>
          <NeonBtn label="⚡ GENERATE WORKOUT" onPress={generate} color={C.purple} />
        </View>

        {/* Results */}
        {plan.length > 0 ? (
          <View style={styles.section}>
            {/* Plan header */}
            <View style={styles.planHeader}>
              <Text style={styles.planTitle}>{sel.focus} {sel.goal}</Text>
              <Text style={styles.planMeta}>
                {sel.equip} · {sel.level} · {sel.dur} · {SR_MAP[sel.goal]?.sets}×{SR_MAP[sel.goal]?.reps} · REST {SR_MAP[sel.goal]?.rest}
              </Text>
            </View>

            {plan.map((item, i) => (
              <View key={item.ex.id} style={styles.genItem}>
                <Text style={styles.genNum}>{String(i + 1).padStart(2, '0')}</Text>
                <View style={styles.genInfo}>
                  <View style={{ flexDirection:'row', alignItems:'center', gap:6 }}>
                    <Text style={styles.genName}>{item.ex.icon} {item.ex.name}</Text>
                    {item.ex.tracked && <Text style={styles.trackBadge}>📷</Text>}
                  </View>
                  <Text style={styles.genMuscle}>{item.ex.muscle}</Text>
                  <EqTag eq={item.ex.eq} />
                </View>
                <View style={styles.genSetsBox}>
                  <Text style={styles.genSets}>{item.sets}×{item.reps}</Text>
                  <Text style={styles.genSetsLabel}>SETS×REPS</Text>
                </View>
              </View>
            ))}

            {/* Action buttons */}
            <NeonBtn label="→ SEND TO BUILDER" onPress={() => onSendToBuilder(plan)} color={C.neon} style={{ marginTop: 12 }} />
            <NeonBtn label="▶ LOAD INTO TRACKER" onPress={() => onLoadToTracker(plan)} color={C.blue} />
            <TouchableOpacity onPress={generate} style={styles.regenBtn}>
              <Text style={styles.regenTxt}>↺ REGENERATE WITH SAME SETTINGS</Text>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={styles.emptyBox}>
            <Text style={styles.emptyIcon}>✨</Text>
            <Text style={styles.emptyTitle}>CONFIGURE & GENERATE</Text>
            <Text style={styles.emptySub}>Set your preferences above and tap Generate to get a complete workout plan</Text>
          </View>
        )}

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

  optGroup: { paddingHorizontal: 16, marginBottom: 16 },
  chip: {
    borderWidth: 1, borderColor: C.border,
    paddingHorizontal: 14, paddingVertical: 8,
    marginRight: 8,
  },
  chipTxt: { fontFamily: 'monospace', fontSize: 11, color: C.muted, letterSpacing: 1 },

  planHeader: {
    borderLeftWidth: 3, borderLeftColor: C.neon,
    paddingLeft: 12, marginBottom: 12,
  },
  planTitle: { fontSize: 20, fontWeight: '900', color: C.neon, letterSpacing: 2, textTransform: 'uppercase' },
  planMeta: { fontFamily: 'monospace', fontSize: 9, color: C.muted, marginTop: 3, letterSpacing: 0.5 },

  genItem: {
    flexDirection: 'row', alignItems: 'center', gap: 12,
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    padding: 12, marginBottom: 6,
  },
  genNum: { fontSize: 24, fontWeight: '900', color: C.neon, minWidth: 30, textAlign: 'center' },
  genInfo: { flex: 1 },
  genName: { color: C.text, fontFamily: 'monospace', fontSize: 12, letterSpacing: 0.5, fontWeight: '700' },
  trackBadge: { fontSize: 14 },
  genMuscle: { color: C.muted, fontSize: 10, marginTop: 2, marginBottom: 4 },
  genSetsBox: { alignItems: 'center', minWidth: 55 },
  genSets: { fontSize: 18, fontWeight: '900', color: C.muted },
  genSetsLabel: { fontFamily: 'monospace', fontSize: 8, color: C.muted, letterSpacing: 1 },

  regenBtn: { alignItems: 'center', paddingVertical: 12 },
  regenTxt: { fontFamily: 'monospace', fontSize: 11, color: C.muted, letterSpacing: 1 },

  emptyBox: {
    margin: 16, padding: 40, alignItems: 'center',
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderStyle: 'dashed',
  },
  emptyIcon: { fontSize: 40, marginBottom: 12 },
  emptyTitle: { color: C.neon, fontWeight: '800', letterSpacing: 2, fontSize: 14, marginBottom: 6 },
  emptySub: { color: C.muted, fontSize: 12, textAlign: 'center', fontFamily: 'monospace', lineHeight: 18 },
});
