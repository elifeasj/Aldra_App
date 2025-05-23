import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth, initializeAuth, browserLocalPersistence, browserSessionPersistence } from 'firebase/auth';
import { getReactNativePersistence } from 'firebase/auth/react-native';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import Constants from 'expo-constants';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Hent ekstra Firebase config fra app.config.js / .env
const extra = Constants.expoConfig?.extra || (Constants.manifest as any)?.extra;

const firebaseConfig = {
  apiKey: extra?.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: extra?.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: extra?.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: extra?.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: extra?.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: extra?.EXPO_PUBLIC_FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey) {
  throw new Error('❌ Firebase config mangler – check .env eller app.config.js');
}

console.log('✅ FIREBASE CONFIG:', firebaseConfig);

// Initialiser Firebase app
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Initialiser Firebase Auth med AsyncStorage (persistens)
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage),
  });
} catch (error: any) {
  if (!/already exists|has already been initialized/.test(error.message)) {
    throw error;
  }
  auth = getAuth(app);
}

const firestore = getFirestore(app);
const storage = getStorage(app);

export { app, auth, firestore, storage };