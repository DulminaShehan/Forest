import { getApps, initializeApp } from 'firebase/app';
import { getDatabase } from 'firebase/database';

const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  databaseURL: import.meta.env.VITE_FIREBASE_DATABASE_URL,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID
};

export const hasFirebaseConfig = Boolean(firebaseConfig.apiKey && firebaseConfig.databaseURL && firebaseConfig.projectId);

export const getFirebaseApp = () => {
  if (!hasFirebaseConfig) {
    return null;
  }

  return getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
};

export const getFirebaseDatabase = () => {
  const app = getFirebaseApp();
  return app ? getDatabase(app) : null;
};