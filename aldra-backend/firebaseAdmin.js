const admin = require('firebase-admin');
const path = require('path');
const fs = require('fs');

let serviceAccount;

if (process.env.FIREBASE_SERVICE_ACCOUNT) {
  const raw = process.env.FIREBASE_SERVICE_ACCOUNT.replace(/\\n/g, '\n');
  serviceAccount = JSON.parse(raw);
} else {
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
});

const auth = admin.auth();
const db = admin.firestore();

module.exports = { auth, db };
