import React, { useState, useCallback } from 'react';
import { View, Text, StyleSheet, StatusBar, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';

import TrackerScreen from './src/screens/TrackerScreen';
import LibraryScreen from './src/screens/LibraryScreen';
import BuilderScreen from './src/screens/BuilderScreen';
import SuggestScreen from './src/screens/SuggestScreen';
import SavedScreen   from './src/screens/SavedScreen';
import { C } from './src/data/theme';

const Tab = createBottomTabNavigator();

// Tab icon component
function TabIcon({ label, icon, focused }) {
  return (
    <View style={[tabStyles.iconWrap, focused && tabStyles.iconWrapActive]}>
      <Text style={tabStyles.iconEmoji}>{icon}</Text>
      <Text style={[tabStyles.iconLabel, focused && tabStyles.iconLabelActive]}>{label}</Text>
    </View>
  );
}

export default function App() {
  // Shared state passed between all screens
  const [workoutPlan, setWorkoutPlan] = useState([]);
  const [activePlan, setActivePlan] = useState([]);

  // When an exercise is toggled in library
  function toggleExercise(ex) {
    setWorkoutPlan(prev => {
      const idx = prev.findIndex(i => i.ex.id === ex.id);
      if (idx === -1) return [...prev, { ex, sets: 3, reps: 10 }];
      return prev.filter((_, i) => i !== idx);
    });
  }

  // Load generated plan into builder
  function sendToBuilder(generatedPlan, name) {
    setWorkoutPlan(generatedPlan);
  }

  // Load any plan into tracker (from builder, suggest, or saved)
  function loadToTracker(plan) {
    setActivePlan(plan);
  }

  // Load saved plan into builder
  function loadToBuilder(hydratedPlan, name) {
    setWorkoutPlan(hydratedPlan);
  }

  const TABS = [
    { name: 'Tracker',  icon: '📷', label: 'TRACK',   component: () => <TrackerScreen activePlan={activePlan} onClearPlan={() => setActivePlan([])} /> },
    { name: 'Library',  icon: '📚', label: 'LIBRARY', component: () => <LibraryScreen workoutPlan={workoutPlan} onToggleExercise={toggleExercise} /> },
    { name: 'Builder',  icon: '🏗️', label: 'BUILD',   component: () => <BuilderScreen workoutPlan={workoutPlan} setWorkoutPlan={setWorkoutPlan} onLoadToTracker={loadToTracker} /> },
    { name: 'Suggest',  icon: '✨', label: 'SUGGEST', component: () => <SuggestScreen onSendToBuilder={sendToBuilder} onLoadToTracker={loadToTracker} /> },
    { name: 'Saved',    icon: '💾', label: 'SAVED',   component: () => <SavedScreen onLoadToBuilder={loadToBuilder} onLoadToTracker={loadToTracker} /> },
  ];

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar barStyle="light-content" backgroundColor={C.panel} />
        <NavigationContainer>
          {/* Header */}
          <View style={styles.appHeader}>
            <Text style={styles.logo}>KIN<Text style={styles.logoWhite}>ETIC</Text></Text>
            <Text style={styles.logoSub}>AI FITNESS SYSTEM</Text>
            {activePlan.length > 0 && (
              <View style={styles.activeBadge}>
                <Text style={styles.activeBadgeTxt}>▶ PLAN ACTIVE</Text>
              </View>
            )}
          </View>

          <Tab.Navigator
            screenOptions={{
              headerShown: false,
              tabBarStyle: styles.tabBar,
              tabBarShowLabel: false,
            }}
          >
            {TABS.map(t => (
              <Tab.Screen
                key={t.name}
                name={t.name}
                component={t.component}
                options={{
                  tabBarIcon: ({ focused }) => (
                    <TabIcon label={t.label} icon={t.icon} focused={focused} />
                  ),
                }}
              />
            ))}
          </Tab.Navigator>
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  appHeader: {
    backgroundColor: C.panel,
    borderBottomWidth: 1,
    borderBottomColor: C.border,
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 50 : 14,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  logo: {
    fontSize: 22,
    fontWeight: '900',
    color: C.neon,
    letterSpacing: 4,
  },
  logoWhite: { color: C.text },
  logoSub: {
    fontFamily: 'monospace',
    fontSize: 8,
    color: C.muted,
    letterSpacing: 2,
    flex: 1,
    marginTop: 2,
  },
  activeBadge: {
    backgroundColor: C.neonDim,
    borderWidth: 1,
    borderColor: C.neon + '55',
    paddingHorizontal: 8,
    paddingVertical: 3,
  },
  activeBadgeTxt: {
    fontFamily: 'monospace',
    fontSize: 9,
    color: C.neon,
    letterSpacing: 1,
  },
  tabBar: {
    backgroundColor: C.panel,
    borderTopWidth: 1,
    borderTopColor: C.border,
    height: Platform.OS === 'ios' ? 85 : 65,
    paddingBottom: Platform.OS === 'ios' ? 20 : 8,
    paddingTop: 6,
  },
});

const tabStyles = StyleSheet.create({
  iconWrap: {
    alignItems: 'center',
    gap: 2,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  iconWrapActive: {
    borderBottomWidth: 2,
    borderBottomColor: C.neon,
  },
  iconEmoji: { fontSize: 18 },
  iconLabel: {
    fontFamily: 'monospace',
    fontSize: 8,
    color: C.muted,
    letterSpacing: 1,
  },
  iconLabelActive: { color: C.neon },
});
