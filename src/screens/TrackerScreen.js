import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  SafeAreaView, Dimensions, Alert, FlatList, Animated,
} from 'react-native';
import { CameraView, useCameraPermissions } from 'expo-camera';
import * as Haptics from 'expo-haptics';
import { C } from '../data/theme';
import { TRACKED, EXERCISES } from '../data/exercises';
import { getLog, saveLog, clearLog } from '../data/storage';
import { NeonBtn, OutlineBtn, StatBox, MonoLabel } from '../components/UI';

const { width: SW, height: SH } = Dimensions.get('window');

// Exercises that have AI rep counting config
const REP_CONFIG = {
  pushup:       { label: 'PUSH-UP',       cue: 'Lower chest to floor, then push up' },
  widepushup:   { label: 'WIDE PUSH-UP',  cue: 'Wide grip, lower chest fully' },
  diapushup:    { label: 'DIAMOND PU',    cue: 'Hands diamond-shape under chest' },
  pikedpu:      { label: 'PIKE PUSH-UP',  cue: 'Hips high, lower head toward floor' },
  squat:        { label: 'SQUAT',         cue: 'Hips below parallel, drive through heels' },
  sumoSq:       { label: 'SUMO SQUAT',    cue: 'Wide stance, knees track toes' },
  lunge:        { label: 'LUNGE',         cue: 'Back knee toward floor, stay upright' },
  calfraise:    { label: 'CALF RAISE',    cue: 'Full extension at top, lower slowly' },
  situp:        { label: 'SIT-UP',        cue: 'Full range, touch chest to knees' },
  plank:        { label: 'PLANK',         cue: 'Hips level with shoulders', timed: true },
  dip:          { label: 'TRICEP DIP',    cue: 'Lower until elbows 90°, press up' },
  jumpingjack:  { label: 'JUMP JACK',     cue: 'Arms fully extend overhead' },
  burpee:       { label: 'BURPEE',        cue: 'Full range: floor to jump' },
  mountclimber: { label: 'MT CLIMBER',    cue: 'Drive knees to chest alternating' },
  bandcurl:     { label: 'BAND CURL',     cue: 'Full curl, control the lower' },
  bandshpress:  { label: 'BAND PRESS',    cue: 'Full extension overhead' },
  dbshpress:    { label: 'DB PRESS',      cue: 'Press to full extension overhead' },
  dbcurl:       { label: 'DB CURL',       cue: 'Squeeze at top, control descent' },
  dbgobsq:      { label: 'GOBLET SQ',     cue: 'Chest up, elbows inside knees' },
};

export default function TrackerScreen({ activePlan, onClearPlan }) {
  const [permission, requestPermission] = useCameraPermissions();
  const [selectedEx, setSelectedEx] = useState(null);
  const [tracking, setTracking] = useState(false);
  const [repCount, setRepCount] = useState(0);
  const [setCount, setSetCount] = useState(0);
  const [totalReps, setTotalReps] = useState(0);
  const [plankSecs, setPlankSecs] = useState(0);
  const [history, setHistory] = useState([]);
  const [showCamera, setShowCamera] = useState(false);
  const plankRef = useRef(null);
  const popAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => { loadHistory(); }, []);

  useEffect(() => {
    if (activePlan?.length > 0) {
      const first = activePlan.find(i => i.ex.tracked);
      if (first) selectExercise(first.ex);
    }
  }, [activePlan]);

  async function loadHistory() {
    const log = await getLog();
    setHistory(log);
  }

  function selectExercise(ex) {
    if (tracking) stopTracking();
    setSelectedEx(ex);
    setRepCount(0);
    setPlankSecs(0);
  }

  function startTracking() {
    if (!selectedEx) return;
    setTracking(true);
    setRepCount(0);
    setPlankSecs(0);
    if (selectedEx.timed) {
      plankRef.current = setInterval(() => {
        setPlankSecs(s => s + 1);
      }, 1000);
    }
    setShowCamera(true);
  }

  function stopTracking() {
    setTracking(false);
    if (plankRef.current) { clearInterval(plankRef.current); plankRef.current = null; }
  }

  function addRep() {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setRepCount(r => r + 1);
    setTotalReps(t => t + 1);
    // pop animation
    Animated.sequence([
      Animated.timing(popAnim, { toValue: 1.2, duration: 80, useNativeDriver: true }),
      Animated.timing(popAnim, { toValue: 1,   duration: 80, useNativeDriver: true }),
    ]).start();
  }

  async function logSet() {
    if (!selectedEx) return;
    const hasVal = selectedEx.timed ? plankSecs > 0 : repCount > 0;
    if (!hasVal) { Alert.alert('No reps recorded', 'Tap the counter or track first.'); return; }
    stopTracking();
    const val = selectedEx.timed
      ? `${Math.floor(plankSecs/60)}:${(plankSecs%60).toString().padStart(2,'0')}`
      : repCount;
    const entry = {
      exercise: selectedEx.name,
      reps: val,
      timed: !!selectedEx.timed,
      timestamp: new Date().toLocaleTimeString([], { hour:'2-digit', minute:'2-digit' }),
      date: new Date().toLocaleDateString(),
    };
    const updated = [entry, ...history];
    setHistory(updated);
    await saveLog(updated);
    setSetCount(s => s + 1);
    setRepCount(0);
    setPlankSecs(0);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
  }

  async function handleClearHistory() {
    Alert.alert('Clear Log', 'Delete all workout history?', [
      { text: 'Cancel' },
      { text: 'Clear', style: 'destructive', onPress: async () => {
        await clearLog(); setHistory([]); setSetCount(0); setTotalReps(0);
      }},
    ]);
  }

  const planExercises = activePlan?.filter(i => i.ex.tracked) || [];
  const cfg = selectedEx ? REP_CONFIG[selectedEx.id] : null;

  const formatSecs = (s) => `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView style={styles.scroll} showsVerticalScrollIndicator={false}>

        {/* ── Active Plan Bar ── */}
        {planExercises.length > 0 && (
          <View style={styles.planBar}>
            <MonoLabel text="// ACTIVE PLAN" color={C.neon} size={9} />
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 8 }}>
              {planExercises.map(item => (
                <TouchableOpacity
                  key={item.ex.id}
                  style={[styles.planChip, selectedEx?.id === item.ex.id && styles.planChipActive]}
                  onPress={() => selectExercise(item.ex)}
                >
                  <Text style={[styles.planChipTxt, selectedEx?.id === item.ex.id && { color: C.neon }]}>
                    {item.ex.icon} {item.ex.name.split(' ')[0]}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        )}

        {/* ── Camera Permission ── */}
        {!permission?.granted && (
          <View style={styles.permBox}>
            <Text style={styles.permIcon}>📷</Text>
            <Text style={styles.permTitle}>CAMERA ACCESS NEEDED</Text>
            <Text style={styles.permSub}>KINETIC uses your camera to detect poses and count reps automatically.</Text>
            <NeonBtn label="GRANT CAMERA ACCESS" onPress={requestPermission} />
          </View>
        )}

        {/* ── Exercise Selector ── */}
        <View style={styles.section}>
          <MonoLabel text="// SELECT EXERCISE" color={C.muted} size={10} style={{ marginBottom: 10 }} />
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {TRACKED.map(ex => (
              <TouchableOpacity
                key={ex.id}
                style={[styles.exChip, selectedEx?.id === ex.id && styles.exChipActive]}
                onPress={() => selectExercise(ex)}
              >
                <Text style={styles.exChipIcon}>{ex.icon}</Text>
                <Text style={[styles.exChipName, selectedEx?.id === ex.id && { color: C.neon }]}>
                  {ex.name}
                </Text>
                {ex.timed && <Text style={styles.timedBadge}>TIMED</Text>}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* ── Main Counter ── */}
        {selectedEx ? (
          <View style={styles.counterSection}>
            {/* Big counter */}
            <View style={styles.counterBox}>
              <MonoLabel text={cfg?.label || selectedEx.name.toUpperCase()} color={C.muted} size={11} style={{ marginBottom: 8, letterSpacing: 2 }} />

              {selectedEx.timed ? (
                <TouchableOpacity onPress={tracking ? stopTracking : startTracking} activeOpacity={0.7}>
                  <Text style={[styles.bigNum, { color: C.blue }]}>{formatSecs(plankSecs)}</Text>
                  <Text style={[styles.bigLabel, { color: C.blue + '88' }]}>TAP TO {tracking ? 'PAUSE' : 'START'}</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={addRep} activeOpacity={0.7}>
                  <Animated.Text style={[styles.bigNum, { transform: [{ scale: popAnim }] }]}>
                    {repCount}
                  </Animated.Text>
                  <Text style={styles.bigLabel}>TAP TO COUNT REP</Text>
                </TouchableOpacity>
              )}

              {/* Camera feed indicator */}
              {permission?.granted && (
                <View style={styles.camIndicator}>
                  <View style={[styles.camDot, tracking && styles.camDotLive]} />
                  <Text style={styles.camIndicatorTxt}>
                    {tracking ? 'CAMERA ACTIVE' : 'CAMERA READY'}
                  </Text>
                </View>
              )}
            </View>

            {/* Tip box */}
            <View style={styles.tipBox}>
              <MonoLabel text="// POSITIONING TIP" color={C.neon} size={9} style={{ marginBottom: 4 }} />
              <Text style={styles.tipText}>{selectedEx.tip}</Text>
              {cfg?.cue && <Text style={styles.cueText}>FORM: {cfg.cue}</Text>}
            </View>

            {/* Stats row */}
            <View style={styles.statsRow}>
              <StatBox value={selectedEx.timed ? formatSecs(plankSecs) : repCount} label={selectedEx.timed ? 'Time' : 'Reps'} color={selectedEx.timed ? C.blue : C.neon} />
              <StatBox value={setCount} label="Sets" />
              <StatBox value={totalReps} label="Total" />
            </View>

            {/* Buttons */}
            <View style={styles.btnRow}>
              {!selectedEx.timed && (
                <NeonBtn
                  label={tracking ? '⏸ PAUSE' : '▶ START TRACKING'}
                  onPress={tracking ? stopTracking : startTracking}
                  style={{ flex: 1, marginRight: 6 }}
                  disabled={!permission?.granted}
                  color={tracking ? C.yellow : C.neon}
                />
              )}
              <NeonBtn
                label="LOG SET ✓"
                onPress={logSet}
                style={{ flex: 1 }}
                color={C.purple}
              />
            </View>
          </View>
        ) : (
          <View style={styles.noExBox}>
            <Text style={styles.noExIcon}>🎯</Text>
            <Text style={styles.noExTitle}>SELECT AN EXERCISE</Text>
            <Text style={styles.noExSub}>Scroll the list above to pick an exercise to track</Text>
          </View>
        )}

        {/* ── Camera Preview ── */}
        {permission?.granted && selectedEx && (
          <View style={styles.section}>
            <MonoLabel text="// CAMERA FEED" color={C.muted} size={10} style={{ marginBottom: 8 }} />
            <View style={styles.cameraContainer}>
              <CameraView style={styles.camera} facing="front" />
              {/* Corner brackets */}
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />
              <View style={styles.cameraOverlay}>
                <View style={[styles.camStatusBadge, tracking && styles.camStatusLive]}>
                  <Text style={styles.camStatusTxt}>{tracking ? '● TRACKING' : '○ STANDBY'}</Text>
                </View>
              </View>
            </View>
            <Text style={styles.cameraNote}>
              Note: Tap the counter above to manually log reps. Full AI pose detection coming in v2.
            </Text>
          </View>
        )}

        {/* ── Workout Log ── */}
        <View style={styles.section}>
          <View style={styles.logHeader}>
            <MonoLabel text="// WORKOUT LOG" color={C.muted} size={10} />
            <TouchableOpacity onPress={handleClearHistory}>
              <Text style={styles.clearBtn}>CLEAR</Text>
            </TouchableOpacity>
          </View>
          {history.length === 0 ? (
            <Text style={styles.emptyLog}>// NO SETS LOGGED YET</Text>
          ) : (
            history.slice(0, 20).map((entry, i) => (
              <View key={i} style={styles.logEntry}>
                <View>
                  <Text style={styles.logEx}>{entry.exercise}</Text>
                  <Text style={styles.logDate}>{entry.date}</Text>
                </View>
                <View style={{ alignItems: 'flex-end' }}>
                  <Text style={[styles.logReps, entry.timed && { color: C.blue }]}>
                    {entry.reps} <Text style={{ fontSize: 12, color: C.muted }}>{entry.timed ? 'S' : 'REPS'}</Text>
                  </Text>
                  <Text style={styles.logTime}>{entry.timestamp}</Text>
                </View>
              </View>
            ))
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

  planBar: {
    backgroundColor: 'rgba(0,255,136,0.04)',
    borderBottomWidth: 1,
    borderLeftWidth: 3,
    borderColor: C.border,
    borderLeftColor: C.neon,
    padding: 12,
    marginBottom: 4,
  },
  planChip: {
    borderWidth: 1, borderColor: C.border,
    paddingHorizontal: 12, paddingVertical: 7,
    marginRight: 8, backgroundColor: C.card,
  },
  planChipActive: { borderColor: C.neon, backgroundColor: C.neonDim },
  planChipTxt: { fontFamily: 'monospace', fontSize: 11, color: C.muted, letterSpacing: 0.5 },

  permBox: {
    margin: 16, padding: 24, alignItems: 'center',
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
  },
  permIcon: { fontSize: 40, marginBottom: 12 },
  permTitle: { color: C.neon, fontWeight: '800', fontSize: 14, letterSpacing: 2, marginBottom: 8 },
  permSub: { color: C.muted, fontSize: 12, textAlign: 'center', lineHeight: 18, marginBottom: 16, fontFamily: 'monospace' },

  section: { paddingHorizontal: 16, paddingTop: 14 },

  exChip: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: C.border,
    backgroundColor: C.card,
    paddingHorizontal: 12, paddingVertical: 10,
    marginRight: 8, gap: 6,
  },
  exChipActive: { borderColor: C.neon, backgroundColor: C.neonDim },
  exChipIcon: { fontSize: 16 },
  exChipName: { fontFamily: 'monospace', fontSize: 11, color: C.muted, letterSpacing: 0.5 },
  timedBadge: { fontSize: 9, color: C.blue, fontFamily: 'monospace', borderWidth: 1, borderColor: C.blue + '66', paddingHorizontal: 4, paddingVertical: 1 },

  counterSection: { paddingHorizontal: 16, marginTop: 10 },

  counterBox: {
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border,
    padding: 24, alignItems: 'center', marginBottom: 8,
  },
  bigNum: {
    fontSize: 96, fontWeight: '900', color: C.neon,
    lineHeight: 100, textAlign: 'center',
    textShadowColor: C.neon, textShadowRadius: 20,
  },
  bigLabel: {
    fontFamily: 'monospace', fontSize: 10, color: C.muted,
    letterSpacing: 2, textAlign: 'center', marginTop: 4,
  },
  camIndicator: { flexDirection: 'row', alignItems: 'center', marginTop: 14, gap: 6 },
  camDot: { width: 7, height: 7, borderRadius: 4, backgroundColor: C.muted },
  camDotLive: { backgroundColor: C.neon, shadowColor: C.neon, shadowRadius: 6, shadowOpacity: 1 },
  camIndicatorTxt: { fontFamily: 'monospace', fontSize: 9, color: C.muted, letterSpacing: 1 },

  tipBox: {
    borderWidth: 1, borderColor: C.border, borderLeftWidth: 2, borderLeftColor: C.neon,
    backgroundColor: 'rgba(0,255,136,0.03)', padding: 10, marginBottom: 8,
  },
  tipText: { color: C.muted, fontSize: 12, fontFamily: 'monospace', lineHeight: 18 },
  cueText: { color: C.text, fontSize: 11, fontFamily: 'monospace', marginTop: 4, letterSpacing: 0.5 },

  statsRow: { flexDirection: 'row', marginBottom: 10 },

  btnRow: { flexDirection: 'row', marginBottom: 8 },

  noExBox: {
    margin: 16, padding: 40, alignItems: 'center',
    backgroundColor: C.card, borderWidth: 1, borderColor: C.border, borderStyle: 'dashed',
  },
  noExIcon: { fontSize: 40, marginBottom: 12 },
  noExTitle: { color: C.neon, fontWeight: '800', letterSpacing: 2, fontSize: 14, marginBottom: 6 },
  noExSub: { color: C.muted, fontSize: 12, textAlign: 'center', fontFamily: 'monospace' },

  cameraContainer: {
    height: 220, backgroundColor: '#000',
    overflow: 'hidden', position: 'relative',
  },
  camera: { flex: 1 },
  corner: { position: 'absolute', width: 20, height: 20 },
  cornerTL: { top: 8, left: 8, borderTopWidth: 2, borderLeftWidth: 2, borderColor: C.neon },
  cornerTR: { top: 8, right: 8, borderTopWidth: 2, borderRightWidth: 2, borderColor: C.neon },
  cornerBL: { bottom: 8, left: 8, borderBottomWidth: 2, borderLeftWidth: 2, borderColor: C.neon },
  cornerBR: { bottom: 8, right: 8, borderBottomWidth: 2, borderRightWidth: 2, borderColor: C.neon },
  cameraOverlay: { position: 'absolute', top: 8, right: 8 },
  camStatusBadge: { backgroundColor: 'rgba(0,0,0,0.7)', paddingHorizontal: 8, paddingVertical: 4, borderWidth: 1, borderColor: C.border },
  camStatusLive: { borderColor: C.neon },
  camStatusTxt: { fontFamily: 'monospace', fontSize: 10, color: C.neon, letterSpacing: 1 },
  cameraNote: { color: C.muted2, fontSize: 10, fontFamily: 'monospace', marginTop: 6, lineHeight: 16 },

  logHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  clearBtn: { fontFamily: 'monospace', fontSize: 10, color: C.muted, letterSpacing: 1 },
  emptyLog: { color: C.muted, fontFamily: 'monospace', fontSize: 11, textAlign: 'center', padding: 24, letterSpacing: 1 },
  logEntry: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 10, borderBottomWidth: 1, borderColor: C.border,
  },
  logEx: { color: C.text, fontFamily: 'monospace', fontSize: 12, letterSpacing: 0.5 },
  logDate: { color: C.muted, fontSize: 10, fontFamily: 'monospace', marginTop: 2 },
  logReps: { color: C.neon, fontSize: 20, fontWeight: '900' },
  logTime: { color: C.muted, fontSize: 10, fontFamily: 'monospace' },
});
