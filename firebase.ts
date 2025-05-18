import { initializeApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { getStorage } from 'firebase/storage';
import Constants from 'expo-constants';

const firebaseConfig = {
  apiKey: Constants.expoConfig?.extra?.firebaseConfig?.apiKey,
  authDomain: Constants.expoConfig?.extra?.firebaseConfig?.authDomain,
  projectId: Constants.expoConfig?.extra?.firebaseConfig?.projectId,
  storageBucket: Constants.expoConfig?.extra?.firebaseConfig?.storageBucket,
  messagingSenderId: Constants.expoConfig?.extra?.firebaseConfig?.messagingSenderId,
  appId: Constants.expoConfig?.extra?.firebaseConfig?.appId,
};

console.log('✅ Firebase config loaded:', firebaseConfig);

// Kun initialiser Firebase hvis vi har en gyldig config
if (!firebaseConfig.apiKey) {
  throw new Error('Firebase config mangler! Tjek app.config.js og .env filen');
}

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const firestore = getFirestore(app);
const storage = getStorage(app);

try {
  console.log("✅ Firebase initialized successfully");
} catch (error) {
  console.error("❌ Firebase init failed:", error);
}

export { app, auth, firestore, storage };