import admin from 'firebase-admin';
import { ServiceAccount } from 'firebase-admin';
const serviceAccountRaw = require('./aldraapp-firebase-adminsdk-fbsvc-00dc6aadb0.json');

const serviceAccount: ServiceAccount = {
  ...serviceAccountRaw,
  privateKey: serviceAccountRaw.private_key.replace(/\\n/g, '\n'),
};

delete (serviceAccount as any).private_key;

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

export const auth = admin.auth();
export const db = admin.firestore();
