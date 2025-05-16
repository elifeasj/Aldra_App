const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

let serviceAccount;

try {
  if (process.env.FIREBASE_SERVICE_ACCOUNT_BASE64) {
    const raw = Buffer.from(process.env.FIREBASE_SERVICE_ACCOUNT_BASE64, 'base64').toString('utf-8');
    console.log('Decoded Firebase service account JSON:', raw);
    serviceAccount = JSON.parse(raw);
  } else {
    throw new Error('Env var FIREBASE_SERVICE_ACCOUNT_BASE64 not set');
  }
} catch (error) {
  console.warn('Failed to parse FIREBASE_SERVICE_ACCOUNT_BASE64, falling back to local file:', error.message);
  const serviceAccountPath = path.resolve(__dirname, './aldraapp-firebase-adminsdk-fbsvc-00dc6aadb0.json');
  if (fs.existsSync(serviceAccountPath)) {
    serviceAccount = require(serviceAccountPath);
  } else {
    throw new Error('Firebase Service Account file not found and env var missing');
  }
}

if (serviceAccount.private_key) {
  serviceAccount.privateKey = serviceAccount.private_key.replace(/\\n/g, '\n');
  delete serviceAccount.private_key;
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  storageBucket: 'aldraapp.firebasestorage.app'
});

const auth = admin.auth();
const db = admin.firestore();

module.exports = { auth, db };
