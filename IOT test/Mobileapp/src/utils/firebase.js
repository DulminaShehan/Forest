import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInAnonymously,
  signOut,
} from 'firebase/auth';
import {
  getDatabase,
  ref,
  onValue,
  get,
  query,
  orderByChild,
  startAt,
  push,
  set,
} from 'firebase/database';
import { getFirebaseApp } from '../../firebaseConfig';

const USER_ROLE_KEY = '@forest_iot_user_role';

function getAuthInstance() {
  return getAuth(getFirebaseApp());
}

function getDbInstance() {
  return getDatabase(getFirebaseApp());
}

export function initAuthListener(callback) {
  return onAuthStateChanged(getAuthInstance(), callback);
}

export function loginWithEmail(email, password) {
  return signInWithEmailAndPassword(getAuthInstance(), email, password);
}

export function registerWithEmail(email, password) {
  return createUserWithEmailAndPassword(getAuthInstance(), email, password);
}

export function loginAnonymously() {
  return signInAnonymously(getAuthInstance());
}

export function logout() {
  return signOut(getAuthInstance());
}

export async function saveUserRole(uid, role) {
  const db = getDbInstance();
  await set(ref(db, `users/${uid}`), {
    role,
    updatedAt: Date.now(),
  });
  await AsyncStorage.setItem(USER_ROLE_KEY, role);
}

export async function loadStoredRole() {
  return AsyncStorage.getItem(USER_ROLE_KEY);
}

export async function cacheSnapshot(snapshot) {
  await AsyncStorage.setItem('@forest_iot_snapshot', JSON.stringify(snapshot));
}

export async function loadCachedSnapshot() {
  const serialized = await AsyncStorage.getItem('@forest_iot_snapshot');
  return serialized ? JSON.parse(serialized) : null;
}

export function subscribeLiveData(callback) {
  const db = getDbInstance();
  const device01Ref = ref(db, 'esp32/device01');
  const device02Ref = ref(db, 'esp32/device02/latest');

  const unsubscribe1 = onValue(device01Ref, snapshot => {
    callback({ device01: snapshot.val() });
  });

  const unsubscribe2 = onValue(device02Ref, snapshot => {
    callback({ device02Latest: snapshot.val() });
  });

  return () => {
    unsubscribe1();
    unsubscribe2();
  };
}

export function subscribeLocations(callback) {
  const db = getDbInstance();
  return onValue(ref(db, 'esp32/locations'), snapshot => callback(snapshot.val()));
}

export async function fetchLatestData() {
  const db = getDbInstance();
  const device01 = await get(ref(db, 'esp32/device01'));
  const device02Latest = await get(ref(db, 'esp32/device02/latest'));
  return {
    device01: device01.exists() ? device01.val() : null,
    device02Latest: device02Latest.exists() ? device02Latest.val() : null,
  };
}

export async function fetchRecentHistory(days = 1) {
  const db = getDbInstance();
  const cutoff = Date.now() - days * 24 * 60 * 60 * 1000;
  const historyRef = query(ref(db, 'esp32/device02/history'), orderByChild('timestamp'), startAt(cutoff));
  const snapshot = await get(historyRef);
  if (!snapshot.exists()) {
    return [];
  }
  const value = snapshot.val();
  return Object.values(value).sort((a, b) => a.timestamp - b.timestamp);
}

export async function sendSos(uid, role) {
  const db = getDbInstance();
  const sosRef = push(ref(db, 'esp32/alerts/sos'));
  await set(sosRef, {
    userId: uid,
    role,
    createdAt: Date.now(),
    status: 'pending',
  });
}
