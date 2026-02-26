import AsyncStorage from '@react-native-async-storage/async-storage';

const KEYS = {
  PLANS: 'kinetic_plans',
  LOG:   'kinetic_log',
};

export async function getPlans() {
  try {
    const raw = await AsyncStorage.getItem(KEYS.PLANS);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export async function savePlans(plans) {
  try {
    await AsyncStorage.setItem(KEYS.PLANS, JSON.stringify(plans.slice(0, 30)));
  } catch {}
}

export async function getLog() {
  try {
    const raw = await AsyncStorage.getItem(KEYS.LOG);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

export async function saveLog(entries) {
  try {
    await AsyncStorage.setItem(KEYS.LOG, JSON.stringify(entries.slice(0, 200)));
  } catch {}
}

export async function clearLog() {
  try { await AsyncStorage.removeItem(KEYS.LOG); } catch {}
}
