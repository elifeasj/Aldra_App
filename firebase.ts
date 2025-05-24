import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import Constants from 'expo-constants';

const extra = Constants.expoConfig?.extra;

const firebaseConfig = {
  apiKey: extra?.EXPO_PUBLIC_FIREBASE_API_KEY,
  authDomain: extra?.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: extra?.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: extra?.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: extra?.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: extra?.EXPO_PUBLIC_FIREBASE_APP_ID,
};

// Brug eksisterende app hvis den allerede er initialiseret
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();

// Brug standard getAuth — det virker med Expo SDK 53
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
export const firestore = getFirestore(app);

export { app, auth, db, storage };