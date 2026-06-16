import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: 'AIzaSyDfZW0VTLNs4w7RWhB_UQoDgu_EbXWBt8Q',
  authDomain: 'esp32-3c0b8.firebaseapp.com',
  databaseURL: 'https://esp32-3c0b8-default-rtdb.asia-southeast1.firebasedatabase.app',
  projectId: 'esp32-3c0b8',
  storageBucket: 'esp32-3c0b8.appspot.com',
  messagingSenderId: 'YOUR_MESSAGING_SENDER_ID',   // get from Firebase Console
  appId: 'YOUR_APP_ID'                             // get from Firebase Console
};

let app;

export function getFirebaseApp() {
  if (!getApps().length) {
    app = initializeApp(firebaseConfig);
  }
  return getApp();
}

export function getFirebaseAuth() {
  return getAuth(getFirebaseApp());
}

export function getFirebaseDb() {
  return getDatabase(getFirebaseApp());
}
